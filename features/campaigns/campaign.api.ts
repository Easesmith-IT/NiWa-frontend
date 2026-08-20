import { v1ApiClient } from "../../lib/api/v1-client";

import {
  CampaignsResponse,
  CampaignResponse,
  CampaignRecipientsResponse,
  CreateCampaignPayload,
} from "./campaign.types";

export const createCampaign = async (payload: CreateCampaignPayload) => {
  const { data } = await v1ApiClient.post<CampaignResponse>("/campaigns", payload);
  return data;
};

export const getCampaigns = async () => {
  const { data } = await v1ApiClient.get<CampaignsResponse>("/campaigns");
  return data;
};

export const getCampaignById = async (id: string) => {
  const { data } = await v1ApiClient.get<CampaignResponse>(`/campaigns/${id}`);
  return data;
};

export const updateCampaignStatus = async (id: string, action: "pause" | "resume" | "cancel") => {
  const { data } = await v1ApiClient.post<CampaignResponse>(`/campaigns/${id}/status`, { action });
  return data;
};

export const validateCampaign = async (id: string) => {
  const { data } = await v1ApiClient.post<CampaignResponse>(`/campaigns/${id}/validate`);
  return data;
};

export const getCampaignRecipients = async (
  id: string,
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  const { data } = await v1ApiClient.get<CampaignRecipientsResponse>(`/campaigns/${id}/recipients`, { params });
  return data;
};

export const deleteCampaign = async (id: string) => {
  const { data } = await v1ApiClient.delete<{ success: boolean }>(`/campaigns/${id}`);
  return data;
};

export const exportCampaignCSV = async (id: string) => {
  const response = await v1ApiClient.get(`/campaigns/${id}/export`, {
    responseType: "blob",
  });
  return response.data;
};

export const createCampaignDraft = async (payload: Partial<CreateCampaignPayload>) => {
  const { data } = await v1ApiClient.post<CampaignResponse>("/campaigns", payload);
  return data;
};

export const updateCampaignDraft = async (id: string, payload: Partial<CreateCampaignPayload>) => {
  const { data } = await v1ApiClient.patch<CampaignResponse>(`/campaigns/${id}/draft`, payload);
  return data;
};
