"use client";

import React, { useState } from "react";
import { AIAgent, AgentTemplatePreset } from "../ai-agent.api";
import {
  Plus,
  Bot,
  Star,
  Trash2,
  Edit,
  CheckCircle,
  Shield,
  Sparkles,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface AgentInstanceManagerProps {
  agents: AIAgent[];
  templates: AgentTemplatePreset[];
  activeAgentId: string;
  onSelectAgent: (agent: AIAgent) => void;
  onCreateAgent: (payload: { name: string; templateId: string; isDefault?: boolean }) => void;
  onDeleteAgent: (agentId: string) => void;
  onSetDefaultAgent: (agentId: string) => void;
  isCreating?: boolean;
}

export const AgentInstanceManager: React.FC<AgentInstanceManagerProps> = ({
  agents,
  templates,
  activeAgentId,
  onSelectAgent,
  onCreateAgent,
  onDeleteAgent,
  onSetDefaultAgent,
  isCreating = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("business_consultant");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    onCreateAgent({
      name: newAgentName.trim(),
      templateId: selectedTemplateId,
      isDefault: setAsDefault,
    });

    setNewAgentName("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Workspace AI Agent Instances
          </h2>
          <p className="text-xs text-muted-foreground">
            Create, configure, and switch between specialized AI employee personas for your workspace.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Create AI Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isActive = agent._id === activeAgentId;
          const templateDoc = templates.find((t) => t.id === agent.templateId);

          return (
            <div
              key={agent._id}
              onClick={() => onSelectAgent(agent)}
              className={`rounded-xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{templateDoc?.icon || "🤖"}</span>
                    <span className="font-bold text-sm text-foreground">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {agent.isDefault && (
                      <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400" /> Default
                      </span>
                    )}
                    {isActive && (
                      <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                        ACTIVE EDITING
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-primary">{agent.agentRole || "Specialist Agent"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {agent.agentPurpose || "Assists customers accurately using diagnostic rules."}
                </p>
              </div>

              {/* Badges & Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono capitalize bg-muted px-1.5 py-0.5 rounded">
                    Scope: {agent.scopeLevel || "focused"}
                  </span>
                  <span className="font-mono capitalize bg-muted px-1.5 py-0.5 rounded">
                    {agent.aiModel || "llama-3.1"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {!agent.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAgent(agent._id)}
                      title="Set as Workspace Default Agent"
                      className="p-1.5 rounded text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {!agent.isDefault && agents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteAgent(agent._id)}
                      title="Delete Agent Instance"
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Agent Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg rounded-xl bg-card p-6 shadow-2xl border border-border space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New AI Agent Instance
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Agent Name</label>
                <Input
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Real Estate Sales Agent, Travel Specialist..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Select Agent Template Persona</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <span>{tpl.icon}</span>
                          <span>{tpl.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                          {tpl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-semibold text-foreground">Set as Workspace Default AI Agent</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating || !newAgentName.trim()}>
                {isCreating ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

