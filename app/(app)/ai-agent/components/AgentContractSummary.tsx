"use client";

import React from "react";
import { BusinessAISettings } from "../../../../features/ai-agent";
import { ShieldCheck, Cpu, Database, Brain, Target, Wrench } from "lucide-react";

interface AgentContractSummaryProps {
  settings: Partial<BusinessAISettings>;
}

export const AgentContractSummary: React.FC<AgentContractSummaryProps> = ({
  settings,
}) => {
  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-slate-50/50 dark:from-blue-950/20 dark:to-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/60 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Compiled Agent Contract Overview
          </h3>
        </div>
        <span className="rounded-full bg-blue-100 dark:bg-blue-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 dark:text-blue-300">
          {settings.agentRole || "AI Assistant"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <Cpu className="h-3 w-3 text-blue-500" /> Scope Level
          </span>
          <span className="font-bold text-slate-900 dark:text-white capitalize">
            {settings.scopeLevel || "focused"}
          </span>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <Target className="h-3 w-3 text-emerald-500" /> Autonomy
          </span>
          <span className="font-bold text-slate-900 dark:text-white capitalize">
            {settings.autonomyLevel?.replace("_", " ") || "assist"}
          </span>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <Database className="h-3 w-3 text-amber-500" /> Knowledge
          </span>
          <span className="font-bold text-slate-900 dark:text-white capitalize">
            {settings.knowledgePolicy?.replace("_", " ") || "grounded"}
          </span>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <Brain className="h-3 w-3 text-purple-500" /> Memory Fields
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {settings.memorySchema?.length || 0} fields
          </span>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <Wrench className="h-3 w-3 text-teal-500" /> Capabilities
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {settings.capabilities?.length || 0} active
          </span>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2.5 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-rose-500" /> Restrictions
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {settings.restrictedCapabilities?.length || 0} active
          </span>
        </div>
      </div>
    </div>
  );
};
