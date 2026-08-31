import React, { useState } from "react";
import { Plus, LayoutGrid, List, Search, Briefcase } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { usePipelinesQuery, useStagesQuery } from "../../pipelines/pipeline.queries";
import { useArchiveDealMutation, useDealsQuery } from "../deal.queries";
import { DealBoardView } from "./DealBoardView";
import { DealFormModal } from "./DealFormModal";
import { DealListView } from "./DealListView";
import { DealMoveModal } from "./DealMoveModal";
import type { DealRecord, DealStatus } from "../deal.types";
import { SavedViewsManager } from "../../crm/components/SavedViewsManager";
import type { CrmViewRecord } from "../../crm/views.types";
import { useExecuteCrmViewQuery } from "../../crm/views.queries";

export const DealsShell: React.FC = () => {
  const { data: pipelines = [], isLoading: isLoadingPipelines } = usePipelinesQuery();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [activeSavedView, setActiveSavedView] = useState<CrmViewRecord | null>(null);

  const activePipelineId = selectedPipelineId || (pipelines.length > 0 ? pipelines[0]._id : "");

  const { data: stages = [], isLoading: isLoadingStages } = useStagesQuery(
    activePipelineId ? { pipelineId: activePipelineId } : undefined
  );

  // Standard un-view-filtered deals query
  const { data: standardDeals = [], isLoading: isLoadingStandardDeals } = useDealsQuery({
    status: statusFilter !== "ALL" ? (statusFilter as DealStatus) : undefined,
    search: searchTerm.trim() || undefined,
  });

  // Saved View Execution query
  const { data: executedViewResult, isLoading: isLoadingExecutedView } = useExecuteCrmViewQuery(
    activeSavedView?._id || "",
    { page: 1, limit: 100 },
    Boolean(activeSavedView?._id),
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealRecord | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingDeal, setMovingDeal] = useState<DealRecord | null>(null);

  const archiveMutation = useArchiveDealMutation();

  const handleOpenCreateDeal = () => {
    setEditingDeal(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditDeal = (deal: DealRecord) => {
    setEditingDeal(deal);
    setIsFormModalOpen(true);
  };

  const handleOpenMoveDeal = (deal: DealRecord) => {
    setMovingDeal(deal);
    setIsMoveModalOpen(true);
  };

  const handleArchiveDeal = async (deal: DealRecord) => {
    if (window.confirm(`Are you sure you want to archive deal "${deal.title}"?`)) {
      await archiveMutation.mutateAsync(deal._id);
    }
  };

  // View Execution Architecture:
  // If a saved view is active, the dataset comes directly from the backend executeView() execution engine.
  // Otherwise, falls back to the standard un-filtered deals query.
  const rawExecutedData = (executedViewResult as any)?.data || executedViewResult;
  let executedRecords: DealRecord[] = [];
  if (Array.isArray(rawExecutedData)) {
    executedRecords = rawExecutedData;
  } else if (rawExecutedData && typeof rawExecutedData === "object") {
    if (Array.isArray((rawExecutedData as any).data)) {
      executedRecords = (rawExecutedData as any).data;
    } else if (Array.isArray((rawExecutedData as any).items)) {
      executedRecords = (rawExecutedData as any).items;
    }
  }

  const rawStandardDeals = (standardDeals as any)?.data || standardDeals;
  let safeStandardDeals: DealRecord[] = [];
  if (Array.isArray(rawStandardDeals)) {
    safeStandardDeals = rawStandardDeals;
  } else if (rawStandardDeals && typeof rawStandardDeals === "object") {
    if (Array.isArray((rawStandardDeals as any).deals)) {
      safeStandardDeals = (rawStandardDeals as any).deals;
    } else if (Array.isArray((rawStandardDeals as any).items)) {
      safeStandardDeals = (rawStandardDeals as any).items;
    } else if (Array.isArray((rawStandardDeals as any).data)) {
      safeStandardDeals = (rawStandardDeals as any).data;
    }
  }

  const activeDealsList: DealRecord[] = activeSavedView
    ? executedRecords
    : safeStandardDeals;

  // Filter deals by active pipeline for board view or if pipeline filter selected
  const pipelineDeals = Array.isArray(activeDealsList)
    ? (activePipelineId ? activeDealsList.filter((d) => d && d.pipelineId === activePipelineId) : activeDealsList)
    : [];

  const isLoading =
    isLoadingPipelines ||
    isLoadingStages ||
    (activeSavedView ? isLoadingExecutedView : isLoadingStandardDeals);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Deals Management
          </h1>
          <p className="text-xs text-slate-500">
            Track sales opportunities across pipelines and progress stages toward Won/Lost.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "board" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "list" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button onClick={handleOpenCreateDeal} className="flex items-center gap-1 text-xs">
            <Plus className="h-4 w-4" /> Create Deal
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Saved Views Selector */}
          <SavedViewsManager
            objectKey="Deal"
            activeViewId={activeSavedView?._id}
            onSelectView={(v) => setActiveSavedView(v)}
          />

          {/* Pipeline Switcher */}
          <div>
            <select
              value={activePipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:ring-blue-500"
            >
              {pipelines.map((p) => (
                <option key={p._id} value={p._id}>
                  Pipeline: {p.name} {p.isDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          {!activeSavedView && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ALL">Status: All</option>
                <option value="OPEN">Status: OPEN</option>
                <option value="WON">Status: WON</option>
                <option value="LOST">Status: LOST</option>
              </select>
            </div>
          )}
        </div>

        {/* Search */}
        {!activeSavedView && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deals by title..."
              className="pl-8 text-xs h-8"
            />
          </div>
        )}
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading deals...</div>
      ) : viewMode === "board" ? (
        <DealBoardView
          stages={stages}
          deals={pipelineDeals}
          onEditDeal={handleOpenEditDeal}
          onMoveDeal={handleOpenMoveDeal}
        />
      ) : (
        <DealListView
          deals={pipelineDeals}
          pipelines={pipelines}
          stages={stages}
          onEditDeal={handleOpenEditDeal}
          onMoveDeal={handleOpenMoveDeal}
          onArchiveDeal={handleArchiveDeal}
        />
      )}

      {/* Modals */}
      <DealFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        deal={editingDeal}
        defaultPipelineId={activePipelineId}
      />

      <DealMoveModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        deal={movingDeal}
      />
    </div>
  );
};
