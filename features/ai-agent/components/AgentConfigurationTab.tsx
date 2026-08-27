"use client";

import React from "react";
import { AgentConfigurationTabProps } from "../ai-agent.types";

import { AgentContractSummary } from "./AgentContractSummary";
import { AgentLibrary } from "./AgentLibrary";

import { AgentConfigurationHeader } from "./AgentConfigurationHeader";
import { AgentIdentitySection } from "./AgentIdentitySection";
import { AgentBehaviorSection } from "./AgentBehaviorSection";
import { AgentScopeSection } from "./AgentScopeSection";
import { AgentInstructionsSection } from "./AgentInstructionsSection";
import { AgentLanguageSection } from "./AgentLanguageSection";
import { AgentMemorySection } from "./AgentMemorySection";
import { AgentHandoffSection } from "./AgentHandoffSection";

export const AgentConfigurationTab: React.FC<AgentConfigurationTabProps> = ({
  activeAgent,
  agents,
  templates,
  currentData,
  isApplyingTemplate,
  showAdvancedInstructions,
  showAdvancedMemory,
  onSelectAgentId,
  onUpdateField,
  onUpdateBehavior,
  onUpdateHandoffTrigger,
  onApplyTemplate,
  onResetToTemplateDefaults,
  onOpenAddMemoryModal,
  onOpenEditMemoryModal,
  onDeleteMemoryField,
  onToggleShowAdvancedInstructions,
  onToggleShowAdvancedMemory,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Active Editing Agent Instance Switcher Bar */}
      <AgentConfigurationHeader
        activeAgent={activeAgent}
        agents={agents}
        templates={templates}
        onSelectAgentId={onSelectAgentId}
      />

      {/* Agent Contract Visual Overview */}
      <AgentContractSummary settings={currentData} />

      {/* Enterprise Agent Library Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AgentLibrary
          templates={templates}
          activeTemplateId={currentData.templateId || "business_consultant"}
          onApplyTemplate={onApplyTemplate}
          isApplying={isApplyingTemplate}
        />
      </div>

      {/* 1. Identity Section */}
      <AgentIdentitySection
        currentData={currentData}
        onUpdateField={onUpdateField}
      />

      {/* 2. Conversation Style & Diagnostic Behavior */}
      <AgentBehaviorSection
        currentData={currentData}
        onUpdateField={onUpdateField}
        onUpdateBehavior={onUpdateBehavior}
      />

      {/* Agent Scope & Boundaries Section */}
      <AgentScopeSection
        currentData={currentData}
        showAdvancedInstructions={showAdvancedInstructions}
        onUpdateField={onUpdateField}
        onToggleShowAdvancedInstructions={onToggleShowAdvancedInstructions}
      />

      {/* 3. Custom Agent Instructions */}
      <AgentInstructionsSection
        currentData={currentData}
        showAdvancedInstructions={showAdvancedInstructions}
        onUpdateField={onUpdateField}
        onResetToTemplateDefaults={onResetToTemplateDefaults}
        onToggleShowAdvancedInstructions={onToggleShowAdvancedInstructions}
      />

      {/* 4. Language Configuration */}
      <AgentLanguageSection
        currentData={currentData}
        onUpdateField={onUpdateField}
      />

      {/* 5. Conversation Memory Schema */}
      <AgentMemorySection
        currentData={currentData}
        showAdvancedMemory={showAdvancedMemory}
        onUpdateField={onUpdateField}
        onOpenAddMemoryModal={onOpenAddMemoryModal}
        onOpenEditMemoryModal={onOpenEditMemoryModal}
        onDeleteMemoryField={onDeleteMemoryField}
        onToggleShowAdvancedMemory={onToggleShowAdvancedMemory}
      />

      {/* 6. Safety & Human Handoff Triggers */}
      <AgentHandoffSection
        currentData={currentData}
        onUpdateField={onUpdateField}
        onUpdateHandoffTrigger={onUpdateHandoffTrigger}
      />
    </div>
  );
};

