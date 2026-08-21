import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { useMetaCredentialsState } from "../hooks/useMetaCredentialsState";

export interface MetaCredentialsCardProps {
  meta: ReturnType<typeof useMetaCredentialsState>;
}

export const MetaCredentialsCard: React.FC<MetaCredentialsCardProps> = ({ meta }) => {
  return (
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
            {meta.settingsQuery.data?.metaWebhookEndpoint ?? "Loading..."}
          </p>
        </div>
        <div className="rounded-md border border-[#C4E8DA] bg-[#EDF8F3] p-3 dark:border-[#1F4D3C] dark:bg-[#13251E]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#176B4D] dark:text-[#359B76]">
            Connection Diagnostics
          </p>
          <p className="mt-1 text-xs text-foreground">
            {meta.connectionTestMutation.data?.message ?? "No connection test executed."}
          </p>
          {meta.connectionError ? (
            <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">{meta.connectionError}</p>
          ) : null}
          {typeof meta.connectionTestMutation.data?.statusCode === "number" ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Meta Status: {meta.connectionTestMutation.data.statusCode}
            </p>
          ) : null}
          {meta.connectionTestMutation.data?.missingFields.length ? (
            <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">
              Missing: {meta.connectionTestMutation.data.missingFields.join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#F0F0F2] py-2.5 dark:border-[#202326]">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
            App Secret:{" "}
            <span className="font-semibold">
              {meta.settingsQuery.data?.secretsConfigured?.appSecret ? "Stored" : "Missing"}
            </span>
          </span>
          <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
            Access Token:{" "}
            <span className="font-semibold">
              {meta.settingsQuery.data?.secretsConfigured?.accessToken ? "Stored" : "Missing"}
            </span>
          </span>
          <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 dark:border-[#292C2F] dark:bg-[#17191B]">
            Verify Token:{" "}
            <span className="font-semibold">
              {meta.settingsQuery.data?.secretsConfigured?.verifyToken ? "Stored" : "Missing"}
            </span>
          </span>
        </div>
        <Button onClick={meta.toggleShowStoredSecrets} size="sm" type="button" variant="secondary">
          {meta.showStoredSecrets ? "Mask Stored Secrets" : "Reveal Stored Secrets"}
        </Button>
      </div>

      <form className="grid gap-3.5 md:grid-cols-2" onSubmit={meta.handleSaveSettings}>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">App ID *</label>
          <Input className="font-mono text-xs" placeholder="e.g. 27900924049538288" {...meta.settingsForm.register("appId")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">App Secret *</label>
          <Input className="font-mono text-xs" placeholder="Meta App Secret" {...meta.settingsForm.register("appSecret")} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground">Permanent Access Token *</label>
          <Textarea
            className="font-mono text-xs min-h-24"
            placeholder="System User Access Token..."
            {...meta.settingsForm.register("accessToken")}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Business Account ID (WABA ID) *</label>
          <Input className="font-mono text-xs" placeholder="e.g. 4433978036814896" {...meta.settingsForm.register("businessAccountId")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Phone Number ID *</label>
          <Input className="font-mono text-xs" placeholder="e.g. 1295455696976455" {...meta.settingsForm.register("phoneNumberId")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Verify Token *</label>
          <Input className="font-mono text-xs" placeholder="Handshake verify token..." {...meta.settingsForm.register("verifyToken")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Webhook Callback URL *</label>
          <Input className="font-mono text-xs" placeholder="https://niwaapi.easesmith.com/webhook" {...meta.settingsForm.register("webhookUrl")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Meta API Version</label>
          <Input className="font-mono text-xs" placeholder="v22.0" {...meta.settingsForm.register("apiVersion")} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Cloud API Base URL</label>
          <Input className="font-mono text-xs" placeholder="https://graph.facebook.com" {...meta.settingsForm.register("cloudApiBaseUrl")} />
        </div>

        <div className="md:col-span-2 pt-2 border-t border-[#F0F0F2] dark:border-[#202326]">
          <div className="flex flex-wrap gap-2.5">
            <Button disabled={meta.settingsForm.formState.isSubmitting || meta.saveMutation.isPending} type="submit" variant="primary">
              {meta.saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              disabled={meta.connectionTestMutation.isPending}
              onClick={meta.handleTestConnection}
              type="button"
              variant="secondary"
            >
              {meta.connectionTestMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>
          </div>
          {meta.submitMessage ? (
            <p className="mt-2 text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{meta.submitMessage}</p>
          ) : null}
          {meta.submitError ? (
            <p className="mt-2 text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{meta.submitError}</p>
          ) : null}
        </div>
      </form>
      {meta.connectionTestMutation.data?.responseBody ? (
        <div className="mt-4 rounded-md border border-[#292C2F] bg-[#0F1112] p-3 text-[#E4E4E7]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Meta Response JSON
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-[11px]">
            {JSON.stringify(meta.connectionTestMutation.data.responseBody, null, 2)}
          </pre>
        </div>
      ) : null}
    </Card>
  );
};
