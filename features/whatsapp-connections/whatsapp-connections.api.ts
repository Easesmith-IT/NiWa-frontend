import { apiClient } from "../../lib/api/api-client";
import type { EmbeddedSignupResponse, WhatsAppConnectionsResponse } from "../../lib/api/types";

export const getWhatsAppConnections = async () => {
  const { data } = await apiClient.get<WhatsAppConnectionsResponse>("/whatsapp/connections");
  return data;
};

export const syncWhatsAppConnection = async (connectionId: string) => {
  const { data } = await apiClient.post(`/whatsapp/connections/${connectionId}/sync`);
  return data;
};

export const checkWhatsAppConnectionHealth = async (connectionId: string) => {
  const { data } = await apiClient.post(`/whatsapp/connections/${connectionId}/health`);
  return data;
};

export const disconnectWhatsAppConnection = async (connectionId: string) => {
  const { data } = await apiClient.delete(`/whatsapp/connections/${connectionId}`);
  return data;
};

export const completeEmbeddedSignup = async (payload: {
  wabaId: string;
  phoneNumberId: string;
  businessId?: string;
  code?: string;
}) => {
  const { data } = await apiClient.post<EmbeddedSignupResponse>(
    "/whatsapp/connections/embedded-signup/complete",
    payload
  );
  return data;
};
