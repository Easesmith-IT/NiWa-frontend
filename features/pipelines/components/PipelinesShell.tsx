import React, { useState } from "react";
import { Plus, ArrowUp, ArrowDown, Edit2, CheckCircle2, XCircle, Star, GitFork } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  usePipelinesQuery,
  useStagesQuery,
  useReorderStagesMutation,
  useUpdatePipelineMutation,
  useUpdateStageMutation,
} from "../pipeline.queries";
import { PipelineFormModal } from "./PipelineFormModal";
import { StageFormModal } from "./StageFormModal";
import type { PipelineRecord, StageRecord } from "../pipeline.types";

export const PipelinesShell: React.FC = () => {
  const { data: pipelines = [], isLoading: isLoadingPipelines, isError: isErrorPipelines } = usePipelinesQuery();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  const activePipelineId = selectedPipelineId || (pipelines.length > 0 ? pipelines[0]._id : null);
  const selectedPipeline = pipelines.find((p) => p._id === activePipelineId) || null;

  const { data: stages = [], isLoading: isLoadingStages } = useStagesQuery(
    activePipelineId ? { pipelineId: activePipelineId } : undefined
  );

  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<PipelineRecord | null>(null);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<StageRecord | null>(null);

  const reorderMutation = useReorderStagesMutation();
  const updatePipelineMutation = useUpdatePipelineMutation();
  const updateStageMutation = useUpdateStageMutation();

  const handleOpenCreatePipeline = () => {
    setEditingPipeline(null);
    setIsPipelineModalOpen(true);
  };

  const handleOpenEditPipeline = (pipeline: PipelineRecord) => {
    setEditingPipeline(pipeline);
    setIsPipelineModalOpen(true);
  };

  const handleOpenCreateStage = () => {
    setEditingStage(null);
    setIsStageModalOpen(true);
  };

  const handleOpenEditStage = (stage: StageRecord) => {
    setEditingStage(stage);
    setIsStageModalOpen(true);
  };

  const handleTogglePipelineActive = async (pipeline: PipelineRecord) => {
    await updatePipelineMutation.mutateAsync({
      id: pipeline._id,
      payload: { isActive: !pipeline.isActive },
    });
  };

  const handleToggleStageActive = async (stage: StageRecord) => {
    await updateStageMutation.mutateAsync({
      id: stage._id,
      payload: { isActive: !stage.isActive },
    });
  };

  const handleMoveStage = async (index: number, direction: "up" | "down") => {
    if (!activePipelineId) return;
    const sortedStages = [...stages].sort((a, b) => a.position - b.position);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedStages.length) return;

    // Swap elements
    const temp = sortedStages[index];
    sortedStages[index] = sortedStages[targetIndex];
    sortedStages[targetIndex] = temp;

    // Reassign contiguous 0-indexed positions
    const reorderedPayload = sortedStages.map((s, idx) => ({
      id: s._id,
      position: idx,
    }));

    await reorderMutation.mutateAsync({
      pipelineId: activePipelineId,
      payload: { stages: reorderedPayload },
    });
  };

  if (isLoadingPipelines) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading pipelines...</div>;
  }

  if (isErrorPipelines) {
    return <div className="p-8 text-center text-sm text-red-500">Failed to load pipelines.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="h-5 w-5 text-blue-600" />
            Pipelines & Stage Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure deal pipelines and stage workflows for your workspace.
          </p>
        </div>
        <Button onClick={handleOpenCreatePipeline} className="flex items-center gap-1 text-xs">
          <Plus className="h-4 w-4" /> Create Pipeline
        </Button>
      </div>

      {pipelines.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">No pipelines created yet for this workspace.</p>
          <Button onClick={handleOpenCreatePipeline} className="mt-4 text-xs" variant="outline">
            Create First Pipeline
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Pipeline Sidebar / Tabs */}
          <div className="space-y-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase text-slate-500">Pipelines</h2>
            <div className="space-y-1">
              {pipelines.map((pipeline) => {
                const isSelected = pipeline._id === activePipelineId;
                return (
                  <div
                    key={pipeline._id}
                    onClick={() => setSelectedPipelineId(pipeline._id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 font-medium text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="truncate">{pipeline.name}</span>
                      {pipeline.isDefault && (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        pipeline.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {pipeline.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Pipeline Details & Stages */}
          <div className="lg:col-span-3 space-y-6">
            {selectedPipeline && (
              <Card className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900">{selectedPipeline.name}</h2>
                      {selectedPipeline.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Default
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          selectedPipeline.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {selectedPipeline.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {selectedPipeline.description && (
                      <p className="text-xs text-slate-500 mt-1">{selectedPipeline.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePipelineActive(selectedPipeline)}
                      className="text-xs"
                    >
                      {selectedPipeline.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditPipeline(selectedPipeline)}
                      className="text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </div>

                {/* Stages List & Order Manager */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Pipeline Stages</h3>
                      <p className="text-xs text-slate-500">Ordered sequence of deal progression stages.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleOpenCreateStage}
                      className="text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Stage
                    </Button>
                  </div>

                  {isLoadingStages ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading stages...</div>
                  ) : stages.length === 0 ? (
                    <div className="p-6 text-center border border-dashed rounded-lg">
                      <p className="text-xs text-slate-500">No stages configured for this pipeline.</p>
                      <Button size="sm" onClick={handleOpenCreateStage} className="mt-2 text-xs" variant="outline">
                        Add First Stage
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...stages]
                        .sort((a, b) => a.position - b.position)
                        .map((stage, idx, arr) => (
                          <div
                            key={stage._id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-slate-900">{stage.name}</span>
                                  {stage.isWon && (
                                    <span className="inline-flex items-center text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                                      <CheckCircle2 className="h-3 w-3 mr-0.5 text-green-600" /> Won Stage
                                    </span>
                                  )}
                                  {stage.isLost && (
                                    <span className="inline-flex items-center text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                      <XCircle className="h-3 w-3 mr-0.5 text-red-600" /> Lost Stage
                                    </span>
                                  )}
                                  {!stage.isActive && (
                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Win Probability: {stage.probability !== undefined && stage.probability !== null ? `${stage.probability}%` : "Not set"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              {/* Reorder Buttons */}
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={idx === 0 || reorderMutation.isPending}
                                onClick={() => handleMoveStage(idx, "up")}
                                className="h-7 w-7 p-0 text-slate-500"
                                title="Move Up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={idx === arr.length - 1 || reorderMutation.isPending}
                                onClick={() => handleMoveStage(idx, "down")}
                                className="h-7 w-7 p-0 text-slate-500"
                                title="Move Down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleStageActive(stage)}
                                className="text-xs text-slate-600 px-2 h-7"
                              >
                                {stage.isActive ? "Deactivate" : "Activate"}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditStage(stage)}
                                className="h-7 w-7 p-0 text-slate-600"
                                title="Edit Stage"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <PipelineFormModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        pipeline={editingPipeline}
      />

      {activePipelineId && (
        <StageFormModal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          pipelineId={activePipelineId}
          stage={editingStage}
          nextPosition={stages.length}
        />
      )}
    </div>
  );
};

