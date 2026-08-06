"use client";

import React from "react";
import { AIAgent } from "../../../../features/ai-agent/ai-agent.api";

export type AccessFilter = "all" | "shared" | "agent_specific";

interface KnowledgeFiltersProps {
  accessFilter: AccessFilter;
  selectedAgentId: string;
  agents: AIAgent[];
  onChangeAccessFilter: (filter: AccessFilter) => void;
  onChangeSelectedAgent: (agentId: string) => void;
}

export const KnowledgeFilters: React.FC<KnowledgeFiltersProps> = ({
  accessFilter,
  selectedAgentId,
  agents,
  onChangeAccessFilter,
  onChangeSelectedAgent,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Access Type Filter */}
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => onChangeAccessFilter("all")}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
            accessFilter === "all"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          All Knowledge
        </button>
        <button
          type="button"
          onClick={() => onChangeAccessFilter("shared")}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
            accessFilter === "shared"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          🌐 Shared Only
        </button>
        <button
          type="button"
          onClick={() => onChangeAccessFilter("agent_specific")}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
            accessFilter === "agent_specific"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          🎯 Agent Specific
        </button>
      </div>

      {/* Agent Instance Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Agent View:</span>
        <select
          value={selectedAgentId}
          onChange={(e) => onChangeSelectedAgent(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="">All Agents (Entire Workspace)</option>
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name} {agent.isDefault ? "(Default)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
