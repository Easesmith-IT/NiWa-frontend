import { apiClient } from "../../lib/api/client";
import type {
  ConversationDetailResponse,
  ConversationLabelsResponse,
  ConversationNoteMutationResponse,
  ConversationReadResponse,
  ConversationsResponse,
  MediaListResponse,
  OutboundMessageResponse,
  TemplatesResponse,
} from "../../lib/api/types";
import type {
  AddNoteRequest,
  SendReplyRequest,
  UpdateNoteRequest,
} from "./conversations.types";

export const getConversations = async (params?: {
  query?: string;
  unreadOnly?: boolean;
  limit?: number;
}) => {
  const response = await apiClient.get<ConversationsResponse>("/conversations", {
    params: {
      query: params?.query || undefined,
      unreadOnly: params?.unreadOnly ? "true" : undefined,
      limit: params?.limit ?? 50,
    },
  });
  return response.data;
};

export const getConversationDetail = async (conversationId: string) => {
  const response = await apiClient.get<ConversationDetailResponse>(
    `/conversations/${conversationId}`,
  );
  return response.data;
};

export const getReplyTemplates = async () => {
  const response = await apiClient.get<TemplatesResponse>("/templates");
  return response.data;
};

export const getReplyMedia = async () => {
  const response = await apiClient.get<MediaListResponse>("/media");
  return response.data;
};

export const sendReply = async (payload: SendReplyRequest) => {
  const response = await apiClient.post<OutboundMessageResponse>(
    "/conversations/reply",
    payload,
  );
  return response.data;
};

export const clearUnread = async (conversationId: string) => {
  const response = await apiClient.post<ConversationReadResponse>(
    `/conversations/${conversationId}/read`,
  );
  return response.data;
};

export const markMessageRead = async (messageId: string) => {
  const response = await apiClient.post<OutboundMessageResponse>("/messages/read", {
    messageId,
  });
  return response.data;
};

export const updateLabels = async (conversationId: string, labels: string[]) => {
  const response = await apiClient.put<ConversationLabelsResponse>(
    `/conversations/${conversationId}/labels`,
    { labels },
  );
  return response.data;
};

export const addNote = async (conversationId: string, payload: AddNoteRequest) => {
  const response = await apiClient.post<ConversationNoteMutationResponse>(
    `/conversations/${conversationId}/notes`,
    payload,
  );
  return response.data;
};

export const updateNote = async (
  conversationId: string,
  payload: UpdateNoteRequest,
) => {
  const { noteId, ...data } = payload;
  const response = await apiClient.patch<ConversationNoteMutationResponse>(
    `/conversations/${conversationId}/notes/${noteId}`,
    data,
  );
  return response.data;
};
