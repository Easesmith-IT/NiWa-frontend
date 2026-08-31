import React from "react";
import { ArrowRight, Edit2, Move, DollarSign, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { useUpdateDealMutation } from "../deal.queries";
import type { StageRecord } from "../../pipelines/pipeline.types";
import type { DealRecord } from "../deal.types";

interface DealBoardViewProps {
  stages: StageRecord[];
  deals: DealRecord[];
  onEditDeal: (deal: DealRecord) => void;
  onMoveDeal: (deal: DealRecord) => void;
}

export const DealBoardView: React.FC<DealBoardViewProps> = ({
  stages,
  deals,
  onEditDeal,
  onMoveDeal,
}) => {
  const updateMutation = useUpdateDealMutation();

  const sortedStages = [...stages].sort((a, b) => a.position - b.position);

  const handleQuickMoveToNextStage = async (deal: DealRecord, currentStageIdx: number) => {
    if (currentStageIdx >= sortedStages.length - 1) return;
    const nextStage = sortedStages[currentStageIdx + 1];
    if (!nextStage.isActive) return;

    await updateMutation.mutateAsync({
      id: deal._id,
      payload: {
        stageId: nextStage._id,
        // Automatically set status to WON if stage isWon, etc.
        status: nextStage.isWon ? "WON" : nextStage.isLost ? "LOST" : deal.status,
      },
    });
  };

  if (stages.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg bg-white">
        <p className="text-sm text-slate-500">No stages defined for this pipeline.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {sortedStages.map((stage, stageIdx) => {
        const stageDeals = deals.filter((d) => d.stageId === stage._id);
        const stageTotalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        return (
          <div
            key={stage._id}
            className="flex w-72 flex-col flex-shrink-0 rounded-xl bg-slate-100/80 border border-slate-200/80 p-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center space-x-2 truncate">
                <span className="font-semibold text-xs text-slate-800 truncate">{stage.name}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                  {stageDeals.length}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {stage.isWon && <span className="text-[10px] text-green-700 bg-green-100 px-1 rounded">Won</span>}
                {stage.isLost && <span className="text-[10px] text-red-700 bg-red-100 px-1 rounded">Lost</span>}
                {!stage.isActive && <span className="text-[10px] text-slate-500 bg-slate-200 px-1 rounded">Inactive</span>}
              </div>
            </div>

            {/* Total value metric */}
            {stageTotalValue > 0 && (
              <div className="mb-3 text-[11px] text-slate-500 font-medium flex items-center">
                <DollarSign className="h-3 w-3 mr-0.5 text-slate-400" />
                {stageTotalValue.toLocaleString()} total
              </div>
            )}

            {/* Deal Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto min-h-[150px]">
              {stageDeals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No deals</div>
              ) : (
                stageDeals.map((deal) => (
                  <Card
                    key={deal._id}
                    className="p-3 bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{deal.title}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditDeal(deal)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                        title="Edit Deal"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {deal.value !== undefined && deal.value !== null && (
                      <div className="text-xs font-semibold text-blue-700 flex items-center">
                        <DollarSign className="h-3 w-3 text-blue-500" />
                        {deal.value.toLocaleString()} {deal.currency || "USD"}
                      </div>
                    )}

                    {deal.expectedCloseDate && (
                      <div className="text-[10px] text-slate-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Target: {deal.expectedCloseDate}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded ${
                          deal.status === "WON"
                            ? "bg-green-50 text-green-700"
                            : deal.status === "LOST"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {deal.status}
                      </span>

                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onMoveDeal(deal)}
                          className="h-6 px-1.5 text-[10px] text-slate-600 hover:text-blue-600"
                          title="Move Deal across Pipelines/Stages"
                        >
                          <Move className="h-3 w-3 mr-1" /> Move
                        </Button>

                        {stageIdx < sortedStages.length - 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!sortedStages[stageIdx + 1].isActive || updateMutation.isPending}
                            onClick={() => handleQuickMoveToNextStage(deal, stageIdx)}
                            className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                            title={`Next Stage: ${sortedStages[stageIdx + 1].name}`}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

