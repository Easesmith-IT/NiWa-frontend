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
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          System Settings & Meta Cloud API Connectivity
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Configure WABA credentials, phone number IDs, permanent access tokens, and operator access controls.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3.5 p-4">
          <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            <h2 className="text-sm font-semibold text-foreground">Operator Profile</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Manage operator identity attached to active sessions and audit logs.
            </p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs space-y-1 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-muted-foreground">
              Email: <span className="font-mono font-medium text-foreground">{profileQuery.data?.user.email ?? "Loading..."}</span>
            </p>
            <p className="text-muted-foreground">
              Role: <span className="font-semibold text-foreground capitalize">{profileQuery.data?.user.role ?? "..."}</span>
            </p>
          </div>
          <form
            className="space-y-3"
            onSubmit={profileForm.handleSubmit((values) => {
              setProfileError(null);
              setProfileMessage(null);
              profileMutation.mutate(values);
            })}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Operator Display Name</label>
              <Input placeholder="Operator name" {...profileForm.register("name")} />
            </div>
            <Button disabled={profileMutation.isPending} type="submit" variant="primary">
              {profileMutation.isPending ? "Saving..." : "Update Profile"}
            </Button>
            {profileMessage ? <p className="text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{profileMessage}</p> : null}
            {profileError ? <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{profileError}</p> : null}
          </form>
        </Card>

        <Card className="space-y-3.5 p-4">
          <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            <h2 className="text-sm font-semibold text-foreground">Security & Credentials</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Change account password and refresh security tokens.
            </p>
          </div>
          <form
            className="space-y-3"
            onSubmit={passwordForm.handleSubmit((values) => {
              setPasswordError(null);
              setPasswordMessage(null);
              passwordMutation.mutate(values);
            })}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Current Password</label>
              <Input
                placeholder="Current password"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">New Password</label>
              <Input
                placeholder="New password"
                type="password"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Confirm New Password</label>
              <Input
                placeholder="Confirm new password"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <Button disabled={passwordMutation.isPending} type="submit" variant="secondary">
              {passwordMutation.isPending ? "Updating..." : "Change Password"}
            </Button>
            {passwordMessage ? <p className="text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{passwordMessage}</p> : null}
            {passwordError ? <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{passwordError}</p> : null}
          </form>
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
          <h2 className="text-sm font-semibold text-foreground">Meta WABA Credentials</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure Meta Cloud API credentials and verify webhooks handshake endpoints.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meta Webhook Callback URL
            </p>
            <p className="mt-1 break-all font-mono text-xs text-foreground">
              {settingsQuery.data?.metaWebhookEndpoint ?? "Loading..."}
            </p>
          </div>
          <div className="rounded-md border border-[#C4E8DA] bg-[#EDF8F3] p-3 dark:border-[#1F4D3C] dark:bg-[#13251E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#176B4D] dark:text-[#359B76]">
              Connection Diagnostics
            </p>
            <p className="mt-1 text-xs text-foreground">
              {connectionTestMutation.data?.message ?? "No connection test executed."}
            </p>
            {connectionError ? (
              <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">{connectionError}</p>
            ) : null}
            {typeof connectionTestMutation.data?.statusCode === "number" ? (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Meta Status: {connectionTestMutation.data.statusCode}
              </p>
            ) : null}
            {connectionTestMutation.data?.missingFields.length ? (
              <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">
                Missing: {connectionTestMutation.data.missingFields.join(", ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#F0F0F2] py-2.5 dark:border-[#202326]">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
              App Secret: <span className="font-semibold">{settingsQuery.data?.secretsConfigured?.appSecret ? "Stored" : "Missing"}</span>
            </span>
            <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
              Access Token: <span className="font-semibold">{settingsQuery.data?.secretsConfigured?.accessToken ? "Stored" : "Missing"}</span>
            </span>
            <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
              Verify Token: <span className="font-semibold">{settingsQuery.data?.secretsConfigured?.verifyToken ? "Stored" : "Missing"}</span>
            </span>
          </div>
          <Button
            onClick={() => setShowStoredSecrets((current) => !current)}
            size="sm"
            type="button"
            variant="secondary"
          >
            {showStoredSecrets ? "Mask Stored Secrets" : "Reveal Stored Secrets"}
          </Button>
        </div>

        <form
          className="grid gap-3.5 md:grid-cols-2"
          onSubmit={handleSubmit((values) => {
            setSubmitError(null);
            setSubmitMessage(null);
            saveMutation.mutate(values);
          })}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              App ID *
            </label>
            <Input className="font-mono text-xs" placeholder="e.g. 27900924049538288" {...register("appId")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              App Secret *
            </label>
            <Input className="font-mono text-xs" placeholder="Meta App Secret" {...register("appSecret")} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-foreground">
              Permanent Access Token *
            </label>
            <Textarea className="font-mono text-xs min-h-24" placeholder="System User Access Token..." {...register("accessToken")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Business Account ID (WABA ID) *
            </label>
            <Input className="font-mono text-xs" placeholder="e.g. 4433978036814896" {...register("businessAccountId")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Phone Number ID *
            </label>
            <Input className="font-mono text-xs" placeholder="e.g. 1295455696976455" {...register("phoneNumberId")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Verify Token *
            </label>
            <Input className="font-mono text-xs" placeholder="Handshake verify token..." {...register("verifyToken")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Webhook Callback URL *
            </label>
            <Input className="font-mono text-xs" placeholder="https://niwaapi.easesmith.com/webhook" {...register("webhookUrl")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Meta API Version
            </label>
            <Input className="font-mono text-xs" placeholder="v22.0" {...register("apiVersion")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Cloud API Base URL
            </label>
            <Input className="font-mono text-xs" placeholder="https://graph.facebook.com" {...register("cloudApiBaseUrl")} />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-[#F0F0F2] dark:border-[#202326]">
            <div className="flex flex-wrap gap-2.5">
              <Button disabled={isSubmitting || saveMutation.isPending} type="submit" variant="primary">
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
            {submitMessage ? <p className="mt-2 text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{submitMessage}</p> : null}
            {submitError ? <p className="mt-2 text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{submitError}</p> : null}
          </div>
        </form>
        {connectionTestMutation.data?.responseBody ? (
          <div className="mt-4 rounded-md border border-[#292C2F] bg-[#0F1112] p-3 text-[#E4E4E7]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meta Response JSON
            </p>
            <pre className="mt-2 overflow-x-auto font-mono text-[11px]">
              {JSON.stringify(connectionTestMutation.data.responseBody, null, 2)}
            </pre>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

