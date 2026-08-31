import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { usePipelinesQuery, useStagesQuery } from "../../pipelines/pipeline.queries";
import { useUpdateDealMutation } from "../deal.queries";
import type { DealRecord } from "../deal.types";

interface DealMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRecord | null;
}

export const DealMoveModal: React.FC<DealMoveModalProps> = ({ isOpen, onClose, deal }) => {
  const { data: pipelines = [] } = usePipelinesQuery();
  const [pipelineId, setPipelineId] = useState("");
  const [stageId, setStageId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: stages = [] } = useStagesQuery(
    pipelineId ? { pipelineId } : undefined
  );

  const updateMutation = useUpdateDealMutation();

  useEffect(() => {
    if (deal) {
      setPipelineId(deal.pipelineId || "");
      setStageId(deal.stageId || "");
    } else {
      setPipelineId("");
      setStageId("");
    }
    setErrorMsg("");
  }, [deal, isOpen]);

  const handlePipelineChange = (newPipelineId: string) => {
    setPipelineId(newPipelineId);
    setStageId(""); // reset stage on pipeline change
  };

  const handleMove = async () => {
    if (!deal) return;
    if (!pipelineId) {
      setErrorMsg("Pipeline selection is required");
      return;
    }
    if (!stageId) {
      setErrorMsg("Stage selection is required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: deal._id,
        payload: {
          pipelineId,
          stageId,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to move deal");
    }
  };

  if (!deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Deal — {deal.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Target Pipeline</label>
            <select
              value={pipelineId}
              onChange={(e) => handlePipelineChange(e.target.value)}
              disabled={updateMutation.isPending}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Pipeline...</option>
              {pipelines.map((p) => (
                <option key={p._id} value={p._id} disabled={!p.isActive && p._id !== deal?.pipelineId}>
                  {p.name} {p.isDefault ? "(Default)" : ""} {!p.isActive ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Target Stage</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              disabled={updateMutation.isPending || !pipelineId}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Stage...</option>
              {stages.map((s) => (
                <option key={s._id} value={s._id} disabled={!s.isActive && s._id !== deal.stageId}>
                  {s.name} {!s.isActive ? "(Inactive)" : ""} {s.isWon ? "🏆" : s.isLost ? "❌" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Moving..." : "Move Deal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

