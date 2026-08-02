import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { MessageRecordV1 } from "./message.types";

export const listMessagesV1 = async () => {
  const response = await v1ApiClient.get<V1ListResponse<MessageRecordV1>>("/messages");
  return response.data;
};

export const sendTextMessageV1 = async (payload: {
  body: string;
  contactId?: string;
  conversationId?: string;
  previewUrl?: boolean;
}) => {
  const response = await v1ApiClient.post("/messages/text", payload);
  return response.data;
};
