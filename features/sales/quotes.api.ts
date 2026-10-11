import { apiClient } from "../../lib/api/api-client";
import type { PaginatedQuotesData, QuoteItem, QuotesApiResponse } from "./quotes.types";

/**
 * Safely parses API responses for quotation listing.
 * Handles the backend's standard { success: true, data: { quotes: [...], total, page, limit, totalPages } },
 * as well as direct objects and arrays for compatibility.
 */
export function parseQuotesResponse(responsePayload: unknown): PaginatedQuotesData {
  if (!responsePayload) {
    return { quotes: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  // Handle direct array response: [quote1, quote2, ...]
  if (Array.isArray(responsePayload)) {
    return {
      quotes: responsePayload as QuoteItem[],
      total: responsePayload.length,
      page: 1,
      limit: responsePayload.length || 20,
      totalPages: 1,
    };
  }

  if (typeof responsePayload === "object") {
    const obj = responsePayload as Record<string, unknown>;

    // Handle { success: true, data: ... } response envelope
    if ("data" in obj && obj.data !== undefined) {
      return parseQuotesResponse(obj.data);
    }

    // Handle paginated data object: { quotes: [...], total, page, limit, totalPages }
    if ("quotes" in obj && Array.isArray(obj.quotes)) {
      const quotes = obj.quotes as QuoteItem[];
      const total = typeof obj.total === "number" ? obj.total : quotes.length;
      const page = typeof obj.page === "number" ? obj.page : 1;
      const limit = typeof obj.limit === "number" && obj.limit > 0 ? obj.limit : 20;
      const totalPages =
        typeof obj.totalPages === "number"
          ? obj.totalPages
          : Math.max(1, Math.ceil(total / limit));

      return {
        quotes,
        total,
        page,
        limit,
        totalPages,
      };
    }
  }

  return { quotes: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export interface FetchQuotesParams {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
}

export async function fetchQuotes(params?: FetchQuotesParams): Promise<PaginatedQuotesData> {
  const queryParams: Record<string, string | number> = {};
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.search) queryParams.search = params.search;
  if (params?.customerId) queryParams.customerId = params.customerId;

  const res = await apiClient.get<QuotesApiResponse>("/api/sales/quotes", {
    params: queryParams,
  });

  return parseQuotesResponse(res.data);
}
