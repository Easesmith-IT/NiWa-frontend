import { apiClient } from "../../lib/api/api-client";
import type { OffsetListResponse } from "../../lib/api/api-types";
import type { CreateTaskPayload, LinkedRecord, TaskFilterInput, TaskRecord, UpdateTaskPayload } from "./task.types";

export const listTasks = async (params?: TaskFilterInput) => {
  const response = await apiClient.get<OffsetListResponse<TaskRecord> & { success?: boolean }>(
    "/tasks",
    { params },
  );
  return response.data;
};

export const fetchTaskById = async (taskId: string) => {
  const response = await apiClient.get<{ success?: boolean; data: TaskRecord }>(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (payload: CreateTaskPayload) => {
  const response = await apiClient.post<{ success?: boolean; data: TaskRecord }>("/tasks", payload);
  return response.data;
};

export const completeTask = async (taskId: string) => {
  const response = await apiClient.post<{ success?: boolean; data: TaskRecord }>(`/tasks/${taskId}/complete`);
  return response.data;
};

export const patchTask = async (taskId: string, payload: UpdateTaskPayload) => {
  const response = await apiClient.patch<{ success?: boolean; data: TaskRecord }>(`/tasks/${taskId}`, payload);
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await apiClient.delete<{ success?: boolean; data: TaskRecord }>(`/tasks/${taskId}`);
  return response.data;
};

export const linkTaskRecord = async (taskId: string, link: LinkedRecord) => {
  const response = await apiClient.post<{ success?: boolean; data: TaskRecord }>(`/tasks/${taskId}/link`, link);
  return response.data;
};

export const unlinkTaskRecord = async (taskId: string, recordType: string, recordId: string) => {
  const response = await apiClient.delete<{ success?: boolean; data: TaskRecord }>(
    `/tasks/${taskId}/link`,
    { params: { recordType, recordId } },
  );
  return response.data;
};
