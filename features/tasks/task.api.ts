import { apiClient } from "../../lib/api/api-client";
import type { ListResponse } from "../../lib/api/api-types";
import type { TaskRecord } from "./task.types";

export const listTasks = async (params?: { contactId?: string; status?: string }) => {
  const response = await apiClient.get<ListResponse<TaskRecord>>("/tasks", {
    params,
  });

  return response.data;
};

export const createTask = async (payload: {
  contactId: string;
  conversationId?: string;
  description?: string;
  dueAt?: string;
  priority: "high" | "low" | "medium";
  reminderAt?: string;
  title: string;
}) => {
  const response = await apiClient.post<{ data: TaskRecord }>("/tasks", payload);
  return response.data;
};

export const completeTask = async (taskId: string) => {
  const response = await apiClient.post<{ data: TaskRecord }>(`/tasks/${taskId}/complete`);
  return response.data;
};

export const cancelTask = async (taskId: string) => {
  const response = await apiClient.post<{ data: TaskRecord }>(`/tasks/${taskId}/cancel`);
  return response.data;
};

export const patchTask = async (
  taskId: string,
  payload: Partial<{
    description: string;
    dueAt: string | null;
    priority: "high" | "low" | "medium";
    reminderAt: string | null;
    title: string;
  }>,
) => {
  const response = await apiClient.patch<{ data: TaskRecord }>(`/tasks/${taskId}`, payload);
  return response.data;
};
