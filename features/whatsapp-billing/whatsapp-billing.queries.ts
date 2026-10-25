import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  getWhatsAppBillingSummary,
  getWhatsAppUsageEvents,
  getWhatsAppLedger,
  getWhatsAppAllowances,
  getWhatsAppRateCards,
  createWhatsAppRateCard,
  verifyWhatsAppRateCard,
  revokeWhatsAppRateCard,
  triggerWhatsAppReconciliation,
  type GetSummaryParams,
  type GetEventsParams,
  type GetLedgerParams,
  type GetRateCardsParams,
  type WhatsAppRateCard,
  type VerifyRateCardPayload,
  type RevokeRateCardPayload,
} from "./whatsapp-billing.api";

export const useWhatsAppBillingSummary = (params?: GetSummaryParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.whatsappBilling.summary(params),
    queryFn: () => getWhatsAppBillingSummary(params),
    enabled,
    staleTime: 30_000,
  });
};

export const useWhatsAppUsageEvents = (params?: GetEventsParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.whatsappBilling.events(params),
    queryFn: () => getWhatsAppUsageEvents(params),
    enabled,
    staleTime: 15_000,
  });
};

export const useWhatsAppLedger = (params?: GetLedgerParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.whatsappBilling.ledger(params),
    queryFn: () => getWhatsAppLedger(params),
    enabled,
    staleTime: 15_000,
  });
};

export const useWhatsAppAllowances = (
  params?: { period?: string; phoneNumberId?: string },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.whatsappBilling.allowances(params),
    queryFn: () => getWhatsAppAllowances(params),
    enabled,
    staleTime: 30_000,
  });
};

export const useWhatsAppRateCards = (params?: GetRateCardsParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.whatsappBilling.rateCards(params),
    queryFn: () => getWhatsAppRateCards(params),
    enabled,
    staleTime: 60_000,
  });
};

export const useCreateWhatsAppRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WhatsAppRateCard>) => createWhatsAppRateCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-billing", "rate-cards"] });
    },
  });
};

export const useVerifyWhatsAppRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rateCardId, payload }: { rateCardId: string; payload: VerifyRateCardPayload }) =>
      verifyWhatsAppRateCard(rateCardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-billing"] });
    },
  });
};

export const useRevokeWhatsAppRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rateCardId, payload }: { rateCardId: string; payload: RevokeRateCardPayload }) =>
      revokeWhatsAppRateCard(rateCardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-billing"] });
    },
  });
};

export const useTriggerWhatsAppReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerWhatsAppReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-billing"] });
    },
  });
};
