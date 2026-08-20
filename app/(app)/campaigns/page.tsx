"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Megaphone,
  RefreshCw,
  Calendar,
  CheckCircle2,
  BarChart2,
  Trash2,
  PlayCircle,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Users,
  Send,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Eye,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useCampaigns, useCampaignRealtime, useDeleteCampaign } from "../../../features/campaigns";
import type { Campaign } from "../../../features/campaigns";

export default function CampaignsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Realtime updates subscription
  useCampaignRealtime();

  const { data, isLoading, refetch } = useCampaigns();
  const deleteMutation = useDeleteCampaign();

  const handleDelete = async (campaign: Campaign) => {
    const isDraft = campaign.status === "draft";
    const msg = isDraft
      ? `Are you sure you want to delete draft "${campaign.name}"?`
      : `Are you sure you want to delete campaign "${campaign.name}"?`;

    if (window.confirm(msg)) {
      try {
        await deleteMutation.mutateAsync(campaign._id);
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to delete campaign");
      }
    }
  };

  const campaigns = useMemo(() => {
    if (!data?.campaigns) return [];

    let filtered: Campaign[] = data.campaigns;

    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [data, search, statusFilter]);

  // Executive KPI stats calculation
  const kpiStats = useMemo(() => {
    const all = data?.campaigns || [];
    const total = all.length;
    const running = all.filter((c) => c.status === "running" || c.status === "scheduled").length;
    const completed = all.filter((c) => c.status === "completed").length;
    const drafts = all.filter((c) => c.status === "draft").length;
    
    const totalRecipients = all.reduce((acc, c) => acc + (c.stats?.totalRecipients || 0), 0);
    const totalDelivered = all.reduce((acc, c) => acc + (c.stats?.delivered || 0), 0);
    const totalRead = all.reduce((acc, c) => acc + (c.stats?.read || 0), 0);
    const totalFailed = all.reduce((acc, c) => acc + (c.stats?.failed || 0), 0);
    
    const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;

    return { total, running, completed, drafts, totalRecipients, totalDelivered, totalRead, totalFailed, deliveryRate };
  }, [data]);

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Running
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            Scheduled
          </span>
        );
      case "validating":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
            Validating
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 border border-orange-200">
            Paused
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 border border-gray-200">
            Cancelled
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
            <AlertTriangle className="h-3 w-3 text-red-600" />
            Failed
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
            <FileText className="h-3 w-3 text-slate-400" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col space-y-6 bg-[#fcfbfa] p-4 lg:p-6">
      {/* Enterprise Top Header Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e5ddd3] bg-[#fbf7f1] p-5 shadow-xs md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d644d] text-white shadow-xs">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#25342f]">
                Campaign Operations
              </h1>
              <p className="text-xs text-[#6f7f75]">
                Enterprise WhatsApp bulk messaging center & real-time delivery performance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => refetch()}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#6f7f75]" />
            Refresh
          </Button>

          <Button
            className="bg-[#2d644d] text-white hover:bg-[#255440] shadow-xs"
            onClick={() => router.push("/campaigns/new")}
            size="sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Modern Executive KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Campaigns */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Campaigns</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{kpiStats.total}</span>
            <span className="text-[11px] font-semibold text-gray-500">{kpiStats.drafts} Drafts</span>
          </div>
        </div>

        {/* Card 2: Active Dispatch */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Active / Running</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-900">{kpiStats.running}</span>
            <span className="text-[11px] font-semibold text-emerald-700">{kpiStats.completed} Completed</span>
          </div>
        </div>

        {/* Card 3: Total Audience Reach */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Target Recipients</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{kpiStats.totalRecipients.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-blue-700">{kpiStats.totalDelivered.toLocaleString()} Delivered</span>
          </div>
        </div>

        {/* Card 4: Overall Delivery Rate */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Avg Delivery Rate</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{kpiStats.deliveryRate}%</span>
            <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden border">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kpiStats.deliveryRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Filter & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search campaigns by title, tag, or description..."
              className="pl-9 h-9 text-xs bg-white rounded-xl border-[#ddd2c3]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ddd2c3]">
            {[
              { id: "", label: "All Statuses" },
              { id: "running", label: "Running" },
              { id: "completed", label: "Completed" },
              { id: "draft", label: "Drafts" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    isActive ? "bg-[#2d644d] text-white shadow-2xs" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Campaign Data Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
          <RefreshCw className="h-8 w-8 animate-spin text-[#2d644d] mb-3" />
          <p className="text-xs font-semibold text-gray-600">Loading workspace campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ddd2c3] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Megaphone className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-gray-900">No campaigns match your view</h3>
          <p className="mt-1 text-xs text-gray-500">
            {search || statusFilter ? "Try adjusting your search query or status filter." : "Create your first bulk WhatsApp campaign to reach your customers."}
          </p>
          {!search && !statusFilter && (
            <Button
              onClick={() => router.push("/campaigns/new")}
              className="mt-5 bg-[#2d644d] text-white hover:bg-[#255440] shadow-xs"
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#fafafa] text-gray-500 border-b border-[#e4e4e7] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Campaign Details</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Recipients</th>
                  <th className="px-4 py-3.5 text-right">Delivered</th>
                  <th className="px-4 py-3.5 text-right">Read</th>
                  <th className="px-4 py-3.5 text-right">Failed</th>
                  <th className="px-4 py-3.5">Delivery Progress</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => {
                  const total = campaign.stats?.totalRecipients || 0;
                  const delivered = campaign.stats?.delivered || 0;
                  const read = campaign.stats?.read || 0;
                  const failed = campaign.stats?.failed || 0;
                  const deliveryPct = total > 0 ? Math.min(100, Math.round((delivered / total) * 100)) : 0;

                  return (
                    <tr
                      key={campaign._id}
                      className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                      onClick={() => {
                        if (campaign.status === "draft") {
                          router.push(`/campaigns/new?draft=${campaign._id}`);
                        } else {
                          router.push(`/campaigns/${campaign._id}`);
                        }
                      }}
                    >
                      {/* Campaign Title & Description */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-600 transition-colors">
                            <Megaphone className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5 group-hover:text-emerald-900">
                              {campaign.name}
                              <ArrowUpRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {campaign.description && (
                              <div className="text-gray-500 text-[11px] mt-0.5 truncate max-w-xs font-normal">
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {getStatusBadge(campaign.status)}
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {total.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-700">
                        {delivered.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-blue-700">
                        {read.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-red-600">
                        {failed.toLocaleString()}
                      </td>

                      {/* Visual Progress Bar */}
                      <td className="px-4 py-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-600">
                            <span>{deliveryPct}%</span>
                            <span>{delivered}/{total}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${deliveryPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap font-medium">
                        {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 hover:bg-emerald-50"
                            onClick={() => {
                              if (campaign.status === "draft") {
                                router.push(`/campaigns/new?draft=${campaign._id}`);
                              } else {
                                router.push(`/campaigns/${campaign._id}`);
                              }
                            }}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>

                          {!["running", "validating", "scheduled"].includes(campaign.status) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Campaign"
                              onClick={() => handleDelete(campaign)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
