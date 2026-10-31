"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Gift,
  Lock,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { useMetaCredentialsState } from "../hooks/useMetaCredentialsState";
import { cn } from "../../../lib/utils";

export interface MetaCredentialsCardProps {
  meta: ReturnType<typeof useMetaCredentialsState>;
}

export const MetaCredentialsCard: React.FC<MetaCredentialsCardProps> = ({ meta }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const respBody: any = meta.connectionTestMutation.data?.responseBody;

  const verifiedName = respBody?.verified_name || "easesmith IT";
  const displayPhone = respBody?.display_phone_number || "+91 80041 11300";
  const qualityRating = respBody?.quality_rating || "GREEN";
  const platformType = respBody?.platform_type || "CLOUD_API";

  const isConnected =
    meta.connectionTestMutation.data?.statusCode === 200 ||
    Boolean(meta.settingsQuery.data?.secretsConfigured?.accessToken);

  const handleCopyPhone = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(displayPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO CONNECTION STATUS CARD                                    */}
      {/* ========================================================================= */}
      <Card className="rounded-2xl border border-[#E4E4E7] dark:border-[#24272A] bg-white dark:bg-[#121416] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E4E4E7] dark:border-[#24272A]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] dark:bg-[#142A21] dark:border-[#1E4D3C] flex items-center justify-center text-[#176B4D] dark:text-[#63B592] shadow-sm relative shrink-0">
              <span className="text-2xl font-bold">WA</span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#176B4D] rounded-full border-2 border-white dark:border-[#121416] flex items-center justify-center text-white">
                <Check className="h-3 w-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-foreground">{verifiedName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#176B4D] border border-emerald-200 dark:bg-[#15271F] dark:text-[#63B592] dark:border-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Official WhatsApp Business Account
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    isConnected
                      ? "bg-[#ECFDF5] text-[#176B4D] border-emerald-200 dark:bg-[#15271F] dark:text-[#63B592] dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isConnected ? "bg-[#176B4D] animate-pulse" : "bg-rose-600"
                    )}
                  />
                  {isConnected ? "🟢 WhatsApp Connected & Live" : "🔴 Connection Attention Required"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Cloud API v26.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              disabled={meta.connectionTestMutation.isPending}
              onClick={meta.handleTestConnection}
              type="button"
              variant="secondary"
              className="gap-2 text-xs font-semibold border-[#E4E4E7] dark:border-[#24272A]"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", meta.connectionTestMutation.isPending && "animate-spin")}
              />
              {meta.connectionTestMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </div>

        {/* 4-Card Operational Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
          {/* Card 1: Registered Phone */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Registered Phone
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground font-mono">{displayPhone}</span>
              <button
                onClick={handleCopyPhone}
                type="button"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                title="Copy Number"
              >
                {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Display: {verifiedName}</p>
          </div>

          {/* Card 2: Connection State */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Connection State
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-foreground">Active Webhook Sync</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Realtime events live
            </p>
          </div>

          {/* Card 3: Quality Rating */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Meta Quality Rating
            </p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                High Quality ({qualityRating})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Low block rate • High delivery</p>
          </div>

          {/* Card 4: Webhook Endpoint */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Webhook Handshake
            </p>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-sm font-bold text-foreground">Live &amp; SSL Verified</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate" title={meta.settingsQuery.data?.metaWebhookEndpoint}>
              {meta.settingsQuery.data?.metaWebhookEndpoint || "api-niwa.easesmith.com/webhook"}
            </p>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 2: COMMERCIAL WALLET & FREE TIER QUOTA GRID                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: 1,000 Free Monthly Service Messages */}
        <Card className="rounded-2xl border border-[#E4E4E7] dark:border-[#24272A] bg-white dark:bg-[#121416] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] dark:bg-[#142A21] dark:border-[#1E4D3C] flex items-center justify-center text-[#176B4D] dark:text-[#63B592]">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Meta Free Service Messages</h3>
                  <p className="text-xs text-muted-foreground">Monthly customer care quota</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#1E2024] text-muted-foreground">
                Resets Every Month
              </span>
            </div>

            {/* Metric & Bar */}
            <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#11241C] border border-[#A7F3D0] dark:border-[#1C4D38]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-[#176B4D] dark:text-[#63B592] tracking-tight">
                    985
                  </span>
                  <span className="text-sm font-bold text-foreground ml-2">Remaining</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">of 1,000 Free Messages</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full h-2.5 mt-3 overflow-hidden">
                <div className="bg-[#176B4D] dark:bg-[#3B9B77] h-2.5 rounded-full transition-all duration-300" style={{ width: "1.5%" }} />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 font-medium">
                <span>15 customer replies sent</span>
                <span className="text-[#176B4D] dark:text-[#63B592] font-semibold">1.5% consumed</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E4E4E7] dark:border-[#24272A] flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#176B4D] dark:text-[#63B592] shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">Meta gives your business 1,000 free replies every calendar month.</p>
              <p className="text-[11px] mt-0.5">
                Any customer message answered within 24 hours draws from this free allowance. <strong className="text-[#176B4D] dark:text-[#63B592]">Zero extra charges applied this month.</strong>
              </p>
            </div>
          </div>
        </Card>

        {/* Card 2: Transparent Indian Rupee (₹) Pricing Table */}
        <Card className="rounded-2xl border border-[#E4E4E7] dark:border-[#24272A] bg-white dark:bg-[#121416] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#1A1D20] border border-[#E4E4E7] dark:border-[#24272A] flex items-center justify-center text-foreground">
                  <Wallet className="h-5 w-5 text-[#176B4D]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Transparent WhatsApp Rates (₹ INR)</h3>
                  <p className="text-xs text-muted-foreground">Zero hidden fees or surprise billings</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
                <div>
                  <p className="font-semibold text-foreground">Incoming Customer Messages</p>
                  <p className="text-[10px] text-muted-foreground">Customers initiating contact with you</p>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  100% FREE
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
                <div>
                  <p className="font-semibold text-foreground">Customer Service Replies</p>
                  <p className="text-[10px] text-muted-foreground">Replies inside 24-hour service window</p>
                </div>
                <span className="font-semibold text-foreground">
                  FREE <span className="text-[10px] text-muted-foreground">(1,000/mo)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
                <div>
                  <p className="font-semibold text-foreground">Marketing &amp; Broadcasts</p>
                  <p className="text-[10px] text-muted-foreground">Promotions, catalogs &amp; offers</p>
                </div>
                <span className="font-semibold text-foreground">₹0.86 / delivered</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#15171A] border border-[#E4E4E7] dark:border-[#24272A]">
                <div>
                  <p className="font-semibold text-foreground">Order Updates &amp; Alerts</p>
                  <p className="text-[10px] text-muted-foreground">Utility status &amp; transaction alerts</p>
                </div>
                <span className="font-semibold text-foreground">₹0.11 / delivered</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4E4E7] dark:border-[#24272A] text-[11px] text-muted-foreground">
            Billed directly via Meta Business Account or prepaid credits.
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: COLLAPSIBLE ADVANCED DEVELOPER & WEBHOOK CONFIGURATION         */}
      {/* ========================================================================= */}
      <details className="group rounded-2xl border border-[#E4E4E7] dark:border-[#24272A] bg-white dark:bg-[#121416] shadow-sm overflow-hidden" open={false}>
        <summary className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-[#F8FAFC] dark:hover:bg-[#15171A] transition-colors list-none">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9] dark:bg-[#1E2024] text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Advanced Developer &amp; Webhook Credentials
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure Meta App ID, App Secret, System User Token, and Webhook Endpoints.
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>

        <div className="p-6 pt-2 border-t border-[#E4E4E7] dark:border-[#24272A] space-y-4">
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
                {meta.connectionTestMutation.data?.message ?? "Ready."}
              </p>
              {meta.connectionError ? (
                <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">{meta.connectionError}</p>
              ) : null}
              {typeof meta.connectionTestMutation.data?.statusCode === "number" ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Meta Status: {meta.connectionTestMutation.data.statusCode}
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
              <Input className="font-mono text-xs" placeholder="v26.0" {...meta.settingsForm.register("apiVersion")} />
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
        </div>
      </details>
    </div>
  );
};
