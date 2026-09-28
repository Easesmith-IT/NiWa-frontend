import { apiClient } from "../../lib/api/api-client";
import type { CreateLeadPayload, ConvertLeadPayload, LeadRecord } from "./lead.types";

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export const unwrapData = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
};

export const listLeads = async (params?: Record<string, any>): Promise<LeadRecord[]> => {
  const response = await apiClient.get<ApiResponse<LeadRecord[]> | LeadRecord[]>("/crm/leads", { params });
  return unwrapData(response.data);
};

export const createLead = async (payload: CreateLeadPayload): Promise<LeadRecord> => {
  const response = await apiClient.post<ApiResponse<LeadRecord> | LeadRecord>("/crm/leads", payload);
  return unwrapData(response.data);
};

export const convertLead = async (
  id: string,
  payload: ConvertLeadPayload,
): Promise<{ lead: LeadRecord; deal: any }> => {
  const response = await apiClient.post<ApiResponse<{ lead: LeadRecord; deal: any }> | { lead: LeadRecord; deal: any }>(
    `/crm/leads/${id}/convert`,
    payload,
  );
  return unwrapData(response.data);
};
