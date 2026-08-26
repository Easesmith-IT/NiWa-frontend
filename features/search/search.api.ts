import { apiClient } from "../../lib/api/api-client";
import type {
  DashboardSummaryResponse,
  GlobalSearchResponse,
  InboxSearchResponse,
} from "./search.types";

export const getGlobalSearch = async (params: { limit?: number; query: string }) => {
  const response = await apiClient.get<GlobalSearchResponse>("/search", {
    params,
  });
  return response.data;
};

export const getInboxSearch = async (params: { limit?: number; query: string }) => {
  const response = await apiClient.get<InboxSearchResponse>("/search/inbox", {
    params,
  });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await apiClient.get<DashboardSummaryResponse>("/dashboard");
  return response.data;
};
