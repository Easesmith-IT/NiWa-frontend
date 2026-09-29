import React, { useState } from "react";
import { ArrowRight, Edit2, Move, DollarSign, Calendar, GripVertical } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { useUpdateDealMutation } from "../deal.queries";
import type { StageRecord } from "../../pipelines/pipeline.types";
import type { DealRecord } from "../deal.types";
import { isDealOverdue, isDealStalled } from "../deal.utils";

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
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.position - b.position);

  const handleQuickMoveToNextStage = async (deal: DealRecord, currentStageIdx: number) => {
    if (currentStageIdx >= sortedStages.length - 1) return;
    const nextStage = sortedStages[currentStageIdx + 1];
    if (!nextStage.isActive) return;

    if (nextStage.isLost && !deal.lostReason) {
      onMoveDeal(deal);
      return;
    }

    await updateMutation.mutateAsync({
      id: deal._id,
      payload: {
        stageId: nextStage._id,
      },
    });
  };

  const calculateNewPosition = (
    stageDeals: DealRecord[],
    draggedId: string,
    dropIndex: number
  ): number => {
    const remaining = stageDeals.filter((d) => d._id !== draggedId);

    if (remaining.length === 0) {
      return 1000;
    }

    if (dropIndex <= 0) {
      const firstPos = remaining[0].positionInStage ?? 1000;
      return firstPos > 1 ? firstPos / 2 : firstPos - 1000;
    }

    if (dropIndex >= remaining.length) {
      const lastPos = remaining[remaining.length - 1].positionInStage ?? 1000;
      return lastPos + 1000;
    }

    const prevPos = remaining[dropIndex - 1].positionInStage ?? dropIndex * 1000;
    const nextPos = remaining[dropIndex].positionInStage ?? (dropIndex + 1) * 1000;

    // Fractional midpoint position — backend rebalances stage automatically if gap collapses
    return (prevPos + nextPos) / 2;
  };

  const handleDrop = async (targetStageId: string, targetIndex: number) => {
    if (!draggingDealId) return;

    const draggedDeal = deals.find((d) => d._id === draggingDealId);
    if (!draggedDeal) return;

    const targetStage = stages.find((s) => s._id === targetStageId);
    if (!targetStage || !targetStage.isActive) return;

    // If moving to a lost stage and deal has no lostReason, open move modal for reason
    if (targetStage.isLost && !draggedDeal.lostReason) {
      setDraggingDealId(null);
      setDragOverStageId(null);
      setDragOverIndex(null);
      onMoveDeal(draggedDeal);
      return;
    }

    const targetStageDeals = deals
      .filter((d) => d && d.stageId === targetStageId)
      .sort((a, b) => (a.positionInStage ?? 1000) - (b.positionInStage ?? 1000));

    const newPosition = calculateNewPosition(targetStageDeals, draggingDealId, targetIndex);

    setDraggingDealId(null);
    setDragOverStageId(null);
    setDragOverIndex(null);

    await updateMutation.mutateAsync({
      id: draggedDeal._id,
      payload: {
        stageId: targetStageId,
        positionInStage: newPosition,
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
        const safeDeals = Array.isArray(deals) ? deals : [];
        const stageDeals = safeDeals
          .filter((d) => d && d.stageId === stage._id)
          .sort((a, b) => (a.positionInStage ?? 1000) - (b.positionInStage ?? 1000));
        const stageTotalValue = stageDeals.reduce((sum, d) => sum + (d?.value || 0), 0);
        const isColumnOver = dragOverStageId === stage._id;

        return (
          <div
            key={stage._id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverStageId !== stage._id) {
                setDragOverStageId(stage._id);
                setDragOverIndex(stageDeals.length);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(stage._id, dragOverIndex ?? stageDeals.length);
            }}
            className={`flex w-72 flex-col flex-shrink-0 rounded-xl transition-colors border p-3 ${
              isColumnOver
                ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-400/40"
                : "bg-slate-100/80 border-slate-200/80"
            }`}
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
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverStageId(stage._id);
                    setDragOverIndex(0);
                  }}
                  className="py-12 text-center text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-lg"
                >
                  Drop deals here
                </div>
              ) : (
                stageDeals.map((deal, cardIdx) => {
                  const isDragging = draggingDealId === deal._id;
                  const isInsertHere = isColumnOver && dragOverIndex === cardIdx;

                  return (
                    <React.Fragment key={deal._id}>
                      {isInsertHere && (
                        <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                      )}
                      <Card
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", deal._id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggingDealId(deal._id);
                        }}
                        onDragEnd={() => {
                          setDraggingDealId(null);
                          setDragOverStageId(null);
                          setDragOverIndex(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverStageId(stage._id);
                          setDragOverIndex(cardIdx);
                        }}
                        className={`p-3 bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition-all space-y-2 cursor-grab active:cursor-grabbing ${
                          isDragging ? "opacity-40 border-dashed border-blue-400" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-start gap-1 flex-1 min-w-0">
                            <GripVertical className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{deal.title}</h4>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDeal(deal);
                            }}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700 flex-shrink-0"
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

                        {deal.lostReason && (
                          <p className="text-[10px] text-red-600 italic">
                            Lost: {deal.lostReason}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center space-x-1">
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
                            {isDealOverdue(deal) && (
                              <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 py-0.5 rounded">
                                Overdue
                              </span>
                            )}
                            {isDealStalled(deal) && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                                Stalled
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveDeal(deal);
                              }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickMoveToNextStage(deal, stageIdx);
                                }}
                                className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                                title={`Next Stage: ${sortedStages[stageIdx + 1].name}`}
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </React.Fragment>
                  );
                })
              )}
              {isColumnOver && dragOverIndex === stageDeals.length && stageDeals.length > 0 && (
                <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


