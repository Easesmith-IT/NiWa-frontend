import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useCreatePipelineMutation, useUpdatePipelineMutation } from "../pipeline.queries";
import type { PipelineRecord } from "../pipeline.types";

interface PipelineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline?: PipelineRecord | null;
}

export const PipelineFormModal: React.FC<PipelineFormModalProps> = ({ isOpen, onClose, pipeline }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreatePipelineMutation();
  const updateMutation = useUpdatePipelineMutation();

  useEffect(() => {
    if (pipeline) {
      setName(pipeline.name || "");
      setDescription(pipeline.description || "");
      setIsDefault(!!pipeline.isDefault);
      setIsActive(pipeline.isActive !== false);
    } else {
      setName("");
      setDescription("");
      setIsDefault(false);
      setIsActive(true);
    }
    setErrorMsg("");
  }, [pipeline, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Pipeline name is required");
      return;
    }

    try {
      if (pipeline) {
        await updateMutation.mutateAsync({
          id: pipeline._id,
          payload: { name: name.trim(), description: description.trim(), isDefault, isActive },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          isDefault,
          isActive,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save pipeline");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{pipeline ? "Edit Pipeline" : "Create Pipeline"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Pipeline Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Sales Pipeline"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pipeline..."
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={isPending}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Set as Default Pipeline for Workspace</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isPending}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Active (Deactivating prevents new deal creation)</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : pipeline ? "Update Pipeline" : "Create Pipeline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

