"use client";

import { AxiosError } from "axios";
import { KeyboardEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowDown,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Command,
  MessageSquareDot,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Send,
  SendHorizonal,
  Smile,
  Sparkles,
  Star,
  Tags,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { withDisplayPhoneNumber } from "../../../features/shared/mappers";
import {
  useAddContactLabelV1Mutation,
  usePatchContactV1Mutation,
  useRemoveContactLabelV1Mutation,
} from "../../../features/contacts";
import {
  ChatComposer,
  ChatMessageList,
  ChatWindowSkeleton,
  ContactAvatar,
  ImageLightboxModal,
  InboxChatWindow,
  InboxLayout,
  InboxThreadList,
  MessageRecordV1,
  fetchMessageMediaBlobV1,
  formatConversationTime,
  formatDateInput,
  formatDateTime,
  formatMessageDay,
  getMessageTimestamp,
  mergeAndReconcileMessages,
  toIsoFromDateInput,
  useAsyncMessageBatchQueue,
  useInboxRealtimeHandlers,
  useInboxState,
  useInboxThreadDetailV1Query,
  useInboxThreadStateMutation,
  useInboxThreadsV1Query,
  useSyncInboxThreadHistoryV1Mutation,
} from "../../../features/inbox";
import { useLabelsV1Query } from "../../../features/labels";
import { useSendTextMessageV1Mutation } from "../../../features/messages";
import {
  useCreateContactNoteV1Mutation,
  useDeleteNoteV1Mutation,
  usePatchNoteV1Mutation,
  useSetNotePinnedV1Mutation,
} from "../../../features/notes";
import { usePatchQuickReplyV1Mutation, useQuickRepliesV1Query } from "../../../features/quick-replies";
import {
  useCreateScheduledMessageV1Mutation,
  useScheduledMessagesV1Query,
} from "../../../features/scheduled-messages";
import {
  useCancelTaskV1Mutation,
  useCompleteTaskV1Mutation,
  useCreateTaskV1Mutation,
  useTasksV1Query,
} from "../../../features/tasks";
import {
  useAgentsQuery,
  useTransferConversationAgentMutation,
  useUpdateConversationAIModeMutation,
} from "../../../features/ai-agent";

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const getContactVariableDefaults = (contact?: {
  company?: string | null;
  displayName?: string;
  phoneNumber?: string;
  profileName?: string | null;
}) => {
  const displayName = contact?.displayName ?? "";
  const firstName = displayName.trim().split(/\s+/)[0] ?? "";

  return {
    company: contact?.company ?? "",
    displayName,
    firstName,
    name: displayName,
    phoneNumber: contact?.phoneNumber ?? "",
    profileName: contact?.profileName ?? "",
  };
};

const extractTemplateVariables = (body: string, explicitVariables: string[]) => {
  const placeholders = Array.from(body.matchAll(/{{\s*([^}]+?)\s*}}/g))
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([...explicitVariables, ...placeholders]));
};

const resolveQuickReplyBody = (
  body: string,
  variables: string[],
  values: Record<string, string>,
) =>
  body.replace(/{{\s*([^}]+?)\s*}}/g, (_match, rawName: string) => {
    const name = rawName.trim();

    if (name in values) {
      return values[name] ?? "";
    }

    const numericIndex = Number(name);
    if (!Number.isNaN(numericIndex) && numericIndex >= 1) {
      return values[variables[numericIndex - 1] ?? ""] ?? "";
    }

    return "";
  });

const areVariableValuesEqual = (left: Record<string, string>, right: Record<string, string>) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};

const getSchedulePreview = (payload: Record<string, unknown>) => {
  if (typeof payload.body === "string" && payload.body.trim()) {
    return payload.body;
  }

  return "Scheduled payload";
};

const messageActionLabels = [
  { action: "read" as const, label: "Mark as read" },
  { action: "pin" as const, label: "Pin conversation" },
  { action: "star" as const, label: "Star conversation" },
  { action: "archive" as const, label: "Archive conversation" },
];

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

const PanelSection = ({
  title,
  children,
}: {
  children: ReactNode;
  title: string;
}) => (
  <section className="border-t border-[#E4E4E7] px-5 py-4 first:border-t-0">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h3>
    <div className="mt-3">{children}</div>
  </section>
);

