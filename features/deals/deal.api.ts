import { apiClient } from "../../lib/api/api-client";
import type { CreateDealPayload, DealFilterInput, DealRecord, UpdateDealPayload } from "./deal.types";

export const listDeals = async (params?: DealFilterInput) => {
  const response = await apiClient.get<DealRecord[]>("/crm/deals", { params });
  return response.data;
};

export const fetchDealById = async (id: string) => {
  const response = await apiClient.get<DealRecord>(`/crm/deals/${id}`);
  return response.data;
};

export const createDeal = async (payload: CreateDealPayload) => {
  const response = await apiClient.post<DealRecord>("/crm/deals", payload);
  return response.data;
};

export const updateDeal = async (id: string, payload: UpdateDealPayload) => {
  const response = await apiClient.patch<DealRecord>(`/crm/deals/${id}`, payload);
  return response.data;
};

export const archiveDeal = async (id: string) => {
  const response = await apiClient.delete<DealRecord>(`/crm/deals/${id}`);
  return response.data;
};

