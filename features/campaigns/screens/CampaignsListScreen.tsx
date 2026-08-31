"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Megaphone, RefreshCw, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ConfirmDialog } from "../../../components/shared/ConfirmDialog";
import { useCampaigns, useDeleteCampaign } from "../campaign.queries";
import { useCampaignRealtime } from "../campaign.realtime";
import type { Campaign } from "../campaign.types";

import { CampaignKpiCards } from "../components/CampaignKpiCards";
import { CampaignListToolbar } from "../components/CampaignListToolbar";
import { CampaignTable } from "../components/CampaignTable";
import { CampaignEmptyState } from "../components/CampaignEmptyState";

export function CampaignsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  // Realtime updates subscription
  useCampaignRealtime();

  const { data, isLoading, error, refetch } = useCampaigns();
  const deleteMutation = useDeleteCampaign();

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;
    try {
      await deleteMutation.mutateAsync(campaignToDelete._id);
      setCampaignToDelete(null);
    } catch (err) {
      alert((isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to delete campaign");
    }
  };

  const campaigns = useMemo(() => {
    const rawCampaigns = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.campaigns)
      ? (data as any).campaigns
      : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

    let filtered: Campaign[] = rawCampaigns;

    if (statusFilter) {
      filtered = filtered.filter((c) => c && c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) => c && (c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [data, search, statusFilter]);

  // Executive KPI stats calculation
  const kpiStats = useMemo(() => {
    const all: Campaign[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.campaigns)
      ? (data as any).campaigns
      : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

    const total = all.length;
    const running = all.filter((c) => c && (c.status === "running" || c.status === "scheduled")).length;
    const completed = all.filter((c) => c && c.status === "completed").length;
    const drafts = all.filter((c) => c && c.status === "draft").length;
    
    const totalRecipients = all.reduce((acc, c) => acc + (c.stats?.totalRecipients || 0), 0);
    const totalDelivered = all.reduce((acc, c) => acc + (c.stats?.delivered || 0), 0);
    const totalRead = all.reduce((acc, c) => acc + (c.stats?.read || 0), 0);
    const totalFailed = all.reduce((acc, c) => acc + (c.stats?.failed || 0), 0);
    
    const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;

    return { total, running, completed, drafts, totalRecipients, totalDelivered, totalRead, totalFailed, deliveryRate };
  }, [data]);

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

      <CampaignKpiCards stats={kpiStats} />

      <CampaignListToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Main Campaign Data Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
          <RefreshCw className="h-8 w-8 animate-spin text-[#2d644d] mb-3" />
          <p className="text-xs font-semibold text-gray-600">Loading workspace campaigns...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-red-100 text-center">
          <p className="text-sm font-semibold text-red-600 mb-1">Failed to load campaigns</p>
          <p className="text-xs text-red-500 max-w-sm">Please check your connection and try again.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : campaigns.length === 0 ? (
        <CampaignEmptyState
          search={search}
          statusFilter={statusFilter}
          onCreate={() => router.push("/campaigns/new")}
        />
      ) : (
        <CampaignTable
          campaigns={campaigns}
          onView={(campaign) => {
            if (campaign.status === "draft") {
              router.push(`/campaigns/new?draft=${campaign._id}`);
            } else {
              router.push(`/campaigns/${campaign._id}`);
            }
          }}
          onDelete={setCampaignToDelete}
        />
      )}

      <ConfirmDialog
        open={!!campaignToDelete}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
        title={campaignToDelete?.status === "draft" ? "Delete Draft" : "Delete Campaign"}
        description={`Are you sure you want to delete ${
          campaignToDelete?.status === "draft" ? "draft" : "campaign"
        } "${campaignToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}

      />
    </div>
  );
}
