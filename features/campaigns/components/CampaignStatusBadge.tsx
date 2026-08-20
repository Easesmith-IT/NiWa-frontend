import React from "react";
import { Clock, RefreshCw, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import type { Campaign } from "../campaign.types";

export function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  switch (status) {
    case "running":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Running
        </span>
      );
    case "scheduled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
          <Clock className="h-3 w-3 text-amber-600" />
          Scheduled
        </span>
      );
    case "validating":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
          <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
          Validating
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Completed
        </span>
      );
    case "paused":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 border border-orange-200">
          Paused
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 border border-gray-200">
          Cancelled
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
          <AlertTriangle className="h-3 w-3 text-red-600" />
          Failed
        </span>
      );
    case "draft":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
          <FileText className="h-3 w-3 text-slate-400" />
          Draft
        </span>
      );
  }
}
