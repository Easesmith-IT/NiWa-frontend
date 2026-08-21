"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Play,
  RefreshCw,
  Save,
  Sliders,
  Terminal,
  TrendingUp,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import {
  useAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useSetDefaultAgentMutation,
  useAIActivityLogsQuery,
  useAISettingsQuery,
  useAITemplatesQuery,
  useUpdateAISettingsMutation,
  useApplyAITemplateMutation,
  useAITestingPlaygroundMutation,
  useCreateKnowledgeSourceMutation,
  useDeleteKnowledgeSourceMutation,
  useKnowledgeSourcesQuery,
  useToggleKnowledgeSourceStatusMutation,
  useUpdateKnowledgeSourceMutation,
  useAIAgentTabs,
  useAIAgentForms,
  useAgentKnowledge,
  AgentLibraryTab,
  AgentConfigurationTab,
  AgentKnowledgeTab,
  AgentPlaygroundTab,
  AgentActivityTab,
  AIAgent,
  MemoryFieldDefinition,
} from "../../../features/ai-agent";

import { KnowledgeAccessSelector } from "./components/KnowledgeAccessSelector";

export default function AIAgentPage() {
  const [testQuery, setTestQuery] = useState("");

  // Agent Management Mutations
  const createAgentMutation = useCreateAgentMutation();
  const updateAgentMutation = useUpdateAgentMutation();
  const deleteAgentMutation = useDeleteAgentMutation();
  const setDefaultAgentMutation = useSetDefaultAgentMutation();

  // Queries & Mutations
  const agentsQuery = useAgentsQuery();
  const settingsQuery = useAISettingsQuery();
  const templatesQuery = useAITemplatesQuery();
  const updateSettingsMutation = useUpdateAISettingsMutation();
  const applyTemplateMutation = useApplyAITemplateMutation();
  const testingMutation = useAITestingPlaygroundMutation();
  const activityQuery = useAIActivityLogsQuery();

  const createKnowledgeMutation = useCreateKnowledgeSourceMutation();
  const updateKnowledgeMutation = useUpdateKnowledgeSourceMutation();
  const toggleKnowledgeStatusMutation = useToggleKnowledgeSourceStatusMutation();
  const deleteKnowledgeMutation = useDeleteKnowledgeSourceMutation();

  const agents = agentsQuery.data?.agents || [];
  const serverSettings = settingsQuery.data?.settings;
  const templates = templatesQuery.data?.templates || [];

  // Tab & Active Agent Navigation Orchestration
  const {
    activeTab,
    setActiveTab,
    activeEditingAgentId,
    setActiveEditingAgentId,
    activeAgent,
  } = useAIAgentTabs(agents);

  // Forms & Configuration Orchestration
  const {
    saveFeedback,
    setSaveFeedback,
    pendingTemplateId,
    setIsTemplateModalOpen,
    isTemplateModalOpen,
    isMemoryModalOpen,
    setIsMemoryModalOpen,
    editingMemoryKey,
    memoryFieldName,
    setMemoryFieldName,
    memoryFieldDesc,
    setMemoryFieldDesc,
    memoryFieldType,
    setMemoryFieldType,
    memoryFieldError,
    showAdvancedInstructions,
    setShowAdvancedInstructions,
    showAdvancedMemory,
    setShowAdvancedMemory,
    currentData,
    isDirty,
    handleUpdateField,
    handleUpdateBehavior,
    handleUpdateHandoffTrigger,
    handleDiscardChanges,
    handleSaveSettings,
    executeApplyTemplate,
    handleOpenAddMemoryModal,
    handleOpenEditMemoryModal,
    handleSaveMemoryField,
    handleDeleteMemoryField,
    handleResetToTemplateDefaults,
    generateSafeKey,
  } = useAIAgentForms({
    activeAgent,
    serverSettings,
    templates,
    updateSettingsMutation,
    updateAgentMutation,
  });

  // Knowledge Base Orchestration
  const {
    selectedKnowledgeAgentId,
    setSelectedKnowledgeAgentId,
    accessFilter,
    setAccessFilter,
    isAddKnowledgeOpen,
    setIsAddKnowledgeOpen,
    editingSource,
    sourceType,
    sourceTitle,
    setSourceTitle,
    sourceContent,
    setSourceContent,
    sourceQuestion,
    setSourceQuestion,
    sourceAnswer,
    setSourceAnswer,
    sourceAccessMode,
    setSourceAccessMode,
    sourceAssignedAgentIds,
    setSourceAssignedAgentIds,
    handleOpenAddKnowledge,
    handleOpenEditKnowledge,
    handleSaveKnowledge,
  } = useAgentKnowledge({
    createKnowledgeMutation,
    updateKnowledgeMutation,
  });

  const knowledgeQuery = useKnowledgeSourcesQuery(selectedKnowledgeAgentId || undefined);

  const handleCreateAgent = (payload: { name: string; templateId: string; isDefault?: boolean }) => {
    createAgentMutation.mutate(payload, {
      onSuccess: (data) => {
        setActiveEditingAgentId(data.agent._id);
        setSaveFeedback({ type: "success", message: `AI Agent '${data.agent.name}' created successfully.` });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
      onError: (err: Error) => {
        setSaveFeedback({ type: "error", message: `Failed to create agent: ${err?.message}` });
      },
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    deleteAgentMutation.mutate(agentId, {
      onSuccess: () => {
        setSaveFeedback({ type: "success", message: "AI Agent deleted successfully." });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
    });
  };

  const handleSetDefaultAgent = (agentId: string) => {
    setDefaultAgentMutation.mutate(agentId, {
      onSuccess: () => {
        setSaveFeedback({ type: "success", message: "Default AI Agent updated." });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
    });
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    testingMutation.mutate({ query: testQuery.trim(), agentId: selectedKnowledgeAgentId || undefined });
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span>Loading AI Agent configuration...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* Header Bar */}
      <div className="border-b border-border bg-card px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">AI Agent Studio</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              v2.0 Generic Core
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your AI employee persona, diagnostic behaviors, generic memory, and safety handoffs.
          </p>
        </div>

        {/* Status Toggle & Save Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Auto Response:</span>
            <button
              onClick={() => handleUpdateField("enabled", !currentData.enabled)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                currentData.enabled ? "bg-emerald-500" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  currentData.enabled ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
            <span className={cn("text-xs font-bold", currentData.enabled ? "text-emerald-500" : "text-muted-foreground")}>
              {currentData.enabled ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={!isDirty || updateSettingsMutation.isPending}
            className="gap-2 font-semibold shadow-sm"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div
          className={cn(
            "mx-6 mt-4 p-3 rounded-lg flex items-center justify-between text-sm font-medium border",
            saveFeedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              : "bg-destructive/10 text-destructive border-destructive/30",
          )}
        >
          <div className="flex items-center gap-2">
            {saveFeedback.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{saveFeedback.message}</span>
          </div>
          <button onClick={() => setSaveFeedback(null)} className="text-xs underline opacity-80 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="border-b border-border bg-card/50 px-6">
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("agents")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
              activeTab === "agents"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Bot className="h-4 w-4" />
            AI Agents ({agentsQuery.data?.agents?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Sliders className="h-4 w-4" />
            Agent Persona & Rules
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
              activeTab === "knowledge"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="h-4 w-4" />
            Knowledge Base (RAG)
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
              activeTab === "playground"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Terminal className="h-4 w-4" />
            Playground
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Activity Logs
          </button>
        </div>
      </div>

      {/* Main Content Body - Extracted Primary Tabs */}
      <div className="flex-1 p-6">
        {activeTab === "agents" && (
          <AgentLibraryTab
            agents={agentsQuery.data?.agents || []}
            templates={templates}
            activeAgentId={activeEditingAgentId || (agentsQuery.data?.agents.find((a) => a.isDefault)?._id || "")}
            isCreating={createAgentMutation.isPending}
            onSelectAgent={(agent: AIAgent) => {
              setActiveEditingAgentId(agent._id);
              setActiveTab("settings");
            }}
            onCreateAgent={handleCreateAgent}
            onDeleteAgent={handleDeleteAgent}
            onSetDefaultAgent={handleSetDefaultAgent}
          />
        )}

        {activeTab === "settings" && (
          <AgentConfigurationTab
            activeAgent={activeAgent}
            agents={agents}
            templates={templates}
            currentData={currentData}
            isApplyingTemplate={applyTemplateMutation.isPending}
            showAdvancedInstructions={showAdvancedInstructions}
            showAdvancedMemory={showAdvancedMemory}
            onSelectAgentId={setActiveEditingAgentId}
            onUpdateField={handleUpdateField}
            onUpdateBehavior={handleUpdateBehavior}
            onUpdateHandoffTrigger={handleUpdateHandoffTrigger}
            onApplyTemplate={executeApplyTemplate}
            onResetToTemplateDefaults={handleResetToTemplateDefaults}
            onOpenAddMemoryModal={handleOpenAddMemoryModal}
            onOpenEditMemoryModal={handleOpenEditMemoryModal}
            onDeleteMemoryField={handleDeleteMemoryField}
            onToggleShowAdvancedInstructions={() => setShowAdvancedInstructions(!showAdvancedInstructions)}
            onToggleShowAdvancedMemory={() => setShowAdvancedMemory(!showAdvancedMemory)}
          />
        )}

        {activeTab === "knowledge" && (
          <AgentKnowledgeTab
            sources={knowledgeQuery.data?.sources || []}
            agents={agentsQuery.data?.agents || []}
            selectedKnowledgeAgentId={selectedKnowledgeAgentId}
            accessFilter={accessFilter}
            onSelectKnowledgeAgent={setSelectedKnowledgeAgentId}
            onChangeAccessFilter={setAccessFilter}
            onAddSource={handleOpenAddKnowledge}
            onEditSource={handleOpenEditKnowledge}
            onDeleteSource={(id) => deleteKnowledgeMutation.mutate(id)}
            onToggleSourceStatus={(id, status) => toggleKnowledgeStatusMutation.mutate({ id, status })}
          />
        )}

        {activeTab === "playground" && (
          <AgentPlaygroundTab
            testQuery={testQuery}
            isTesting={testingMutation.isPending}
            testResult={testingMutation.data}
            onQueryChange={setTestQuery}
            onRunTest={handleRunTest}
          />
        )}

        {activeTab === "activity" && (
          <AgentActivityTab
            logs={activityQuery.data?.activities || []}
            isLoading={activityQuery.isLoading}
          />
        )}
      </div>

      {/* Sticky Bottom Action Bar for Unsaved Changes */}
      {isDirty && (
        <div className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t border-border p-4 shadow-2xl z-50 flex items-center justify-between px-8 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <span>Unsaved Changes in Agent Configuration</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
            <Button size="sm" onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending} className="gap-2">
              {updateSettingsMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Agent Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Template Overwrite Confirmation Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-foreground">Apply Template Preset?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Applying this template will replace current agent behavior, diagnostic rules, and recommended memory schema. Organization info and Knowledge Base content will be preserved.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => pendingTemplateId && executeApplyTemplate(pendingTemplateId)}
                disabled={applyTemplateMutation.isPending}
              >
                {applyTemplateMutation.isPending ? "Applying..." : "Apply Template"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Memory Field Modal */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveMemoryField} className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingMemoryKey ? "Edit Memory Field" : "Add Memory Field"}
              </h3>
              <button type="button" onClick={() => setIsMemoryModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>

            {memoryFieldError && (
              <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs font-semibold">
                {memoryFieldError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Field Name</label>
                <Input
                  value={memoryFieldName}
                  onChange={(e) => setMemoryFieldName(e.target.value)}
                  placeholder="e.g. Average Order Value"
                />
                <p className="text-[11px] text-muted-foreground">
                  Internal key: <code className="font-mono font-bold text-primary">{editingMemoryKey || generateSafeKey(memoryFieldName || "field_name")}</code>
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <Textarea
                  rows={2}
                  value={memoryFieldDesc}
                  onChange={(e) => setMemoryFieldDesc(e.target.value)}
                  placeholder="Explicit description of what this field tracks..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Data Type</label>
                <select
                  value={memoryFieldType}
                  onChange={(e) => setMemoryFieldType(e.target.value as MemoryFieldDefinition["type"])}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="string">Text (String)</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes / No (Boolean)</option>
                  <option value="string_array">List of Text (Array)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMemoryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Memory Field
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Knowledge Modal */}
      {isAddKnowledgeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveKnowledge} className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold">{editingSource ? "Edit Knowledge Source" : "Add Knowledge Source"}</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Source Title</label>
                <Input value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} required />
              </div>
              {sourceType === "text" ? (
                <div className="space-y-1">
                  <label className="font-bold">Content</label>
                  <Textarea rows={4} value={sourceContent} onChange={(e) => setSourceContent(e.target.value)} required />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-bold">Question</label>
                    <Input value={sourceQuestion} onChange={(e) => setSourceQuestion(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Answer</label>
                    <Textarea rows={3} value={sourceAnswer} onChange={(e) => setSourceAnswer(e.target.value)} required />
                  </div>
                </>
              )}

              {/* Agent Access Control Selector */}
              <div className="pt-3 border-t border-border">
                <KnowledgeAccessSelector
                  accessMode={sourceAccessMode}
                  assignedAgentIds={sourceAssignedAgentIds}
                  agents={agentsQuery.data?.agents || []}
                  onChangeAccessMode={setSourceAccessMode}
                  onChangeAssignedAgents={setSourceAssignedAgentIds}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddKnowledgeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Source
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
