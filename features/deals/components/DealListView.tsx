import React from "react";
import { Edit2, Move, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { PipelineRecord, StageRecord } from "../../pipelines/pipeline.types";
import type { DealRecord } from "../deal.types";

interface DealListViewProps {
  deals: DealRecord[];
  pipelines: PipelineRecord[];
  stages: StageRecord[];
  onEditDeal: (deal: DealRecord) => void;
  onMoveDeal: (deal: DealRecord) => void;
  onArchiveDeal: (deal: DealRecord) => void;
}

export const DealListView: React.FC<DealListViewProps> = ({
  deals,
  pipelines,
  stages,
  onEditDeal,
  onMoveDeal,
  onArchiveDeal,
}) => {
  if (deals.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg bg-white">
        <p className="text-sm text-slate-500">No deals found.</p>
      </div>
    );
  }

  const pipelineMap = new Map(pipelines.map((p) => [p._id, p]));
  const stageMap = new Map(stages.map((s) => [s._id, s]));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Pipeline</th>
            <th className="p-3">Stage</th>
            <th className="p-3">Value</th>
            <th className="p-3">Close Date</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {deals.map((deal) => {
            const pipeline = deal.pipelineId ? pipelineMap.get(deal.pipelineId) : null;
            const stage = deal.stageId ? stageMap.get(deal.stageId) : null;

            return (
              <tr key={deal._id} className="hover:bg-slate-50/80 transition-all">
                <td className="p-3 font-semibold text-slate-900">{deal.title}</td>
                <td className="p-3 text-slate-600">{pipeline ? pipeline.name : deal.pipelineId || "None"}</td>
                <td className="p-3">
                  {stage ? (
                    <span className="inline-flex items-center space-x-1">
                      <span>{stage.name}</span>
                      {!stage.isActive && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">(Inactive)</span>}
                    </span>
                  ) : (
                    deal.stageId || "None"
                  )}
                </td>
                <td className="p-3 font-medium text-blue-700">
                  {deal.value !== undefined && deal.value !== null
                    ? `${deal.value.toLocaleString()} ${deal.currency || "USD"}`
                    : "-"}
                </td>
                <td className="p-3 text-slate-500">{deal.expectedCloseDate || "-"}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                      deal.status === "WON"
                        ? "bg-green-100 text-green-700"
                        : deal.status === "LOST"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {deal.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMoveDeal(deal)}
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-600"
                      title="Move Deal across Pipelines/Stages"
                    >
                      <Move className="h-3.5 w-3.5 mr-1" /> Move
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditDeal(deal)}
                      className="h-7 w-7 p-0 text-slate-600"
                      title="Edit Deal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onArchiveDeal(deal)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                      title="Archive Deal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

