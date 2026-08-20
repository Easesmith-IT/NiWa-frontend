import { v1ApiClient } from "../../lib/api/v1-client";
import type { WhatsAppConnectionsResponse } from "../../lib/api/types";

export const getWhatsAppConnections = async () => {
  const { data } = await v1ApiClient.get<WhatsAppConnectionsResponse>("/whatsapp/connections");
  return data;
};
