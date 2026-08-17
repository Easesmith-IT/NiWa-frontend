import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { campaignKeys } from "./campaign.queries";
import { getBaseApiUrl } from "../../lib/api/client";

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

      // To pass JWT to backend properly, we grab it from localStorage since NiWa uses useAuth() which stores it.
      // Assuming it's in localStorage or cookie. Since auth is handled via withCredentials (cookie) or we can just try:
      const authDataString = typeof window !== "undefined" ? localStorage.getItem("niwa_auth") : null;
      let token = "";
      if (authDataString) {
        try {
          const authData = JSON.parse(authDataString);
          token = authData?.state?.token || "";
        } catch(e) {}
      }

      sharedSocket = io(realtimeUrl, {
        path: "/socket.io",
        transports,
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        auth: token ? { token } : undefined
      });
    }

    const socket = sharedSocket;

    const invalidationTimeouts: Record<string, NodeJS.Timeout> = {};

    const handleCampaignUpdated = (envelope: { payload: { campaignId: string; type: string } }) => {
      const { campaignId, type } = envelope.payload;
      
      // Debounce the invalidation to prevent backend hammering during mass dispatches
      const key = `${campaignId}-${type}`;
      if (invalidationTimeouts[key]) {
        clearTimeout(invalidationTimeouts[key]);
      }
      
      invalidationTimeouts[key] = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
        
        if (type === "stats_changed") {
          queryClient.invalidateQueries({ queryKey: campaignKeys.recipients(campaignId) });
        }
        
        queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      }, 1000);
    };

    socket.on("campaign.updated", handleCampaignUpdated);

    return () => {
      socket.off("campaign.updated", handleCampaignUpdated);
      Object.values(invalidationTimeouts).forEach(clearTimeout);
    };
  }, [queryClient]);
};
