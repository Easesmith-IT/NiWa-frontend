import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkWhatsAppConnectionHealth,
  disconnectWhatsAppConnection,
  getWhatsAppConnections,
  syncWhatsAppConnection,
} from "./whatsapp-connections.api";

export const whatsappConnectionKeys = {
  all: ["whatsapp-connections"] as const,
  lists: () => [...whatsappConnectionKeys.all, "list"] as const,
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
