import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  createAutomation,
  getAutomationRun,
  listAutomationRuns,
  listAutomations,
  patchAutomation,
  setAutomationLifecycle,
  testAutomation,
} from "./automation.api";

const invalidateAutomationSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.automations }),
    queryClient.invalidateQueries({ queryKey: queryKeys.automationRuns }),
  ]);
};

export const useAutomationsQuery = (params?: {
  status?: "active" | "archived" | "paused";
}) =>
  useQuery({
    queryKey: [...queryKeys.automations, params?.status ?? "all"],
    queryFn: () => listAutomations(params),
  });

export const useCreateAutomationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAutomation,
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const usePatchAutomationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      automationId,
      payload,
    }: {
      automationId: string;
      payload: Parameters<typeof patchAutomation>[1];
    }) => patchAutomation(automationId, payload),
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const useAutomationLifecycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      automationId,
    }: {
      action: "activate" | "archive" | "pause";
      automationId: string;
    }) => setAutomationLifecycle(automationId, action),
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const useAutomationTestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      automationId,
      payload,
    }: {
      automationId: string;
      payload: Parameters<typeof testAutomation>[1];
    }) => testAutomation(automationId, payload),
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const useAutomationRunsQuery = (params?: {
  automationId?: string;
  status?: "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting";
}) =>
  useQuery({
    queryKey: [...queryKeys.automationRuns, params?.automationId ?? "all", params?.status ?? "all"],
    queryFn: () => listAutomationRuns(params),
  });

export const useAutomationRunQuery = (runId: string | null) =>
  useQuery({
    enabled: Boolean(runId),
    queryKey: [...queryKeys.automationRuns, "detail", runId],
    queryFn: () => getAutomationRun(runId ?? ""),
  });
