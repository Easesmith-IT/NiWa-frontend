import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { InboxThreadDetailV1, InboxThreadRecordV1 } from "./inbox.types";

export const listInboxThreadsV1 = async (params?: {
  filter?: "all" | "archived" | "awaiting_reply" | "starred" | "unread";
  search?: string;
}) => {
  const response = await v1ApiClient.get<V1ListResponse<InboxThreadRecordV1>>("/inbox", {
    params: {
      filter: params?.filter,
      search: params?.search,
    },
  });

  return response.data;
};

export const getInboxThreadDetailV1 = async (
  conversationId: string,
  params?: { cursor?: string | null; messageLimit?: number },
  options?: { signal?: AbortSignal },
) => {
  const response = await v1ApiClient.get<{
    data: InboxThreadDetailV1;
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
      limit: number;
    };
  }>(`/inbox/${conversationId}`, {
    params: {
      cursor: params?.cursor || undefined,
      messageLimit: params?.messageLimit,
    },
    signal: options?.signal,
  });

  return response.data;
};

export const updateInboxThreadStateV1 = async (
  conversationId: string,
  action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
) => {
  const response = await v1ApiClient.post(`/inbox/${conversationId}/${action}`);
  return response.data;
};

export const syncInboxThreadHistoryV1 = async (conversationId: string) => {
  const response = await v1ApiClient.post<{
    data: InboxThreadDetailV1;
    message: string;
  }>(`/inbox/${conversationId}/sync-history`);

  return response.data;
};

