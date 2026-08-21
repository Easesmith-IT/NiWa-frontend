"use client";

import React from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Database,
  Edit2,
  FileText,
  Plus,
  RotateCcw,
  Shield,
  Sliders,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { AgentConfigurationTabProps } from "../ai-agent.types";
import { BusinessAISettings, HumanHandoffTriggers } from "../ai-agent.api";

import { AgentContractSummary } from "../../../app/(app)/ai-agent/components/AgentContractSummary";
import { AgentLibrary } from "../../../app/(app)/ai-agent/components/AgentLibrary";
import { AgentScopeSettings } from "../../../app/(app)/ai-agent/components/AgentScopeSettings";
import { KnowledgePolicySelector } from "../../../app/(app)/ai-agent/components/KnowledgePolicySelector";
import { AgentObjectiveSettings } from "../../../app/(app)/ai-agent/components/AgentObjectiveSettings";
import { AgentCapabilitiesEditor } from "../../../app/(app)/ai-agent/components/AgentCapabilitiesEditor";

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
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
            {templates.find((t) => t.id === activeAgent?.templateId)?.icon || "🤖"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editing Persona For</span>
              {activeAgent?.isDefault && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  ⭐ Workspace Default
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-foreground">{activeAgent?.name || "Select an Agent"}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Switch Agent Instance:</label>
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
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          1. Identity & Organization Context
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Agent Name</label>
            <Input
              value={currentData.agentName || ""}
              onChange={(e) => onUpdateField("agentName", e.target.value)}
              placeholder="e.g. AI Senior Business Consultant"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Agent Role</label>
            <Input
              value={currentData.agentRole || ""}
              onChange={(e) => onUpdateField("agentRole", e.target.value)}
              placeholder="e.g. Senior Business Consultant"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-foreground">Organization / Business Name</label>
            <Input
              value={currentData.businessName || ""}
              onChange={(e) => onUpdateField("businessName", e.target.value)}
              placeholder="e.g. Easesmith"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-foreground">Agent Purpose</label>
            <Textarea
              rows={2}
              value={currentData.agentPurpose || ""}
              onChange={(e) => onUpdateField("agentPurpose", e.target.value)}
              placeholder="Describe what this AI employee is designed to achieve..."
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-foreground">Organization Description</label>
            <Textarea
              rows={2}
              value={currentData.businessDescription || ""}
              onChange={(e) => onUpdateField("businessDescription", e.target.value)}
              placeholder="Brief description of products, services, or organization background..."
            />
          </div>
        </div>
      </div>

      {/* 2. Behavior Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          2. Conversation Style & Diagnostic Behavior
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Conversation Style</label>
            <select
              value={currentData.conversationStyle || "consultative"}
              onChange={(e) => onUpdateField("conversationStyle", e.target.value as BusinessAISettings["conversationStyle"])}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="direct">Direct</option>
              <option value="consultative">Consultative</option>
              <option value="supportive">Supportive</option>
              <option value="sales_oriented">Sales-oriented</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Response Tone</label>
            <select
              value={currentData.responseStyle || "professional"}
              onChange={(e) => onUpdateField("responseStyle", e.target.value as BusinessAISettings["responseStyle"])}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Response Length</label>
            <select
              value={currentData.responseLength || "short"}
              onChange={(e) => onUpdateField("responseLength", e.target.value as BusinessAISettings["responseLength"])}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="short">Short (1-2 sentences)</option>
              <option value="balanced">Balanced (2-4 sentences)</option>
              <option value="detailed">Detailed (Comprehensive)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Questions Per Reply</label>
            <select
              value={currentData.questionsPerReply || 1}
              onChange={(e) => onUpdateField("questionsPerReply", Number(e.target.value))}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={1}>1 Question Max</option>
              <option value={2}>2 Questions Max</option>
              <option value={3}>3 Questions Max</option>
            </select>
          </div>
        </div>

        {/* Behavior Toggles Grid */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-foreground">Diagnostic Behavior Controls</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "diagnoseBeforeRecommending", label: "Diagnose before recommending", desc: "Ask diagnostic questions before prescribing solutions" },
              { key: "challengeAssumptions", label: "Challenge assumptions", desc: "Respectfully question unsupported customer assumptions" },
              { key: "explainReasoning", label: "Explain reasoning", desc: "Briefly explain why recommendations make sense" },
              { key: "preferActionableAdvice", label: "Prefer actionable advice", desc: "Prioritize direct, high-impact next steps" },
              { key: "useNumbersWhenUseful", label: "Use numbers when useful", desc: "Incorporate metrics & data points into diagnosis" },
              { key: "avoidGenericRecommendations", label: "Avoid generic recommendations", desc: "Refuse cliché advice like 'do paid ads' prematurely" },
            ].map((item) => {
              const isChecked = Boolean(currentData.behavior?.[item.key as keyof typeof currentData.behavior]);
              return (
                <label
                  key={item.key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs",
                    isChecked ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-accent/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onUpdateBehavior(item.key as keyof BusinessAISettings["behavior"], e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-foreground block">{item.label}</span>
                    <span className="text-muted-foreground text-[11px] leading-tight block">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* AGENT SCOPE & BOUNDARIES SECTION */}
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
              { id: "answer_only", title: "Answer Only", desc: "Respond to questions. Do not proactively qualify or drive toward objectives." },
              { id: "assist", title: "Assist (Default)", desc: "Answer questions and ask useful follow-up questions to recommend next steps." },
              { id: "goal_driven", title: "Goal Driven", desc: "Actively guide conversation toward primary objective progressively." },
              { id: "action_enabled", title: "Action Enabled", desc: "Goal-driven behavior plus execution of explicitly enabled workflow tools." },
            ].map((aut) => {
              const isSelected = (currentData.autonomyLevel || "assist") === aut.id;
              return (
                <div
                  key={aut.id}
                  onClick={() => onUpdateField("autonomyLevel", aut.id as BusinessAISettings["autonomyLevel"])}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all text-xs flex flex-col justify-between space-y-1.5",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-600 dark:ring-blue-500"
                      : "border-border bg-card hover:bg-accent/40",
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
                  { key: "allowAdjacentTopics", label: "Allow Adjacent Topics", desc: "Allow questions closely related to current conversation" },
                  { key: "allowGeneralKnowledge", label: "Allow General Knowledge", desc: "Permit general domain knowledge where appropriate" },
                  { key: "allowCasualConversation", label: "Allow Casual Conversation", desc: "Process greetings and acknowledgements gracefully" },
                  { key: "redirectOutOfScope", label: "Redirect Out-of-Scope Questions", desc: "Politely redirect queries exceeding scope boundaries" },
                ].map((tog) => {
                  const isChecked = Boolean(currentData[tog.key as keyof BusinessAISettings] !== false);
                  return (
                    <label
                      key={tog.key}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs bg-card",
                        isChecked ? "border-primary/30" : "border-border opacity-75",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onUpdateField(tog.key as keyof BusinessAISettings, e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-bold text-foreground block">{tog.label}</span>
                        <span className="text-muted-foreground text-[11px] leading-tight block">{tog.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-foreground">Out-of-Scope Redirect Response (Max 500 chars)</label>
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

      {/* 3. Custom Instructions Area */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              3. Custom Agent Instructions
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add specific instructions for how this agent should converse. Platform safety & grounding directives remain active automatically.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetToTemplateDefaults}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Template Defaults
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-foreground">Agent Instructions</span>
            <span className="text-muted-foreground font-mono">
              {(currentData.agentInstructions || "").length} / 4000
            </span>
          </div>
          <Textarea
            rows={6}
            maxLength={4000}
            value={currentData.agentInstructions || ""}
            onChange={(e) => onUpdateField("agentInstructions", e.target.value)}
            placeholder="Enter workspace-level agent instructions..."
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Advanced Collapsed Section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onToggleShowAdvancedInstructions}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvancedInstructions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Advanced Instructions & System Prompt Override
          </button>

          {showAdvancedInstructions && (
            <div className="mt-3 p-4 rounded-lg border border-border bg-muted/20 space-y-3 text-xs">
              <p className="text-muted-foreground">
                <Shield className="h-4 w-4 inline mr-1.5 text-amber-500" />
                Platform safety directives and grounding rules cannot be modified or overridden.
              </p>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Legacy System Prompt Extra Directive</label>
                <Textarea
                  rows={3}
                  value={currentData.systemPrompt || ""}
                  onChange={(e) => onUpdateField("systemPrompt", e.target.value)}
                  placeholder="Additional prompt rules appended into system prompt..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Language Configuration */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          4. Language Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Language Mode</label>
            <select
              value={currentData.languageMode || "auto"}
              onChange={(e) => onUpdateField("languageMode", e.target.value as BusinessAISettings["languageMode"])}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="auto">Auto Detect Customer Language</option>
              <option value="english">English Only</option>
              <option value="hindi">Hindi Only</option>
              <option value="hinglish">Hinglish (Hindi + English)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Preferred Language Default</label>
            <Input
              value={currentData.preferredLanguage || "English"}
              onChange={(e) => onUpdateField("preferredLanguage", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {[
            { key: "matchCustomerLanguage", label: "Match Customer Language", desc: "Mirror customer's language automatically" },
            { key: "allowHinglish", label: "Allow Hinglish", desc: "Support Hinglish when customer speaks Hindi/Hinglish" },
            { key: "preserveTechnicalEnglish", label: "Preserve Tech Terms", desc: "Keep business & technical English terms intact" },
          ].map((item) => {
            const isChecked = Boolean(currentData[item.key as keyof BusinessAISettings]);
            return (
              <label
                key={item.key}
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors text-xs",
                  isChecked ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-accent/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onUpdateField(item.key as keyof BusinessAISettings, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-bold text-foreground block">{item.label}</span>
                  <span className="text-muted-foreground text-[11px] leading-tight block">{item.desc}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Memory Configuration UI */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              5. Conversation Memory Schema
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure facts worth remembering explicitly during customer chats with full provenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Memory:</span>
              <button
                onClick={() => onUpdateField("memoryEnabled", !currentData.memoryEnabled)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  currentData.memoryEnabled ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    currentData.memoryEnabled ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <Button onClick={onOpenAddMemoryModal} size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Add Memory Field
            </Button>
          </div>
        </div>

        {/* Memory Fields Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Field Key</th>
                <th className="p-3">Description</th>
                <th className="p-3">Data Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(currentData.memorySchema || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No memory fields configured. Click "Add Memory Field" to add one.
                  </td>
                </tr>
              ) : (
                (currentData.memorySchema || []).map((item) => (
                  <tr key={item.key} className="hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{item.key}</td>
                    <td className="p-3 text-muted-foreground">{item.description || "No description"}</td>
                    <td className="p-3 font-semibold capitalize">{item.type.replace("_", " ")}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenEditMemoryModal(item)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMemoryField(item.key)}
                        className="h-7 w-7 p-0 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Advanced Collapsed Memory Settings */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onToggleShowAdvancedMemory}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvancedMemory ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Advanced Memory Bounds Settings
          </button>

          {showAdvancedMemory && (
            <div className="mt-3 p-4 rounded-lg border border-border bg-muted/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Max Facts Remembered Per Conversation</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={currentData.maxFactsPerConversation || 15}
                  onChange={(e) => onUpdateField("maxFactsPerConversation", Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">Allowed limit: 1-50 facts (Default: 15)</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Max Fact String Length</label>
                <Input
                  type="number"
                  min={20}
                  max={500}
                  value={currentData.maxFactLength || 200}
                  onChange={(e) => onUpdateField("maxFactLength", Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">Allowed limit: 20-500 characters (Default: 200)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Safety & Human Handoff Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          6. Safety & Human Handoff Triggers
        </h3>

        {/* Unknown Answer Behavior */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            When this AI doesn't have enough information:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: "ask_customer", label: "Ask customer for missing info", desc: "Inquire politely for missing facts" },
              { value: "explain_unavailable", label: "Explain info unavailable", desc: "State that information is not available" },
              { value: "safe_response", label: "Send fallback message", desc: "Respond with configured fallback message" },
              { value: "handoff", label: "Hand over to human", desc: "Transfer conversation to human team" },
              { value: "no_response", label: "Do not respond", desc: "Remain silent without auto-reply" },
            ].map((opt) => {
              const isSelected = currentData.unknownAnswerBehavior === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdateField("unknownAnswerBehavior", opt.value as BusinessAISettings["unknownAnswerBehavior"])}
                  className={cn(
                    "flex flex-col text-left p-3 rounded-lg border text-xs space-y-1 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 font-semibold shadow-sm"
                      : "border-border bg-card hover:bg-accent/40",
                  )}
                >
                  <span className="font-bold text-foreground">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>

          {currentData.unknownAnswerBehavior === "safe_response" && (
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Fallback Response Text</label>
              <Textarea
                rows={2}
                value={currentData.fallbackResponse || ""}
                onChange={(e) => onUpdateField("fallbackResponse", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Human Handoff Controls */}
        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Human Handoff Master Switch</h4>
              <p className="text-xs text-muted-foreground">Automatically transfer conversation to human operator on triggers</p>
            </div>
            <button
              onClick={() => onUpdateField("humanHandoffEnabled", !currentData.humanHandoffEnabled)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                currentData.humanHandoffEnabled ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  currentData.humanHandoffEnabled ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
          </div>

          {currentData.humanHandoffEnabled && (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-foreground">Configurable Handoff Triggers</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "explicitHumanRequest", label: "Customer explicitly asks for human", desc: "e.g. 'talk to agent', 'human please'" },
                  { key: "unableToAnswer", label: "AI cannot confidently answer", desc: "Query falls below RAG match threshold" },
                  { key: "dissatisfied", label: "Customer appears dissatisfied", desc: "Negative sentiment or frustration detected" },
                  { key: "sensitiveRequest", label: "Sensitive / high-risk request", desc: "Payment, legal, or account risk query" },
                ].map((trig) => {
                  const isChecked = Boolean(currentData.handoffTriggers?.[trig.key as keyof typeof currentData.handoffTriggers]);
                  return (
                    <label
                      key={trig.key}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs",
                        isChecked ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-accent/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onUpdateHandoffTrigger(trig.key as keyof HumanHandoffTriggers, e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-bold text-foreground block">{trig.label}</span>
                        <span className="text-muted-foreground text-[11px] leading-tight block">{trig.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground">Handoff Message</label>
                <Input
                  value={currentData.handoffMessage || ""}
                  onChange={(e) => onUpdateField("handoffMessage", e.target.value)}
                  placeholder="e.g. I'll connect you with a team member who can help you further."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
