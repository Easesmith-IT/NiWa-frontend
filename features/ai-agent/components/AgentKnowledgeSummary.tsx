"use client";

import React from "react";
import { AIAgent, KnowledgeSource } from "../ai-agent.api";

interface AgentKnowledgeSummaryProps {
  agents: AIAgent[];
  sources: KnowledgeSource[];
  selectedAgentId?: string;
  onManageKnowledge?: () => void;
}

export const AgentKnowledgeSummary: React.FC<AgentKnowledgeSummaryProps> = ({
  agents,
  sources,
  selectedAgentId,
  onManageKnowledge,
}) => {
  const selectedAgent = agents.find((a) => a._id === selectedAgentId);

  const sharedSourcesCount = sources.filter((s) => s.accessMode === "all_agents").length;
  const specificSourcesCount = sources.filter((s) => s.accessMode === "selected_agents").length;
  
  const selectedAgentSpecificCount = selectedAgent
    ? sources.filter(
        (s) => s.accessMode === "selected_agents" && s.assignedAgentIds?.includes(selectedAgent._id),
      ).length
    : specificSourcesCount;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Knowledge Access Overview</h3>
          <p className="text-xs text-muted-foreground">
            {selectedAgent ? (
              <>Showing active knowledge sources for <span className="font-semibold text-primary">{selectedAgent.name}</span></>
            ) : (
              <>Workspace knowledge visibility across <span className="font-semibold text-primary">{agents.length} Agent Instances</span></>
            )}
          </p>
        </div>
        {onManageKnowledge && (
          <button
            type="button"
            onClick={onManageKnowledge}
            className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Manage Knowledge →
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            🌐 Shared Knowledge
          </span>
          <p className="mt-1 text-lg font-bold text-foreground">
            {sharedSourcesCount} <span className="text-xs font-normal text-muted-foreground">sources (All Agents)</span>
          </p>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
          <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            🎯 Agent Specific
          </span>
          <p className="mt-1 text-lg font-bold text-foreground">
            {selectedAgentSpecificCount} <span className="text-xs font-normal text-muted-foreground">sources {selectedAgent ? `for ${selectedAgent.name}` : "(Restricted)"}</span>
          </p>
        </div>

        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <span className="text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
            ⚡ Platform Packs
          </span>
          <p className="mt-1 text-xs font-bold text-foreground truncate leading-relaxed">
            {selectedAgent && selectedAgent.knowledgePackIds?.length > 0
              ? selectedAgent.knowledgePackIds.join(", ")
              : `${agents.filter((a) => a.knowledgePackIds?.length > 0).length} Agents configured`}
          </p>
        </div>
      </div>
    </div>
  );
};

