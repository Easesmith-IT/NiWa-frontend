"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isSocketIoRealtimeEnabled()) {
      return;
    }

    const realtimeUrl = resolveRealtimeUrl();
    const transports = process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS
      ? process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS.split(",")
      : ["polling"];

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
      if (!activeConversationId || !conversationId || activeConversationId !== conversationId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: [...v1QueryKeys.inboxThread, activeConversationId],
      });
    };

    socket.on("conversation.updated", (event: { payload?: { conversationId?: string } }) => {
      const conversationId = event?.payload?.conversationId;
      invalidateInbox();
      invalidateActiveThread(conversationId);
      if (activeConversationId && conversationId === activeConversationId) {
        onActiveMessageReceived?.(conversationId);
      }
    });

    socket.on("message.created", (event: { payload?: { conversationId?: string } }) => {
      const conversationId = event?.payload?.conversationId;
      invalidateInbox();
      invalidateActiveThread(conversationId);
      if (activeConversationId && conversationId === activeConversationId) {
        onActiveMessageReceived?.(conversationId);
      }
    });

    socket.on(
      "message.status.updated",
      (event: { payload?: { conversationId?: string } }) => {
        const conversationId = event?.payload?.conversationId;
        invalidateInbox();
        invalidateActiveThread(conversationId);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [activeConversationId, onActiveMessageReceived, queryClient]);
};
