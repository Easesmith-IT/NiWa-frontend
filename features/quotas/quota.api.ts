import { v1ApiClient } from "../../lib/api/v1-client";

export interface QuotaData {
  limit: number;
  used: number;
  reserved: number;
  released: number;
  available: number;
  dateString: string;
}

export interface QuotaForecastResponse {
  data: {
    forecast: number;
  };
}

export const getQuota = async (connectionId?: string) => {
  const { data } = await v1ApiClient.get<{ data: QuotaData }>("/quotas", {
    params: { connectionId },
  });
  return data.data;
};

export const getQuotaForecast = async (params: { connectionId?: string; timezone?: string; recipientCount?: number; startDate?: string }) => {
  const { data } = await v1ApiClient.get<any>("/quotas/forecast", {
    params,
  });
  return data;
};
