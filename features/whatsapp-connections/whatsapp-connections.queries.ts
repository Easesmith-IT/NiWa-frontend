import { useQuery } from "@tanstack/react-query";
import { getWhatsAppConnections } from "./whatsapp-connections.api";

export const whatsappConnectionKeys = {
  all: ["whatsapp-connections"] as const,
  lists: () => [...whatsappConnectionKeys.all, "list"] as const,
};

export const useWhatsAppConnections = () => {
  return useQuery({
    queryKey: whatsappConnectionKeys.lists(),
    queryFn: getWhatsAppConnections,
  });
};
