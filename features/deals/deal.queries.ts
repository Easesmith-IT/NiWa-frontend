import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { archiveDeal, createDeal, fetchDealById, listDeals, updateDeal } from "./deal.api";
import type { CreateDealPayload, DealFilterInput, UpdateDealPayload } from "./deal.types";

export const useDealsQuery = (params?: DealFilterInput, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.deals, JSON.stringify(params || {})],
    queryFn: () => listDeals(params),
    enabled: options?.enabled,
  });

export const useDealDetailQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.deals, "detail", id],
    queryFn: () => fetchDealById(id),
    enabled: enabled && !!id,
  });

export const useCreateDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      ]);
    },
  });
};

export const useUpdateDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDealPayload }) =>
      updateDeal(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      ]);
    },
  });
};

export const useArchiveDealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveDeal(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      ]);
    },
  });
};

