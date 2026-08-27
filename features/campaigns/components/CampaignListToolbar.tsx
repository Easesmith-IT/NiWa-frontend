import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import type { Campaign } from "../campaign.types";

interface CampaignListToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export function CampaignListToolbar({ search, setSearch, statusFilter, setStatusFilter }: CampaignListToolbarProps) {
  return (
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
  );
}
