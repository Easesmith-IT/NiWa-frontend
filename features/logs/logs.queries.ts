import { useQuery } from "@tanstack/react-query";
import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { getApiLogsV1, GetApiLogsParams, getWebhookLogsV1, GetWebhookLogsParams } from "./logs.api";

export const logKeys = {
  all: v1QueryKeys.logs,
  api: (params?: GetApiLogsParams) => [...v1QueryKeys.logs, "api", params] as const,
  webhooks: (params?: GetWebhookLogsParams) => [...v1QueryKeys.webhookLogs, "webhooks", params] as const,
};

export const useApiLogsV1Query = (params?: GetApiLogsParams) => {
  return useQuery({
    queryKey: logKeys.api(params),
    queryFn: () => getApiLogsV1(params),
  });
};

export const useWebhookLogsV1Query = (params?: GetWebhookLogsParams) => {
  return useQuery({
    queryKey: logKeys.webhooks(params),
    queryFn: () => getWebhookLogsV1(params),
  });
};
