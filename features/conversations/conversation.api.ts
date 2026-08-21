import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { ConversationRecordV1 } from "./conversations.types";

export const listConversationsV1 = async () => {
  const response = await v1ApiClient.get<V1ListResponse<ConversationRecordV1>>("/conversations");
  return response.data;
};
