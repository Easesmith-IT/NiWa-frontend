"use client";

import React from "react";
import { AIAgent, KnowledgeSource } from "../../../../features/ai-agent/ai-agent.api";

interface AgentKnowledgeSummaryProps {
  agent: AIAgent;
  sources: KnowledgeSource[];
  onManageKnowledge: () => void;
}

export const AgentKnowledgeSummary: React.FC<AgentKnowledgeSummaryProps> = ({
  agent,
  sources,
  onManageKnowledge,
}) => {
  const sharedSourcesCount = sources.filter((s) => s.accessMode === "all_agents").length;
  const specificSourcesCount = sources.filter(
    (s) => s.accessMode === "selected_agents" && s.assignedAgentIds.includes(agent._id),
  ).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Knowledge Access</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Knowledge sources available to <span className="font-semibold">{agent.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onManageKnowledge}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Manage Knowledge →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800/80 dark:bg-gray-950/40">
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">SHARED WORKSPACE</span>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {sharedSourcesCount} <span className="text-xs font-normal text-gray-500">sources</span>
          </p>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">AGENT SPECIFIC</span>
          <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-200">
            {specificSourcesCount} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">sources</span>
          </p>
        </div>

        <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3 dark:border-purple-900/30 dark:bg-purple-950/20">
          <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">TEMPLATE PACKS</span>
          <p className="mt-1 text-xs font-bold text-purple-900 dark:text-purple-200 truncate">
            {agent.knowledgePackIds && agent.knowledgePackIds.length > 0
              ? agent.knowledgePackIds.join(", ")
              : "None"}
          </p>
        </div>
      </div>
    </div>
  );
};
