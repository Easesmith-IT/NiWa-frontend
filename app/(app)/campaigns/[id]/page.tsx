"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  Search,
  RefreshCw,
  Megaphone,
  Loader2,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Calendar,
  Clock,
  Users,
  FileText,
  Smartphone,
  Info,
} from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  useCampaign,
  useCampaignRecipients,
  useCampaignRealtime,
  useUpdateCampaignStatus,
  useValidateCampaign,
  exportCampaignCSV,
} from "../../../../features/campaigns";
import { useQuota } from "../../../../features/quotas/quota.queries";

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useCampaignRealtime();

  const campaignQuery = useCampaign(id);
  const recipientsQuery = useCampaignRecipients(id, { page, limit, search, status: statusFilter });
  const updateStatusMutation = useUpdateCampaignStatus();
  const validateMutation = useValidateCampaign();

  const campaign = campaignQuery.data?.campaign;
  const recipientsData = recipientsQuery.data?.data;

  const quotaQuery = useQuota(campaign?.connectionId, Boolean(campaign?.connectionId));
  const quota = quotaQuery.data;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "draft": return "bg-gray-200 text-gray-700";
      case "validating": return "bg-blue-200 text-blue-700";
      case "scheduled": return "bg-yellow-200 text-yellow-700";
      case "running": return "bg-green-200 text-green-700";
      case "paused": return "bg-orange-200 text-orange-700";
      case "completed": return "bg-emerald-200 text-emerald-800";
      case "cancelled": return "bg-red-200 text-red-700";
      case "failed": return "bg-red-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  if (campaignQuery.isLoading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Campaign...
      </div>
    );
  }

  if (!campaign) {
    return <div className="p-12 text-center text-sm text-red-500">Campaign not found.</div>;
  }

  const handleAction = async (action: "pause" | "resume" | "cancel") => {
    await updateStatusMutation.mutateAsync({ id, action });
  };

  const handleValidate = async () => {
    await validateMutation.mutateAsync(id);
  };

  const handleExportCSV = async () => {
    try {
      const data = await exportCampaignCSV(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `campaign-${id}-recipients.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Performance Analytics Formulas
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
    <div className="flex h-full flex-col bg-slate-50/50">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")} className="mr-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Megaphone className="w-5 h-5 text-emerald-600" />
          <h1 className="text-base font-semibold text-gray-900">{campaign.name}</h1>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ml-2 ${getStatusColor(campaign.status)}`}>
            {campaign.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          {campaign.status === "draft" && (
            <Button
              onClick={() => router.push(`/campaigns/new?draft=${campaign._id}`)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Resume Editing Draft
            </Button>
          )}
          {campaign.status === "running" && (
            <Button onClick={() => handleAction("pause")} variant="secondary" size="sm">
              <Pause className="w-4 h-4 mr-1.5" /> Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button onClick={() => handleAction("resume")} variant="secondary" size="sm">
              <Play className="w-4 h-4 mr-1.5" /> Resume
            </Button>
          )}
          {(["draft", "validating", "scheduled", "running", "paused"].includes(campaign.status)) && (
            <Button onClick={() => handleAction("cancel")} variant="destructive" size="sm">
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-6">

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

          {/* Recipient Explorer */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            <div className="border-b px-4 py-3 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900 text-sm">Recipient Explorer</h2>
              <div className="flex gap-2 items-center">
                <select
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 shadow-xs focus:outline-hidden"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="processing">Processing</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read</option>
                  <option value="failed">Failed</option>
                  <option value="unknown">Unknown</option>
                  <option value="skipped">Skipped</option>
                </select>
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search phone..."
                    className="pl-8 h-9 text-xs"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => recipientsQuery.refetch()} className="h-9 w-9">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-gray-500 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Phone Number</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Meta Message ID</th>
                    <th className="px-4 py-3 font-semibold">Last Attempt</th>
                    <th className="px-4 py-3 font-semibold">Failure / Unknown Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipientsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" /> Loading recipients...
                      </td>
                    </tr>
                  ) : recipientsData?.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        No recipients matching current filter.
                      </td>
                    </tr>
                  ) : (
                    recipientsData?.items.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-gray-900">{rec.phoneNumberE164}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getStatusColor(rec.status)}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                          {rec.metaMessageId || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {rec.lastAttemptAt
                            ? new Date(rec.lastAttemptAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {rec.status === "failed" && rec.failureReason && (
                            <span className="text-red-600 font-medium">{rec.failureReason}</span>
                          )}
                          {rec.status === "unknown" && (
                            <span className="inline-flex items-center text-amber-700 gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <HelpCircle className="h-3 w-3 shrink-0" />
                              Meta timeout (No automatic retry to prevent duplicates)
                            </span>
                          )}
                          {rec.status !== "failed" && rec.status !== "unknown" && (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {recipientsData && recipientsData.pagination && (
              <div className="border-t px-4 py-3 flex items-center justify-between bg-slate-50/60 text-xs text-gray-600">
                <div>
                  Showing {Math.min(1 + (page - 1) * limit, recipientsData.pagination.total)} to{" "}
                  {Math.min(page * limit, recipientsData.pagination.total)} of {recipientsData.pagination.total} recipients
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= recipientsData.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
