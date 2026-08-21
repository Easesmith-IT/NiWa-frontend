import { useQuery } from "@tanstack/react-query";
import { getApiLogsV1, GetApiLogsParams, getWebhookLogsV1, GetWebhookLogsParams } from "./logs.api";

export const logKeys = {
  all: ["logs"] as const,
  api: (params?: GetApiLogsParams) => [...logKeys.all, "api", params] as const,
  webhooks: (params?: GetWebhookLogsParams) => [...logKeys.all, "webhooks", params] as const,
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
