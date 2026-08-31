import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useCreateStageMutation, useUpdateStageMutation } from "../pipeline.queries";
import type { StageRecord } from "../pipeline.types";

interface StageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  stage?: StageRecord | null;
  nextPosition?: number;
}

export const StageFormModal: React.FC<StageFormModalProps> = ({
  isOpen,
  onClose,
  pipelineId,
  stage,
  nextPosition = 0,
}) => {
  const [name, setName] = useState("");
  const [probability, setProbability] = useState<string>("");
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateStageMutation();
  const updateMutation = useUpdateStageMutation();

  useEffect(() => {
    if (stage) {
      setName(stage.name || "");
      setProbability(stage.probability !== undefined && stage.probability !== null ? String(stage.probability) : "");
      setIsWon(!!stage.isWon);
      setIsLost(!!stage.isLost);
      setIsActive(stage.isActive !== false);
    } else {
      setName("");
      setProbability("");
      setIsWon(false);
      setIsLost(false);
      setIsActive(true);
    }
    setErrorMsg("");
  }, [stage, isOpen]);

  const handleWonChange = (checked: boolean) => {
    setIsWon(checked);
    if (checked) setIsLost(false);
  };

  const handleLostChange = (checked: boolean) => {
    setIsLost(checked);
    if (checked) setIsWon(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Stage name is required");
      return;
    }

    if (isWon && isLost) {
      setErrorMsg("A stage cannot be both Won and Lost");
      return;
    }

    const parsedProbability = probability !== "" ? Number(probability) : null;

    try {
      if (stage) {
        await updateMutation.mutateAsync({
          id: stage._id,
          payload: {
            name: name.trim(),
            probability: parsedProbability,
            isWon,
            isLost,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          pipelineId,
          name: name.trim(),
          position: nextPosition,
          probability: parsedProbability,
          isWon,
          isLost,
          isActive,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save stage");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{stage ? "Edit Stage" : "Create Stage"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Stage Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead Qualification"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Win Probability (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              placeholder="e.g. 50"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isWon}
                onChange={(e) => handleWonChange(e.target.checked)}
                disabled={isPending}
                className="rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span>Is Won Stage (Deals closed as Won)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isLost}
                onChange={(e) => handleLostChange(e.target.checked)}
                disabled={isPending}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span>Is Lost Stage (Deals closed as Lost)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isPending}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Active Stage</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : stage ? "Update Stage" : "Create Stage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

