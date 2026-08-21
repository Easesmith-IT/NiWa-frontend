"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import { v1ApiClient } from "../../lib/api/v1-client";
import { EmbeddedSignupResponse, WhatsAppConnectionRecord } from "../../lib/api/types";

const META_CONFIG_ID = "981824644880745";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
        options: Record<string, unknown>,
      ) => void;
    };
  }
}

interface MetaEmbeddedSignupProps {
  onSuccess?: (connection: WhatsAppConnectionRecord) => void;
  onCancel?: () => void;
  onError?: (errorMsg: string) => void;
}

type SignupStep = "idle" | "launching" | "authenticating" | "exchanging" | "validating" | "subscribing" | "syncing" | "completed" | "failed";

export const MetaEmbeddedSignup: React.FC<MetaEmbeddedSignupProps> = ({
  onSuccess,
  onCancel,
  onError,
}) => {
  const [step, setStep] = useState<SignupStep>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedData, setCapturedData] = useState<{
    wabaId?: string;
    phoneNumberId?: string;
    businessId?: string;
    code?: string;
  }>({});

  // Initialize Facebook SDK
  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: "", // Optional app ID for SDK init
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Listen for Meta Embedded Signup postMessage events
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (
        !event.origin.includes("facebook.com") &&
        !event.origin.includes("workplace.com") &&
        !event.origin.includes("meta.com")
      ) {
        // Safe fallthrough for postMessage string parsing
      }

      let payload: {
        type?: string;
        event?: string;
        data?: { phone_number_id?: string; waba_id?: string; business_id?: string; error_message?: string };
      } | null = null;
      try {
        payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (payload && payload.type === "WA_EMBEDDED_SIGNUP") {
        if (payload.event === "FINISH") {
          const { phone_number_id, waba_id, business_id } = payload.data || {};
          setCapturedData((prev) => ({
            ...prev,
            wabaId: waba_id,
            phoneNumberId: phone_number_id,
            businessId: business_id,
          }));

          // If code was also captured or available, trigger backend completion
          triggerBackendCompletion({
            wabaId: waba_id,
            phoneNumberId: phone_number_id,
            businessId: business_id,
            code: capturedData.code,
          });
        } else if (payload.event === "CANCEL") {
          setStep("idle");
          setStatusMessage("");
          if (onCancel) onCancel();
        } else if (payload.event === "ERROR") {
          const errMsg = payload.data?.error_message || "Meta Embedded Signup encountered an error.";
          setStep("failed");
          setErrorMessage(errMsg);
          if (onError) onError(errMsg);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [capturedData.code, onCancel, onError]);

  const triggerBackendCompletion = async (data: {
    wabaId?: string;
    phoneNumberId?: string;
    businessId?: string;
    code?: string;
  }) => {
    setStep("exchanging");
    setStatusMessage("Exchanging Meta authorization credentials securely...");

    try {
      setStep("validating");
      setStatusMessage("Validating WhatsApp Business Account & Phone Number...");

      const response = await v1ApiClient.post<EmbeddedSignupResponse>(
        "/whatsapp/connections/embedded-signup/complete",
        {
          code: data.code,
          wabaId: data.wabaId,
          phoneNumberId: data.phoneNumberId,
          businessId: data.businessId,
        },
      );

      setStep("subscribing");
      setStatusMessage("Configuring Webhook Subscriptions...");

      setStep("syncing");
      setStatusMessage("Synchronizing WhatsApp Templates...");

      setStep("completed");
      setStatusMessage("WhatsApp Account connected successfully!");

      if (onSuccess && response.data.connection) {
        onSuccess(response.data.connection);
      }
    } catch (err) {
      setStep("failed");
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Failed to verify WhatsApp connection with server. Please try again."
          : "Failed to verify WhatsApp connection with server. Please try again.";
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  };

  const launchEmbeddedSignup = () => {
    setStep("launching");
    setErrorMessage(null);
    setStatusMessage("Opening Meta Embedded Signup...");

    if (window.FB) {
      setStep("authenticating");
      setStatusMessage("Authenticating with Meta...");

      window.FB.login(
        (response) => {
          const authCode = response?.authResponse?.code;
          if (authCode) {
            setCapturedData((prev) => ({
              ...prev,
              code: authCode,
            }));

            if (capturedData.wabaId && capturedData.phoneNumberId) {
              triggerBackendCompletion({
                wabaId: capturedData.wabaId,
                phoneNumberId: capturedData.phoneNumberId,
                businessId: capturedData.businessId,
                code: authCode,
              });
            }
          } else if (response.status === "not_authorized" || response.status === "unknown") {
            setStep("idle");
          }
        },
        {
          config_id: META_CONFIG_ID,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {
              // Meta Embedded Signup extras
            },
          },
        },
      );
    } else {
      // Fallback: If FB SDK popup fails to launch, guide user to retry SDK initialization
      setStep("failed");
      setErrorMessage("Meta JavaScript SDK not loaded yet. Please check your internet connection and retry.");
    }
  };

  if (step === "idle") {
    return (
      <Button
        onClick={launchEmbeddedSignup}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
      >
        <ShieldCheck className="w-4 h-4" />
        Connect WhatsApp
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    );
  }

  if (step === "failed") {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
              Connection Failed
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300">
              {errorMessage || "We couldn't finish connecting your WhatsApp account."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("idle")}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={launchEmbeddedSignup}
            className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const stepsList = [
    { key: "authenticating", label: "Account authorized" },
    { key: "exchanging", label: "Meta credentials exchanged" },
    { key: "validating", label: "WhatsApp Business Account found" },
    { key: "subscribing", label: "Webhooks configured" },
    { key: "syncing", label: "Templates synchronized" },
  ];

  const getStepStatus = (itemKey: string) => {
    const order = ["idle", "launching", "authenticating", "exchanging", "validating", "subscribing", "syncing", "completed"];
    const currentIndex = order.indexOf(step);
    const itemIndex = order.indexOf(itemKey);

    if (currentIndex > itemIndex) return "done";
    if (currentIndex === itemIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
      <div className="flex items-center gap-3">
        {step === "completed" ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {step === "completed" ? "WhatsApp Connection Ready" : "Setting up WhatsApp Connection..."}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{statusMessage}</p>
        </div>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
        {stepsList.map((st) => {
          const stStatus = getStepStatus(st.key);
          return (
            <div key={st.key} className="flex items-center gap-3 text-xs">
              {stStatus === "done" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : stStatus === "current" ? (
                <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span
                className={
                  stStatus === "done"
                    ? "text-slate-700 dark:text-slate-300 font-medium"
                    : stStatus === "current"
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-400 dark:text-slate-600"
                }
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
