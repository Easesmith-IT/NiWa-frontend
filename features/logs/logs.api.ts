import { apiClient } from "../../lib/api/api-client";
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

export const getApiLogs = async (params?: GetApiLogsParams) => {
  const { data } = await apiClient.get<ApiLogsResponse>("/logs/api", { params });
  return data;
};

export const exportApiLogs = async (params?: GetApiLogsParams) => {
  const { data } = await apiClient.get<unknown>("/logs/api", {
    params: { ...params, export: "json" },
  });
  return data;
};

export const getWebhookLogs = async (params?: GetWebhookLogsParams) => {
  const { data } = await apiClient.get<WebhookLogsResponse>("/logs/webhooks", { params });
  return data;
};

export const exportWebhookLogs = async (params?: GetWebhookLogsParams) => {
  const { data } = await apiClient.get<unknown>("/logs/webhooks", {
    params: { ...params, export: "json" },
  });
  return data;
};
