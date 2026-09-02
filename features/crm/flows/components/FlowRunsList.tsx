"use client";

import React, { useState } from "react";
import { useFlowRuns } from "../flow.queries";

interface FlowRunsListProps {
  flowId?: string;
}

export const FlowRunsList: React.FC<FlowRunsListProps> = ({ flowId }) => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: runsData, isLoading } = useFlowRuns(flowId, statusFilter);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs">
        {["all", "queued", "running", "waiting", "completed", "failed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st === "all" ? undefined : st)}
            className={`px-2.5 py-1 font-medium rounded capitalize transition-colors ${
              (st === "all" && !statusFilter) || statusFilter === st
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-400 text-xs">Loading execution runs...</div>
      ) : !runsData?.data || runsData.data.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">No execution runs recorded yet.</div>
      ) : (
        <div className="space-y-3">
          {runsData.data.map((run) => (
            <div
              key={run._id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-200">{run.automationName || "Flow Run"}</span>
                  <span className="font-mono text-[10px] text-slate-500">({run._id})</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                    run.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : run.status === "failed"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : run.status === "waiting" || run.status === "running"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {run.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Trigger: <code className="text-emerald-400">{run.triggerType}</code></span>
                <span>Queued at: {new Date(run.createdAt).toLocaleString()}</span>
              </div>

              {run.lastError && (
                <div className="p-2 bg-red-950/40 border border-red-900/50 rounded text-red-400 text-[11px]">
                  Error: {run.lastError}
                </div>
              )}

              {/* Logs Timeline */}
              {run.logs && run.logs.length > 0 && (
                <div className="bg-slate-900 rounded p-2.5 space-y-1.5 font-mono text-[11px]">
                  {run.logs.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-start justify-between">
                      <span
                        className={
                          log.level === "error"
                            ? "text-red-400"
                            : log.level === "success"
                            ? "text-emerald-400"
                            : "text-slate-300"
                        }
                      >
                        • {log.message}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(log.at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
