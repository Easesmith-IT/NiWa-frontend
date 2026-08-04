"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { apiClient } from "../../../lib/api/client";
import { clearAccessToken, redirectToLogin } from "../../../lib/auth";
import {
  BasicMessageResponse,
  ConnectionTestResponse,
  PasswordChangePayload,
  ProfileResponse,
  ProfileUpdatePayload,
  SettingsPayload,
  SettingsResponse,
} from "../../../lib/api/types";

const settingsSchema = z.object({
  appId: z.string(),
  appSecret: z.string(),
  accessToken: z.string(),
  businessAccountId: z.string(),
  phoneNumberId: z.string(),
  verifyToken: z.string(),
  webhookUrl: z.string(),
  apiVersion: z.string(),
  cloudApiBaseUrl: z.string(),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

type SettingsValues = z.infer<typeof settingsSchema>;
type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? error.response?.data?.message ?? fallback : fallback;

export default function SettingsPage() {
  const [showStoredSecrets, setShowStoredSecrets] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appId: "",
      appSecret: "",
      accessToken: "",
      businessAccountId: "",
      phoneNumberId: "",
      verifyToken: "",
      webhookUrl: "",
      apiVersion: "v22.0",
      cloudApiBaseUrl: "https://graph.facebook.com",
    },
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["settings", showStoredSecrets],
    queryFn: async () => {
      const response = await apiClient.get<SettingsResponse>("/settings", {
        params: {
          includeSecrets: showStoredSecrets ? "true" : undefined,
        },
      });
      return response.data;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile", "settings-page"],
    queryFn: async () => {
      const response = await apiClient.get<ProfileResponse>("/auth/profile");
      return response.data;
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data.settings);
    }
  }, [reset, settingsQuery.data]);

  useEffect(() => {
    if (profileQuery.data) {
      profileForm.reset({
        name: profileQuery.data.user.name,
      });
    }
  }, [profileForm, profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsPayload) => {
      const response = await apiClient.put<SettingsResponse>("/settings", values);
      return response.data;
    },
    onSuccess: (data) => {
      setSubmitError(null);
      setSubmitMessage("Settings saved.");
      reset(data.settings);
      settingsQuery.refetch();
    },
    onError: (error) => {
      setSubmitError(getErrorMessage(error, "Failed to save settings."));
      setSubmitMessage(null);
    },
  });

  const connectionTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ConnectionTestResponse>("/settings/test-connection");
      return response.data;
    },
    onSuccess: () => {
      setConnectionError(null);
    },
    onError: (error) => {
      setConnectionError(getErrorMessage(error, "Failed to test Meta connection."));
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (values: ProfileUpdatePayload) => {
      const response = await apiClient.put<ProfileResponse>("/auth/profile", values);
      return response.data;
    },
    onSuccess: (data) => {
      setProfileError(null);
      setProfileMessage("Profile updated.");
      profileForm.reset({
        name: data.user.name,
      });
      profileQuery.refetch();
    },
    onError: (error) => {
      setProfileError(getErrorMessage(error, "Failed to update profile."));
      setProfileMessage(null);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (values: PasswordChangePayload) => {
      const response = await apiClient.post<BasicMessageResponse>("/auth/change-password", values);
      return response.data;
    },
    onSuccess: (data) => {
      setPasswordError(null);
      setPasswordMessage(data.message);
      passwordForm.reset();
      clearAccessToken();
      window.setTimeout(() => {
        redirectToLogin();
      }, 1200);
    },
    onError: (error) => {
      setPasswordError(getErrorMessage(error, "Failed to update password."));
      setPasswordMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Settings
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Meta Connectivity</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Operator Account
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Profile</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage the current NiWa operator identity used for this console.
            </p>
          </div>
          <div className="mb-5 grid gap-3 rounded-2xl bg-[#eef4ef] p-4 text-sm text-foreground">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {profileQuery.data?.user.email ?? "Loading..."}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {profileQuery.data?.user.role ?? "..."}
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={profileForm.handleSubmit((values) => {
              setProfileError(null);
              setProfileMessage(null);
              profileMutation.mutate(values);
            })}
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Operator Display Name
              </label>
              <p className="text-xs text-muted-foreground">
                Name attached to your active console session and internal action logs.
              </p>
              <Input placeholder="Operator name" {...profileForm.register("name")} />
            </div>
            <Button disabled={profileMutation.isPending} type="submit">
              {profileMutation.isPending ? "Saving..." : "Update Profile"}
            </Button>
            {profileMessage ? <p className="text-sm text-green-700">{profileMessage}</p> : null}
            {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Security
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Password Change</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Changing the password invalidates the current refresh token and requires sign-in again.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit((values) => {
              setPasswordError(null);
              setPasswordMessage(null);
              passwordMutation.mutate(values);
            })}
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Password
              </label>
              <Input
                placeholder="Current password"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <Input
                placeholder="New password"
                type="password"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm New Password
              </label>
              <Input
                placeholder="Confirm new password"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <Button disabled={passwordMutation.isPending} type="submit" variant="secondary">
              {passwordMutation.isPending ? "Updating..." : "Change Password"}
            </Button>
            {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#f7f1e4] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Meta Callback Endpoint
            </p>
            <p className="mt-3 break-all font-mono text-sm text-foreground">
              {settingsQuery.data?.metaWebhookEndpoint ?? "Loading..."}
            </p>
          </div>
          <div className="rounded-2xl bg-[#eef4ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Connection Check
            </p>
            <p className="mt-3 text-sm text-foreground">
              {connectionTestMutation.data?.message ?? "No connection test run yet."}
            </p>
            {connectionError ? (
              <p className="mt-2 text-sm text-red-700">{connectionError}</p>
            ) : null}
            {typeof connectionTestMutation.data?.statusCode === "number" ? (
              <p className="mt-2 text-sm text-foreground">
                Meta status code: {connectionTestMutation.data.statusCode}
              </p>
            ) : null}
            {connectionTestMutation.data?.missingFields.length ? (
              <p className="mt-2 text-sm text-red-700">
                Missing: {connectionTestMutation.data.missingFields.join(", ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-foreground">
            App secret: {settingsQuery.data?.secretsConfigured?.appSecret ? "Stored" : "Missing"}
          </div>
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-foreground">
            Access token: {settingsQuery.data?.secretsConfigured?.accessToken ? "Stored" : "Missing"}
          </div>
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-foreground">
            Verify token: {settingsQuery.data?.secretsConfigured?.verifyToken ? "Stored" : "Missing"}
          </div>
          <Button
            onClick={() => setShowStoredSecrets((current) => !current)}
            type="button"
            variant="secondary"
          >
            {showStoredSecrets ? "Mask Stored Secrets" : "Reveal Stored Secrets"}
          </Button>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit((values) => {
            setSubmitError(null);
            setSubmitMessage(null);
            saveMutation.mutate(values);
          })}
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              App ID
            </label>
            <p className="text-xs text-muted-foreground">
              Meta Developer Application numeric ID assigned in your Meta App Dashboard.
            </p>
            <Input placeholder="e.g. 27900924049538288" {...register("appId")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              App Secret
            </label>
            <p className="text-xs text-muted-foreground">
              Confidential secret used to compute HMAC-SHA256 signatures for webhook verification.
            </p>
            <Input placeholder="Enter Meta App Secret" {...register("appSecret")} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Access Token
            </label>
            <p className="text-xs text-muted-foreground">
              System User Permanent Access Token with whatsapp_business_messaging & whatsapp_business_management permissions.
            </p>
            <Textarea className="md:col-span-2" placeholder="System User Access Token" {...register("accessToken")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Business Account ID (WABA ID)
            </label>
            <p className="text-xs text-muted-foreground">
              WhatsApp Business Account ID in Meta Manager hosting message templates and phone numbers.
            </p>
            <Input placeholder="e.g. 4433978036814896" {...register("businessAccountId")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number ID
            </label>
            <p className="text-xs text-muted-foreground">
              Numeric ID assigned by Meta to your registered sender phone number for Graph API endpoints.
            </p>
            <Input placeholder="e.g. 1295455696976455" {...register("phoneNumberId")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verify Token
            </label>
            <p className="text-xs text-muted-foreground">
              Custom secret token passed during Meta Webhook GET verification handshake challenge.
            </p>
            <Input placeholder="Enter Verify Token" {...register("verifyToken")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Webhook Callback URL
            </label>
            <p className="text-xs text-muted-foreground">
              Public HTTPS URL where Meta delivers incoming messages and status receipts.
            </p>
            <Input placeholder="https://niwaapi.easesmith.com/webhook" {...register("webhookUrl")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              API Version
            </label>
            <p className="text-xs text-muted-foreground">
              Meta Graph API release version string targeted for API operations (e.g. v22.0 or v25.0).
            </p>
            <Input placeholder="e.g. v22.0" {...register("apiVersion")} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cloud API Base URL
            </label>
            <p className="text-xs text-muted-foreground">
              Primary endpoint host domain for Meta Graph API services.
            </p>
            <Input placeholder="https://graph.facebook.com" {...register("cloudApiBaseUrl")} />
          </div>

          <div className="md:col-span-2 pt-2">
            <div className="flex flex-wrap gap-3">
              <Button disabled={isSubmitting || saveMutation.isPending} type="submit">
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                disabled={connectionTestMutation.isPending}
                onClick={() => {
                  setConnectionError(null);
                  connectionTestMutation.mutate();
                }}
                type="button"
                variant="secondary"
              >
                {connectionTestMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
            </div>
            {submitMessage ? <p className="mt-3 text-sm text-green-700">{submitMessage}</p> : null}
            {submitError ? <p className="mt-3 text-sm text-red-600">{submitError}</p> : null}
          </div>
        </form>
        {connectionTestMutation.data?.responseBody ? (
          <div className="mt-6 rounded-2xl bg-[#16302b] p-4 text-[#f8f1de]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e5dcc5]">
              Meta Response
            </p>
            <pre className="mt-3 overflow-x-auto text-xs">
              {JSON.stringify(connectionTestMutation.data.responseBody, null, 2)}
            </pre>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
