import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { InboxThreadDetail, InboxThreadRecord } from "./inbox.types";

export const listInboxThreads = async (params?: {
  filter?: "all" | "archived" | "awaiting_reply" | "starred" | "unread";
  search?: string;
}) => {
  const response = await apiClient.get<ListResponse<InboxThreadRecord>>("/inbox", {
    params: {
      filter: params?.filter,
      search: params?.search,
    },
  });

  return response.data;
};

export const getInboxThreadDetail = async (
  conversationId: string,
  params?: { cursor?: string | null; messageLimit?: number },
  options?: { signal?: AbortSignal },
) => {
  const response = await apiClient.get<{
    data: InboxThreadDetail;
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

export const updateInboxThreadState = async (
  conversationId: string,
  action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
) => {
  const response = await apiClient.post(`/inbox/${conversationId}/${action}`);
  return response.data;
};

export const syncInboxThreadHistory = async (conversationId: string) => {
  const response = await apiClient.post<{
    data: InboxThreadDetail;
    message: string;
  }>(`/inbox/${conversationId}/sync-history`);

  return response.data;
};

export const fetchMessageMediaBlob = async (
  messageId: string,
  options?: { signal?: AbortSignal },
): Promise<Blob> => {
  const response = await apiClient.get<Blob>(`/messages/${messageId}/media`, {
    responseType: "blob",
    signal: options?.signal,
  });

  return response.data;
};