export default function InboxPage() {
  const searchParams = useSearchParams();

  const {
    filter,
    setFilter,
    search,
    setSearch,
    selectedConversationId,
    setSelectedConversationId,

    composerBody,
    setComposerBody,
    composerMenuOpen,
    setComposerMenuOpen,
    composerFeedback,
    setComposerFeedback,
    optimisticMessages,
    setOptimisticMessages,

    selectedQuickReplyId,
    setSelectedQuickReplyId,
    quickReplyVariableValues,
    setQuickReplyVariableValues,
    quickReplyPanelOpen,
    setQuickReplyPanelOpen,

    selectedLabelId,
    setSelectedLabelId,
    contactInfoOpen,
    setContactInfoOpen,
    actionsOpen,
    setActionsOpen,
    editingContact,
    setEditingContact,
    editDisplayName,
    setEditDisplayName,
    editCompany,
    setEditCompany,
    editEmail,
    setEditEmail,
    editAvatarUrl,
    setEditAvatarUrl,

    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,
    taskPriority,
    setTaskPriority,

    noteContent,
    setNoteContent,
    notePinned,
    setNotePinned,
    editingNoteId,
    setEditingNoteId,
    editingNoteContent,
    setEditingNoteContent,

    scheduledDate,
    setScheduledDate,
    scheduledType,
    setScheduledType,
    scheduledRule,
    setScheduledRule,
    scheduleDialogOpen,
    setScheduleDialogOpen,

    hasInitialScrollCompleted,
    setHasInitialScrollCompleted,
    showJumpToBottom,
    setShowJumpToBottom,
    newMessageCount,
    setNewMessageCount,
    lightboxImageId,
    setLightboxImageId,

    resetThreadDependentState,
  } = useInboxState();

  const paginationCallWindowRef = useRef<number[]>([]);

  const threadsQuery = useInboxThreadsV1Query({ filter, search });
  const labelsQuery = useLabelsV1Query();
  const quickRepliesQuery = useQuickRepliesV1Query();
  const threadMutation = useInboxThreadStateMutation();
  const addLabelMutation = useAddContactLabelV1Mutation();
  const removeLabelMutation = useRemoveContactLabelV1Mutation();
  const sendTextMutation = useSendTextMessageV1Mutation();
  const createTaskMutation = useCreateTaskV1Mutation();
  const completeTaskMutation = useCompleteTaskV1Mutation();
  const cancelTaskMutation = useCancelTaskV1Mutation();
  const createNoteMutation = useCreateContactNoteV1Mutation();
  const patchNoteMutation = usePatchNoteV1Mutation();
  const deleteNoteMutation = useDeleteNoteV1Mutation();
  const setNotePinnedMutation = useSetNotePinnedV1Mutation();
  const patchQuickReplyMutation = usePatchQuickReplyV1Mutation();
  const createScheduledMessageMutation = useCreateScheduledMessageV1Mutation();
  const updateAIModeMutation = useUpdateConversationAIModeMutation();
  const agentsQuery = useAgentsQuery();
  const transferAgentMutation = useTransferConversationAgentMutation();

  const rawThreads = threadsQuery.data?.data ?? [];
  const threads = useMemo(() => {
    return [...rawThreads].sort((left, right) => {
      const leftPinned = left.conversation.pinnedAt ? new Date(left.conversation.pinnedAt).getTime() : 0;
      const rightPinned = right.conversation.pinnedAt ? new Date(right.conversation.pinnedAt).getTime() : 0;

      if (leftPinned !== rightPinned) {
        return rightPinned - leftPinned;
      }

      const leftTime = new Date(
        left.conversation.lastMessageAt || left.conversation.updatedAt || left.conversation.createdAt || 0,
      ).getTime();
      const rightTime = new Date(
        right.conversation.lastMessageAt || right.conversation.updatedAt || right.conversation.createdAt || 0,
      ).getTime();

      return rightTime - leftTime;
    });
  }, [rawThreads]);

  const quickReplies = (quickRepliesQuery.data?.data ?? []).filter((item) => item.isActive);

  useEffect(() => {
    const requestedConversationId = searchParams.get("conversationId");
    if (requestedConversationId) {
      setSelectedConversationId(requestedConversationId);
    }
  }, [searchParams, setSelectedConversationId]);

  useEffect(() => {
    if (threads.length === 0) {
      if (selectedConversationId !== null) {
        setSelectedConversationId(null);
      }
      return;
    }

    const hasSelectedConversation = selectedConversationId
      ? threads.some((thread) => thread.conversation._id === selectedConversationId)
      : false;

    if (!hasSelectedConversation) {
      setSelectedConversationId(threads[0]?.conversation._id ?? null);
    }
  }, [selectedConversationId, threads, setSelectedConversationId]);

  const selectedThread = useMemo(
    () =>
      threads.find((thread) => thread.conversation._id === selectedConversationId) ??
      null,
    [selectedConversationId, threads],
  );

  const activeConversationId = selectedThread?.conversation._id ?? null;

  useInboxRealtimeHandlers({
    activeConversationId,
    unreadCount: selectedThread?.conversation?.unreadCount,
    mutateThreadState: threadMutation.mutate,
  });

  const detailQuery = useInboxThreadDetailV1Query(activeConversationId, { messageLimit: 50 });
  const syncHistoryMutation = useSyncInboxThreadHistoryV1Mutation();
  const patchContactMutation = usePatchContactV1Mutation();
  const detail = detailQuery.data?.data ?? null;
  const initialPagination = detailQuery.data?.pagination;

  const {
    olderMessages,
    isLoadingNextBatch,
    hasMoreOlderMessages,
    nextCursor,
    paginationError,
    loadNextBatchAsync,
    retryLoadOlder,
  } = useAsyncMessageBatchQueue(activeConversationId, initialPagination);

  const tasksQuery = useTasksV1Query(detail?.contact?._id ? { contactId: detail.contact._id } : undefined);
  const scheduledMessagesQuery = useScheduledMessagesV1Query(
    detail?.contact?._id ? { contactId: detail.contact._id } : undefined,
  );

  const handleSyncHistory = async () => {
    if (!activeConversationId) return;
    try {
      await syncHistoryMutation.mutateAsync(activeConversationId);
      setComposerFeedback({
        message: "Thread history synchronized successfully.",
        tone: "success",
      });
    } catch (error) {
      setComposerFeedback({
        message: getErrorMessage(error, "Failed to synchronize thread history."),
        tone: "error",
      });
    }
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const anchorRef = useRef<{
    anchorId: string | null;
    anchorOffset: number;
    beforeScrollHeight: number;
    beforeScrollTop: number;
  } | null>(null);

  const captureScrollAnchor = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const children = Array.from(container.querySelectorAll("[data-message-id]"));
    const containerTop = container.getBoundingClientRect().top;
    let anchorId: string | null = null;
    let anchorOffset = 0;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      if (rect.bottom > containerTop) {
        anchorId = child.getAttribute("data-message-id");
        anchorOffset = rect.top - containerTop;
        break;
      }
    }

    anchorRef.current = {
      anchorId,
      anchorOffset,
      beforeScrollHeight: container.scrollHeight,
      beforeScrollTop: container.scrollTop,
    };
  }, []);

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    const { anchorId, anchorOffset, beforeScrollHeight, beforeScrollTop } = anchorRef.current;
    anchorRef.current = null;

    if (anchorId) {
      const anchorEl = container.querySelector(`[data-message-id="${anchorId}"]`);
      if (anchorEl) {
        const newOffset = anchorEl.getBoundingClientRect().top - container.getBoundingClientRect().top;
        const delta = newOffset - anchorOffset;
        container.scrollTop += delta;
        return;
      }
    }

    const newScrollHeight = container.scrollHeight;
    container.scrollTop = beforeScrollTop + (newScrollHeight - beforeScrollHeight);
  }, [olderMessages]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const handleMessageContainerScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isFarFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight > 140;
    setShowJumpToBottom(isFarFromBottom);

    if (!isFarFromBottom) {
      setNewMessageCount(0);
    }

    if (
      hasInitialScrollCompleted &&
      el.scrollTop < 150 &&
      hasMoreOlderMessages &&
      !isLoadingNextBatch &&
      !paginationError &&
      Boolean(nextCursor)
    ) {
      const now = Date.now();
      paginationCallWindowRef.current = paginationCallWindowRef.current.filter((t) => now - t < 5000);
      if (paginationCallWindowRef.current.length >= 10) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[INBOX_CIRCUIT_BREAKER] Rapid pagination requests suppressed.");
        }
        return;
      }
      paginationCallWindowRef.current.push(now);

      captureScrollAnchor();
      void loadNextBatchAsync();
    }
  };

  useEffect(() => {
    resetThreadDependentState();
    paginationCallWindowRef.current = [];

    const timer = setTimeout(() => {
      scrollToBottom(false);
      setHasInitialScrollCompleted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConversationId, resetThreadDependentState, setHasInitialScrollCompleted]);

  const selectedQuickReply = useMemo(
    () => quickReplies.find((quickReply) => quickReply._id === selectedQuickReplyId) ?? null,
    [quickReplies, selectedQuickReplyId],
  );
  const selectedQuickReplyVariables = useMemo(
    () =>
      selectedQuickReply
        ? extractTemplateVariables(selectedQuickReply.body, selectedQuickReply.variables)
        : [],
    [selectedQuickReply],
  );
  const quickReplyPreview = selectedQuickReply
    ? resolveQuickReplyBody(
        selectedQuickReply.body,
        selectedQuickReplyVariables,
        quickReplyVariableValues,
      )
    : "";

  const contactLabelIds = detail?.contact.labels ?? [];
  const availableLabels = (labelsQuery.data?.data ?? []).filter(
    (label) => !contactLabelIds.includes(label._id),
  );
  const contactLabels = (labelsQuery.data?.data ?? []).filter((label) =>
    contactLabelIds.includes(label._id),
  );
  const tasks = tasksQuery.data?.data ?? [];
  const scheduledItems = scheduledMessagesQuery.data?.data ?? [];

  const quickReplyTrigger = useMemo(() => {
    const match = composerBody.match(/(?:^|\s)\/([\w-]*)$/);
    return match?.[1]?.toLowerCase() ?? null;
  }, [composerBody]);

  const quickReplySuggestions = useMemo(() => {
    if (quickReplyTrigger === null) {
      return [];
    }

    return quickReplies.filter((reply) => {
      const searchValue = `${reply.shortcut} ${reply.title}`.toLowerCase();
      return searchValue.includes(quickReplyTrigger);
    });
  }, [quickReplies, quickReplyTrigger]);

  const displayedMessages = useMemo(() => {
    return mergeAndReconcileMessages({
      initialMessages: detail?.messages ?? [],
      historicalPages: [olderMessages],
      optimisticMessages,
    });
  }, [detail?.messages, olderMessages, optimisticMessages]);

  const lightboxImages = useMemo(() => {
    return displayedMessages
      .filter(
        (m: MessageRecordV1) =>
          m.messageType === "image" ||
          m.media?.mimeType?.startsWith("image/") ||
          Boolean(m.media?.metaMediaId),
      )
      .map((m: MessageRecordV1) => {
        const isOutgoing = m.direction === "outgoing";
        const senderName = isOutgoing
          ? "You"
          : detail?.contact.displayName || detail?.contact.phoneNumber || "Customer";
        const timestamp = formatConversationTime(getMessageTimestamp(m));
        const caption =
          m.textBody || (m.previewText && m.previewText !== "[image]" ? m.previewText : null);

        return {
          caption,
          messageId: m._id,
          senderName,
          timestamp,
        };
      });
  }, [displayedMessages, detail?.contact]);

  const messageGroups = useMemo(() => {
    const groups: Array<{ day: string; messages: NonNullable<typeof detail>["messages"] }> = [];
    if (!detail && optimisticMessages.length === 0) {
      return groups;
    }

    displayedMessages.forEach((message: MessageRecordV1) => {
      const day = formatMessageDay(getMessageTimestamp(message));
      const existing = groups[groups.length - 1];

      if (!existing || existing.day !== day) {
        groups.push({ day, messages: [message] });
        return;
      }

      existing.messages.push(message);
    });

    return groups;
  }, [detail, displayedMessages, optimisticMessages.length]);

  useEffect(() => {
    if (!selectedQuickReply) {
      setQuickReplyVariableValues((current) => (Object.keys(current).length === 0 ? current : {}));
      return;
    }

    const defaults = getContactVariableDefaults(detail?.contact);
    const nextValues: Record<string, string> = {};

    for (const variable of selectedQuickReplyVariables) {
      const numericIndex = Number(variable);

      if (!Number.isNaN(numericIndex) && numericIndex >= 1) {
        const mappedVariable = selectedQuickReply.variables[numericIndex - 1] ?? "";
        nextValues[variable] = defaults[mappedVariable as keyof typeof defaults] ?? "";
        continue;
      }

      nextValues[variable] = defaults[variable as keyof typeof defaults] ?? "";
    }

    setQuickReplyVariableValues((current) =>
      areVariableValuesEqual(current, nextValues) ? current : nextValues,
    );
  }, [detail?.contact, selectedQuickReply, selectedQuickReplyVariables]);

  const performThreadAction = (
    action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
  ) => {
    if (!activeConversationId) {
      return;
    }

    threadMutation.mutate({
      action,
      conversationId: activeConversationId,
    });
    setActionsOpen(false);
  };

  const insertQuickReply = (quickReplyId = selectedQuickReplyId) => {
    const chosenQuickReply = quickReplies.find((item) => item._id === quickReplyId);
    if (!chosenQuickReply) {
      return;
    }

    setSelectedQuickReplyId(chosenQuickReply._id);
    const replyVariables = extractTemplateVariables(chosenQuickReply.body, chosenQuickReply.variables);
    const resolvedBody = resolveQuickReplyBody(
      chosenQuickReply.body,
      replyVariables,
      quickReplyVariableValues,
    );

    setComposerBody((current) =>
      current.replace(/(?:^|\s)\/([\w-]*)$/, () => {
        const prefix = current.match(/(?:^|\s)\/([\w-]*)$/)?.[0]?.startsWith(" ") ? " " : "";
        return `${prefix}${resolvedBody}`;
      }),
    );
  };

  const sendMessage = () => {
    if (!detail?.contact._id || !composerBody.trim()) {
      return;
    }

    const outboundBody = composerBody.trim();
    const optimisticMessageId = `optimistic-${Date.now()}`;
    const optimisticCreatedAt = new Date().toISOString();

    setComposerFeedback(null);
    setComposerBody("");
    setSelectedQuickReplyId("");
    setQuickReplyVariableValues({});
    setOptimisticMessages((current) => [
      ...current,
      {
        _id: optimisticMessageId,
        createdAt: optimisticCreatedAt,
        direction: "outgoing",
        messageType: "text",
        previewText: outboundBody,
        status: "queued",
      },
    ]);
    sendTextMutation.mutate(
      {
        body: outboundBody,
        contactId: detail.contact._id,
        conversationId: activeConversationId ?? undefined,
      },
      {
        onSuccess: (result) => {
          const storedMessage = result?.message;

          setOptimisticMessages((current) =>
            current.map((message) =>
              message._id === optimisticMessageId
                ? {
                    ...message,
                    _id:
                      typeof storedMessage?._id === "string" && storedMessage._id.length > 0
                        ? storedMessage._id
                        : message._id,
                    createdAt: storedMessage?.createdAt ?? message.createdAt,
                    previewText: storedMessage?.previewText ?? message.previewText,
                    status:
                      (storedMessage?.status as "failed" | "queued" | "sent" | undefined) ??
                      "sent",
                  }
                : message,
            ),
          );
          setComposerFeedback({
            message: "Message sent. Waiting for delivery status...",
            tone: "success",
          });
        },
        onError: (error) => {
          setComposerBody((current) => current || outboundBody);
          setOptimisticMessages((current) =>
            current.map((message) =>
              message._id === optimisticMessageId
                ? {
                    ...message,
                    status: "failed",
                  }
                : message,
            ),
          );
          setComposerFeedback({
            message: getErrorMessage(error, "Message could not be sent."),
            tone: "error",
          });
        },
      },
    );
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <InboxLayout
        hasDetail={Boolean(detail)}
        isContactInfoOpen={contactInfoOpen}
        threadList={
          <InboxThreadList
            activeConversationId={activeConversationId}
            filter={filter}
            isLoading={threadsQuery.isPending || threadsQuery.isLoading}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onSelectConversation={setSelectedConversationId}
            search={search}
            threads={threads}
          />
        }
      >
        <InboxChatWindow
          actionsOpen={actionsOpen}
          agents={agentsQuery.data?.agents || []}
          composer={
            <ChatComposer
              composerBody={composerBody}
              composerFeedback={composerFeedback}
              composerMenuOpen={composerMenuOpen}
              contactId={detail?.contact._id}
              isPatchingQuickReply={patchQuickReplyMutation.isPending}
              isScheduling={createScheduledMessageMutation.isPending}
              isSending={sendTextMutation.isPending}
              onComposerBodyChange={setComposerBody}
              onComposerMenuOpenChange={setComposerMenuOpen}
              onInsertQuickReply={insertQuickReply}
              onPatchQuickReplyVars={(id, vars) =>
                patchQuickReplyMutation.mutate({
                  payload: { variables: vars },
                  quickReplyId: id,
                })
              }
              onQuickReplyPanelOpenChange={setQuickReplyPanelOpen}
              onQuickReplyVariableValuesChange={setQuickReplyVariableValues}
              onScheduleDialogOpenChange={setScheduleDialogOpen}
              onScheduleMessage={() => {
                if (!detail?.contact._id || !composerBody.trim() || !scheduledDate) return;
                createScheduledMessageMutation.mutate(
                  {
                    contactId: detail.contact._id,
                    conversationId: activeConversationId ?? undefined,
                    payload: { body: composerBody.trim() },
                    payloadType: "text",
                    recurrenceRule: scheduledType === "recurring" ? scheduledRule : undefined,
                    scheduleType: scheduledType,
                    scheduledFor: toIsoFromDateInput(scheduledDate) ?? new Date().toISOString(),
                    timezone: "Asia/Calcutta",
                  },
                  {
                    onSuccess: () => {
                      setScheduledDate("");
                      setScheduledType("one_time");
                      setScheduledRule("daily");
                      setScheduleDialogOpen(false);
                      setComposerFeedback({
                        message: "Message scheduled successfully.",
                        tone: "success",
                      });
                    },
                    onError: (error) => {
                      setComposerFeedback({
                        message: getErrorMessage(error, "Message could not be scheduled."),
                        tone: "error",
                      });
                    },
                  },
                );
              }}
              onScheduledDateChange={setScheduledDate}
              onScheduledRuleChange={setScheduledRule}
              onScheduledTypeChange={setScheduledType}
              onSelectQuickReplyId={setSelectedQuickReplyId}
              onSendMessage={sendMessage}
              quickReplies={quickReplies}
              quickReplyPanelOpen={quickReplyPanelOpen}
              quickReplyPreview={quickReplyPreview}
              quickReplySuggestions={quickReplySuggestions}
              scheduleDialogOpen={scheduleDialogOpen}
              scheduledDate={scheduledDate}
              scheduledRule={scheduledRule}
              scheduledType={scheduledType}
              selectedQuickReply={selectedQuickReply}
              selectedQuickReplyId={selectedQuickReplyId}
              selectedQuickReplyVariables={selectedQuickReplyVariables}
              quickReplyVariableValues={quickReplyVariableValues}
            />
          }
          detail={detail}
          isLoadingDetail={detailQuery.isPending || detailQuery.isLoading}
          isSyncingHistory={syncHistoryMutation.isPending}
          isTransferringAgent={transferAgentMutation.isPending}
          messageList={
            <ChatMessageList
              hasMoreOlderMessages={hasMoreOlderMessages}
              isLoadingDetail={detailQuery.isLoading}
              isLoadingNextBatch={isLoadingNextBatch}
              messageGroups={messageGroups}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
              newMessageCount={newMessageCount}
              onImageClick={(id) => setLightboxImageId(id)}
              onJumpToBottom={() => {
                setNewMessageCount(0);
                scrollToBottom(true);
              }}
              onScroll={handleMessageContainerScroll}
              paginationError={paginationError}
              retryLoadOlder={retryLoadOlder}
              showJumpToBottom={showJumpToBottom}
            />
          }
          onActionsOpenChange={setActionsOpen}
          onOpenContactInfo={() => setContactInfoOpen(true)}
          onPerformThreadAction={performThreadAction}
          onSyncHistory={handleSyncHistory}
          onTransferAgent={(targetAgentId) => {
            if (!detail) return;
            transferAgentMutation.mutate({
              conversationId: detail.conversation._id,
              agentId: targetAgentId,
            });
          }}
          onUpdateAIMode={(nextMode) => {
            if (!detail) return;
            updateAIModeMutation.mutate({
              conversationId: detail.conversation._id,
              aiMode: nextMode,
            });
          }}
        />

        {detail && contactInfoOpen ? (
          <aside className="niwa-scrollbar min-h-0 overflow-y-auto border-l border-[#ddd2c3] bg-[#fbf7f1]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5ddd3] bg-[#fbf7f1] px-6 py-5">
              <div>
                <h2 className="text-[18px] font-semibold text-[#25342f]">Contact info</h2>
                <p className="text-sm text-[#6f7f75]">CRM context for the active conversation</p>
              </div>
              <button
                className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                onClick={() => setContactInfoOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-6">
              {editingContact ? (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Display Name
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Display Name"
                      value={editDisplayName}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Company
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Company Name"
                      value={editCompany}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Email Address
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      value={editEmail}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Custom Avatar Image URL
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      value={editAvatarUrl}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="bg-[#2d644d] text-white hover:bg-[#255440]"
                      disabled={!editDisplayName.trim() || patchContactMutation.isPending}
                      onClick={() =>
                        patchContactMutation.mutate(
                          {
                            contactId: detail.contact._id,
                            payload: {
                              avatarUrl: editAvatarUrl.trim(),
                              company: editCompany.trim(),
                              displayName: editDisplayName.trim(),
                              email: editEmail.trim(),
                            },
                          },
                          {
                            onSuccess: () => setEditingContact(false),
                          },
                        )
                      }
                      size="sm"
                      type="button"
                    >
                      Save changes
                    </Button>
                    <Button
                      onClick={() => setEditingContact(false)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <ContactAvatar
                    avatarUrl={detail.contact.avatarUrl}
                    className="h-24 w-24 text-2xl"
                    name={detail.contact.displayName}
                  />
                  <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#25342f]">
                    {detail.contact.displayName}
                  </h3>
                  <p className="mt-2 text-[16px] text-[#56675d]">
                    {detail.contact.phoneNumber || "No phone available"}
                  </p>
                  {detail.contact.profileName && detail.contact.profileName !== detail.contact.displayName ? (
                    <p className="mt-1 text-sm text-[#7a8b82]">
                      WhatsApp profile: {detail.contact.profileName}
                    </p>
                  ) : null}
                  {detail.contact.company ? (
                    <p className="mt-1 text-sm text-[#7a8b82]">{detail.contact.company}</p>
                  ) : null}
                  <Button
                    className="mt-4 border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                    onClick={() => {
                      setEditDisplayName(detail.contact.displayName ?? "");
                      setEditCompany(detail.contact.company ?? "");
                      setEditEmail(detail.contact.email ?? "");
                      setEditAvatarUrl(detail.contact.avatarUrl ?? "");
                      setEditingContact(true);
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Edit contact details
                  </Button>
                </div>
              )}
            </div>

            <PanelSection title="Labels">
              <div className="flex flex-wrap gap-2">
                {contactLabels.map((label) => (
                  <button
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm"
                    disabled={removeLabelMutation.isPending}
                    key={label._id}
                    onClick={() =>
                      removeLabelMutation.mutate({ contactId: detail.contact._id, labelId: label._id })
                    }
                    style={{ backgroundColor: label.color, color: "#1b2521" }}
                    type="button"
                  >
                    {label.name}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                {contactLabels.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No labels assigned.</p>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2">
                <select
                  className="h-10 flex-1 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                  onChange={(event) => setSelectedLabelId(event.target.value)}
                  value={selectedLabelId}
                >
                  <option value="">Add a label</option>
                  {availableLabels.map((label) => (
                    <option key={label._id} value={label._id}>
                      {label.name}
                    </option>
                  ))}
                </select>
                <Button
                  className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                  disabled={!selectedLabelId || addLabelMutation.isPending}
                  onClick={() =>
                    addLabelMutation.mutate(
                      { contactId: detail.contact._id, labelId: selectedLabelId },
                      { onSuccess: () => setSelectedLabelId("") },
                    )
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Tags className="h-4 w-4" />
                </Button>
              </div>
            </PanelSection>

            <PanelSection title="Notes">
              <Textarea
                className="min-h-24 border-[#ddd2c3] bg-white text-[#25342f]"
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="Add internal note"
                value={noteContent}
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-[#6f7f75]">
                <input
                  checked={notePinned}
                  onChange={(event) => setNotePinned(event.target.checked)}
                  type="checkbox"
                />
                Pin note
              </label>
              <Button
                className="mt-3 w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                disabled={!noteContent.trim() || createNoteMutation.isPending}
                onClick={() =>
                  createNoteMutation.mutate(
                    {
                      contactId: detail.contact._id,
                      payload: {
                        content: noteContent.trim(),
                        conversationId: activeConversationId ?? undefined,
                        pinned: notePinned,
                      },
                    },
                    {
                      onSuccess: () => {
                        setNoteContent("");
                        setNotePinned(false);
                      },
                    },
                  )
                }
                type="button"
                variant="secondary"
              >
                Add note
              </Button>
              <div className="mt-4 space-y-3">
                {detail.notes.slice(0, 6).map((note) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={note._id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#25342f]">{note.authorName}</p>
                      <button
                        className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                        onClick={() =>
                          setNotePinnedMutation.mutate({ noteId: note._id, pinned: !note.pinned })
                        }
                        type="button"
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                    </div>
                    {editingNoteId === note._id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          className="min-h-20 border-[#ddd2c3] bg-[#fffdf9] text-[#25342f]"
                          onChange={(event) => setEditingNoteContent(event.target.value)}
                          value={editingNoteContent}
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={!editingNoteContent.trim() || patchNoteMutation.isPending}
                            onClick={() =>
                              patchNoteMutation.mutate(
                                { noteId: note._id, payload: { content: editingNoteContent.trim() } },
                                {
                                  onSuccess: () => {
                                    setEditingNoteId(null);
                                    setEditingNoteContent("");
                                  },
                                },
                              )
                            }
                            size="sm"
                            type="button"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent("");
                            }}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[#5c6d63]">{note.content}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                        onClick={() => {
                          setEditingNoteId(note._id);
                          setEditingNoteContent(note.content);
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                        disabled={deleteNoteMutation.isPending}
                        onClick={() => deleteNoteMutation.mutate(note._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {detail.notes.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No notes yet.</p>
                ) : null}
              </div>
            </PanelSection>

            <PanelSection title="Tasks">
              <div className="space-y-3">
                <Input
                  className="border-[#ddd2c3] bg-white text-[#25342f]"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Create task"
                  value={taskTitle}
                />
                <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
                  <Input
                    className="border-[#ddd2c3] bg-white text-[#25342f]"
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    type="date"
                    value={taskDueDate}
                  />
                  <select
                    className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                    onChange={(event) => setTaskPriority(event.target.value as "high" | "low" | "medium")}
                    value={taskPriority}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                  disabled={!taskTitle.trim() || createTaskMutation.isPending}
                  onClick={() =>
                    createTaskMutation.mutate(
                      {
                        contactId: detail.contact._id,
                        conversationId: activeConversationId ?? undefined,
                        dueAt: toIsoFromDateInput(taskDueDate),
                        priority: taskPriority,
                        title: taskTitle.trim(),
                      },
                      {
                        onSuccess: () => {
                          setTaskTitle("");
                          setTaskDueDate("");
                          setTaskPriority("medium");
                        },
                      },
                    )
                  }
                  type="button"
                  variant="secondary"
                >
                  Add task
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {tasks.map((task) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={task._id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#25342f]">{task.title}</p>
                        <p className="mt-1 text-xs text-[#7a8b82]">
                          {task.priority} • {task.status}
                        </p>
                        <p className="mt-1 text-xs text-[#7a8b82]">
                          Due {task.dueAt ? formatDateInput(task.dueAt) : "unscheduled"}
                        </p>
                      </div>
                      {task.status === "todo" ? (
                        <div className="flex gap-1">
                          <button
                            className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                            disabled={completeTaskMutation.isPending}
                            onClick={() => completeTaskMutation.mutate(task._id)}
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                            disabled={cancelTaskMutation.isPending}
                            onClick={() => cancelTaskMutation.mutate(task._id)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 ? <p className="text-sm text-[#7a8b82]">No tasks yet.</p> : null}
              </div>
            </PanelSection>

            <PanelSection title="Scheduled messages">
              <div className="space-y-3">
                {scheduledItems.slice(0, 5).map((item) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={item._id}>
                    <p className="text-sm font-medium text-[#25342f]">{getSchedulePreview(item.payload)}</p>
                    <p className="mt-1 text-xs text-[#7a8b82]">
                      {item.status} • {item.scheduleType}
                    </p>
                    <p className="mt-1 text-xs text-[#7a8b82]">
                      {formatDateTime(item.nextRunAt ?? item.scheduledFor)}
                    </p>
                  </div>
                ))}
                {scheduledItems.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No scheduled sends.</p>
                ) : null}
              </div>
            </PanelSection>

            <PanelSection title="Activity">
              <div className="space-y-3">
                {detail.activities.slice(0, 6).map((activity) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={activity._id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-[#25342f]">{activity.description}</p>
                      <span className="rounded-full bg-[#f6f1e9] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#7a8b82]">
                        {activity.type}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#7a8b82]">
                      {activity.actorName} • {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))}
                {detail.activities.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No activity recorded.</p>
                ) : null}
              </div>
            </PanelSection>
          </aside>
        ) : null}
      </InboxLayout>

      {lightboxImageId ? (
        <ImageLightboxModal
          images={lightboxImages}
          initialIndex={Math.max(
            0,
            lightboxImages.findIndex((img: { messageId: string }) => img.messageId === lightboxImageId),
          )}
          onClose={() => setLightboxImageId(null)}
        />
      ) : null}
    </>
  );
}
