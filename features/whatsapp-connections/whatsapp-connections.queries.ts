import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  checkWhatsAppConnectionHealth,
  disconnectWhatsAppConnection,
  getWhatsAppConnections,
  syncWhatsAppConnection,
} from "./whatsapp-connections.api";

export const whatsappConnectionKeys = {
  all: queryKeys.whatsappConnections,
  lists: () => [...queryKeys.whatsappConnections, "list"] as const,
};

export const useWhatsAppConnections = () => {
  return useQuery({
    queryKey: whatsappConnectionKeys.all,
    queryFn: getWhatsAppConnections,
  });
};

export const useSyncWhatsAppConnectionMutation = () => {
  return useMutation({
    mutationFn: (connectionId: string) => syncWhatsAppConnection(connectionId),
  });
};

export const useHealthCheckWhatsAppConnectionMutation = () => {
  return useMutation({
    mutationFn: (connectionId: string) => checkWhatsAppConnectionHealth(connectionId),
  });
};

export const useDisconnectWhatsAppConnectionMutation = () => {
  return useMutation({
    mutationFn: (connectionId: string) => disconnectWhatsAppConnection(connectionId),
  });
};
