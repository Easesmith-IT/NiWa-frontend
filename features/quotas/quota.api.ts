import { v1ApiClient } from "../../lib/api/v1-client";
import type {
  QuotaData,
  QuotaForecastQueryParams,
  QuotaForecastResponse,
} from "./quota.types";

export * from "./quota.types";

export const getQuota = async (connectionId?: string) => {
  const { data } = await v1ApiClient.get<{ data: QuotaData }>("/quotas", {
    params: { connectionId },
  });
  return data.data;
};

export const getQuotaForecast = async (params: QuotaForecastQueryParams) => {
  const { data } = await v1ApiClient.get<QuotaForecastResponse>("/quotas/forecast", {
    params,
  });
  return data;
};
