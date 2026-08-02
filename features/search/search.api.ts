import { v1ApiClient } from "../../lib/api/v1-client";
import type {
  DashboardSummaryResponseV1,
  GlobalSearchResponseV1,
  InboxSearchResponseV1,
} from "./search.types";

export const getGlobalSearchV1 = async (params: { limit?: number; query: string }) => {
  const response = await v1ApiClient.get<GlobalSearchResponseV1>("/search", {
    params,
  });
  return response.data;
};

export const getInboxSearchV1 = async (params: { limit?: number; query: string }) => {
  const response = await v1ApiClient.get<InboxSearchResponseV1>("/search/inbox", {
    params,
  });
  return response.data;
};

export const getDashboardSummaryV1 = async () => {
  const response = await v1ApiClient.get<DashboardSummaryResponseV1>("/dashboard");
  return response.data;
};
