import { apiClient } from "../../lib/api/api-client";
import type { ListResponse } from "../../lib/api/api-types";
import type { QuickReplyRecord } from "./quick-reply.types";

export const listQuickReplies = async () => {
  const response = await apiClient.get<ListResponse<QuickReplyRecord>>("/quick-replies");
  return response.data;
};

export const createQuickReply = async (payload: {
  body: string;
  category?: string;
  shortcut: string;
  title: string;
  variables: string[];
}) => {
  const response = await apiClient.post<{ data: QuickReplyRecord }>("/quick-replies", payload);
  return response.data;
};

export const patchQuickReply = async (
  quickReplyId: string,
  payload: Partial<{
    body: string;
    category: string | null;
    isActive: boolean;
    shortcut: string;
    title: string;
    variables: string[];
  }>,
) => {
  const response = await apiClient.patch<{ data: QuickReplyRecord }>(
    `/quick-replies/${quickReplyId}`,
    payload,
  );
  return response.data;
};
