"use client";

import React, { useState } from "react";
import { useWorkspace } from "lib/workspace/workspace-context";
import {
  useActivateFlow,
  useArchiveFlow,
  useFlows,
  usePauseFlow,
} from "../flow.queries";
import { CrmFlow, FlowStatus } from "../flow.types";
import { FlowEditorModal } from "./FlowEditorModal";
import { FlowRunsList } from "./FlowRunsList";

export const FlowsList: React.FC = () => {
  const { activeMembership } = useWorkspace();
  const userRole = activeMembership?.role || "viewer";
  const canWrite = userRole === "owner" || userRole === "admin" || userRole === "member";

  const [statusFilter, setStatusFilter] = useState<FlowStatus | undefined>("active");
  const [selectedFlow, setSelectedFlow] = useState<CrmFlow | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewingRunsFlowId, setViewingRunsFlowId] = useState<string | null>(null);

  const { data: flowsData, isLoading } = useFlows(statusFilter);
  const activateFlow = useActivateFlow();
  const pauseFlow = usePauseFlow();
  const archiveFlow = useArchiveFlow();

  const handleCreateNew = () => {
    setSelectedFlow(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (flow: CrmFlow) => {
    setSelectedFlow(flow);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">CRM Flows & Automations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure event-driven workflows, condition checks, and automated task, activity, or messaging actions.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            + Create Flow
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {(["active", "paused", "archived"] as FlowStatus[]).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              statusFilter === st
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Flows Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading workspace flows...</div>
      ) : !flowsData?.data || flowsData.data.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <p className="text-slate-400 text-sm">No {statusFilter} flows found in this workspace.</p>
          {canWrite && (
            <button
              onClick={handleCreateNew}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
            >
              Create your first flow
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flowsData.data.map((flow) => (
            <div
              key={flow._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">{flow.name}</h3>
                  {flow.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{flow.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                    flow.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : flow.status === "paused"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {flow.status}
                </span>
              </div>

              {/* Summary Metadata */}
              <div className="bg-slate-950/60 rounded-lg p-3 text-xs space-y-1.5 border border-slate-800/60">
                <div className="flex justify-between text-slate-400">
                  <span>Trigger:</span>
                  <span className="font-mono text-emerald-400 font-medium">{flow.trigger.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Conditions:</span>
                  <span className="text-slate-200">{flow.conditions.length} rule(s)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Steps:</span>
                  <span className="text-slate-200">{flow.steps.length} action(s)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Revision:</span>
                  <span className="text-slate-400">v{flow.revision}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setViewingRunsFlowId(flow._id)}
                  className="text-slate-400 hover:text-slate-200 underline font-medium"
                >
                  View Run Logs
                </button>
                {canWrite && (
                  <div className="flex items-center space-x-2">
                    {flow.status === "active" ? (
                      <button
                        onClick={() => pauseFlow.mutate(flow._id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700"
                      >
                        Pause
                      </button>
                    ) : flow.status === "paused" ? (
                      <button
                        onClick={() => activateFlow.mutate(flow._id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700"
                      >
                        Activate
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleEdit(flow)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                    >
                      Edit
                    </button>

                    {flow.status !== "archived" && (
                      <button
                        onClick={() => archiveFlow.mutate(flow._id)}
                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded border border-red-900/50"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <FlowEditorModal
          flow={selectedFlow}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Runs Log Drawer/Modal */}
      {viewingRunsFlowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="font-semibold text-slate-100">Flow Execution History</h2>
              <button
                onClick={() => setViewingRunsFlowId(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <FlowRunsList flowId={viewingRunsFlowId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
