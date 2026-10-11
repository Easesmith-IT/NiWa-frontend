import { apiClient } from "../../lib/api/api-client";
import type { PaginatedQuotesData, QuoteItem, QuoteSummaryData, QuotesApiResponse } from "./quotes.types";

/**
 * Safely parses API responses for quotation listing.
 * Handles the backend's standard { success: true, data: { quotes: [...], total, page, limit, totalPages, summary } },
 * as well as direct objects and arrays for compatibility.
 * Throws an Error for malformed payloads or failed API responses to prevent masking server errors as empty success states.
 */
export function parseQuotesResponse(responsePayload: unknown): PaginatedQuotesData {
  if (responsePayload === null || responsePayload === undefined) {
    throw new Error("Invalid quotation API response: response payload is empty or missing");
  }

  if (typeof responsePayload !== "object") {
    throw new Error("Invalid quotation API response: response payload must be an object or array");
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

    // Handle explicit API failure response
    if ("success" in obj && obj.success === false) {
      throw new Error(String(obj.message || "Quotation API request reported failure"));
    }

    // Handle { success: true, data: ... } response envelope
    if ("data" in obj && obj.data !== undefined) {
      return parseQuotesResponse(obj.data);
    }

    // Handle paginated data object: { quotes: [...], total, page, limit, totalPages, summary? }
    if ("quotes" in obj) {
      if (!Array.isArray(obj.quotes)) {
        throw new Error("Invalid quotation API response: 'quotes' property must be an array");
      }

      const quotes = obj.quotes as QuoteItem[];
      const total = typeof obj.total === "number" ? obj.total : quotes.length;
      const page = typeof obj.page === "number" ? obj.page : 1;
      const limit = typeof obj.limit === "number" && obj.limit > 0 ? obj.limit : 20;
      const totalPages =
        typeof obj.totalPages === "number"
          ? obj.totalPages
          : Math.max(1, Math.ceil(total / limit));

      let summary: QuoteSummaryData | undefined;
      if ("summary" in obj && typeof obj.summary === "object" && obj.summary !== null) {
        const s = obj.summary as Record<string, unknown>;
        summary = {
          total: typeof s.total === "number" ? s.total : 0,
          sentCount: typeof s.sentCount === "number" ? s.sentCount : 0,
          acceptedCount: typeof s.acceptedCount === "number" ? s.acceptedCount : 0,
          draftCount: typeof s.draftCount === "number" ? s.draftCount : 0,
          declinedCount: typeof s.declinedCount === "number" ? s.declinedCount : 0,
          expiredCount: typeof s.expiredCount === "number" ? s.expiredCount : 0,
          totalValue: typeof s.totalValue === "number" ? s.totalValue : 0,
        };
      }

      return {
        quotes,
        total,
        page,
        limit,
        totalPages,
        summary,
      };
    }
  }

  throw new Error("Invalid quotation API response: unrecognized response structure");
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
