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
} from "../../../../features/campaigns";
import { v1ApiClient } from "../../../../lib/api/v1-client";
import { apiClient } from "../../../../lib/api/client";

export interface QuotaData {
  limit: number;
  used: number;
  reserved: number;
  released: number;
  available: number;
  dateString: string;
}

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

  const quotaQuery = useQuery({
    queryKey: ["quota", campaign?.connectionId],
    queryFn: async () => {
      const { data } = await v1ApiClient.get<{ data: QuotaData }>("/quotas", {
        params: { connectionId: campaign?.connectionId },
      });
      return data.data;
    },
    enabled: Boolean(campaign?.connectionId),
  });

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
      const response = await apiClient.get(`/campaigns/${id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
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
          <div className="rounded-xl border bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-600" />
                  Campaign Overview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{campaign.description || "No description provided."}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  Created: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  Updated: {campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="text-gray-400 font-medium block mb-0.5">Schedule Mode</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  {campaign.schedule?.scheduledAt ? new Date(campaign.schedule.scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Immediate Dispatch"}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="text-gray-400 font-medium block mb-0.5">Target Audience Source</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  {(campaign.audience as any)?.importId
                    ? "CSV Import File"
                    : (campaign.audience as any)?.contactIds?.length
                    ? `${(campaign.audience as any).contactIds.length} Selected Contacts`
                    : (campaign.audience as any)?.tags?.length
                    ? `Tags: ${Array.isArray((campaign.audience as any).tags) ? (campaign.audience as any).tags.join(", ") : (campaign.audience as any).tags}`
                    : "All Audience Contacts"}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="text-gray-400 font-medium block mb-0.5">WhatsApp Account</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                  <Smartphone className="h-3.5 w-3.5 text-purple-600" />
                  {campaign.connectionId || "Default Account"}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="text-gray-400 font-medium block mb-0.5">Template ID</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  {campaign.templateId}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Analytics & Rates */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Delivery Rate</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{deliveryRate}%</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${deliveryRate}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                {deliveredCount.toLocaleString()} delivered of {eligibleRecipients.toLocaleString()} eligible
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Read Rate</span>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{readRate}%</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readRate}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                {readCount.toLocaleString()} read of {deliveredCount.toLocaleString()} delivered
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Failure Rate</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{failureRate}%</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${failureRate}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                {failedCount.toLocaleString()} failed of {eligibleRecipients.toLocaleString()} eligible
              </p>
            </div>
          </div>

          {/* Detailed Recipient Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            <StatCard label="Total" value={campaign.stats?.totalRecipients || 0} color="bg-gray-100 text-gray-800" />
            <StatCard label="Pending" value={campaign.stats?.pending || 0} color="bg-gray-50 text-gray-600" />
            <StatCard label="Scheduled" value={campaign.stats?.scheduled || 0} color="bg-yellow-50 text-yellow-800" />
            <StatCard label="Processing" value={campaign.stats?.processing || 0} color="bg-blue-50 text-blue-800" />
            <StatCard label="Sent" value={campaign.stats?.sent || 0} color="bg-indigo-50 text-indigo-800" />
            <StatCard label="Delivered" value={campaign.stats?.delivered || 0} color="bg-emerald-50 text-emerald-800" />
            <StatCard label="Read" value={campaign.stats?.read || 0} color="bg-emerald-100 text-emerald-900" />
            <StatCard label="Failed" value={campaign.stats?.failed || 0} color="bg-red-50 text-red-800" />
            <StatCard label="Unknown" value={campaign.stats?.unknown || 0} color="bg-amber-50 text-amber-800" />
            <StatCard label="Skipped" value={campaign.stats?.skipped || 0} color="bg-slate-100 text-slate-700" />
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
    <div className={`rounded-xl border p-3 text-center shadow-2xs ${color}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</div>
      <div className="mt-1 text-lg font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
