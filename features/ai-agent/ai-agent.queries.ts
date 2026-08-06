import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createKnowledgeSource,
  deleteKnowledgeSource,
  fetchAIActivityLogs,
  fetchAISettings,
  fetchKnowledgeSources,
  runAITestingPlayground,
  toggleKnowledgeSourceStatus,
  updateAISettings,
  updateConversationAIMode,
  updateKnowledgeSource,
} from "./ai-agent.api";

export const aiAgentKeys = {
  all: ["ai-agent"] as const,
  settings: () => [...aiAgentKeys.all, "settings"] as const,
  activity: () => [...aiAgentKeys.all, "activity"] as const,
  knowledge: () => [...aiAgentKeys.all, "knowledge"] as const,
};

export const useAISettingsQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.settings(),
    queryFn: fetchAISettings,
  });

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

export const useKnowledgeSourcesQuery = () =>
  useQuery({
    queryKey: aiAgentKeys.knowledge(),
    queryFn: fetchKnowledgeSources,
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
};
