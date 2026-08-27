"use client";

import React from "react";
import { AgentLibraryTabProps } from "../ai-agent.types";
import { AgentInstanceManager } from "./AgentInstanceManager";

export const AgentLibraryTab: React.FC<AgentLibraryTabProps> = ({
  agents,
  templates,
  activeAgentId,
  isCreating,
  onSelectAgent,
  onCreateAgent,
  onDeleteAgent,
  onSetDefaultAgent,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <AgentInstanceManager
        agents={agents}
        templates={templates}
        activeAgentId={activeAgentId}
        onSelectAgent={onSelectAgent}
        onCreateAgent={onCreateAgent}
        onDeleteAgent={onDeleteAgent}
        onSetDefaultAgent={onSetDefaultAgent}
        isCreating={isCreating}
      />
    </div>
  );
};

