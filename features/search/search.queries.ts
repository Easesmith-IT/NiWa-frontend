import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { getDashboardSummary, getGlobalSearch, getInboxSearch } from "./search.api";

export const useGlobalSearchQuery = (params: { limit?: number; query: string }) =>
  useQuery({
    enabled: params.query.trim().length > 0,
    queryKey: [...queryKeys.search, params.query, params.limit ?? null],
    queryFn: () => getGlobalSearch(params),
  });

export const useInboxSearchQuery = (params: { limit?: number; query: string }) =>
  useQuery({
    enabled: params.query.trim().length > 0,
    queryKey: [...queryKeys.inboxSearch, params.query, params.limit ?? null],
    queryFn: () => getInboxSearch(params),
  });

export const useDashboardSummaryQuery = () =>
  useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummary,
  });
