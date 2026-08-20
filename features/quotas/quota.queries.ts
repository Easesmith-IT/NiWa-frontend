import { useQuery } from "@tanstack/react-query";
import { getQuota, getQuotaForecast } from "./quota.api";

export const quotaKeys = {
  all: ["quotas"] as const,
  detail: (connectionId?: string) => [...quotaKeys.all, "detail", connectionId ?? "default"] as const,
  forecast: (connectionId?: string, timezone?: string, recipientCount?: number, startDate?: string) => 
    [...quotaKeys.all, "forecast", connectionId ?? "default", timezone, recipientCount, startDate] as const,
};

export const useQuota = (connectionId?: string, enabled = true) => {
  return useQuery({
    queryKey: quotaKeys.detail(connectionId),
    queryFn: () => getQuota(connectionId),
    enabled: enabled,
  });
};

export const useQuotaForecast = (params: { connectionId?: string; timezone?: string; recipientCount?: number; startDate?: string }, enabled = true) => {
  return useQuery({
    queryKey: quotaKeys.forecast(params.connectionId, params.timezone, params.recipientCount, params.startDate),
    queryFn: () => getQuotaForecast(params),
    enabled: enabled,
  });
};
