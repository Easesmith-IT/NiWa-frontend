"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Edit2,
  FileText,
  Headphones,
  HelpCircle,
  Info,
  Plus,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  ShoppingBag,
  Sliders,
  Sparkles,
  Stethoscope,
  Terminal,
  Trash2,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import {
  useAgentsQuery,
  useCreateAgentMutation,
  useDeleteAgentMutation,
  useSetDefaultAgentMutation,
  useAIActivityLogsQuery,
  useAISettingsQuery,
  useAITemplatesQuery,
  useApplyAITemplateMutation,
  useAITestingPlaygroundMutation,
  useCreateKnowledgeSourceMutation,
  useDeleteKnowledgeSourceMutation,
  useKnowledgeSourcesQuery,
  useToggleKnowledgeSourceStatusMutation,
  useUpdateAISettingsMutation,
  useUpdateKnowledgeSourceMutation,
  AIAgent,
  BusinessAISettings,
  KnowledgeSource,
  AIActivityLog,
  MemoryFieldDefinition,
  AgentTemplatePreset,
} from "../../../features/ai-agent";

import { AgentLibrary } from "./components/AgentLibrary";
import { AgentScopeSettings } from "./components/AgentScopeSettings";
import { KnowledgePolicySelector } from "./components/KnowledgePolicySelector";
import { AgentCapabilitiesEditor } from "./components/AgentCapabilitiesEditor";
import { AgentObjectiveSettings } from "./components/AgentObjectiveSettings";
import { AgentContractSummary } from "./components/AgentContractSummary";
import { AgentDecisionTrace } from "./components/AgentDecisionTrace";
import { KnowledgeFilters, AccessFilter } from "./components/KnowledgeFilters";
import { KnowledgeAccessSelector } from "./components/KnowledgeAccessSelector";
import { AgentKnowledgeSummary } from "./components/AgentKnowledgeSummary";
import { AgentInstanceManager } from "./components/AgentInstanceManager";

