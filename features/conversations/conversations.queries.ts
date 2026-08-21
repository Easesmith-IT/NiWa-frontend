import { useMutation, useQuery } from "@tanstack/react-query";
import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  addNote,
  clearUnread,
  getConversationDetail,
  getConversations,
  getReplyMedia,
  getReplyTemplates,
  markMessageRead,
  sendReply,
  updateLabels,
  updateNote,
} from "./conversations.api";
import type {
  AddNoteRequest,
  FilterMode,
  SendReplyRequest,
  UpdateNoteRequest,
} from "./conversations.types";

export const conversationsKeys = {
  all: v1QueryKeys.conversations,
  list: (query?: string, filterMode?: FilterMode) =>
    [...v1QueryKeys.conversations, searchQueryOrEmpty(query), filterMode ?? "all"] as const,
  detail: (id: string | null) => [...v1QueryKeys.conversations, "detail", id] as const,
  templates: [...v1QueryKeys.templates, "conversations-reply"] as const,
  media: [...v1QueryKeys.media, "conversations-reply"] as const,
};

function searchQueryOrEmpty(query?: string) {
  return query ?? "";
}

export const useConversationsQuery = (query?: string, filterMode?: FilterMode) =>
  useQuery({
    queryKey: conversationsKeys.list(query, filterMode),
    queryFn: () =>
      getConversations({
        query,
        unreadOnly: filterMode === "unread",
        limit: 50,
      }),
  });

export const useConversationDetailQuery = (selectedConversationId: string | null) =>
  useQuery({
    queryKey: conversationsKeys.detail(selectedConversationId),
    queryFn: () => getConversationDetail(selectedConversationId!),
    enabled: Boolean(selectedConversationId),
  });

export const useReplyTemplatesQuery = () =>
  useQuery({
    queryKey: conversationsKeys.templates,
    queryFn: () => getReplyTemplates(),
  });

export const useReplyMediaQuery = () =>
  useQuery({
    queryKey: conversationsKeys.media,
    queryFn: () => getReplyMedia(),
  });

export const useSendReplyMutation = () =>
  useMutation({
    mutationFn: (payload: SendReplyRequest) => sendReply(payload),
  });

export const useClearUnreadMutation = () =>
  useMutation({
    mutationFn: (conversationId: string) => clearUnread(conversationId),
  });

export const useMarkMessageReadMutation = () =>
  useMutation({
    mutationFn: (messageId: string) => markMessageRead(messageId),
  });

export const useUpdateLabelsMutation = () =>
  useMutation({
    mutationFn: ({
      conversationId,
      labels,
    }: {
      conversationId: string;
      labels: string[];
    }) => updateLabels(conversationId, labels),
  });

export const useAddNoteMutation = () =>
  useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: AddNoteRequest;
    }) => addNote(conversationId, payload),
  });

export const useUpdateNoteMutation = () =>
  useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: UpdateNoteRequest;
    }) => updateNote(conversationId, payload),
  });
