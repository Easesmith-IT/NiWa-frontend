"use client";

import React, { useState } from "react";
import { DecisionTrace } from "../../../../features/ai-agent";
import { Terminal, ChevronDown, ChevronUp, CheckCircle2, Shield, Database, Brain, Target } from "lucide-react";

interface AgentDecisionTraceProps {
  trace?: DecisionTrace;
}

export const AgentDecisionTrace: React.FC<AgentDecisionTraceProps> = ({
  trace,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!trace) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 hover:bg-slate-800 transition-colors border-b border-slate-700/60"
      >
        <div className="flex items-center gap-2 font-mono text-blue-400 font-semibold">
          <Terminal className="h-4 w-4" />
          System Decision Trace
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 text-[11px] font-mono capitalize">
            Scope: {trace.scope}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-slate-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              Scope Classification
            </div>
            <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Classification:</span>
                <span className="font-semibold text-emerald-400 capitalize">{trace.scope}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Confidence:</span>
                <span>{Math.round(trace.scopeConfidence * 100)}%</span>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-1 mt-1">
                Reason: {trace.scopeReason}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              Knowledge & Policy
            </div>
            <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Policy Mode:</span>
                <span className="font-semibold text-amber-300 capitalize">{trace.knowledgePolicy.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Knowledge Source Used:</span>
                <span className="text-slate-200">{trace.knowledgeUsed}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Brain className="h-3.5 w-3.5 text-purple-400" />
              Memory & Objective
            </div>
            <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Memory Context:</span>
                <span className="text-purple-300">{trace.memoryUsed}</span>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1 mt-1">
                Objective: <span className="text-slate-200">{trace.objective}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              Executed Action
            </div>
            <div className="rounded bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Action Outcome:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {trace.action}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