export default function AIAgentPage() {
  const [activeTab, setActiveTab] = useState<"agents" | "settings" | "knowledge" | "playground" | "activity">("agents");
  const [testQuery, setTestQuery] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Template Overwrite Modal state
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Memory Field Modal state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [editingMemoryKey, setEditingMemoryKey] = useState<string | null>(null);
  const [memoryFieldName, setMemoryFieldName] = useState("");
  const [memoryFieldDesc, setMemoryFieldDesc] = useState("");
  const [memoryFieldType, setMemoryFieldType] = useState<"string" | "number" | "boolean" | "string_array">("string");
  const [memoryFieldError, setMemoryFieldError] = useState<string | null>(null);

  // Collapsed sections state
  const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(false);
  const [showAdvancedMemory, setShowAdvancedMemory] = useState(false);

  // Knowledge Form state
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [sourceType, setSourceType] = useState<"text" | "faq">("text");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceQuestion, setSourceQuestion] = useState("");
  const [sourceAnswer, setSourceAnswer] = useState("");

  // Agent Knowledge Access State
  const [selectedKnowledgeAgentId, setSelectedKnowledgeAgentId] = useState<string>("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [sourceAccessMode, setSourceAccessMode] = useState<"all_agents" | "selected_agents">("all_agents");
  const [sourceAssignedAgentIds, setSourceAssignedAgentIds] = useState<string[]>([]);

  // Agent Management Mutations
  const createAgentMutation = useCreateAgentMutation();
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
  const knowledgeQuery = useKnowledgeSourcesQuery(selectedKnowledgeAgentId || undefined);

  const createKnowledgeMutation = useCreateKnowledgeSourceMutation();
  const updateKnowledgeMutation = useUpdateKnowledgeSourceMutation();
  const toggleKnowledgeStatusMutation = useToggleKnowledgeSourceStatusMutation();
  const deleteKnowledgeMutation = useDeleteKnowledgeSourceMutation();

  const handleCreateAgent = (payload: { name: string; templateId: string; isDefault?: boolean }) => {
    createAgentMutation.mutate(payload, {
      onSuccess: (data) => {
        setSelectedKnowledgeAgentId(data.agent._id);
        setSaveFeedback({ type: "success", message: `AI Agent '${data.agent.name}' created successfully.` });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
      onError: (err: any) => {
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

  const serverSettings = settingsQuery.data?.settings;
  const [formData, setFormData] = useState<Partial<BusinessAISettings>>({});

  // Sync formData with serverSettings when loaded initially or after save
  useEffect(() => {
    if (serverSettings) {
      setFormData({});
    }
  }, [serverSettings]);

  const currentData: BusinessAISettings = useMemo(() => {
    return {
      ...(serverSettings || ({} as BusinessAISettings)),
      ...formData,
      behavior: {
        diagnoseBeforeRecommending: true,
        challengeAssumptions: true,
        explainReasoning: true,
        preferActionableAdvice: true,
        useNumbersWhenUseful: true,
        avoidGenericRecommendations: true,
        ...(serverSettings?.behavior || {}),
        ...(formData.behavior || {}),
      },
      handoffTriggers: {
        explicitHumanRequest: true,
        unableToAnswer: true,
        dissatisfied: true,
        sensitiveRequest: false,
        ...(serverSettings?.handoffTriggers || {}),
        ...(formData.handoffTriggers || {}),
      },
    };
  }, [serverSettings, formData]);

  const isDirty = useMemo(() => {
    return Object.keys(formData).length > 0;
  }, [formData]);

  const handleUpdateField = <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateBehavior = (key: keyof BusinessAISettings["behavior"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      behavior: {
        ...(currentData.behavior || {}),
        [key]: value,
      },
    }));
  };

  const handleUpdateHandoffTrigger = (key: keyof BusinessAISettings["handoffTriggers"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      handoffTriggers: {
        ...(currentData.handoffTriggers || {}),
        [key]: value,
      },
    }));
  };

  const handleDiscardChanges = () => {
    setFormData({});
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({});
        setSaveFeedback({ type: "success", message: "AI Agent settings saved successfully." });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
      onError: (err: any) => {
        setSaveFeedback({ type: "error", message: `Error saving settings: ${err?.message || "Failed to update"}` });
      },
    });
  };

  // Template Selection
  const handleSelectTemplate = (templateId: string) => {
    if (templateId === "custom") {
      handleUpdateField("templateId", "custom");
      return;
    }

    setPendingTemplateId(templateId);
    if (isDirty || currentData.agentInstructions?.trim()) {
      setIsTemplateModalOpen(true);
    } else {
      executeApplyTemplate(templateId);
    }
  };

  const executeApplyTemplate = (templateId: string) => {
    applyTemplateMutation.mutate(templateId, {
      onSuccess: () => {
        setFormData({});
        setIsTemplateModalOpen(false);
        setPendingTemplateId(null);
        setSaveFeedback({ type: "success", message: `Template '${templateId}' applied successfully.` });
        setTimeout(() => setSaveFeedback(null), 3000);
      },
      onError: (err: any) => {
        setIsTemplateModalOpen(false);
        setSaveFeedback({ type: "error", message: `Failed to apply template: ${err?.message}` });
      },
    });
  };

  // Memory Field Management
  const generateSafeKey = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_");
  };

  const handleOpenAddMemoryModal = () => {
    setEditingMemoryKey(null);
    setMemoryFieldName("");
    setMemoryFieldDesc("");
    setMemoryFieldType("string");
    setMemoryFieldError(null);
    setIsMemoryModalOpen(true);
  };

  const handleOpenEditMemoryModal = (item: MemoryFieldDefinition) => {
    setEditingMemoryKey(item.key);
    setMemoryFieldName(item.key.replace(/_/g, " "));
    setMemoryFieldDesc(item.description || "");
    setMemoryFieldType(item.type);
    setMemoryFieldError(null);
    setIsMemoryModalOpen(true);
  };

  const handleSaveMemoryField = (e: React.FormEvent) => {
    e.preventDefault();
    setMemoryFieldError(null);

    if (!memoryFieldName.trim()) {
      setMemoryFieldError("Field name is required");
      return;
    }

    const key = editingMemoryKey || generateSafeKey(memoryFieldName);
    const existingSchema = currentData.memorySchema || [];

    if (!editingMemoryKey && existingSchema.some((f) => f.key.toLowerCase() === key.toLowerCase())) {
      setMemoryFieldError(`Field key '${key}' already exists.`);
      return;
    }

    const newField: MemoryFieldDefinition = {
      key,
      description: memoryFieldDesc.trim(),
      type: memoryFieldType,
    };

    let updatedSchema: MemoryFieldDefinition[];
    if (editingMemoryKey) {
      updatedSchema = existingSchema.map((f) => (f.key === editingMemoryKey ? newField : f));
    } else {
      updatedSchema = [...existingSchema, newField];
    }

    handleUpdateField("memorySchema", updatedSchema);
    setIsMemoryModalOpen(false);
  };

  const handleDeleteMemoryField = (keyToDelete: string) => {
    const updatedSchema = (currentData.memorySchema || []).filter((f) => f.key !== keyToDelete);
    handleUpdateField("memorySchema", updatedSchema);
  };

  const handleResetToTemplateDefaults = () => {
    if (currentData.templateId) {
      executeApplyTemplate(currentData.templateId);
    }
  };

  // Knowledge Form handlers
  const handleOpenAddKnowledge = (type: "text" | "faq" = "text") => {
    setEditingSource(null);
    setSourceType(type);
    setSourceTitle("");
    setSourceContent("");
    setSourceQuestion("");
    setSourceAnswer("");
    setSourceAccessMode("all_agents");
    setSourceAssignedAgentIds([]);
    setIsAddKnowledgeOpen(true);
  };

  const handleOpenEditKnowledge = (source: KnowledgeSource) => {
    setEditingSource(source);
    setSourceType(source.type === "faq" ? "faq" : "text");
    setSourceTitle(source.title || "");
    setSourceContent(source.content || "");
    setSourceQuestion(source.question || "");
    setSourceAnswer(source.answer || "");
    setSourceAccessMode(source.accessMode || "all_agents");
    setSourceAssignedAgentIds(source.assignedAgentIds || []);
    setIsAddKnowledgeOpen(true);
  };

  // Playground & Knowledge
  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    testingMutation.mutate({ query: testQuery.trim(), agentId: selectedKnowledgeAgentId || undefined });
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: sourceType === "text" ? sourceTitle : (sourceTitle || sourceQuestion),
      content: sourceContent,
      question: sourceQuestion,
      answer: sourceAnswer,
      accessMode: sourceAccessMode,
      assignedAgentIds: sourceAccessMode === "selected_agents" ? sourceAssignedAgentIds : [],
    };

    if (editingSource) {
      updateKnowledgeMutation.mutate(
        { id: editingSource._id, ...payload },
        { onSuccess: () => setIsAddKnowledgeOpen(false) },
      );
    } else {
      createKnowledgeMutation.mutate(
        { type: sourceType, ...payload },
        { onSuccess: () => setIsAddKnowledgeOpen(false) },
      );
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span>Loading AI Agent configuration...</span>
      </div>
    );
  }

  const templates = templatesQuery.data?.templates || [];

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

      {/* Main Content Body */}
      <div className="flex-1 p-6">
        {/* AI Agents Manager Tab */}
        {activeTab === "agents" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <AgentInstanceManager
              agents={agentsQuery.data?.agents || []}
              templates={templates}
              activeAgentId={selectedKnowledgeAgentId || (agentsQuery.data?.agents.find((a) => a.isDefault)?._id || "")}
              onSelectAgent={(agent) => {
                setSelectedKnowledgeAgentId(agent._id);
                setActiveTab("settings");
              }}
              onCreateAgent={handleCreateAgent}
              onDeleteAgent={handleDeleteAgent}
              onSetDefaultAgent={handleSetDefaultAgent}
              isCreating={createAgentMutation.isPending}
            />
          </div>
        )}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Agent Contract Visual Overview */}
            <AgentContractSummary settings={currentData} />

            {/* Enterprise Agent Library Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <AgentLibrary
                templates={templates}
                activeTemplateId={currentData.templateId || "business_consultant"}
                onApplyTemplate={executeApplyTemplate}
                isApplying={applyTemplateMutation.isPending}
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
                    onChange={(e) => handleUpdateField("agentName", e.target.value)}
                    placeholder="e.g. AI Senior Business Consultant"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Agent Role</label>
                  <Input
                    value={currentData.agentRole || ""}
                    onChange={(e) => handleUpdateField("agentRole", e.target.value)}
                    placeholder="e.g. Senior Business Consultant"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">Organization / Business Name</label>
                  <Input
                    value={currentData.businessName || ""}
                    onChange={(e) => handleUpdateField("businessName", e.target.value)}
                    placeholder="e.g. Easesmith"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">Agent Purpose</label>
                  <Textarea
                    rows={2}
                    value={currentData.agentPurpose || ""}
                    onChange={(e) => handleUpdateField("agentPurpose", e.target.value)}
                    placeholder="Describe what this AI employee is designed to achieve..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">Organization Description</label>
                  <Textarea
                    rows={2}
                    value={currentData.businessDescription || ""}
                    onChange={(e) => handleUpdateField("businessDescription", e.target.value)}
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
                    onChange={(e) => handleUpdateField("conversationStyle", e.target.value as any)}
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
                    onChange={(e) => handleUpdateField("responseStyle", e.target.value as any)}
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
                    onChange={(e) => handleUpdateField("responseLength", e.target.value as any)}
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
                    onChange={(e) => handleUpdateField("questionsPerReply", Number(e.target.value))}
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
                    const isChecked = Boolean((currentData.behavior as any)?.[item.key]);
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
                          onChange={(e) => handleUpdateBehavior(item.key as any, e.target.checked)}
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
                onChange={(val) => handleUpdateField("scopeLevel", val)}
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
                        onClick={() => handleUpdateField("autonomyLevel", aut.id as any)}
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
                onChange={(val) => handleUpdateField("knowledgePolicy", val)}
              />

              {/* Objectives Editor */}
              <AgentObjectiveSettings
                primaryObjective={currentData.primaryObjective || ""}
                secondaryObjectives={currentData.secondaryObjectives || []}
                onChangePrimary={(val) => handleUpdateField("primaryObjective", val)}
                onChangeSecondary={(val) => handleUpdateField("secondaryObjectives", val)}
              />

              {/* Capabilities & Restrictions Editor */}
              <AgentCapabilitiesEditor
                capabilities={currentData.capabilities || []}
                restrictedCapabilities={currentData.restrictedCapabilities || []}
                onChangeCapabilities={(caps) => handleUpdateField("capabilities", caps)}
                onChangeRestricted={(rests) => handleUpdateField("restrictedCapabilities", rests)}
              />

              {/* Collapsible Advanced Scope Toggles */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAdvancedInstructions(!showAdvancedInstructions)}
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
                        const isChecked = Boolean((currentData as any)[tog.key] !== false);
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
                              onChange={(e) => handleUpdateField(tog.key as any, e.target.checked)}
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
                        onChange={(e) => handleUpdateField("outOfScopeMessage", e.target.value)}
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
                  onClick={handleResetToTemplateDefaults}
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
                  onChange={(e) => handleUpdateField("agentInstructions", e.target.value)}
                  placeholder="Enter workspace-level agent instructions..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Advanced Collapsed Section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedInstructions(!showAdvancedInstructions)}
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
                        onChange={(e) => handleUpdateField("systemPrompt", e.target.value)}
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
                    onChange={(e) => handleUpdateField("languageMode", e.target.value as any)}
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
                    onChange={(e) => handleUpdateField("preferredLanguage", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {[
                  { key: "matchCustomerLanguage", label: "Match Customer Language", desc: "Mirror customer's language automatically" },
                  { key: "allowHinglish", label: "Allow Hinglish", desc: "Support Hinglish when customer speaks Hindi/Hinglish" },
                  { key: "preserveTechnicalEnglish", label: "Preserve Tech Terms", desc: "Keep business & technical English terms intact" },
                ].map((item) => {
                  const isChecked = Boolean((currentData as any)[item.key]);
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
                        onChange={(e) => handleUpdateField(item.key as any, e.target.checked)}
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
                      onClick={() => handleUpdateField("memoryEnabled", !currentData.memoryEnabled)}
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

                  <Button onClick={handleOpenAddMemoryModal} size="sm" className="gap-1.5 text-xs">
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
                              onClick={() => handleOpenEditMemoryModal(item)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMemoryField(item.key)}
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
                  onClick={() => setShowAdvancedMemory(!showAdvancedMemory)}
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
                        onChange={(e) => handleUpdateField("maxFactsPerConversation", Number(e.target.value))}
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
                        onChange={(e) => handleUpdateField("maxFactLength", Number(e.target.value))}
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
                        onClick={() => handleUpdateField("unknownAnswerBehavior", opt.value as any)}
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
                      onChange={(e) => handleUpdateField("fallbackResponse", e.target.value)}
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
                    onClick={() => handleUpdateField("humanHandoffEnabled", !currentData.humanHandoffEnabled)}
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
                        const isChecked = Boolean((currentData.handoffTriggers as any)?.[trig.key]);
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
                              onChange={(e) => handleUpdateHandoffTrigger(trig.key as any, e.target.checked)}
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
                        onChange={(e) => handleUpdateField("handoffMessage", e.target.value)}
                        placeholder="e.g. I'll connect you with a team member who can help you further."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Tab */}
        {activeTab === "knowledge" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header & Add Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Knowledge Base Sources</h3>
                <p className="text-xs text-muted-foreground">Add text documents or Q&A pairs for precision RAG retrieval with Agent-Scoped access controls.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleOpenAddKnowledge("text")} size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add Document
                </Button>
                <Button onClick={() => handleOpenAddKnowledge("faq")} size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add FAQ Pair
                </Button>
              </div>
            </div>

            {/* Knowledge Overview Summary */}
            <AgentKnowledgeSummary
              agents={agentsQuery.data?.agents || []}
              sources={knowledgeQuery.data?.sources || []}
              selectedAgentId={selectedKnowledgeAgentId}
            />

            {/* Access & Agent Instance Filter Toolbar */}
            <KnowledgeFilters
              accessFilter={accessFilter}
              selectedAgentId={selectedKnowledgeAgentId}
              agents={agentsQuery.data?.agents || []}
              onChangeAccessFilter={setAccessFilter}
              onChangeSelectedAgent={setSelectedKnowledgeAgentId}
            />

            {/* Knowledge List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(knowledgeQuery.data?.sources || [])
                .filter((source: KnowledgeSource) => {
                  if (accessFilter === "shared") return source.accessMode === "all_agents";
                  if (accessFilter === "agent_specific") return source.accessMode === "selected_agents";
                  return true;
                })
                .map((source: KnowledgeSource) => (
                <div key={source._id} className="p-4 rounded-xl border border-border bg-card space-y-3.5 relative shadow-sm hover:shadow-md transition-all">
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
                        onClick={() => toggleKnowledgeStatusMutation.mutate({ id: source._id, status: source.status === "ready" ? "disabled" : "ready" })}
                        className={cn("text-xs font-semibold px-2 py-0.5 rounded transition-colors", source.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}
                      >
                        {source.status}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditKnowledge(source)} className="h-7 w-7 p-0">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteKnowledgeMutation.mutate(source._id)} className="h-7 w-7 p-0 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{source.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                      {source.type === "faq" ? `Q: ${source.question}\nA: ${source.answer}` : source.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playground Tab */}
        {activeTab === "playground" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Testing Playground
              </h3>
              <form onSubmit={handleRunTest} className="space-y-3">
                <Textarea
                  rows={3}
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Type a test customer message (e.g. 'Business ka apko kya knowledge hai')..."
                />
                <Button type="submit" disabled={testingMutation.isPending} className="gap-2">
                  {testingMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Test AI Response
                </Button>
              </form>

              {testingMutation.data && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                    <div className="font-bold text-primary flex items-center justify-between">
                      <span>AI Output Response:</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{testingMutation.data.model}</span>
                    </div>
                    <p className="text-sm font-medium whitespace-pre-wrap text-foreground leading-relaxed">
                      {testingMutation.data.response}
                    </p>
                  </div>

                  {/* System Decision Trace */}
                  <AgentDecisionTrace trace={testingMutation.data.decisionTrace} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === "activity" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent AI Activity Logs
              </h3>
              <div className="divide-y divide-border">
                {(activityQuery.data?.activities || []).map((log: AIActivityLog) => (
                  <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">{log.customerPhoneNumber || "Customer"}</span>
                      <span className="text-muted-foreground ml-2">Reason: {log.reason}</span>
                    </div>
                    <span className={cn("font-bold px-2 py-0.5 rounded", log.processingState === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>
                      {log.processingState}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  onChange={(e) => setMemoryFieldType(e.target.value as any)}
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
