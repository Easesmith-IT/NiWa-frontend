import { v1ApiClient } from "../../lib/api/v1-client";
import type { GetWebhooksParams, WebhookReconcileResponse, WebhooksResponse } from "./webhooks.types";

export * from "./webhooks.types";

export const getWebhooksV1 = async (params?: GetWebhooksParams) => {
  const { data } = await v1ApiClient.get<WebhooksResponse>("/webhooks", { params });
  return data;
};

export const testWebhookV1 = async () => {
  await v1ApiClient.post("/webhooks/test");
};

export const reconcileWebhookV1 = async () => {
  const { data } = await v1ApiClient.post<WebhookReconcileResponse>("/webhooks/reconcile");
  return data;
};
