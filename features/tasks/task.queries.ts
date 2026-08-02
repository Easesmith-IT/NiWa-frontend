import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { cancelTaskV1, completeTaskV1, createTaskV1, listTasksV1, patchTaskV1 } from "./task.api";

export const useTasksV1Query = (params?: { contactId?: string; status?: string }) =>
  useQuery({
    queryKey: [...v1QueryKeys.tasks, params?.contactId ?? "all", params?.status ?? "all"],
    queryFn: () => listTasksV1(params),
  });

export const useCreateTaskV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskV1,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};

export const useCompleteTaskV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTaskV1,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};

export const useCancelTaskV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTaskV1,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};

export const usePatchTaskV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, taskId }: { payload: Parameters<typeof patchTaskV1>[1]; taskId: string }) =>
      patchTaskV1(taskId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};
