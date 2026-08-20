"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileCode,
  Globe,
  Loader2,
  Megaphone,
  Rocket,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { apiClient } from "../../../lib/api/client";
import { WhatsAppMessagePreview, MetaTemplate } from "./WhatsAppMessagePreview";

export interface QuotaData {
  limit: number;
  used: number;
  reserved: number;
  released: number;
  available: number;
  dateString: string;
}

interface Step6Props {
  name: string;
  description: string;
  connectionId: string;
  connectionDetails: { phone: string; name: string; status: string } | null;
  template: MetaTemplate | null;
  audienceType: "import" | "tags";
  importDetails: { name: string; total: number; valid: number; invalid: number } | null;
  tagsInput: string;
  variableValues: Record<string, string>;
  scheduleType: "now" | "scheduled";
  scheduledAt: string;
  timezone: string;
  isSubmitting: boolean;
  onLaunch: () => void;
  onBack: () => void;
}

export const Step6ReviewLaunch: React.FC<Step6Props> = ({
  name,
  description,
  connectionId,
  connectionDetails,
  template,
  audienceType,
  importDetails,
  tagsInput,
  variableValues,
  scheduleType,
  scheduledAt,
  timezone,
  isSubmitting,
  onLaunch,
  onBack,
}) => {

  const quotaQuery = useQuery({
    queryKey: ["quota", connectionId, timezone],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: QuotaData }>("/quotas", {
        params: { connectionId, timezone },
      });
      return data.data;
    },
    enabled: Boolean(connectionId),
  });

  const quota = quotaQuery.data;
  const eligibleCount = audienceType === "import" ? importDetails?.valid || 0 : 0;
  const isQuotaInsufficient = quota && eligibleCount > 0 && quota.available < eligibleCount;

  const warnings: string[] = [];
  if (!name.trim()) warnings.push("Campaign name is missing.");
  if (!connectionId) warnings.push("No WhatsApp connection selected.");
  if (!template) warnings.push("No Meta template selected.");
  if (audienceType === "import" && !importDetails) warnings.push("No contact import selected.");
  if (audienceType === "tags" && !tagsInput.trim()) warnings.push("No contact tags specified.");
  if (isQuotaInsufficient) {
    warnings.push(
      `Insufficient daily quota! Eligible recipients (${eligibleCount.toLocaleString()}) exceed available quota (${quota?.available.toLocaleString()}).`
    );
  }

  const canLaunch = warnings.length === 0 && !isSubmitting;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Rocket className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 6: Review & Launch Campaign</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Verify all campaign configurations, recipient audience numbers, and quota allocations before launching.
        </p>
      </div>

      {/* Warnings Banner */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Please resolve the following before launching:
          </div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Comprehensive Review Details */}
        <div className="space-y-6 lg:col-span-7">
          {/* Campaign Details */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Megaphone className="h-3.5 w-3.5" />
              Campaign Details
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{name}</p>
              {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
          </div>

          {/* WhatsApp Connection */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Smartphone className="h-3.5 w-3.5" />
              Sending WhatsApp Connection
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-gray-900">{connectionDetails?.phone || connectionId}</p>
                <p className="text-gray-500">{connectionDetails?.name || "WhatsApp Business Account"}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                {connectionDetails?.status || "CONNECTED"}
              </span>
            </div>
          </div>

          {/* Audience Summary */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Users className="h-3.5 w-3.5" />
              Target Audience
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {audienceType === "import" ? (
                <div>
                  <p className="font-semibold text-gray-900">Import: {importDetails?.name}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-gray-50 p-2">
                      <p className="font-bold text-gray-900">{(importDetails?.total || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </div>
                    <div className="rounded-md bg-emerald-50 p-2">
                      <p className="font-bold text-emerald-700">{(importDetails?.valid || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600">Eligible</p>
                    </div>
                    <div className="rounded-md bg-amber-50 p-2">
                      <p className="font-bold text-amber-700">{(importDetails?.invalid || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-amber-600">Excluded</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-gray-900">Tags: {tagsInput}</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Summary */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              Schedule & Dispatch Mode
            </div>
            <div className="mt-3 text-xs text-gray-700">
              {scheduleType === "now" ? (
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Immediate Dispatch (Send Now)
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-gray-900">Scheduled for Future Dispatch</p>
                  <p className="mt-0.5 text-gray-500">
                    Timestamp: {new Date(scheduledAt).toLocaleString()} ({timezone})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quota Usage */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Daily Messaging Quota
              </div>
              {quota && (
                <span className="text-[10px] text-gray-400">Date: {quota.dateString}</span>
              )}
            </div>

            {quotaQuery.isLoading ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading quota stats...</div>
            ) : quota ? (
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="font-bold text-gray-900">{quota.limit.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500">Daily Limit</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2">
                  <p className="font-bold text-blue-700">{quota.used.toLocaleString()}</p>
                  <p className="text-[10px] text-blue-600">Used</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-2">
                  <p className="font-bold text-yellow-700">{quota.reserved.toLocaleString()}</p>
                  <p className="text-[10px] text-yellow-600">Reserved</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="font-bold text-emerald-700">{quota.available.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-600">Available</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Template Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Final WhatsApp Preview</p>
            <WhatsAppMessagePreview template={template} variableValues={variableValues} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={onLaunch}
          disabled={!canLaunch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-44 h-11 text-sm font-semibold shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Campaign...
            </>
          ) : scheduleType === "now" ? (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Launch Campaign Now
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Campaign
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
