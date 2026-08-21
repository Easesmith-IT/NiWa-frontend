import type { WebhookReconcileResponse, WebhooksResponse } from "../../lib/api/types";

export type { WebhookReconcileResponse, WebhooksResponse };

export interface GetWebhooksParams {
  eventCategory?: string;
  eventType?: string;
  processingState?: string;
}

export interface TestWebhookPayload {
  url?: string;
  eventType?: string;
}

export interface TestWebhookResponse {
  success: boolean;
  message: string;
  latencyMs?: number;
  statusCode?: number;
}
