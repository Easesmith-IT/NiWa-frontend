"use client";

import React from "react";
import { AgentConfigurationHeaderProps } from "../ai-agent.types";

export const AgentConfigurationHeader: React.FC<AgentConfigurationHeaderProps> = ({
  activeAgent,
  agents,
  templates,
  onSelectAgentId,
}) => {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
          {templates.find((t) => t.id === activeAgent?.templateId)?.icon || "🤖"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Editing Persona For
            </span>
            {activeAgent?.isDefault && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                ⭐ Workspace Default
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-foreground">
            {activeAgent?.name || "Select an Agent"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
          Switch Agent Instance:
        </label>
        <select
          value={activeAgent?._id || ""}
          onChange={(e) => onSelectAgentId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name} ({agent.agentRole}) {agent.isDefault ? "⭐ (Default)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

