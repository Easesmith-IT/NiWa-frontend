import { v1ApiClient } from "../../lib/api/v1-client";
import type { V1ListResponse } from "../../lib/api/v1-types";
import type { QuickReplyRecordV1 } from "./quick-reply.types";

export const listQuickRepliesV1 = async () => {
  const response = await v1ApiClient.get<V1ListResponse<QuickReplyRecordV1>>("/quick-replies");
  return response.data;
};

export const createQuickReplyV1 = async (payload: {
  body: string;
  category?: string;
  shortcut: string;
  title: string;
  variables: string[];
}) => {
  const response = await v1ApiClient.post<{ data: QuickReplyRecordV1 }>("/quick-replies", payload);
  return response.data;
};

export const patchQuickReplyV1 = async (
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
  const response = await v1ApiClient.patch<{ data: QuickReplyRecordV1 }>(
    `/quick-replies/${quickReplyId}`,
    payload,
  );
  return response.data;
};
