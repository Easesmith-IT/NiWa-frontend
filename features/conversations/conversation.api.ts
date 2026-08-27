import type { ConversationRecord, ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";

export const listConversations = async () => {
  const response = await apiClient.get<ListResponse<ConversationRecord>>("/conversations");
  return response.data;
};
