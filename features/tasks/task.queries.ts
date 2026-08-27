import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { cancelTask, completeTask, createTask, listTasks, patchTask } from "./task.api";

export const useTasksQuery = (params?: { contactId?: string; status?: string }) =>
  useQuery({
    queryKey: [...queryKeys.tasks, params?.contactId ?? "all", params?.status ?? "all"],
    queryFn: () => listTasks(params),
  });

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

export const useCancelTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTask,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

export const usePatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, taskId }: { payload: Parameters<typeof patchTask>[1]; taskId: string }) =>
      patchTask(taskId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};
