import { apiClient } from "../../lib/api/api-client";
import type {
  CreateCrmViewPayload,
  CrmViewObjectKey,
  CrmViewRecord,
  UpdateCrmViewPayload,
  ViewExecutionResult,
} from "./views.types";

export const fetchViews = async (objectKey?: CrmViewObjectKey) => {
  const response = await apiClient.get<CrmViewRecord[]>("/crm/views", {
    params: objectKey ? { objectKey } : undefined,
  });
  return response.data;
};

export const fetchViewById = async (id: string) => {
  const response = await apiClient.get<CrmViewRecord>(`/crm/views/${id}`);
  return response.data;
};

export const createView = async (payload: CreateCrmViewPayload) => {
  const response = await apiClient.post<CrmViewRecord>("/crm/views", payload);
  return response.data;
};

export const updateView = async (id: string, payload: UpdateCrmViewPayload) => {
  const response = await apiClient.put<CrmViewRecord>(`/crm/views/${id}`, payload);
  return response.data;
};

export const deleteView = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; deletedId: string }>(`/crm/views/${id}`);
  return response.data;
};

export const setDefaultView = async (id: string) => {
  const response = await apiClient.post<CrmViewRecord>(`/crm/views/${id}/default`);
  return response.data;
};

export const executeView = async <T = any>(id: string, options?: { page?: number; limit?: number }) => {
  const response = await apiClient.post<ViewExecutionResult<T>>(`/crm/views/${id}/execute`, options);
  return response.data;
};
