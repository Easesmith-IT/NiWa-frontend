import { useMemo } from "react";
import { AxiosError } from "axios";
import type {
  ConversationNoteRecord,
  ConversationRecord,
} from "../../../lib/api/types";
import { getActiveTemplates } from "../../../lib/templates";
import {
  useAddNoteMutation,
  useClearUnreadMutation,
  useConversationDetailQuery,
  useConversationsQuery,
  useMarkMessageReadMutation,
  useReplyMediaQuery,
  useReplyTemplatesQuery,
  useSendReplyMutation,
  useUpdateLabelsMutation,
  useUpdateNoteMutation,
} from "../conversations.queries";
import type { SendReplyRequest } from "../conversations.types";

import { useConversationFilters } from "./useConversationFilters";
import { useConversationReplyState, ReplyValues } from "./useConversationReplyState";
import { useConversationSelection } from "./useConversationSelection";
import { useConversationWorkspaceState } from "./useConversationWorkspaceState";

const noteSort = (left: ConversationNoteRecord, right: ConversationNoteRecord) => {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1;
  }
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
};

const getConversationLabels = (conversation?: Pick<ConversationRecord, "labels"> | null) =>
  Array.isArray(conversation?.labels) ? conversation.labels : [];

const parseTemplateVariables = (value?: string) =>
  (value ?? "")
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export const useConversationsOrchestration = () => {
  const filters = useConversationFilters();

  const conversationsQuery = useConversationsQuery(filters.searchQuery, filters.filterMode);
  const templatesQuery = useReplyTemplatesQuery();
  const mediaQuery = useReplyMediaQuery();

  const conversations = useMemo(
    () => conversationsQuery.data?.conversations ?? [],
    [conversationsQuery.data],
  );
  const allMedia = useMemo(() => mediaQuery.data?.media ?? [], [mediaQuery.data]);
  const activeTemplates = useMemo(
    () => getActiveTemplates(templatesQuery.data?.templates ?? []),
    [templatesQuery.data],
  );

  const selection = useConversationSelection({ conversations });

  const selectedConversation = useMemo(
    () =>
      conversations.find((item) => item._id === selection.selectedConversationId) ?? null,
    [conversations, selection.selectedConversationId],
  );

  const detailQuery = useConversationDetailQuery(selection.selectedConversationId);

  const workspaceConversation = detailQuery.data?.conversation ?? selectedConversation;
  const conversationMessages = detailQuery.data?.messages ?? [];
  const sortedNotes = useMemo(
    () => [...(workspaceConversation?.notes ?? [])].sort(noteSort),
    [workspaceConversation?.notes],
  );
  const activityFeed = useMemo(
    () => [...(workspaceConversation?.activityFeed ?? [])].reverse(),
    [workspaceConversation?.activityFeed],
  );
  const selectedConversationLabels = useMemo(
    () => getConversationLabels(workspaceConversation),
    [workspaceConversation],
  );

  const workspace = useConversationWorkspaceState({
    selectedConversationLabels,
    workspaceConversationId: workspaceConversation?._id,
  });

  const reply = useConversationReplyState({
    activeTemplates,
    allMedia,
  });

  const lastIncomingMessageId = useMemo(() => {
    const incomingMessage = [...conversationMessages]
      .reverse()
      .find((message) => message.direction === "incoming" && message.waMessageId);
    return incomingMessage?.waMessageId ?? "";
  }, [conversationMessages]);

  const refreshConversationData = async () => {
    await Promise.all([detailQuery.refetch(), conversationsQuery.refetch()]);
  };

  const replyMutation = useSendReplyMutation();
  const clearUnreadMutation = useClearUnreadMutation();
  const markAsReadMutation = useMarkMessageReadMutation();
  const labelsMutation = useUpdateLabelsMutation();
  const addNoteMutation = useAddNoteMutation();
  const updateNoteMutation = useUpdateNoteMutation();

  const handleReplySubmit = (values: ReplyValues) => {
    if (!selection.selectedConversationId) {
      workspace.setReplyError("No conversation selected.");
      return;
    }

    const payload: SendReplyRequest =
      values.type === "text"
        ? {
            conversationId: selection.selectedConversationId,
            type: "text",
            body: values.body,
          }
        : values.type === "template"
          ? {
              conversationId: selection.selectedConversationId,
              type: "template",
              templateName: values.templateName,
              languageCode: values.languageCode,
              bodyVariables: parseTemplateVariables(values.bodyVariables),
            }
          : {
              conversationId: selection.selectedConversationId,
              type: values.type,
              mediaId: values.mediaId,
              caption: values.caption,
              filename: values.filename,
            };

    replyMutation.mutate(payload, {
      onSuccess: async () => {
        workspace.setReplyError(null);
        reply.replyForm.reset({ type: "text", body: "" });
        await refreshConversationData();
      },
      onError: (error: unknown) => {
        workspace.setReplyError(toErrorMessage(error, "Reply failed."));
      },
    });
  };

  const handleClearUnread = () => {
    if (!selection.selectedConversationId) {
      return;
    }
    clearUnreadMutation.mutate(selection.selectedConversationId, {
      onSuccess: async () => {
        workspace.setReadError(null);
        await refreshConversationData();
      },
      onError: (error: unknown) => {
        workspace.setReadError(toErrorMessage(error, "Failed to clear unread count."));
      },
    });
  };

  const handleSaveLabels = () => {
    if (!selection.selectedConversationId) {
      return;
    }
    labelsMutation.mutate(
      { conversationId: selection.selectedConversationId, labels: workspace.draftLabels },
      {
        onSuccess: async (response) => {
          workspace.setWorkspaceError(null);
          workspace.setDraftLabels(response.conversation.labels);
          workspace.setLabelInput("");
          await refreshConversationData();
        },
        onError: (error: unknown) => {
          workspace.setWorkspaceError(toErrorMessage(error, "Failed to update labels."));
        },
      },
    );
  };

  const handleAddNote = () => {
    if (!selection.selectedConversationId || !workspace.noteContent.trim()) {
      return;
    }
    addNoteMutation.mutate(
      {
        conversationId: selection.selectedConversationId,
        payload: { content: workspace.noteContent, pinned: workspace.notePinned },
      },
      {
        onSuccess: async () => {
          workspace.setWorkspaceError(null);
          workspace.setNoteContent("");
          workspace.setNotePinned(false);
          await refreshConversationData();
        },
        onError: (error: unknown) => {
          workspace.setWorkspaceError(toErrorMessage(error, "Failed to add note."));
        },
      },
    );
  };

  const isWorkspaceBusy =
    labelsMutation.isPending || addNoteMutation.isPending || updateNoteMutation.isPending;

  return {
    filters,
    selection,
    workspace,
    reply,
    conversations,
    allMedia,
    activeTemplates,
    selectedConversation,
    workspaceConversation,
    conversationMessages,
    sortedNotes,
    activityFeed,
    selectedConversationLabels,
    lastIncomingMessageId,
    isWorkspaceBusy,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingDetail: detailQuery.isLoading,
    isSendingReply: replyMutation.isPending,
    isClearingUnread: clearUnreadMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
    handleReplySubmit,
    handleClearUnread,
    handleSaveLabels,
    handleAddNote,
    refreshConversationData,
  };
};
