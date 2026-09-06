import { apiClient } from "../../lib/api/api-client";
import type { CreateDealPayload, DealFilterInput, DealRecord, UpdateDealPayload } from "./deal.types";

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

export const listDeals = async (params?: DealFilterInput): Promise<DealRecord[]> => {
  const response = await apiClient.get<ApiResponse<DealRecord[]> | DealRecord[]>("/crm/deals", { params });
  return unwrapData(response.data);
};

export const fetchDealById = async (id: string): Promise<DealRecord> => {
  const response = await apiClient.get<ApiResponse<DealRecord> | DealRecord>(`/crm/deals/${id}`);
  return unwrapData(response.data);
};

export const createDeal = async (payload: CreateDealPayload): Promise<DealRecord> => {
  const response = await apiClient.post<ApiResponse<DealRecord> | DealRecord>("/crm/deals", payload);
  return unwrapData(response.data);
};

export const updateDeal = async (id: string, payload: UpdateDealPayload): Promise<DealRecord> => {
  const response = await apiClient.patch<ApiResponse<DealRecord> | DealRecord>(`/crm/deals/${id}`, payload);
  return unwrapData(response.data);
};

export const archiveDeal = async (id: string): Promise<DealRecord> => {
  const response = await apiClient.delete<ApiResponse<DealRecord> | DealRecord>(`/crm/deals/${id}`);
  return unwrapData(response.data);
};

