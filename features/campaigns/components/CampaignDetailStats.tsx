import React from "react";
import { Info, Calendar, Clock, Users, Smartphone, FileText, CheckCircle2, BarChart3, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Campaign } from "../campaign.types";

interface QuotaInfo {
  dateString: string;
  limit: number;
  used: number;
  reserved: number;
  available: number;
}

interface CampaignDetailStatsProps {
  campaign: Campaign;
  quota?: QuotaInfo;
}

export function CampaignDetailStats({ campaign, quota }: CampaignDetailStatsProps) {
  const totalRecipients = campaign.stats?.totalRecipients || 0;
  const skippedRecipients = campaign.stats?.skipped || 0;
  const eligibleRecipients = Math.max(0, totalRecipients - skippedRecipients);
  const deliveredCount = campaign.stats?.delivered || 0;
  const readCount = campaign.stats?.read || 0;
  const failedCount = campaign.stats?.failed || 0;

  const deliveryRate = eligibleRecipients > 0 ? Math.round((deliveredCount / eligibleRecipients) * 100) : 0;
  const readRate = deliveredCount > 0 ? Math.round((readCount / deliveredCount) * 100) : 0;
  const failureRate = eligibleRecipients > 0 ? Math.round((failedCount / eligibleRecipients) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Campaign Overview & Timestamps Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Info className="h-4 w-4 text-emerald-600" />
              </div>
              Campaign Overview
            </h2>
            <p className="text-sm text-gray-500 mt-1">{campaign.description || "No description provided."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 font-medium text-gray-700 border border-gray-200/60">
              <Calendar className="h-4 w-4 text-gray-400" />
              Created: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 font-medium text-gray-700 border border-gray-200/60">
              <Clock className="h-4 w-4 text-gray-400" />
              Updated: {campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
            <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Schedule Mode</span>
              <span className="font-semibold text-gray-900 text-sm">
                {campaign.schedule?.scheduledAt ? new Date(campaign.schedule.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Immediate Dispatch"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
            <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Target Audience</span>
              <span className="font-semibold text-gray-900 text-sm truncate block">
                {campaign.audience?.importId
                  ? "CSV Import File"
                  : campaign.audience?.contactIds?.length
                  ? `${campaign.audience.contactIds.length} Selected Contacts`
                  : campaign.audience?.tags?.length
                  ? `Tags: ${Array.isArray(campaign.audience.tags) ? campaign.audience.tags.join(", ") : campaign.audience.tags}`
                  : "All Audience Contacts"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
            <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
              <Smartphone className="h-4 w-4 text-purple-600" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">WhatsApp Account</span>
              <span className="font-semibold text-gray-900 text-sm truncate block">
                {campaign.connectionId || "Default Account"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
            <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Template ID</span>
              <span className="font-semibold text-gray-900 text-sm truncate block">
                {campaign.templateId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics & Rates */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 opacity-5">
            <CheckCircle2 className="h-24 w-24 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Rate</span>
            <div className="rounded-full bg-emerald-50 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{deliveryRate}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-emerald-50 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${deliveryRate}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500">
              <span className="text-gray-900 font-bold">{deliveredCount.toLocaleString()}</span> delivered out of {eligibleRecipients.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 opacity-5">
            <BarChart3 className="h-24 w-24 text-blue-600" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Read Rate</span>
            <div className="rounded-full bg-blue-50 p-1.5">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{readRate}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-blue-50 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${readRate}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500">
              <span className="text-gray-900 font-bold">{readCount.toLocaleString()}</span> read out of {deliveredCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 opacity-5">
            <AlertTriangle className="h-24 w-24 text-amber-600" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failure Rate</span>
            <div className="rounded-full bg-amber-50 p-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{failureRate}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-amber-50 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${failureRate}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500">
              <span className="text-gray-900 font-bold">{failedCount.toLocaleString()}</span> failed out of {eligibleRecipients.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Recipient Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        <StatCard label="Total" value={campaign.stats?.totalRecipients || 0} color="bg-gray-50 border-gray-200 text-gray-800" />
        <StatCard label="Pending" value={campaign.stats?.pending || 0} color="bg-gray-50 border-gray-200 text-gray-600" />
        <StatCard label="Scheduled" value={campaign.stats?.scheduled || 0} color="bg-yellow-50 border-yellow-200 text-yellow-800" />
        <StatCard label="Processing" value={campaign.stats?.processing || 0} color="bg-blue-50 border-blue-200 text-blue-800" />
        <StatCard label="Sent" value={campaign.stats?.sent || 0} color="bg-indigo-50 border-indigo-200 text-indigo-800" />
        <StatCard label="Delivered" value={campaign.stats?.delivered || 0} color="bg-emerald-50 border-emerald-200 text-emerald-800" />
        <StatCard label="Read" value={campaign.stats?.read || 0} color="bg-emerald-100 border-emerald-300 text-emerald-900" />
        <StatCard label="Failed" value={campaign.stats?.failed || 0} color="bg-red-50 border-red-200 text-red-800" />
        <StatCard label="Unknown" value={campaign.stats?.unknown || 0} color="bg-amber-50 border-amber-200 text-amber-800" />
        <StatCard label="Skipped" value={campaign.stats?.skipped || 0} color="bg-slate-100 border-slate-200 text-slate-700" />
      </div>

      {/* Quota Usage Banner if available */}
      {quota && (
        <div className="rounded-xl border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Daily Quota Usage ({quota.dateString})
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3 text-center text-xs">
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
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-opacity-40 p-3.5 transition-all hover:scale-105 hover:shadow-sm ${color}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{label}</span>
      <span className="text-xl font-black">{value.toLocaleString()}</span>
    </div>
  );
}
