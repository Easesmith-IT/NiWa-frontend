import { apiClient } from "../../lib/api/api-client";

import {
  CampaignsResponse,
  CampaignResponse,
  CampaignRecipientsResponse,
  CreateCampaignPayload,
} from "./campaign.types";

export const createCampaign = async (payload: CreateCampaignPayload) => {
  const { data } = await apiClient.post<CampaignResponse>("/campaigns", payload);
  return data;
};

export const getCampaigns = async () => {
  const { data } = await apiClient.get<CampaignsResponse>("/campaigns");
  return data;
};

export const getCampaignById = async (id: string) => {
  const { data } = await apiClient.get<CampaignResponse>(`/campaigns/${id}`);
  return data;
};

export const updateCampaignStatus = async (id: string, action: "pause" | "resume" | "cancel") => {
  const { data } = await apiClient.post<CampaignResponse>(`/campaigns/${id}/status`, { action });
  return data;
};

export const validateCampaign = async (id: string) => {
  const { data } = await apiClient.post<CampaignResponse>(`/campaigns/${id}/validate`);
  return data;
};

export const getCampaignRecipients = async (
  id: string,
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  const { data } = await apiClient.get<CampaignRecipientsResponse>(`/campaigns/${id}/recipients`, { params });
  return data;
};

export const deleteCampaign = async (id: string) => {
  const { data } = await apiClient.delete<{ success: boolean }>(`/campaigns/${id}`);
  return data;
};

export const exportCampaignCSV = async (id: string) => {
  const response = await apiClient.get(`/campaigns/${id}/export`, {
    responseType: "blob",
  });
  return response.data;
};

export const createCampaignDraft = async (payload: Partial<CreateCampaignPayload>) => {
  const { data } = await apiClient.post<CampaignResponse>("/campaigns", payload);
  return data;
};

export const updateCampaignDraft = async (id: string, payload: Partial<CreateCampaignPayload>) => {
  const { data } = await apiClient.patch<CampaignResponse>(`/campaigns/${id}/draft`, payload);
  return data;
};
