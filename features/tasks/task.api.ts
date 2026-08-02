import { v1ApiClient } from "../../lib/api/v1-client";
import type { V1ListResponse } from "../../lib/api/v1-types";
import type { TaskRecordV1 } from "./task.types";

export const listTasksV1 = async (params?: { contactId?: string; status?: string }) => {
  const response = await v1ApiClient.get<V1ListResponse<TaskRecordV1>>("/tasks", {
    params,
  });

  return response.data;
};

export const createTaskV1 = async (payload: {
  contactId: string;
  conversationId?: string;
  description?: string;
  dueAt?: string;
  priority: "high" | "low" | "medium";
  reminderAt?: string;
  title: string;
}) => {
  const response = await v1ApiClient.post<{ data: TaskRecordV1 }>("/tasks", payload);
  return response.data;
};

export const completeTaskV1 = async (taskId: string) => {
  const response = await v1ApiClient.post<{ data: TaskRecordV1 }>(`/tasks/${taskId}/complete`);
  return response.data;
};

export const cancelTaskV1 = async (taskId: string) => {
  const response = await v1ApiClient.post<{ data: TaskRecordV1 }>(`/tasks/${taskId}/cancel`);
  return response.data;
};

export const patchTaskV1 = async (
  taskId: string,
  payload: Partial<{
    description: string;
    dueAt: string | null;
    priority: "high" | "low" | "medium";
    reminderAt: string | null;
    title: string;
  }>,
) => {
  const response = await v1ApiClient.patch<{ data: TaskRecordV1 }>(`/tasks/${taskId}`, payload);
  return response.data;
};
