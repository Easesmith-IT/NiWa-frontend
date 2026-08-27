import React from "react";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CampaignEmptyStateProps {
  search: string;
  statusFilter: string;
  onCreate: () => void;
}

export function CampaignEmptyState({ search, statusFilter, onCreate }: CampaignEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e4e4e7] shadow-2xs text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-4 border border-emerald-100">
        <Megaphone className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">
        {search || statusFilter ? "No campaigns found" : "No campaigns yet"}
      </h3>
      <p className="mt-1 text-xs text-gray-500 max-w-sm">
        {search || statusFilter ? "Try adjusting your search query or status filter." : "Create your first bulk WhatsApp campaign to reach your customers."}
      </p>
      {!search && !statusFilter && (
        <Button
          onClick={onCreate}
          className="mt-5 bg-[#2d644d] text-white hover:bg-[#255440] shadow-xs"
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create Campaign
        </Button>
      )}
    </div>
  );
}
