"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getInboxThreadDetail } from "./inbox.api";
import { mapInboxThreadDetail } from "./inbox.mappers";
import type { MessageRecord } from "./inbox.types";

export interface AsyncMessageBatchQueueState {
  olderMessages: MessageRecord[];
  isLoadingNextBatch: boolean;
  hasMoreOlderMessages: boolean;
  nextCursor: string | null;
  paginationError: string | null;
  loadNextBatchAsync: () => Promise<void>;
  retryLoadOlder: () => Promise<void>;
  resetQueue: () => void;
}

export const useAsyncMessageBatchQueue = (
  conversationId: string | null,
  initialPagination?: {
    nextCursor?: string | null;
    hasMore?: boolean;
  },
): AsyncMessageBatchQueueState => {
  const [olderMessages, setOlderMessages] = useState<MessageRecord[]>([]);
  const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false);
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(
    initialPagination?.hasMore ?? true,
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialPagination?.nextCursor ?? null,
  );
  const [paginationError, setPaginationError] = useState<string | null>(null);

  const activeIdRef = useRef(conversationId);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync initial pagination info when available
  useEffect(() => {
    if (initialPagination?.nextCursor !== undefined) {
      setNextCursor(initialPagination.nextCursor);
    }
    if (initialPagination?.hasMore !== undefined) {
      setHasMoreOlderMessages(initialPagination.hasMore);
    }
  }, [initialPagination?.hasMore, initialPagination?.nextCursor]);

  // Reset queue state and cancel in-flight requests on conversation switch
  useEffect(() => {
    activeIdRef.current = conversationId;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setOlderMessages([]);
    setIsLoadingNextBatch(false);
    setHasMoreOlderMessages(initialPagination?.hasMore ?? true);
    setNextCursor(initialPagination?.nextCursor ?? null);
    setPaginationError(null);
    isFetchingRef.current = false;
  }, [conversationId, initialPagination?.hasMore, initialPagination?.nextCursor]);

  const resetQueue = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setOlderMessages([]);
    setIsLoadingNextBatch(false);
    setHasMoreOlderMessages(true);
    setNextCursor(null);
    setPaginationError(null);
    isFetchingRef.current = false;
  }, []);

  const loadNextBatchAsync = useCallback(async () => {
    if (
      !conversationId ||
      isFetchingRef.current ||
      !hasMoreOlderMessages ||
      !nextCursor
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingNextBatch(true);
    setPaginationError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const rawResult = await getInboxThreadDetail(
        conversationId,
        {
          cursor: nextCursor,
          messageLimit: 50,
        },
        { signal: controller.signal },
      );

      if (
        activeIdRef.current !== conversationId ||
        controller.signal.aborted
      ) {
        return;
      }

      const mapped = mapInboxThreadDetail(rawResult.data);
      const newOlderMessages = mapped.messages || [];
      const newNextCursor = rawResult.pagination?.nextCursor ?? null;
      const newHasMore = rawResult.pagination?.hasMore ?? false;

      setNextCursor(newNextCursor);
      setHasMoreOlderMessages(newHasMore);

      if (newOlderMessages.length > 0) {
        setOlderMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const uniqueNew = newOlderMessages.filter(
            (m) => !existingIds.has(m._id),
          );
          return [...uniqueNew, ...prev];
        });
      }
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : undefined;
      if (errorName === "CanceledError" || errorName === "AbortError") {
        return;
      }
      console.error("Async batch message queue fetch error:", err);
      setPaginationError("Couldn't load earlier messages. Tap to retry.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      isFetchingRef.current = false;
      setIsLoadingNextBatch(false);
    }
  }, [conversationId, hasMoreOlderMessages, nextCursor]);

  const retryLoadOlder = useCallback(async () => {
    setPaginationError(null);
    await loadNextBatchAsync();
  }, [loadNextBatchAsync]);

  return {
    olderMessages,
    isLoadingNextBatch,
    hasMoreOlderMessages,
    nextCursor,
    paginationError,
    loadNextBatchAsync,
    retryLoadOlder,
    resetQueue,
  };
};
