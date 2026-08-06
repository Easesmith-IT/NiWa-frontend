"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  Edit2,
  FileText,
  HelpCircle,
  Info,
  Plus,
  Play,
  RefreshCw,
  Save,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import {
  useAIActivityLogsQuery,
  useAISettingsQuery,
  useAITestingPlaygroundMutation,
  useCreateKnowledgeSourceMutation,
  useDeleteKnowledgeSourceMutation,
  useKnowledgeSourcesQuery,
  useToggleKnowledgeSourceStatusMutation,
  useUpdateAISettingsMutation,
  useUpdateKnowledgeSourceMutation,
  BusinessAISettings,
  KnowledgeSource,
} from "../../../features/ai-agent";

export default function AIAgentPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "knowledge" | "playground" | "activity">("settings");
  const [testQuery, setTestQuery] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Knowledge Form state
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [sourceType, setSourceType] = useState<"text" | "faq">("text");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceQuestion, setSourceQuestion] = useState("");
  const [sourceAnswer, setSourceAnswer] = useState("");

  const settingsQuery = useAISettingsQuery();
  const updateSettingsMutation = useUpdateAISettingsMutation();
  const testingMutation = useAITestingPlaygroundMutation();
  const activityQuery = useAIActivityLogsQuery();
  const knowledgeQuery = useKnowledgeSourcesQuery();

  const createKnowledgeMutation = useCreateKnowledgeSourceMutation();
  const updateKnowledgeMutation = useUpdateKnowledgeSourceMutation();
  const toggleKnowledgeStatusMutation = useToggleKnowledgeSourceStatusMutation();
  const deleteKnowledgeMutation = useDeleteKnowledgeSourceMutation();

  const settings = settingsQuery.data?.settings;
  const [formData, setFormData] = useState<Partial<BusinessAISettings>>({});

  const currentData: Partial<BusinessAISettings> = {
    ...settings,
    ...formData,
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData, {
      onSuccess: () => {
        setSaveFeedback("AI Agent settings saved successfully.");
        setTimeout(() => setSaveFeedback(null), 3000);
      },
      onError: (err: any) => {
        setSaveFeedback(`Error saving settings: ${err?.message || "Failed to update"}`);
      },
    });
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    testingMutation.mutate(testQuery.trim());
  };

  const handleOpenAddKnowledge = (type: "text" | "faq" = "text") => {
    setEditingSource(null);
    setSourceType(type);
    setSourceTitle("");
    setSourceContent("");
    setSourceQuestion("");
    setSourceAnswer("");
    setIsAddKnowledgeOpen(true);
  };

  const handleOpenEditKnowledge = (source: KnowledgeSource) => {
    setEditingSource(source);
    setSourceType(source.type === "faq" ? "faq" : "text");
    setSourceTitle(source.title || "");
    setSourceContent(source.content || "");
    setSourceQuestion(source.question || "");
    setSourceAnswer(source.answer || "");
    setIsAddKnowledgeOpen(true);
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSource) {
      updateKnowledgeMutation.mutate(
        {
          id: editingSource._id,
          title: sourceType === "text" ? sourceTitle : (sourceTitle || sourceQuestion),
          content: sourceContent,
          question: sourceQuestion,
          answer: sourceAnswer,
        },
        {
          onSuccess: () => setIsAddKnowledgeOpen(false),
        },
      );
    } else {
      createKnowledgeMutation.mutate(
        {
          type: sourceType,
          title: sourceType === "text" ? sourceTitle : (sourceTitle || sourceQuestion),
          content: sourceContent,
          question: sourceQuestion,
          answer: sourceAnswer,
        },
        {
          onSuccess: () => setIsAddKnowledgeOpen(false),
        },
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

  return (
    <div className="flex h-full flex-col bg-[#F7F8FA] text-foreground dark:bg-[#0C0D0E]">
      {/* Top Page Header */}
      <div className="border-b border-[#E4E4E7] bg-white px-6 py-5 dark:border-[#24272A] dark:bg-[#121416]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF8F3] text-[#176B4D] dark:bg-[#14251E] dark:text-[#2D8A67]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">AI Agent Console</h1>
                <p className="text-xs text-muted-foreground">
                  xAI Grok Auto-Response, Knowledge Base (RAG) & Operational Activity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border",
                currentData.enabled && currentData.autoReplyEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  currentData.enabled && currentData.autoReplyEnabled ? "bg-emerald-500 animate-pulse" : "bg-zinc-400",
                )}
              />
              {currentData.enabled && currentData.autoReplyEnabled
                ? "Auto-Reply ACTIVE"
                : currentData.enabled
                  ? "AI Enabled (Auto-Reply OFF)"
                  : "AI Disabled"}
            </span>

            <Button
              className="bg-[#176B4D] hover:bg-[#12543C] text-white dark:bg-[#2D8A67] dark:hover:bg-[#236E52]"
              disabled={updateSettingsMutation.isPending}
              onClick={handleSaveSettings}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Status Warnings */}
        <div className="mt-4 space-y-2">
          {!settings?.hasApiKey ? (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>xAI API Key Missing:</strong> Configure <code className="font-mono font-bold">XAI_API_KEY</code> in backend environment variables to enable Grok response generation.
              </span>
            </div>
          ) : null}
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex gap-2 border-b border-[#E4E4E7] dark:border-[#24272A]">
          <button
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "settings"
                ? "border-[#176B4D] text-[#176B4D] dark:border-[#2D8A67] dark:text-[#2D8A67]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("settings")}
            type="button"
          >
            <Sliders className="h-4 w-4" />
            <span>Agent Settings</span>
          </button>
          <button
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "knowledge"
                ? "border-[#176B4D] text-[#176B4D] dark:border-[#2D8A67] dark:text-[#2D8A67]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("knowledge")}
            type="button"
          >
            <Database className="h-4 w-4" />
            <span>Knowledge Base</span>
            <span className="ml-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
              {knowledgeQuery.data?.sources?.length ?? 0}
            </span>
          </button>
          <button
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "playground"
                ? "border-[#176B4D] text-[#176B4D] dark:border-[#2D8A67] dark:text-[#2D8A67]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("playground")}
            type="button"
          >
            <Terminal className="h-4 w-4" />
            <span>Testing Playground</span>
            {settings?.testedSuccessfully ? (
              <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Tested
              </span>
            ) : (
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.2 text-[10px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Untested
              </span>
            )}
          </button>
          <button
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "activity"
                ? "border-[#176B4D] text-[#176B4D] dark:border-[#2D8A67] dark:text-[#2D8A67]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveTab("activity")}
            type="button"
          >
            <Clock className="h-4 w-4" />
            <span>Activity & Logs</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="niwa-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
        {saveFeedback ? (
          <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            {saveFeedback}
          </div>
        ) : null}

        {/* Tab 1: Agent Settings */}
        {activeTab === "settings" && (
          <div className="grid gap-6 max-w-4xl">
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#176B4D] dark:text-[#2D8A67]" />
                Activation Controls
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-3.5 dark:border-[#292C2F]">
                  <div>
                    <label className="text-xs font-semibold text-foreground cursor-pointer" htmlFor="ai-enabled-toggle">
                      AI System Master Switch
                    </label>
                    <p className="text-[11px] text-muted-foreground">Master toggle for AI orchestration</p>
                  </div>
                  <input
                    checked={Boolean(currentData.enabled)}
                    className="h-4 w-4 rounded border-gray-300 text-[#176B4D] focus:ring-[#176B4D]"
                    id="ai-enabled-toggle"
                    onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                    type="checkbox"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-3.5 dark:border-[#292C2F]">
                  <div>
                    <label className="text-xs font-semibold text-foreground cursor-pointer" htmlFor="auto-reply-toggle">
                      Auto-Reply to Customer Messages
                    </label>
                    <p className="text-[11px] text-muted-foreground">Automatically send Grok replies via WhatsApp</p>
                  </div>
                  <input
                    checked={Boolean(currentData.autoReplyEnabled)}
                    className="h-4 w-4 rounded border-gray-300 text-[#176B4D] focus:ring-[#176B4D]"
                    id="auto-reply-toggle"
                    onChange={(e) => setFormData((prev) => ({ ...prev, autoReplyEnabled: e.target.checked }))}
                    type="checkbox"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#176B4D] dark:text-[#2D8A67]" />
                Identity & Behavior Settings
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">Agent Name</label>
                  <Input
                    className="mt-1 text-xs"
                    onChange={(e) => setFormData((prev) => ({ ...prev, agentName: e.target.value }))}
                    value={currentData.agentName ?? ""}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Business Name</label>
                  <Input
                    className="mt-1 text-xs"
                    onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                    value={currentData.businessName ?? ""}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Response Tone</label>
                  <select
                    className="mt-1 w-full rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-medium text-foreground dark:border-[#303438] dark:bg-[#17191B]"
                    onChange={(e) => setFormData((prev) => ({ ...prev, responseStyle: e.target.value as any }))}
                    value={currentData.responseStyle ?? "friendly"}
                  >
                    <option value="friendly">Friendly & Helpful</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="casual">Casual & Direct</option>
                    <option value="custom">Custom Persona</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Response Length</label>
                  <select
                    className="mt-1 w-full rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-medium text-foreground dark:border-[#303438] dark:bg-[#17191B]"
                    onChange={(e) => setFormData((prev) => ({ ...prev, responseLength: e.target.value as any }))}
                    value={currentData.responseLength ?? "short"}
                  >
                    <option value="short">Short (1-2 sentences recommended)</option>
                    <option value="balanced">Balanced (2-3 sentences)</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Language Mode</label>
                  <select
                    className="mt-1 w-full rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-medium text-foreground dark:border-[#303438] dark:bg-[#17191B]"
                    onChange={(e) => setFormData((prev) => ({ ...prev, languageMode: e.target.value as any }))}
                    value={currentData.languageMode ?? "auto"}
                  >
                    <option value="auto">Auto Detect Customer Language</option>
                    <option value="english">English Only</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Unknown Answer Behavior</label>
                  <select
                    className="mt-1 w-full rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-medium text-foreground dark:border-[#303438] dark:bg-[#17191B]"
                    onChange={(e) => setFormData((prev) => ({ ...prev, unknownAnswerBehavior: e.target.value as any }))}
                    value={currentData.unknownAnswerBehavior ?? "safe_response"}
                  >
                    <option value="safe_response">Send Configured Fallback Response</option>
                    <option value="no_response">Do Not Send Automatic Response</option>
                    <option value="handoff">Trigger Human Operator Handoff</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-foreground">Custom System Instructions</label>
                <Textarea
                  className="mt-1 font-mono text-xs"
                  onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="e.g. You are the sales assistant for Easesmith. Ask customers what type of website they require."
                  rows={4}
                  value={currentData.systemPrompt ?? ""}
                />
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-foreground">Fallback Response Text</label>
                <Input
                  className="mt-1 text-xs"
                  onChange={(e) => setFormData((prev) => ({ ...prev, fallbackResponse: e.target.value }))}
                  value={currentData.fallbackResponse ?? "I'm unable to answer that right now. A team member will assist you shortly."}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Knowledge Base */}
        {activeTab === "knowledge" && (
          <div className="grid gap-6 max-w-5xl">
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#176B4D] dark:text-[#2D8A67]" />
                    Business Knowledge Base (RAG)
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Give your AI accurate factual information about your pricing, FAQs, and business policies.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="bg-[#176B4D] text-white hover:bg-[#12543C] dark:bg-[#2D8A67]"
                    onClick={() => handleOpenAddKnowledge("text")}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text Source
                  </Button>
                  <Button
                    onClick={() => handleOpenAddKnowledge("faq")}
                    size="sm"
                    variant="outline"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Add FAQ Source
                  </Button>
                </div>
              </div>

              {/* Knowledge Table */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-muted-foreground dark:border-[#24272A] dark:bg-[#17191B]">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Source Title</th>
                      <th className="px-3 py-2.5 font-semibold">Type</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 font-semibold">Updated</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F2] dark:divide-[#202326]">
                    {knowledgeQuery.data?.sources?.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>
                          No knowledge sources added yet. Click <strong>+ Add Text Source</strong> or <strong>Add FAQ Source</strong> to ground your AI assistant!
                        </td>
                      </tr>
                    ) : (
                      knowledgeQuery.data?.sources?.map((source) => (
                        <tr className="hover:bg-[#FAFAFA] dark:hover:bg-[#17191B]" key={source._id}>
                          <td className="px-3 py-3 font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              {source.type === "faq" ? (
                                <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              )}
                              <span className="truncate max-w-xs">{source.title}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] uppercase text-muted-foreground">
                            {source.type}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                source.status === "ready"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                              )}
                            >
                              {source.status === "ready" ? "● Ready" : "○ Disabled"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground text-[11px]">
                            {new Date(source.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() =>
                                  toggleKnowledgeStatusMutation.mutate({
                                    id: source._id,
                                    status: source.status === "ready" ? "disabled" : "ready",
                                  })
                                }
                                size="sm"
                                variant="outline"
                              >
                                {source.status === "ready" ? "Disable" : "Enable"}
                              </Button>
                              <Button onClick={() => handleOpenEditKnowledge(source)} size="sm" variant="outline">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                className="text-rose-600 hover:text-rose-700"
                                onClick={() => deleteKnowledgeMutation.mutate(source._id)}
                                size="sm"
                                variant="outline"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding / Editing Knowledge */}
        {isAddKnowledgeOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-floating dark:border-[#24272A] dark:bg-[#121416]">
              <h3 className="text-base font-bold text-foreground">
                {editingSource ? "Edit Knowledge Source" : `Add New ${sourceType.toUpperCase()} Knowledge Source`}
              </h3>

              <form className="mt-4 space-y-4" onSubmit={handleSaveKnowledge}>
                {sourceType === "text" ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Title / Topic Name</label>
                      <Input
                        className="mt-1 text-xs"
                        onChange={(e) => setSourceTitle(e.target.value)}
                        placeholder="e.g. Website Pricing & Timelines"
                        required
                        value={sourceTitle}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Content Text</label>
                      <Textarea
                        className="mt-1 text-xs"
                        onChange={(e) => setSourceContent(e.target.value)}
                        placeholder="e.g. Website development pricing starts at ₹35,000. Typical timeline is 3-4 weeks."
                        required
                        rows={5}
                        value={sourceContent}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Question</label>
                      <Input
                        className="mt-1 text-xs"
                        onChange={(e) => setSourceQuestion(e.target.value)}
                        placeholder="e.g. Do you offer hosting and maintenance?"
                        required
                        value={sourceQuestion}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Answer</label>
                      <Textarea
                        className="mt-1 text-xs"
                        onChange={(e) => setSourceAnswer(e.target.value)}
                        placeholder="e.g. Yes, 1 year of hosting and maintenance is included with all projects."
                        required
                        rows={4}
                        value={sourceAnswer}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 border-t border-[#E4E4E7] pt-4 dark:border-[#24272A]">
                  <Button onClick={() => setIsAddKnowledgeOpen(false)} type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button className="bg-[#176B4D] text-white hover:bg-[#12543C] dark:bg-[#2D8A67]" type="submit">
                    Save Knowledge
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Testing Playground */}
        {activeTab === "playground" && (
          <div className="grid gap-6 max-w-4xl">
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#176B4D] dark:text-[#2D8A67]" />
                Testing Playground (RAG Retrieval Visibility)
              </h2>

              <form className="mt-4 space-y-3" onSubmit={handleRunTest}>
                <div>
                  <label className="text-xs font-semibold text-foreground">Customer Test Message</label>
                  <div className="mt-1.5 flex gap-2">
                    <Input
                      className="text-xs"
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="e.g. Website development ka price kitna hai?"
                      value={testQuery}
                    />
                    <Button
                      className="bg-[#176B4D] text-white hover:bg-[#12543C] dark:bg-[#2D8A67]"
                      disabled={testingMutation.isPending || !testQuery.trim()}
                      type="submit"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {testingMutation.isPending ? "Generating..." : "Run Test"}
                    </Button>
                  </div>
                </div>
              </form>

              {testingMutation.data ? (
                <div className="mt-5 space-y-4 border-t border-[#E4E4E7] pt-4 dark:border-[#24272A]">
                  <div>
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#2D8A67]" />
                      Generated Grok Response
                    </span>
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-[#EDF8F3] p-4 text-xs font-medium text-foreground dark:border-[#203D31] dark:bg-[#14251E]">
                      {testingMutation.data.response}
                    </div>
                  </div>

                  {/* RAG Context Information */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        Knowledge Base Retrieval Status
                      </span>
                      <span className="font-mono text-[11px]">
                        {testingMutation.data.knowledgeUsed ? "● Knowledge Used" : "○ No Knowledge Matched"}
                      </span>
                    </div>

                    {testingMutation.data.knowledgeSources?.length ? (
                      <div className="mt-2 text-[11px]">
                        <span className="font-medium text-muted-foreground">Sources Matched:</span>{" "}
                        <span className="font-semibold">{testingMutation.data.knowledgeSources.join(", ")}</span>
                      </div>
                    ) : null}

                    {testingMutation.data.scoredChunks?.length ? (
                      <div className="mt-3 space-y-2">
                        <span className="font-medium text-muted-foreground text-[11px]">Retrieved Chunks & Relevance Scores:</span>
                        {testingMutation.data.scoredChunks.map((chunk, idx) => (
                          <div className="rounded border border-zinc-200 bg-white p-2 text-[11px] dark:border-zinc-800 dark:bg-zinc-950" key={idx}>
                            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                              <span>Source: {chunk.sourceTitle}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Score: {chunk.score}</span>
                            </div>
                            <p className="mt-1 text-foreground whitespace-pre-wrap">{chunk.chunkText}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Tab 4: Activity Logs */}
        {activeTab === "activity" && (
          <div className="grid gap-6 max-w-5xl">
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#176B4D] dark:text-[#2D8A67]" />
                    AI Activity Execution Log
                  </h2>
                </div>
                <Button disabled={activityQuery.isFetching} onClick={() => activityQuery.refetch()} size="sm" variant="outline">
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1", activityQuery.isFetching && "animate-spin")} />
                  Refresh
                </Button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-muted-foreground dark:border-[#24272A] dark:bg-[#17191B]">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Timestamp</th>
                      <th className="px-3 py-2.5 font-semibold">State</th>
                      <th className="px-3 py-2.5 font-semibold">Reason</th>
                      <th className="px-3 py-2.5 font-semibold">Model</th>
                      <th className="px-3 py-2.5 font-semibold">Latency</th>
                      <th className="px-3 py-2.5 font-semibold">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F2] dark:divide-[#202326]">
                    {activityQuery.data?.activities?.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                          No AI activity recorded yet.
                        </td>
                      </tr>
                    ) : (
                      activityQuery.data?.activities?.map((item) => (
                        <tr className="hover:bg-[#FAFAFA] dark:hover:bg-[#17191B]" key={item._id}>
                          <td className="px-3 py-2.5 font-mono text-[11px]">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                item.processingState === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : item.processingState === "FAILED"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
                              )}
                            >
                              {item.processingState}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-foreground">
                            {item.reason}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{item.aiModel}</td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{item.latencyMs}ms</td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{item.totalTokens}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
