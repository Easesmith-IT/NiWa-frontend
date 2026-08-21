"use client";

import { useDeferredValue, useState } from "react";
import { useGlobalSearchV1Query, useInboxSearchV1Query } from "../search.queries";

export const formatSearchTimestamp = (value?: string) =>
  value ? new Date(value).toLocaleString() : "No timestamp";

export function useSearchOrchestration() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const canSearch = deferredQuery.length >= 2;

  const globalSearchQuery = useGlobalSearchV1Query({ limit: 8, query: canSearch ? deferredQuery : "" });
  const inboxSearchQuery = useInboxSearchV1Query({ limit: 6, query: canSearch ? deferredQuery : "" });

  const totals = globalSearchQuery.data?.data.totals;
  const isLoading = globalSearchQuery.isFetching || inboxSearchQuery.isFetching;
  const hasError = globalSearchQuery.isError || inboxSearchQuery.isError;
  const hasResults =
    (totals?.contacts ?? 0) +
      (totals?.messages ?? 0) +
      (totals?.notes ?? 0) +
      (inboxSearchQuery.data?.metadata.total ?? 0) >
    0;

  return {
    query,
    setQuery,
    deferredQuery,
    canSearch,
    globalSearchQuery,
    inboxSearchQuery,
    totals,
    isLoading,
    hasError,
    hasResults,
  };
}
