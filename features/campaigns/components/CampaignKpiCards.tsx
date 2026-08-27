import React from "react";
import { Megaphone, Users, TrendingUp } from "lucide-react";

export interface CampaignKpiStats {
  total: number;
  running: number;
  completed: number;
  drafts: number;
  totalRecipients: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
}

export function CampaignKpiCards({ stats }: { stats: CampaignKpiStats }) {
  return (
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
          <span className="text-2xl font-extrabold text-gray-900">{stats.total}</span>
          <span className="text-[11px] font-semibold text-gray-500">{stats.drafts} Drafts</span>
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
          <span className="text-2xl font-extrabold text-emerald-900">{stats.running}</span>
          <span className="text-[11px] font-semibold text-emerald-700">{stats.completed} Completed</span>
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
          <span className="text-2xl font-extrabold text-gray-900">{stats.totalRecipients.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-blue-700">{stats.totalDelivered.toLocaleString()} Delivered</span>
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
          <span className="text-2xl font-extrabold text-gray-900">{stats.deliveryRate}%</span>
          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden border">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.deliveryRate}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
