"use client";

import React from "react";
import { AIAgent } from "../../../../features/ai-agent/ai-agent.api";

interface KnowledgeAccessSelectorProps {
  accessMode: "all_agents" | "selected_agents";
  assignedAgentIds: string[];
  agents: AIAgent[];
  onChangeAccessMode: (mode: "all_agents" | "selected_agents") => void;
  onChangeAssignedAgents: (agentIds: string[]) => void;
}

export const KnowledgeAccessSelector: React.FC<KnowledgeAccessSelectorProps> = ({
  accessMode,
  assignedAgentIds,
  agents,
  onChangeAccessMode,
  onChangeAssignedAgents,
}) => {
  const handleAgentToggle = (agentId: string) => {
    if (assignedAgentIds.includes(agentId)) {
      onChangeAssignedAgents(assignedAgentIds.filter((id) => id !== agentId));
    } else {
      onChangeAssignedAgents([...assignedAgentIds, agentId]);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Knowledge Access Control
        </label>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Configure which AI agent instances within this workspace can retrieve this knowledge.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChangeAccessMode("all_agents")}
          className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
            accessMode === "all_agents"
              ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          }`}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            🌐 All Agents
          </span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Shared workspace knowledge. Available to every agent.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeAccessMode("selected_agents")}
          className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
            accessMode === "selected_agents"
              ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          }`}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            🎯 Selected Agents
          </span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Agent-specific. Available only to explicitly assigned agents.
          </span>
        </button>
      </div>

      {accessMode === "selected_agents" && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Select Permitted Agent Instances:
          </label>
          {agents.length === 0 ? (
            <p className="text-xs italic text-gray-500">No agents configured yet in workspace.</p>
          ) : (
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-gray-200 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-950">
              {agents.map((agent) => {
                const isSelected = assignedAgentIds.includes(agent._id);
                return (
                  <label
                    key={agent._id}
                    className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? "bg-emerald-50 font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAgentToggle(agent._id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{agent.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {agent.agentRole || agent.templateId}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            ⚠️ Only selected AI agents will be able to retrieve this knowledge source.
          </p>
        </div>
      )}
    </div>
  );
};
