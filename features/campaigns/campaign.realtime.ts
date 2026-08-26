import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { campaignKeys } from "./campaign.queries";
import { getBaseApiUrl } from "../../lib/api/base-url";

import { getAccessToken } from "../../lib/auth";

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

let sharedSocket: Socket | null = null;

export const useCampaignRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sharedSocket) {
      const realtimeUrl = resolveRealtimeUrl();
      const transports = process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS
        ? process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS.split(",")
        : ["websocket", "polling"];

      const token = getAccessToken();
      const activeWorkspaceId =
        (typeof window !== "undefined" && localStorage.getItem("activeWorkspaceId")) ||
        process.env.NEXT_PUBLIC_WORKSPACE_ID ||
        "ws-default";

      sharedSocket = io(realtimeUrl, {
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
    }

    const socket = sharedSocket;

    const activeTimeouts: Record<string, NodeJS.Timeout> = {};
    const pendingRefreshes: Record<string, boolean> = {};

    const handleCampaignUpdated = (envelope: { payload: { campaignId: string; type: string } }) => {
      const { campaignId, type } = envelope.payload;
      
      // We use a bounded throttle. First event schedules the refresh, 
      // subsequent events within the 1500ms window are simply ignored until the refresh fires.
      const key = `${campaignId}-${type}`;
      
      if (pendingRefreshes[key]) {
        return;
      }
      
      pendingRefreshes[key] = true;
      activeTimeouts[key] = setTimeout(() => {
        pendingRefreshes[key] = false;
        delete activeTimeouts[key];
        
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
        
        if (type === "status_changed") {
          queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
        } else if (type === "stats_changed") {
          queryClient.invalidateQueries({ queryKey: campaignKeys.recipients(campaignId) });
          // FIX: Invalidate list query so KPI dashboard reflects fresh stats
          queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
        }
      }, 1500);
    };

    socket.on("campaign.updated", handleCampaignUpdated);

    return () => {
      socket.off("campaign.updated", handleCampaignUpdated);
      Object.values(activeTimeouts).forEach(clearTimeout);
    };
  }, [queryClient]);
};
