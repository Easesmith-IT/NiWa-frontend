import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { createLead, convertLead, listLeads } from "./lead.api";
import type { CreateLeadPayload, ConvertLeadPayload } from "./lead.types";

export const useLeadsQuery = (params?: Record<string, any>, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.leads, JSON.stringify(params || {})],
    queryFn: () => listLeads(params),
    enabled: options?.enabled,
  });

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => createLead(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.leads }),
      ]);
    },
  });
};

export const useConvertLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConvertLeadPayload }) =>
      convertLead(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.leads }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      ]);
    },
  });
};
