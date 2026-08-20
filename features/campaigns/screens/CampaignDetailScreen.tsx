"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useCampaign,
  useCampaignRecipients,
  useUpdateCampaignStatus,
} from "../campaign.queries";
import { useCampaignRealtime } from "../campaign.realtime";
import { exportCampaignCSV } from "../campaign.api";
import { useQuota } from "../../quotas/quota.queries";
import { CampaignDetailHeader } from "../components/CampaignDetailHeader";
import { CampaignDetailStats } from "../components/CampaignDetailStats";
import { CampaignRecipientsTable } from "../components/CampaignRecipientsTable";

interface CampaignDetailScreenProps {
  id: string;
}

export function CampaignDetailScreen({ id }: CampaignDetailScreenProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useCampaignRealtime();

  const campaignQuery = useCampaign(id);
  const recipientsQuery = useCampaignRecipients(id, { page, limit, search, status: statusFilter });
  const updateStatusMutation = useUpdateCampaignStatus();

  const campaign = campaignQuery.data?.campaign;
  const recipientsData = recipientsQuery.data?.data;

  const quotaQuery = useQuota(campaign?.connectionId, Boolean(campaign?.connectionId));
  const quota = quotaQuery.data;

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

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      <CampaignDetailHeader
        campaign={campaign}
        onExportCSV={handleExportCSV}
        onAction={handleAction}
      />

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <CampaignDetailStats campaign={campaign} quota={quota} />
          
          <CampaignRecipientsTable
            recipientsData={recipientsData}
            isLoading={recipientsQuery.isLoading}
            page={page}
            setPage={setPage}
            limit={limit}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRefetch={() => recipientsQuery.refetch()}
          />
        </div>
      </div>
    </div>
  );
}
