import React from "react";
import { Search, RefreshCw, Loader2, HelpCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { CampaignRecipient, CampaignRecipientsPagination } from "../campaign.types";

interface CampaignRecipientsTableProps {
  recipientsData?: {
    items: CampaignRecipient[];
    pagination: CampaignRecipientsPagination;
  };
  isLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onRefetch: () => void;
}

export function CampaignRecipientsTable({
  recipientsData,
  isLoading,
  page,
  setPage,
  limit,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onRefetch,
}: CampaignRecipientsTableProps) {
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

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col min-h-[480px]">
      <div className="border-b px-4 py-3 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900 text-sm">Recipient Explorer</h2>
        <div className="flex gap-2 items-center">
          <select
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 shadow-xs focus:outline-hidden"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="processing">Processing</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
            <option value="unknown">Unknown</option>
            <option value="skipped">Skipped</option>
          </select>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search phone..."
              className="pl-8 h-9 text-xs"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button variant="outline" size="icon" onClick={onRefetch} className="h-9 w-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/80 text-gray-500 border-b sticky top-0">
            <tr>
              <th className="px-4 py-3 font-semibold">Phone Number</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Meta Message ID</th>
              <th className="px-4 py-3 font-semibold">Last Attempt</th>
              <th className="px-4 py-3 font-semibold">Failure / Unknown Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" /> Loading recipients...
                </td>
              </tr>
            ) : recipientsData?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No recipients matching current filter.
                </td>
              </tr>
            ) : (
              recipientsData?.items.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-gray-900">{rec.phoneNumberE164}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getStatusColor(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                    {rec.metaMessageId || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {rec.lastAttemptAt
                      ? new Date(rec.lastAttemptAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {rec.status === "failed" && rec.failureReason && (
                      <span className="text-red-600 font-medium">{rec.failureReason}</span>
                    )}
                    {rec.status === "unknown" && (
                      <span className="inline-flex items-center text-amber-700 gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <HelpCircle className="h-3 w-3 shrink-0" />
                        Meta timeout (No automatic retry to prevent duplicates)
                      </span>
                    )}
                    {rec.status !== "failed" && rec.status !== "unknown" && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {recipientsData && recipientsData.pagination && (
        <div className="border-t px-4 py-3 flex items-center justify-between bg-slate-50/60 text-xs text-gray-600">
          <div>
            Showing {Math.min(1 + (page - 1) * limit, recipientsData.pagination.total)} to{" "}
            {Math.min(page * limit, recipientsData.pagination.total)} of {recipientsData.pagination.total} recipients
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= recipientsData.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
