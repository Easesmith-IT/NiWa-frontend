import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  applyAITemplate,
  createAgent,
  createKnowledgeSource,
  deleteAgent,
  deleteKnowledgeSource,
  fetchAIActivityLogs,
  fetchAISettings,
  fetchAITemplates,
  fetchAgents,
  fetchKnowledgePacks,
  fetchKnowledgeSources,
  runAITestingPlayground,
  setDefaultAgent,
  toggleKnowledgeSourceStatus,
  transferConversationAgent,
  updateAgent,
  updateAISettings,
  updateConversationAIMode,
  updateKnowledgeSource,
} from "./ai-agent.api";

export const aiAgentKeys = {
  all: ["ai-agent"] as const,
  settings: () => [...aiAgentKeys.all, "settings"] as const,
  agents: () => [...aiAgentKeys.all, "agents"] as const,
  templates: () => [...aiAgentKeys.all, "templates"] as const,
  activity: () => [...aiAgentKeys.all, "activity"] as const,
  knowledge: (agentId?: string) => [...aiAgentKeys.all, "knowledge", agentId || "all"] as const,
  knowledgePacks: () => [...aiAgentKeys.all, "knowledge-packs"] as const,
};

export const useAgentsQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.agents(),
    queryFn: fetchAgents,
  });

export const useCreateAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.agents() });
    },
  });
};

export const useUpdateAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.agents() });
    },
  });
};

export const useDeleteAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.agents() });
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.knowledge() });
    },
  });
};

export const useSetDefaultAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAgent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.agents() });
    },
  });
};

export const useTransferConversationAgentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferConversationAgent,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inbox });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.inboxThread, variables.conversationId],
      });
    },
  });
};

export const useAISettingsQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.settings(),
    queryFn: fetchAISettings,
  });

export const useKnowledgePacksQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.knowledgePacks(),
    queryFn: fetchKnowledgePacks,
  });

export const useAITemplatesQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.templates(),
    queryFn: fetchAITemplates,
  });

export const useApplyAITemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyAITemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.settings() });
    },
  });
};

export const useUpdateAISettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAISettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.settings() });
    },
  });
};

export const useAITestingPlaygroundMutation = () =>
  useMutation({
    mutationFn: runAITestingPlayground,
  });

export const useAIActivityLogsQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.activity(),
    queryFn: fetchAIActivityLogs,
    refetchInterval: 10000,
  });

export const useKnowledgeSourcesQuery = (agentId?: string) =>
  useQuery({
    queryKey: aiAgentKeys.knowledge(agentId),
    queryFn: () => fetchKnowledgeSources(agentId),
  });

export const useCreateKnowledgeSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledgeSource,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.knowledge() });
    },
  });
};

export const useUpdateKnowledgeSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateKnowledgeSource,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.knowledge() });
    },
  });
};

export const useToggleKnowledgeSourceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleKnowledgeSourceStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.knowledge() });
    },
  });
};

export const useDeleteKnowledgeSourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKnowledgeSource,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAgentKeys.knowledge() });
    },
  });
};

export const useUpdateConversationAIModeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConversationAIMode,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inbox });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.inboxThread, variables.conversationId],
      });
    },
  });
};
