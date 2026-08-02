"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";

const isSocketIoRealtimeEnabled = () => {
  return process.env.NEXT_PUBLIC_REALTIME_TRANSPORT === "socket_io";
};

const resolveRealtimeUrl = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

  if (explicitUrl) {
    return explicitUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const useInboxRealtime = (activeConversationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSocketIoRealtimeEnabled()) {
      return;
    }

    const realtimeUrl = resolveRealtimeUrl();
    const socket = io(realtimeUrl, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      withCredentials: true,
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
    });

    socket.on("message.created", (event: { payload?: { conversationId?: string } }) => {
      const conversationId = event?.payload?.conversationId;
      invalidateInbox();
      invalidateActiveThread(conversationId);
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
  }, [activeConversationId, queryClient]);
};
