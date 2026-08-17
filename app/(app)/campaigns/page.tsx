"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Megaphone } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useCampaigns, useCampaignRealtime } from "../../../features/campaigns";
import type { Campaign } from "../../../features/campaigns";

export default function CampaignsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  // Realtime events
  useCampaignRealtime();

  const { data, isLoading } = useCampaigns();
  
  const campaigns = useMemo(() => {
    if (!data?.campaigns) return [];
    
    let filtered: Campaign[] = data.campaigns;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [data, search]);

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
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <h1 className="text-lg font-medium flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-gray-500" />
          Campaigns
        </h1>
        <Button onClick={() => router.push("/campaigns/new")} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50">
        <div className="mx-auto max-w-6xl space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search campaigns..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {search ? "Try adjusting your search query." : "Get started by creating your first campaign."}
              </p>
              {!search && (
                <Button onClick={() => router.push("/campaigns/new")} className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Recipients</th>
                    <th className="px-6 py-3 font-medium text-right">Sent</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campaigns.map((campaign) => (
                    <tr 
                      key={campaign._id} 
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/campaigns/${campaign._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-slate-500 text-xs mt-1 truncate max-w-[250px]">
                            {campaign.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusColor(campaign.status)}`}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {campaign.stats?.totalRecipients?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {campaign.stats?.sent?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.createdAt))}
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
