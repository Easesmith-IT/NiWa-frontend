import React from "react";
import { Megaphone, ArrowUpRight, Eye, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { Campaign } from "../campaign.types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignTable({ campaigns, onView, onDelete }: CampaignTableProps) {
  return (
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
                  onClick={() => onView(campaign)}
                >
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

                  <td className="px-4 py-4">
                    <CampaignStatusBadge status={campaign.status} />
                  </td>

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

                  <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap font-medium">
                    {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 hover:bg-emerald-50"
                        onClick={() => onView(campaign)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>

                      {!["running", "validating", "scheduled"].includes(campaign.status) ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Campaign"
                          onClick={() => onDelete(campaign)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="w-8" />
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
  );
}
