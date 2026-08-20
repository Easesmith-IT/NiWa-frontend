import React from "react";
import { ArrowLeft, Megaphone, Download, Play, Pause, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import type { Campaign } from "../campaign.types";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
  onExportCSV: () => void;
  onAction: (action: "pause" | "resume" | "cancel") => void;
}

export function CampaignDetailHeader({ campaign, onExportCSV, onAction }: CampaignDetailHeaderProps) {
  const router = useRouter();

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
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")} className="mr-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Megaphone className="w-5 h-5 text-emerald-600" />
        <h1 className="text-base font-semibold text-gray-900">{campaign.name}</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ml-2 ${getStatusColor(campaign.status)}`}>
          {campaign.status.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
        {campaign.status === "draft" && (
          <Button
            onClick={() => router.push(`/campaigns/new?draft=${campaign._id}`)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Resume Editing Draft
          </Button>
        )}
        {campaign.status === "running" && (
          <Button onClick={() => onAction("pause")} variant="secondary" size="sm">
            <Pause className="w-4 h-4 mr-1.5" /> Pause
          </Button>
        )}
        {campaign.status === "paused" && (
          <Button onClick={() => onAction("resume")} variant="secondary" size="sm">
            <Play className="w-4 h-4 mr-1.5" /> Resume
          </Button>
        )}
        {(["draft", "validating", "scheduled", "running", "paused"].includes(campaign.status)) && (
          <Button onClick={() => onAction("cancel")} variant="destructive" size="sm">
            <XCircle className="w-4 h-4 mr-1.5" /> Cancel
          </Button>
        )}
      </div>
    </header>
  );
}
