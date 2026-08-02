import { useQuery } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { getDashboardSummaryV1, getGlobalSearchV1, getInboxSearchV1 } from "./search.api";

export const useGlobalSearchV1Query = (params: { limit?: number; query: string }) =>
  useQuery({
    enabled: params.query.trim().length > 0,
    queryKey: [...v1QueryKeys.search, params.query, params.limit ?? null],
    queryFn: () => getGlobalSearchV1(params),
  });

export const useInboxSearchV1Query = (params: { limit?: number; query: string }) =>
  useQuery({
    enabled: params.query.trim().length > 0,
    queryKey: [...v1QueryKeys.inboxSearch, params.query, params.limit ?? null],
    queryFn: () => getInboxSearchV1(params),
  });

export const useDashboardSummaryV1Query = () =>
  useQuery({
    queryKey: v1QueryKeys.dashboard,
    queryFn: getDashboardSummaryV1,
  });
