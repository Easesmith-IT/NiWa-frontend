import { v1ApiClient } from "../../lib/api/v1-client";
import type { EmbeddedSignupResponse, WhatsAppConnectionsResponse } from "../../lib/api/types";

export const getWhatsAppConnections = async () => {
  const { data } = await v1ApiClient.get<WhatsAppConnectionsResponse>("/whatsapp/connections");
  return data;
};

export const syncWhatsAppConnection = async (connectionId: string) => {
  const { data } = await v1ApiClient.post(`/whatsapp/connections/${connectionId}/sync`);
  return data;
};

export const checkWhatsAppConnectionHealth = async (connectionId: string) => {
  const { data } = await v1ApiClient.post(`/whatsapp/connections/${connectionId}/health`);
  return data;
};

export const disconnectWhatsAppConnection = async (connectionId: string) => {
  const { data } = await v1ApiClient.delete(`/whatsapp/connections/${connectionId}`);
  return data;
};

export const completeEmbeddedSignupV1 = async (payload: {
  wabaId: string;
  phoneNumberId: string;
  businessId?: string;
  code?: string;
}) => {
  const { data } = await v1ApiClient.post<EmbeddedSignupResponse>(
    "/whatsapp/connections/embedded-signup/complete",
    payload
  );
  return data;
};
