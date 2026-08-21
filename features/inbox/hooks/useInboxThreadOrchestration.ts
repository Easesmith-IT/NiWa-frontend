import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";

import type { InboxFilterType, OptimisticInboxMessage } from "./useInboxState";
import type { MessageRecordV1 } from "../inbox.types";
import {
  formatConversationTime,
  formatMessageDay,
  getMessageTimestamp,
} from "../utils/formatters";
import { mergeAndReconcileMessages } from "../inbox.merge";
import { useAsyncMessageBatchQueue } from "../inbox.batch-queue";
import { useInboxRealtimeHandlers } from "./useInboxRealtimeHandlers";
import {
  useInboxThreadDetailV1Query,
  useInboxThreadStateMutation,
  useInboxThreadsV1Query,
  useSyncInboxThreadHistoryV1Mutation,
} from "../inbox.queries";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export interface UseInboxThreadOrchestrationOptions {
  optimisticMessages?: OptimisticInboxMessage[];
  setComposerFeedback?: (feedback: { message: string; tone: "error" | "success" } | null) => void;
}

export function useInboxThreadOrchestration(options?: UseInboxThreadOrchestrationOptions) {
  const optimisticMessages = useMemo(() => options?.optimisticMessages ?? [], [options?.optimisticMessages]);
  const searchParams = useSearchParams();

  // Filters & Thread Selection
  const [filter, setFilter] = useState<InboxFilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Scroll & Lightbox State
  const [hasInitialScrollCompleted, setHasInitialScrollCompleted] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  const paginationCallWindowRef = useRef<number[]>([]);

  // Queries & Mutations
  const threadsQuery = useInboxThreadsV1Query({ filter, search });
  const threadMutation = useInboxThreadStateMutation();
  const syncHistoryMutation = useSyncInboxThreadHistoryV1Mutation();

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

  // URL search params sync
  useEffect(() => {
    const requestedConversationId = searchParams.get("conversationId");
    if (requestedConversationId) {
      setSelectedConversationId(requestedConversationId);
    }
  }, [searchParams]);

  // Thread selection fallback sync
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
  }, [selectedConversationId, threads]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.conversation._id === selectedConversationId) ?? null,
    [selectedConversationId, threads],
  );

  const activeConversationId = selectedThread?.conversation._id ?? null;

  // Realtime Handler Bridge
  useInboxRealtimeHandlers({
    activeConversationId,
    unreadCount: selectedThread?.conversation?.unreadCount,
    mutateThreadState: threadMutation.mutate,
  });

  const detailQuery = useInboxThreadDetailV1Query(activeConversationId, { messageLimit: 50 });
  const detail = detailQuery.data?.data ?? null;
  const initialPagination = detailQuery.data?.pagination;

  // Pagination queue
  const {
    olderMessages,
    isLoadingNextBatch,
    hasMoreOlderMessages,
    nextCursor,
    paginationError,
    loadNextBatchAsync,
    retryLoadOlder,
  } = useAsyncMessageBatchQueue(activeConversationId, initialPagination);

  // Sync History Handler
  const handleSyncHistory = async () => {
    if (!activeConversationId) return;
    try {
      await syncHistoryMutation.mutateAsync(activeConversationId);
      options?.setComposerFeedback?.({
        message: "Thread history synchronized successfully.",
        tone: "success",
      });
    } catch (error) {
      options?.setComposerFeedback?.({
        message: getErrorMessage(error, "Failed to synchronize thread history."),
        tone: "error",
      });
    }
  };

  // Scroll Anchoring Physics
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

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

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
    paginationCallWindowRef.current = [];
    setHasInitialScrollCompleted(false);
    setShowJumpToBottom(false);
    setNewMessageCount(0);

    const timer = setTimeout(() => {
      scrollToBottom(false);
      setHasInitialScrollCompleted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConversationId, scrollToBottom]);

  // Message Merging & Groups
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

  return {
    filter,
    setFilter,
    search,
    setSearch,
    selectedConversationId,
    setSelectedConversationId,
    threadsQuery,
    threads,
    selectedThread,
    activeConversationId,
    detailQuery,
    detail,
    threadMutation,
    syncHistoryMutation,
    handleSyncHistory,
    olderMessages,
    isLoadingNextBatch,
    hasMoreOlderMessages,
    nextCursor,
    paginationError,
    retryLoadOlder,
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
    handleMessageContainerScroll,
    hasInitialScrollCompleted,
    setHasInitialScrollCompleted,
    showJumpToBottom,
    setShowJumpToBottom,
    newMessageCount,
    setNewMessageCount,
    lightboxImageId,
    setLightboxImageId,
    displayedMessages,
    lightboxImages,
    messageGroups,
  };
}
