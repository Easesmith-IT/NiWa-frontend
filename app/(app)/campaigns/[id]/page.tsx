"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Play, Pause, XCircle, Search, RefreshCw, Megaphone, Loader2 } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { 
  useCampaign, 
  useCampaignRecipients, 
  useCampaignRealtime,
  useUpdateCampaignStatus,
  useValidateCampaign
} from "../../../../features/campaigns";

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
    return <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Campaign...</div>;
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

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Megaphone className="w-5 h-5 text-gray-500" />
          <h1 className="text-lg font-medium">{campaign.name}</h1>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ml-2 ${getStatusColor(campaign.status)}`}>
            {campaign.status.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {campaign.status === "draft" && (
            <Button onClick={handleValidate} disabled={validateMutation.isPending} size="sm">
              {validateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Validate & Run
            </Button>
          )}
          {campaign.status === "running" && (
            <Button onClick={() => handleAction("pause")} variant="secondary" size="sm">
              <Pause className="w-4 h-4 mr-2" /> Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button onClick={() => handleAction("resume")} variant="secondary" size="sm">
              <Play className="w-4 h-4 mr-2" /> Resume
            </Button>
          )}
          {(["draft", "validating", "scheduled", "running", "paused"].includes(campaign.status)) && (
            <Button onClick={() => handleAction("cancel")} variant="destructive" size="sm">
              <XCircle className="w-4 h-4 mr-2" /> Cancel
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
            <StatCard label="Total" value={campaign.stats?.totalRecipients || 0} />
            <StatCard label="Pending" value={campaign.stats?.pending || 0} />
            <StatCard label="Scheduled" value={campaign.stats?.scheduled || 0} />
            <StatCard label="Processing" value={campaign.stats?.processing || 0} />
            <StatCard label="Sent" value={campaign.stats?.sent || 0} />
            <StatCard label="Delivered" value={campaign.stats?.delivered || 0} />
            <StatCard label="Read" value={campaign.stats?.read || 0} />
            <StatCard label="Failed" value={campaign.stats?.failed || 0} />
            <StatCard label="Unknown" value={campaign.stats?.unknown || 0} />
          </div>

          {/* Recipient Explorer */}
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="border-b px-4 py-3 bg-slate-50 flex items-center justify-between">
              <h2 className="font-medium text-slate-800">Recipients</h2>
              <div className="flex gap-2 items-center">
                <select 
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search phone number..."
                    className="pl-9 h-9"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => recipientsQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 border-b sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Phone Number</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Attempted At</th>
                    <th className="px-6 py-3 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recipientsQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading recipients...
                      </td>
                    </tr>
                  ) : recipientsData?.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No recipients found.
                      </td>
                    </tr>
                  ) : (
                    recipientsData?.items.map((rec: import("../../../../features/campaigns/campaign.types.js").CampaignRecipient) => (
                      <tr key={rec._id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium">{rec.phoneNumberE164}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusColor(rec.status)}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {rec.lastAttemptAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(rec.lastAttemptAt)) : "-"}
                        </td>
                        <td className="px-6 py-3 text-red-500 text-xs max-w-[200px] truncate">
                          {rec.failureReason || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination footer */}
            {recipientsData && recipientsData.pagination && (
              <div className="border-t px-4 py-3 flex items-center justify-between bg-slate-50 text-sm text-slate-600">
                <div>
                  Showing {Math.min(1 + (page - 1) * limit, recipientsData.pagination.total)} to{" "}
                  {Math.min(page * limit, recipientsData.pagination.total)} of {recipientsData.pagination.total} recipients
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page >= recipientsData.pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm text-center">
      <div className="text-xs text-slate-500 uppercase font-medium">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value.toLocaleString()}</div>
    </div>
  );
}
