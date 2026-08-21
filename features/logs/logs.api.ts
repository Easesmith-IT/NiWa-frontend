import { v1ApiClient } from "../../lib/api/v1-client";
import type { ApiLogsResponse, WebhookLogsResponse } from "./logs.types";

export * from "./logs.types";

export interface GetApiLogsParams {
  endpoint?: string;
  export?: string;
  from?: string;
  page?: number;
  statusCode?: string;
  success?: string;
  to?: string;
}

export interface GetWebhookLogsParams {
  eventType?: string;
  export?: string;
  from?: string;
  page?: number;
  processed?: string;
  responseCode?: string;
  to?: string;
}

export const getApiLogsV1 = async (params?: GetApiLogsParams) => {
  const { data } = await v1ApiClient.get<ApiLogsResponse>("/logs/api", { params });
  return data;
};

export const exportApiLogsV1 = async (params?: GetApiLogsParams) => {
  const { data } = await v1ApiClient.get<unknown>("/logs/api", {
    params: { ...params, export: "json" },
  });
  return data;
};

export const getWebhookLogsV1 = async (params?: GetWebhookLogsParams) => {
  const { data } = await v1ApiClient.get<WebhookLogsResponse>("/logs/webhooks", { params });
  return data;
};

export const exportWebhookLogsV1 = async (params?: GetWebhookLogsParams) => {
  const { data } = await v1ApiClient.get<unknown>("/logs/webhooks", {
    params: { ...params, export: "json" },
  });
  return data;
};
