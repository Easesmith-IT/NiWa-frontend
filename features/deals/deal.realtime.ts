import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { queryKeys } from "../../lib/api/query-keys";
import { getBaseApiUrl } from "../../lib/api/base-url";
import { getAccessToken } from "../../lib/auth";
import { getActiveWorkspaceId } from "../../lib/workspace/workspace-state";

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

let sharedDealSocket: Socket | null = null;
let currentSocketWorkspaceId: string | null = null;

export const disconnectDealSocket = () => {
  if (sharedDealSocket) {
    sharedDealSocket.disconnect();
    sharedDealSocket = null;
    currentSocketWorkspaceId = null;
  }
};

export const useDealsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const activeWorkspaceId = getActiveWorkspaceId();

    if (!activeWorkspaceId) {
      disconnectDealSocket();
      return;
    }

    if (sharedDealSocket && currentSocketWorkspaceId !== activeWorkspaceId) {
      disconnectDealSocket();
    }

    if (!sharedDealSocket) {
      const realtimeUrl = resolveRealtimeUrl();
      const transports = process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS
        ? process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS.split(",")
        : ["websocket", "polling"];

      const token = getAccessToken();

      sharedDealSocket = io(realtimeUrl, {
        path: "/socket.io",
        transports,
        withCredentials: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        auth: {
          token,
          workspaceId: activeWorkspaceId,
        },
        extraHeaders: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "x-workspace-id": activeWorkspaceId,
        },
      });
      currentSocketWorkspaceId = activeWorkspaceId;
    }

    const socket = sharedDealSocket;
    let refreshTimeout: NodeJS.Timeout | null = null;

    const scheduleRefresh = () => {
      if (refreshTimeout) return;
      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        queryClient.invalidateQueries({ queryKey: queryKeys.deals });
        queryClient.invalidateQueries({ queryKey: queryKeys.leads });
      }, 500);
    };

    socket.on("deal.created", scheduleRefresh);
    socket.on("deal.updated", scheduleRefresh);
    socket.on("deal.stage_changed", scheduleRefresh);
    socket.on("lead.updated", scheduleRefresh);

    return () => {
      socket.off("deal.created", scheduleRefresh);
      socket.off("deal.updated", scheduleRefresh);
      socket.off("deal.stage_changed", scheduleRefresh);
      socket.off("lead.updated", scheduleRefresh);
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [queryClient]);
};
