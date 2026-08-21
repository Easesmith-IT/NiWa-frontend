"use client";

import React from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { AgentKnowledgeTabProps } from "../ai-agent.types";
import { KnowledgeSource } from "../ai-agent.api";

import { AgentKnowledgeSummary } from "./AgentKnowledgeSummary";
import { KnowledgeFilters } from "./KnowledgeFilters";

export const AgentKnowledgeTab: React.FC<AgentKnowledgeTabProps> = ({
  sources,
  agents,
  selectedKnowledgeAgentId,
  accessFilter,
  onSelectKnowledgeAgent,
  onChangeAccessFilter,
  onAddSource,
  onEditSource,
  onDeleteSource,
  onToggleSourceStatus,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Knowledge Base Sources</h3>
          <p className="text-xs text-muted-foreground">
            Add text documents or Q&A pairs for precision RAG retrieval with Agent-Scoped access controls.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onAddSource("text")} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Document
          </Button>
          <Button onClick={() => onAddSource("faq")} size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add FAQ Pair
          </Button>
        </div>
      </div>

      {/* Knowledge Overview Summary */}
      <AgentKnowledgeSummary
        agents={agents}
        sources={sources}
        selectedAgentId={selectedKnowledgeAgentId}
      />

      {/* Access & Agent Instance Filter Toolbar */}
      <KnowledgeFilters
        accessFilter={accessFilter}
        selectedAgentId={selectedKnowledgeAgentId}
        agents={agents}
        onChangeAccessFilter={onChangeAccessFilter}
        onChangeSelectedAgent={onSelectKnowledgeAgent}
      />

      {/* Knowledge List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources
          .filter((source: KnowledgeSource) => {
            if (accessFilter === "shared") return source.accessMode === "all_agents";
            if (accessFilter === "agent_specific") return source.accessMode === "selected_agents";
            return true;
          })
          .map((source: KnowledgeSource) => (
            <div
              key={source._id}
              className="p-4 rounded-xl border border-border bg-card space-y-3.5 relative shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {source.type}
                  </span>
                  {source.accessMode === "all_agents" ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      🌐 Shared (All Agents)
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      🎯 Selected ({source.assignedAgentIds?.length || 0} Agent{(source.assignedAgentIds?.length || 0) === 1 ? "" : "s"})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleSourceStatus(
                        source._id,
                        source.status === "ready" ? "disabled" : "ready"
                      )
                    }
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded transition-colors",
                      source.status === "ready"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {source.status}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSource(source)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSource(source._id)}
                    className="h-7 w-7 p-0 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{source.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                  {source.type === "faq"
                    ? `Q: ${source.question}\nA: ${source.answer}`
                    : source.content}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

