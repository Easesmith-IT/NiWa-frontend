"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  useAddContactLabelV1Mutation,
  usePatchContactV1Mutation,
  useRemoveContactLabelV1Mutation,
} from "../../../features/contacts";
import {
  ChatComposer,
  ChatMessageList,
  ImageLightboxModal,
  InboxChatWindow,
  InboxContactSidebar,
  InboxLayout,
  InboxThreadList,
  MessageRecordV1,
  areVariableValuesEqual,
  extractTemplateVariables,
  formatConversationTime,
  formatMessageDay,
  getContactVariableDefaults,
  getMessageTimestamp,
  mergeAndReconcileMessages,
  resolveQuickReplyBody,
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

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

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
  }, [detail?.contact, selectedQuickReply, selectedQuickReplyVariables, setQuickReplyVariableValues]);

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
              quickReplyVariableValues={quickReplyVariableValues}
              scheduleDialogOpen={scheduleDialogOpen}
              scheduledDate={scheduledDate}
              scheduledRule={scheduledRule}
              scheduledType={scheduledType}
              selectedQuickReply={selectedQuickReply}
              selectedQuickReplyId={selectedQuickReplyId}
              selectedQuickReplyVariables={selectedQuickReplyVariables}
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
          <InboxContactSidebar
            activities={detail.activities}
            availableLabels={availableLabels}
            contactLabels={contactLabels}
            detail={detail}
            editAvatarUrl={editAvatarUrl}
            editCompany={editCompany}
            editDisplayName={editDisplayName}
            editEmail={editEmail}
            editingContact={editingContact}
            editingNoteContent={editingNoteContent}
            editingNoteId={editingNoteId}
            isAddingLabel={addLabelMutation.isPending}
            isCancelingTask={cancelTaskMutation.isPending}
            isCompletingTask={completeTaskMutation.isPending}
            isCreatingNote={createNoteMutation.isPending}
            isCreatingTask={createTaskMutation.isPending}
            isDeletingNote={deleteNoteMutation.isPending}
            isPatchingNote={patchNoteMutation.isPending}
            isRemovingLabel={removeLabelMutation.isPending}
            isSavingContact={patchContactMutation.isPending}
            noteContent={noteContent}
            notePinned={notePinned}
            notes={detail.notes}
            onAddLabel={() => {
              if (!selectedLabelId) return;
              addLabelMutation.mutate(
                { contactId: detail.contact._id, labelId: selectedLabelId },
                { onSuccess: () => setSelectedLabelId("") },
              );
            }}
            onAddNote={() => {
              if (!noteContent.trim()) return;
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
              );
            }}
            onAddTask={() => {
              if (!taskTitle.trim()) return;
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
              );
            }}
            onCancelTask={(taskId) => cancelTaskMutation.mutate(taskId)}
            onClose={() => setContactInfoOpen(false)}
            onCompleteTask={(taskId) => completeTaskMutation.mutate(taskId)}
            onDeleteNote={(noteId) => deleteNoteMutation.mutate(noteId)}
            onEditAvatarUrlChange={setEditAvatarUrl}
            onEditCompanyChange={setEditCompany}
            onEditDisplayNameChange={setEditDisplayName}
            onEditEmailChange={setEditEmail}
            onEditingContactChange={setEditingContact}
            onEditingNoteContentChange={setEditingNoteContent}
            onEditingNoteIdChange={setEditingNoteId}
            onNoteContentChange={setNoteContent}
            onNotePinnedChange={setNotePinned}
            onRemoveLabel={(labelId) =>
              removeLabelMutation.mutate({ contactId: detail.contact._id, labelId })
            }
            onSaveContact={() => {
              if (!editDisplayName.trim()) return;
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
              );
            }}
            onSaveNoteEdit={(noteId) => {
              if (!editingNoteContent.trim()) return;
              patchNoteMutation.mutate(
                { noteId, payload: { content: editingNoteContent.trim() } },
                {
                  onSuccess: () => {
                    setEditingNoteId(null);
                    setEditingNoteContent("");
                  },
                },
              );
            }}
            onSelectLabelId={setSelectedLabelId}
            onTaskDueDateChange={setTaskDueDate}
            onTaskPriorityChange={setTaskPriority}
            onTaskTitleChange={setTaskTitle}
            onTogglePinNote={(noteId, currentPinned) =>
              setNotePinnedMutation.mutate({ noteId, pinned: !currentPinned })
            }
            scheduledItems={scheduledItems}
            selectedLabelId={selectedLabelId}
            taskDueDate={taskDueDate}
            taskPriority={taskPriority}
            taskTitle={taskTitle}
            tasks={tasks}
          />
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
