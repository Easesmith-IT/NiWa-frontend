import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  createAutomationV1,
  getAutomationRunV1,
  listAutomationRuns,
  listAutomations,
  patchAutomationV1,
  setAutomationLifecycleV1,
  testAutomationV1,
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

export const useCreateAutomationV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAutomationV1,
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const usePatchAutomationV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      automationId,
      payload,
    }: {
      automationId: string;
      payload: Parameters<typeof patchAutomationV1>[1];
    }) => patchAutomationV1(automationId, payload),
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const useAutomationLifecycleV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      automationId,
    }: {
      action: "activate" | "archive" | "pause";
      automationId: string;
    }) => setAutomationLifecycleV1(automationId, action),
    onSuccess: async () => {
      await invalidateAutomationSurfaces(queryClient);
    },
  });
};

export const useAutomationTestV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      automationId,
      payload,
    }: {
      automationId: string;
      payload: Parameters<typeof testAutomationV1>[1];
    }) => testAutomationV1(automationId, payload),
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

export const useAutomationRunV1Query = (runId: string | null) =>
  useQuery({
    enabled: Boolean(runId),
    queryKey: [...queryKeys.automationRuns, "detail", runId],
    queryFn: () => getAutomationRunV1(runId ?? ""),
  });
