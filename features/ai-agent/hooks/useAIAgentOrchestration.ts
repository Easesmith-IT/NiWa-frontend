import { useState } from "react";
import type { AIAgent } from "../ai-agent.api";
import {
  useAgentsQuery,
  useAIActivityLogsQuery,
  useAISettingsQuery,
  useAITemplatesQuery,
  useAITestingPlaygroundMutation,
  useApplyAITemplateMutation,
  useCreateAgentMutation,
  useCreateKnowledgeSourceMutation,
  useDeleteAgentMutation,
  useDeleteKnowledgeSourceMutation,
  useKnowledgeSourcesQuery,
  useSetDefaultAgentMutation,
  useToggleKnowledgeSourceStatusMutation,
  useUpdateAgentMutation,
  useUpdateAISettingsMutation,
  useUpdateKnowledgeSourceMutation,
} from "../ai-agent.queries";
import { useAIAgentTabs } from "./useAIAgentTabs";
import { useAIAgentForms } from "./useAIAgentForms";
import { useAgentKnowledge } from "./useAgentKnowledge";

export function useAIAgentOrchestration() {
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
  const tabs = useAIAgentTabs(agents);

  // Forms & Configuration Orchestration
  const forms = useAIAgentForms({
    activeAgent: tabs.activeAgent,
    serverSettings,
    templates,
    updateSettingsMutation,
    updateAgentMutation,
  });

  // Knowledge Base Orchestration
  const knowledge = useAgentKnowledge({
    createKnowledgeMutation,
    updateKnowledgeMutation,
  });

  const knowledgeQuery = useKnowledgeSourcesQuery(
    knowledge.selectedKnowledgeAgentId || undefined,
  );

  const handleCreateAgent = (payload: { name: string; templateId: string; isDefault?: boolean }) => {
    createAgentMutation.mutate(payload, {
      onSuccess: (data: { agent: AIAgent }) => {
        tabs.setActiveEditingAgentId(data.agent._id);
        forms.setSaveFeedback({
          type: "success",
          message: `AI Agent '${data.agent.name}' created successfully.`,
        });
        setTimeout(() => forms.setSaveFeedback(null), 3000);
      },
      onError: (err: Error) => {
        forms.setSaveFeedback({
          type: "error",
          message: `Failed to create agent: ${err?.message}`,
        });
      },
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    deleteAgentMutation.mutate(agentId, {
      onSuccess: () => {
        forms.setSaveFeedback({ type: "success", message: "AI Agent deleted successfully." });
        setTimeout(() => forms.setSaveFeedback(null), 3000);
      },
    });
  };

  const handleSetDefaultAgent = (agentId: string) => {
    setDefaultAgentMutation.mutate(agentId, {
      onSuccess: () => {
        forms.setSaveFeedback({ type: "success", message: "Default AI Agent updated." });
        setTimeout(() => forms.setSaveFeedback(null), 3000);
      },
    });
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    testingMutation.mutate({
      query: testQuery.trim(),
      agentId: knowledge.selectedKnowledgeAgentId || undefined,
    });
  };

  return {
    agents,
    serverSettings,
    templates,
    testQuery,
    setTestQuery,
    agentsQuery,
    settingsQuery,
    templatesQuery,
    activityQuery,
    knowledgeQuery,
    createAgentMutation,
    updateAgentMutation,
    deleteAgentMutation,
    setDefaultAgentMutation,
    updateSettingsMutation,
    applyTemplateMutation,
    testingMutation,
    createKnowledgeMutation,
    updateKnowledgeMutation,
    toggleKnowledgeStatusMutation,
    deleteKnowledgeMutation,
    tabs,
    forms,
    knowledge,
    handleCreateAgent,
    handleDeleteAgent,
    handleSetDefaultAgent,
    handleRunTest,
  };
}
