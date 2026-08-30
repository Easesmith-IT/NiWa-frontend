import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  completeTask,
  createTask,
  deleteTask,
  fetchTaskById,
  linkTaskRecord,
  listTasks,
  patchTask,
  unlinkTaskRecord,
} from "./task.api";
import type { LinkedRecord, TaskFilterInput, UpdateTaskPayload } from "./task.types";

export const useTasksQuery = (params?: TaskFilterInput) =>
  useQuery({
    queryKey: [...queryKeys.tasks, JSON.stringify(params || {})],
    queryFn: () => listTasks(params),
  });

export const useTaskDetailQuery = (taskId: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.tasks, "detail", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: enabled && !!taskId,
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



export const usePatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      patchTask(taskId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

export const useLinkTaskRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, link }: { taskId: string; link: LinkedRecord }) =>
      linkTaskRecord(taskId, link),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
      ]);
    },
  });
};

export const useUnlinkTaskRecordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, recordType, recordId }: { taskId: string; recordType: string; recordId: string }) =>
      unlinkTaskRecord(taskId, recordType, recordId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
      ]);
    },
  });
};
