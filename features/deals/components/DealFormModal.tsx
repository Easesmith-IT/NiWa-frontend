import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { usePipelinesQuery, useStagesQuery } from "../../pipelines/pipeline.queries";
import { useCreateDealMutation, useUpdateDealMutation } from "../deal.queries";
import type { DealRecord, DealStatus } from "../deal.types";

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: DealRecord | null;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  deal,
  defaultPipelineId,
  defaultStageId,
}) => {
  const { data: pipelines = [] } = usePipelinesQuery({ isActive: true });
  const [pipelineId, setPipelineId] = useState("");
  const [stageId, setStageId] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState<DealStatus>("OPEN");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch stages for the selected pipeline
  const { data: stages = [] } = useStagesQuery(
    pipelineId ? { pipelineId } : undefined
  );

  const createMutation = useCreateDealMutation();
  const updateMutation = useUpdateDealMutation();

  useEffect(() => {
    if (deal) {
      setTitle(deal.title || "");
      setPipelineId(deal.pipelineId || "");
      setStageId(deal.stageId || "");
      setValue(deal.value !== undefined && deal.value !== null ? String(deal.value) : "");
      setCurrency(deal.currency || "USD");
      setStatus(deal.status || "OPEN");
      setExpectedCloseDate(deal.expectedCloseDate || "");
      setDescription(deal.description || "");
    } else {
      setTitle("");
      const initialPipeline = defaultPipelineId || (pipelines.length > 0 ? pipelines[0]._id : "");
      setPipelineId(initialPipeline);
      setStageId(defaultStageId || "");
      setValue("");
      setCurrency("USD");
      setStatus("OPEN");
      setExpectedCloseDate("");
      setDescription("");
    }
    setErrorMsg("");
  }, [deal, isOpen, pipelines, defaultPipelineId, defaultStageId]);

  // When pipeline changes during form editing, clear stale stage if it does not belong to new pipeline
  const handlePipelineChange = (newPipelineId: string) => {
    setPipelineId(newPipelineId);
    setStageId(""); // reset stage selection on pipeline change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Deal title is required");
      return;
    }
    if (!pipelineId) {
      setErrorMsg("Pipeline selection is required");
      return;
    }
    if (!stageId) {
      setErrorMsg("Stage selection is required for the selected pipeline");
      return;
    }

    const parsedValue = value !== "" ? Number(value) : null;

    try {
      if (deal) {
        await updateMutation.mutateAsync({
          id: deal._id,
          payload: {
            title: title.trim(),
            pipelineId,
            stageId,
            status,
            value: parsedValue,
            currency,
            expectedCloseDate: expectedCloseDate || null,
            description: description.trim(),
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          pipelineId,
          stageId,
          status,
          value: parsedValue,
          currency,
          expectedCloseDate: expectedCloseDate || null,
          description: description.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save deal");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "Create Deal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Deal Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise Software License Contract"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Pipeline *</label>
              <select
                value={pipelineId}
                onChange={(e) => handlePipelineChange(e.target.value)}
                disabled={isPending}
                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Pipeline...</option>
                {pipelines.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Stage *</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                disabled={isPending || !pipelineId}
                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Stage...</option>
                {stages.map((s) => (
                  <option key={s._id} value={s._id} disabled={!s.isActive && s._id !== deal?.stageId}>
                    {s.name} {!s.isActive ? "(Inactive)" : ""} {s.isWon ? "🏆" : s.isLost ? "❌" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Deal Value</label>
              <Input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Currency</label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
                disabled={isPending}
                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Expected Close Date</label>
              <Input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deal context, key notes, or scope..."
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

