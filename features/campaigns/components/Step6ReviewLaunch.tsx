"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileCode,
  Globe,
  Loader2,
  Megaphone,
  RefreshCw,
  Rocket,
  Save,
  ShieldCheck,
  Smartphone,
  Users,
  Clock,
  TrendingUp,
  Layers,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { WhatsAppMessagePreview, MetaTemplate } from "./WhatsAppMessagePreview";
import { ContactItem } from "./Step3Audience";
import { useQuotaForecast } from "../../quotas/quota.queries";

export interface QuotaForecastResponse {
  data: {
    current: {
      workspaceId: string;
      connectionId: string;
      dateString: string;
      limit: number;
      used: number;
      reserved: number;
      available: number;
    };
    requestedRecipients: number;
    schedule: Array<{
      dateString: string;
      availableCapacity: number;
      recipientsPlanned: number;
      remaining: number;
    }>;
    estimatedCompletionDate: string;
    isEstimate: boolean;
  };
}

interface Step6Props {
  name: string;
  description: string;
  connectionId: string;
  connectionDetails: { phone: string; name: string; status: string } | null;
  template: MetaTemplate | null;
  audienceType: "import" | "select" | "tags";
  importDetails: { name: string; total: number; valid: number; invalid: number } | null;
  selectedContactCount?: number;
  selectedContactList?: ContactItem[];
  tagsInput: string;
  variableValues: Record<string, string>;
  scheduleType: "now" | "scheduled";
  scheduledAt: string;
  timezone: string;
  isSubmitting: boolean;
  isSavingDraft?: boolean;
  lastSavedTime?: string | null;
  onSaveDraft?: () => void;
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
  selectedContactCount = 0,
  selectedContactList = [],
  tagsInput,
  variableValues,
  scheduleType,
  scheduledAt,
  timezone,
  isSubmitting,
  isSavingDraft = false,
  lastSavedTime,
  onSaveDraft,
  onLaunch,
  onBack,
}) => {
  // Determine eligible recipient count for forecast calculation
  const eligibleCount =
    audienceType === "import"
      ? importDetails?.valid || 0
      : audienceType === "select"
      ? selectedContactCount
      : 0;

  // Query Quota & Forecast
  const forecastQuery = useQuotaForecast({
    connectionId,
    timezone,
    recipientCount: eligibleCount,
    startDate: scheduleType === "scheduled" && scheduledAt ? scheduledAt : undefined,
  }, Boolean(connectionId));

  const forecastData = forecastQuery.data?.data;
  const currentQuota = forecastData?.current;

  const limit = currentQuota?.limit ?? 1000;
  const used = currentQuota?.used ?? 0;
  const reserved = currentQuota?.reserved ?? 0;
  const availableNow = currentQuota?.available ?? 1000;

  const todayCapacity = Math.min(eligibleCount, availableNow);
  const rolloverCount = Math.max(0, eligibleCount - availableNow);

  // Warnings check for missing required fields (NOT for quota rollover)
  const warnings: string[] = [];
  if (!name.trim()) warnings.push("Campaign name is missing.");
  if (!connectionId) warnings.push("No WhatsApp connection selected.");
  if (!template) warnings.push("No Meta template selected.");
  if (audienceType === "import" && !importDetails) warnings.push("No contact import selected.");
  if (audienceType === "select" && selectedContactCount === 0) warnings.push("No contacts selected.");
  if (audienceType === "tags" && !tagsInput.trim()) warnings.push("No contact tags specified.");

  const canLaunch = warnings.length === 0 && !isSubmitting;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Rocket className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 6: Review & Launch Campaign</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Verify configurations, recipient counts, daily messaging quota allocations, and rollover dispatch forecast.
        </p>
      </div>

      {/* Configuration Warnings Banner (Missing required fields) */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Please complete required steps before launching:
          </div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Review Details & Quota Forecast */}
        <div className="space-y-6 lg:col-span-7">
          {/* Campaign Details Box */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Megaphone className="h-3.5 w-3.5" />
              Campaign Configuration
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{name || "Untitled Campaign"}</p>
              {description ? (
                <p className="text-xs text-gray-500">{description}</p>
              ) : (
                <p className="text-xs italic text-gray-400">No description provided</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
              <div>
                <span className="text-gray-400">WhatsApp Account</span>
                <p className="mt-0.5 font-medium text-gray-900">
                  {connectionDetails ? `${connectionDetails.name} (${connectionDetails.phone})` : "Not Selected"}
                </p>
              </div>

              <div>
                <span className="text-gray-400">Schedule</span>
                <p className="mt-0.5 font-medium text-gray-900">
                  {scheduleType === "now"
                    ? "Immediate Dispatch (Send Now)"
                    : `Scheduled for ${new Date(scheduledAt).toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Target Audience Summary Section */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Users className="h-3.5 w-3.5" />
                Target Audience & Eligible Contacts
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Selected / Eligible Contacts: {eligibleCount > 0 ? eligibleCount.toLocaleString() : "Calculating audience..."}
              </span>
            </div>

            <div className="mt-3 text-xs">
              {audienceType === "import" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Source: Contact Import File</span>
                    <span className="text-emerald-700">{importDetails?.name || "Selected Import List"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-[10px] text-gray-500">Total Rows</p>
                      <p className="font-bold text-gray-900">{(importDetails?.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <p className="text-[10px] text-emerald-700">Valid / Eligible</p>
                      <p className="font-bold text-emerald-900">{(importDetails?.valid || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2">
                      <p className="text-[10px] text-amber-700">Invalid / Excluded</p>
                      <p className="font-bold text-amber-900">{(importDetails?.invalid || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {audienceType === "select" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Source: Manual Contact Selection</span>
                    <span className="text-emerald-700">{selectedContactCount.toLocaleString()} Contacts Selected</span>
                  </div>

                  {selectedContactList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-auto pt-1">
                      {selectedContactList.slice(0, 10).map((c) => (
                        <span key={c._id} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {c.displayName} ({c.phoneNumberE164})
                        </span>
                      ))}
                      {selectedContactList.length > 10 && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          + {selectedContactList.length - 10} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {audienceType === "tags" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Source: Contact Tags</span>
                    <span className="text-emerald-700">Tags: {tagsInput || "None"}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1">
                    Matching workspace contacts containing specified tags will be resolved at campaign materialization launch.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Daily WhatsApp Quota & Rollover Forecast Section */}
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                Daily WhatsApp Quota & Rollover Forecast
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {currentQuota?.dateString || "Today"} ({timezone})
              </span>
            </div>

            {/* Quota API Query Loading State */}
            {forecastQuery.isLoading && (
              <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Loading daily messaging quota and dispatch forecast...
              </div>
            )}

            {/* Quota API Query Error State (Non-blocking retry action) */}
            {forecastQuery.isError && (
              <div className="my-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Unable to load today's quota details
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white text-red-700 hover:bg-red-50"
                    onClick={() => forecastQuery.refetch()}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Retry
                  </Button>
                </div>
                <p className="mt-1 text-[11px] text-red-600">
                  You can still launch your campaign. Quota limit checks will be automatically validated by the backend scheduler.
                </p>
              </div>
            )}

            {/* Quota & Rollover Visual Display */}
            {forecastData && (
              <div className="mt-3 space-y-4">
                {/* Daily Quota Metrics Table Grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">Daily Limit</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">{limit.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <p className="text-[10px] text-blue-700 font-medium">Used Today</p>
                    <p className="mt-0.5 text-sm font-bold text-blue-900">{used.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2.5">
                    <p className="text-[10px] text-amber-700 font-medium">Reserved</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-900">{reserved.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <p className="text-[10px] text-emerald-700 font-medium">Available Now</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-900">{availableNow.toLocaleString()}</p>
                  </div>
                </div>

                {/* Dispatch Forecast Banner & Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
                    <span>Campaign Dispatch Capacity Plan</span>
                    <span className="text-emerald-700">
                      Estimated Completion: {forecastData.estimatedCompletionDate}
                    </span>
                  </div>

                  {/* Rollover Message Banner */}
                  <div className="mt-2.5">
                    {eligibleCount <= availableNow ? (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-100/70 p-2.5 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        All {eligibleCount.toLocaleString()} selected recipients will be dispatched today.
                      </div>
                    ) : availableNow === 0 ? (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-100/70 p-2.5 text-xs font-semibold text-amber-900">
                        <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                        Today's quota is fully used. Your campaign will begin when quota resets on the next quota day.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-100/70 p-2.5 text-xs font-semibold text-amber-900">
                        <Layers className="h-4 w-4 shrink-0 text-amber-600" />
                        {todayCapacity.toLocaleString()} recipients will be dispatched today. {rolloverCount.toLocaleString()} recipients will roll over to subsequent quota days.
                      </div>
                    )}
                  </div>

                  {/* Day-by-Day Rollover Schedule Breakdown */}
                  {forecastData.schedule.length > 1 && (
                    <div className="mt-3 border-t pt-2.5 space-y-1.5 text-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Estimated Rollover Schedule
                      </p>
                      <div className="divide-y divide-gray-200/60 rounded-lg border bg-white">
                        {forecastData.schedule.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-1.5 text-[11px]">
                            <span className="font-semibold text-gray-800">
                              {idx === 0 ? "Today" : `Day ${idx + 1}`} ({item.dateString})
                            </span>
                            <span className="font-bold text-emerald-700">
                              {item.recipientsPlanned.toLocaleString()} recipients
                            </span>
                            <span className="text-gray-400">
                              {item.remaining > 0 ? `${item.remaining.toLocaleString()} remaining` : "Completed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b pb-2 mb-3">
              Live WhatsApp Recipient Preview
            </h3>
            <WhatsAppMessagePreview template={template} variableValues={variableValues} />
          </div>
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between border-t pt-4">
        {/* Left: Back */}
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Center: Draft Status & Save Draft */}
        <div className="flex items-center gap-3">
          {lastSavedTime && (
            <span className="text-[11px] text-gray-400 font-medium">
              Draft saved at {lastSavedTime}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="border-gray-300 hover:bg-slate-50"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-gray-600" />
                Save Draft
              </>
            )}
          </Button>
        </div>

        {/* Right Primary: Launch Campaign */}
        <Button
          type="button"
          onClick={onLaunch}
          disabled={!canLaunch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Launch...
            </>
          ) : scheduleType === "scheduled" ? (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Campaign
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Launch Campaign Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
