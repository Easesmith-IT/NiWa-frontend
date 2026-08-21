import { useState } from "react";
import { AxiosError } from "axios";
import type { WhatsAppConnectionRecord } from "../../../lib/api/types";
import {
  useDisconnectWhatsAppConnectionMutation,
  useHealthCheckWhatsAppConnectionMutation,
  useSyncWhatsAppConnectionMutation,
  useWhatsAppConnections,
} from "../whatsapp-connections.queries";

export function useWhatsAppSettingsState() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnectionRecord | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch connections query
  const connectionsQuery = useWhatsAppConnections();
  const activeConnection = connectionsQuery.data?.connections?.[0] || null;

  // Mutations
  const syncMutation = useSyncWhatsAppConnectionMutation();
  const healthMutation = useHealthCheckWhatsAppConnectionMutation();
  const disconnectMutation = useDisconnectWhatsAppConnectionMutation();

  const handleSync = (connectionId: string) => {
    syncMutation.mutate(connectionId, {
      onSuccess: () => {
        setActionFeedback({ type: "success", message: "WhatsApp connection and templates synced successfully." });
        connectionsQuery.refetch();
      },
      onError: (err: unknown) => {
        const msg = err instanceof AxiosError ? err.response?.data?.message || "Failed to sync connection." : "Failed to sync connection.";
        setActionFeedback({ type: "error", message: msg });
      },
    });
  };

  const handleDisconnect = (connectionId: string) => {
    disconnectMutation.mutate(connectionId, {
      onSuccess: () => {
        setActionFeedback({ type: "success", message: "WhatsApp connection disconnected. Historical messages preserved." });
        setIsDisconnectModalOpen(false);
        setIsDetailOpen(false);
        connectionsQuery.refetch();
      },
      onError: (err: unknown) => {
        const msg = err instanceof AxiosError ? err.response?.data?.message || "Failed to disconnect account." : "Failed to disconnect account.";
        setActionFeedback({ type: "error", message: msg });
      },
    });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return {
    isDetailOpen,
    setIsDetailOpen,
    selectedConnection,
    setSelectedConnection,
    isDisconnectModalOpen,
    setIsDisconnectModalOpen,
    actionFeedback,
    setActionFeedback,
    connectionsQuery,
    activeConnection,
    syncMutation,
    healthMutation,
    disconnectMutation,
    handleSync,
    handleDisconnect,
    formatDate,
  };
}
