import { apiClient } from "../../lib/api/api-client";
import type { GetWebhooksParams, WebhookReconcileResponse, WebhooksResponse } from "./webhooks.types";

export * from "./webhooks.types";

export const getWebhooks = async (params?: GetWebhooksParams) => {
  const { data } = await apiClient.get<WebhooksResponse>("/webhooks", { params });
  return data;
};

export const testWebhook = async () => {
  await apiClient.post("/webhooks/test");
};

export const reconcileWebhook = async () => {
  const { data } = await apiClient.post<WebhookReconcileResponse>("/webhooks/reconcile");
  return data;
};
