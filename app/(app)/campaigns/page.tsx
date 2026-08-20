"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Megaphone, RefreshCw, Calendar, CheckCircle2, BarChart2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useCampaigns, useCampaignRealtime } from "../../../features/campaigns";
import type { Campaign } from "../../../features/campaigns";

export default function CampaignsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Realtime updates
  useCampaignRealtime();

  const { data, isLoading, refetch } = useCampaigns();

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

  const getStatusColor = (status: Campaign["status"]) => {
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

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-6">
        <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          WhatsApp Campaigns
        </h1>
        <Button onClick={() => router.push("/campaigns/new")} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Campaign
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-8 bg-white h-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 shadow-xs focus:outline-hidden"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="validating">Validating</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {/* Campaign Table */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-base font-semibold text-gray-900">No campaigns found</h3>
              <p className="mt-1 text-xs text-gray-500">
                {search || statusFilter ? "Try adjusting your search or status filter." : "Get started by creating your first bulk campaign."}
              </p>
              {!search && !statusFilter && (
                <Button onClick={() => router.push("/campaigns/new")} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-500 border-b">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Campaign Name</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Recipients</th>
                    <th className="px-5 py-3 font-semibold text-right">Delivered</th>
                    <th className="px-5 py-3 font-semibold text-right">Read</th>
                    <th className="px-5 py-3 font-semibold text-right">Failed</th>
                    <th className="px-5 py-3 font-semibold">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign._id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => router.push(`/campaigns/${campaign._id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-gray-500 text-[11px] mt-0.5 truncate max-w-xs">
                            {campaign.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getStatusColor(campaign.status)}`}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                        {(campaign.stats?.totalRecipients || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-700 font-semibold">
                        {(campaign.stats?.delivered || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-blue-700 font-semibold">
                        {(campaign.stats?.read || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-amber-700 font-semibold">
                        {(campaign.stats?.failed || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
