import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { getApiLogs, GetApiLogsParams, getWebhookLogs, GetWebhookLogsParams } from "./logs.api";

export const logKeys = {
  all: queryKeys.logs,
  api: (params?: GetApiLogsParams) => [...queryKeys.logs, "api", params] as const,
  webhooks: (params?: GetWebhookLogsParams) => [...queryKeys.webhookLogs, "webhooks", params] as const,
};

export const useApiLogsQuery = (params?: GetApiLogsParams) => {
  return useQuery({
    queryKey: logKeys.api(params),
    queryFn: () => getApiLogs(params),
  });
};

export const useWebhookLogsQuery = (params?: GetWebhookLogsParams) => {
  return useQuery({
    queryKey: logKeys.webhooks(params),
    queryFn: () => getWebhookLogs(params),
  });
};
