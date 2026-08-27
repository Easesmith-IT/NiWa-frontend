import { useCallback, useEffect, useRef } from "react";
import { useInboxRealtime } from "../inbox.realtime";

export interface UseInboxRealtimeHandlersParams {
  activeConversationId: string | null;
  unreadCount?: number;
  mutateThreadState: (variables: {
    action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar";
    conversationId: string;
  }) => void;
}

export function useInboxRealtimeHandlers({
  activeConversationId,
  unreadCount = 0,
  mutateThreadState,
}: UseInboxRealtimeHandlersParams) {
  const threadMutationRef = useRef(mutateThreadState);
  useEffect(() => {
    threadMutationRef.current = mutateThreadState;
  });

  const markedReadSetRef = useRef<Set<string>>(new Set());

  const handleActiveMessageReceived = useCallback(
    (conversationId: string) => {
      if (activeConversationId && conversationId === activeConversationId) {
        markedReadSetRef.current.add(activeConversationId);
        threadMutationRef.current({
          action: "read",
          conversationId,
        });
      }
    },
    [activeConversationId],
  );

  // Single authoritative socket.io realtime subscription per Inbox screen
  useInboxRealtime(activeConversationId, handleActiveMessageReceived);

  // Auto-read active thread on selection if unreadCount > 0
  useEffect(() => {
    if (!activeConversationId) return;
    if (unreadCount > 0 && !markedReadSetRef.current.has(activeConversationId)) {
      markedReadSetRef.current.add(activeConversationId);
      threadMutationRef.current({
        action: "read",
        conversationId: activeConversationId,
      });
    }
  }, [activeConversationId, unreadCount]);
}
