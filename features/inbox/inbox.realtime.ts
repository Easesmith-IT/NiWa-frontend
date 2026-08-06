"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { getBaseApiUrl } from "../../lib/api/client";

const isSocketIoRealtimeEnabled = () => {
  return process.env.NEXT_PUBLIC_REALTIME_TRANSPORT === "socket_io";
};

const resolveRealtimeUrl = () => {
  const isBrowser = typeof window !== "undefined";
  const isLocalhost =
    isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  let explicitUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

  if (isBrowser && !isLocalhost && explicitUrl && (explicitUrl.includes("localhost") || explicitUrl.includes("127.0.0.1"))) {
    explicitUrl = undefined;
  }

  if (explicitUrl) {
    return explicitUrl;
  }

  const apiUrl = getBaseApiUrl();
  return apiUrl.replace(/\/api\/?$/, "");
};

export const useInboxRealtime = (
  activeConversationId: string | null,
  onActiveMessageReceived?: (conversationId: string) => void,
) => {
  const queryClient = useQueryClient();
  const onActiveMessageReceivedRef = useRef(onActiveMessageReceived);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    onActiveMessageReceivedRef.current = onActiveMessageReceived;
  }, [onActiveMessageReceived]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!isSocketIoRealtimeEnabled()) {
      return;
    }

    const realtimeUrl = resolveRealtimeUrl();
    const transports = process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS
      ? process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS.split(",")
      : ["websocket", "polling"];

    const socket = io(realtimeUrl, {
      path: "/socket.io",
      transports,
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    const invalidateInbox = () => {
      void queryClient.invalidateQueries({
        queryKey: v1QueryKeys.inbox,
      });
    };

    const invalidateActiveThread = (conversationId?: string) => {
      const currentActiveId = activeConversationIdRef.current;
      if (!currentActiveId || !conversationId || currentActiveId !== conversationId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: [...v1QueryKeys.inboxThread, currentActiveId],
      });
    };

    if (process.env.NODE_ENV !== "production") {
      socket.on("connect", () => {
        console.log("[INBOX_SOCKET] Connected:", socket.id);
      });
      socket.on("disconnect", (reason) => {
        console.log("[INBOX_SOCKET] Disconnected:", reason);
      });
      socket.on("connect_error", (err) => {
        console.warn("[INBOX_SOCKET] Connect error:", err.message);
      });
    }

    socket.on("conversation.updated", (event: { payload?: { conversationId?: string } }) => {
      const conversationId = event?.payload?.conversationId;
      invalidateInbox();
      invalidateActiveThread(conversationId);
    });

    socket.on("message.created", (event: { payload?: { conversationId?: string } }) => {
      const conversationId = event?.payload?.conversationId;
      invalidateInbox();
      invalidateActiveThread(conversationId);
      const currentActiveId = activeConversationIdRef.current;
      if (currentActiveId && conversationId === currentActiveId) {
        onActiveMessageReceivedRef.current?.(conversationId);
      }
    });

    socket.on(
      "message.status.updated",
      (event: { payload?: { conversationId?: string; messageId?: string; status?: string } }) => {
        const conversationId = event?.payload?.conversationId;
        const messageId = event?.payload?.messageId;
        const status = event?.payload?.status;

        invalidateInbox();

        if (conversationId && messageId && status) {
          queryClient.setQueriesData<{ data?: { messages?: Array<{ _id: string; status: string }> } }>(
            { queryKey: [...v1QueryKeys.inboxThread, conversationId] },
            (oldData) => {
              if (!oldData || !oldData.data || !Array.isArray(oldData.data.messages)) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  messages: oldData.data.messages.map((msg) =>
                    msg._id === messageId ? { ...msg, status } : msg,
                  ),
                },
              };
            },
          );
        } else {
          invalidateActiveThread(conversationId);
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};
