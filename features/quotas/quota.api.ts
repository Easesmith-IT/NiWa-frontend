import { apiClient } from "../../lib/api/api-client";
import type {
  QuotaData,
  QuotaForecastQueryParams,
  QuotaForecastResponse,
} from "./quota.types";

export * from "./quota.types";

export const getQuota = async (connectionId?: string) => {
  const { data } = await apiClient.get<{ data: QuotaData }>("/quotas", {
    params: { connectionId },
  });
  return data.data;
};

export const getQuotaForecast = async (params: QuotaForecastQueryParams) => {
  const { data } = await apiClient.get<QuotaForecastResponse>("/quotas/forecast", {
    params,
  });
  return data;
};
