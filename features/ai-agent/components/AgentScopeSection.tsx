"use client";

import React from "react";
import { ChevronDown, ChevronRight, Shield } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { AgentScopeSectionProps } from "../ai-agent.types";
import { BusinessAISettings } from "../ai-agent.api";

import { AgentScopeSettings } from "../../../app/(app)/ai-agent/components/AgentScopeSettings";
import { KnowledgePolicySelector } from "../../../app/(app)/ai-agent/components/KnowledgePolicySelector";
import { AgentObjectiveSettings } from "../../../app/(app)/ai-agent/components/AgentObjectiveSettings";
import { AgentCapabilitiesEditor } from "../../../app/(app)/ai-agent/components/AgentCapabilitiesEditor";

export const AgentScopeSection: React.FC<AgentScopeSectionProps> = ({
  currentData,
  showAdvancedInstructions,
  onUpdateField,
  onToggleShowAdvancedInstructions,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Agent Scope & Boundaries Controls
      </h3>

      {/* Scope Level Selector */}
      <AgentScopeSettings
        value={currentData.scopeLevel || "focused"}
        onChange={(val) => onUpdateField("scopeLevel", val)}
      />

      {/* Autonomy Level Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Agent Autonomy Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              id: "answer_only",
              title: "Answer Only",
              desc: "Respond to questions. Do not proactively qualify or drive toward objectives.",
            },
            {
              id: "assist",
              title: "Assist (Default)",
              desc: "Answer questions and ask useful follow-up questions to recommend next steps.",
            },
            {
              id: "goal_driven",
              title: "Goal Driven",
              desc: "Actively guide conversation toward primary objective progressively.",
            },
            {
              id: "action_enabled",
              title: "Action Enabled",
              desc: "Goal-driven behavior plus execution of explicitly enabled workflow tools.",
            },
          ].map((aut) => {
            const isSelected = (currentData.autonomyLevel || "assist") === aut.id;
            return (
              <div
                key={aut.id}
                onClick={() =>
                  onUpdateField("autonomyLevel", aut.id as BusinessAISettings["autonomyLevel"])
                }
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all text-xs flex flex-col justify-between space-y-1.5",
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-600 dark:ring-blue-500"
                    : "border-border bg-card hover:bg-accent/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{aut.title}</span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{aut.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Knowledge Policy Selector */}
      <KnowledgePolicySelector
        value={currentData.knowledgePolicy || "grounded_business"}
        onChange={(val) => onUpdateField("knowledgePolicy", val)}
      />

      {/* Objectives Editor */}
      <AgentObjectiveSettings
        primaryObjective={currentData.primaryObjective || ""}
        secondaryObjectives={currentData.secondaryObjectives || []}
        onChangePrimary={(val) => onUpdateField("primaryObjective", val)}
        onChangeSecondary={(val) => onUpdateField("secondaryObjectives", val)}
      />

      {/* Capabilities & Restrictions Editor */}
      <AgentCapabilitiesEditor
        capabilities={currentData.capabilities || []}
        restrictedCapabilities={currentData.restrictedCapabilities || []}
        onChangeCapabilities={(caps) => onUpdateField("capabilities", caps)}
        onChangeRestricted={(rests) => onUpdateField("restrictedCapabilities", rests)}
      />

      {/* Collapsible Advanced Scope Toggles */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={onToggleShowAdvancedInstructions}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvancedInstructions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Advanced Scope Toggles & Out-of-Scope Redirect Message
        </button>

        {showAdvancedInstructions && (
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/20 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: "allowAdjacentTopics",
                  label: "Allow Adjacent Topics",
                  desc: "Allow questions closely related to current conversation",
                },
                {
                  key: "allowGeneralKnowledge",
                  label: "Allow General Knowledge",
                  desc: "Permit general domain knowledge where appropriate",
                },
                {
                  key: "allowCasualConversation",
                  label: "Allow Casual Conversation",
                  desc: "Process greetings and acknowledgements gracefully",
                },
                {
                  key: "redirectOutOfScope",
                  label: "Redirect Out-of-Scope Questions",
                  desc: "Politely redirect queries exceeding scope boundaries",
                },
              ].map((tog) => {
                const isChecked = Boolean(currentData[tog.key as keyof BusinessAISettings] !== false);
                return (
                  <label
                    key={tog.key}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs bg-card",
                      isChecked ? "border-primary/30" : "border-border opacity-75"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        onUpdateField(tog.key as keyof BusinessAISettings, e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-foreground block">{tog.label}</span>
                      <span className="text-muted-foreground text-[11px] leading-tight block">
                        {tog.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-foreground">
                Out-of-Scope Redirect Response (Max 500 chars)
              </label>
              <Textarea
                rows={2}
                maxLength={500}
                value={currentData.outOfScopeMessage || ""}
                onChange={(e) => onUpdateField("outOfScopeMessage", e.target.value)}
                placeholder="I specialize in assistance related to our organization's role and services. How can I help you with those?"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
