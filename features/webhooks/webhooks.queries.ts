import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { getWebhooks, GetWebhooksParams, reconcileWebhook, testWebhook } from "./webhooks.api";

export const webhookKeys = {
  all: queryKeys.webhooks,
  lists: () => [...queryKeys.webhooks, "list"] as const,
  list: (params?: GetWebhooksParams) => [...webhookKeys.lists(), params] as const,
};

export const useWebhooksQuery = (params?: GetWebhooksParams) => {
  return useQuery({
    queryKey: webhookKeys.list(params),
    queryFn: () => getWebhooks(params),
  });
};

export const useTestWebhookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
    },
  });
};

export const useReconcileWebhookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reconcileWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
    },
  });
};
