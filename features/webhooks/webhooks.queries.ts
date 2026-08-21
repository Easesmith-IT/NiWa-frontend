import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWebhooksV1, GetWebhooksParams, reconcileWebhookV1, testWebhookV1 } from "./webhooks.api";

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (params?: GetWebhooksParams) => [...webhookKeys.lists(), params] as const,
};

export const useWebhooksV1Query = (params?: GetWebhooksParams) => {
  return useQuery({
    queryKey: webhookKeys.list(params),
    queryFn: () => getWebhooksV1(params),
  });
};

export const useTestWebhookV1Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testWebhookV1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
    },
  });
};

export const useReconcileWebhookV1Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reconcileWebhookV1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
    },
  });
};
