"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoiceSettings, WorkspaceInvoiceSettings } from "lib/api/sales-api";
import { queryKeys } from "lib/api/query-keys";
import { getCurrencySymbol, normalizeCurrencyCode } from "lib/utils/format-currency";

export interface WorkspaceCurrencyInfo {
  currency: string;
  symbol: string;
  isLoading: boolean;
}

export function useWorkspaceDefaultCurrency(): WorkspaceCurrencyInfo {
  const { data: invoiceSettings, isLoading } = useQuery<WorkspaceInvoiceSettings | null>({
    queryKey: queryKeys.invoiceSettings,
    queryFn: getInvoiceSettings,
    staleTime: 5 * 60 * 1000,
  });

  const currency = normalizeCurrencyCode(invoiceSettings?.defaultCurrency || "INR");
  const symbol = getCurrencySymbol(currency);

  return {
    currency,
    symbol,
    isLoading,
  };
}
