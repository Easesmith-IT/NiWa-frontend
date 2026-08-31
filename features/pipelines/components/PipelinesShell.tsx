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
import { CrmPageShell } from "../../crm/components/CrmPageShell";

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
    <CrmPageShell
      breadcrumb="CRM / Pipelines"
      title="Pipelines & Stage Management"
      description="Configure deal pipelines and stage workflows for your workspace."
      primaryAction={
        <Button onClick={handleOpenCreatePipeline} className="flex items-center gap-1 text-xs">
          <Plus className="h-4 w-4" /> Create Pipeline
        </Button>
      }
      dataSurface={
        <div className="h-full flex flex-col min-h-0 bg-slate-50/50 p-4">
          {pipelines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <p className="text-sm font-medium">No pipelines created yet for this workspace.</p>
              <Button onClick={handleOpenCreatePipeline} className="mt-4 text-xs" variant="outline">
                Create First Pipeline
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 h-full min-h-0">
              {/* Pipeline Sidebar / Tabs */}
              <div className="space-y-2 lg:col-span-1 overflow-y-auto">
                <h2 className="text-xs font-semibold uppercase text-slate-500 mb-3 px-1">Pipelines</h2>
                <div className="space-y-1">
                  {pipelines.map((pipeline) => {
                    const isSelected = pipeline._id === activePipelineId;
                    return (
                      <div
                        key={pipeline._id}
                        onClick={() => setSelectedPipelineId(pipeline._id)}
                        className={`flex items-center justify-between rounded-lg border p-3 text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 font-medium text-blue-900 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-sm"
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
              <div className="lg:col-span-3 overflow-y-auto pr-1 pb-4">
                {selectedPipeline && (
                  <Card className="p-5 border-slate-200 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
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
                      <div className="flex items-center space-x-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePipelineActive(selectedPipeline)}
                          className="text-xs border-slate-200"
                        >
                          {selectedPipeline.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditPipeline(selectedPipeline)}
                          className="text-xs border-slate-200"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>

                    {/* Stages List & Order Manager */}
                    <div className="pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">Pipeline Stages</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Ordered sequence of deal progression stages.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleOpenCreateStage}
                          className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Stage
                        </Button>
                      </div>

                      {isLoadingStages ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500 mb-2"></div>
                          <p className="text-xs">Loading stages...</p>
                        </div>
                      ) : stages.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-slate-200 bg-slate-50/50 rounded-lg">
                          <p className="text-xs text-slate-500">No stages configured for this pipeline.</p>
                          <Button size="sm" onClick={handleOpenCreateStage} className="mt-3 text-xs" variant="outline">
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
                                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm hover:border-slate-300 transition-all group"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-slate-900">{stage.name}</span>
                                      {stage.isWon && (
                                        <span className="inline-flex items-center text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded font-medium">
                                          <CheckCircle2 className="h-3 w-3 mr-0.5 text-green-600" /> Won Stage
                                        </span>
                                      )}
                                      {stage.isLost && (
                                        <span className="inline-flex items-center text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                                          <XCircle className="h-3 w-3 mr-0.5 text-rose-600" /> Lost Stage
                                        </span>
                                      )}
                                      {!stage.isActive && (
                                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                          Inactive
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                                      Win Probability: {stage.probability !== undefined && stage.probability !== null ? <span className="text-slate-600">{stage.probability}%</span> : "Not set"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={idx === 0 || reorderMutation.isPending}
                                    onClick={() => handleMoveStage(idx, "up")}
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={idx === arr.length - 1 || reorderMutation.isPending}
                                    onClick={() => handleMoveStage(idx, "down")}
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  
                                  <div className="w-px h-4 bg-slate-200 mx-1"></div>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleStageActive(stage)}
                                    className="text-[11px] font-medium text-slate-600 px-2 h-8 hover:bg-slate-100 rounded-md"
                                  >
                                    {stage.isActive ? "Deactivate" : "Activate"}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenEditStage(stage)}
                                    className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-md"
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
        </div>
      }
    >
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
    </CrmPageShell>
  );
};

