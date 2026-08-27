import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { MessageRecord } from "./message.types";

export const listMessages = async () => {
  const response = await apiClient.get<ListResponse<MessageRecord>>("/messages");
  return response.data;
};

export const sendTextMessage = async (payload: {
  body: string;
  contactId?: string;
  conversationId?: string;
  previewUrl?: boolean;
}) => {
  const response = await apiClient.post("/messages/text", payload);
  return response.data;
};

export const getMessageMediaUrl = (messageId: string) =>
  `${apiClient.defaults.baseURL}/messages/${messageId}/media`;
