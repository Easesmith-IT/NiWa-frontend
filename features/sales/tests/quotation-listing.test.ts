import { describe, expect, it } from "vitest";
import { parseQuotesResponse } from "../quotes.api";
import type { QuoteItem, QuotesApiResponse } from "../quotes.types";

describe("Quotation Listing API Response & Lifecycle Contract Suite", () => {
  const sampleQuotes: QuoteItem[] = [
    {
      _id: "6601a01",
      quoteId: "QTE-000001",
      customer: {
        customerId: "cust_1",
        customerType: "PERSON",
        displayName: "Alice Smith",
        email: "alice@example.com",
      },
      status: "SENT",
      currency: "INR",
      subtotal: 1000,
      taxAmount: 180,
      grandTotal: 1180,
      notes: "Urgent delivery requested",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
    {
      _id: "6601a02",
      quoteId: "QTE-000002",
      customer: {
        customerId: "cust_2",
        customerType: "COMPANY",
        displayName: "Acme Corp",
        email: "billing@acme.com",
      },
      status: "ACCEPTED",
      currency: "INR",
      subtotal: 5000,
      taxAmount: 900,
      grandTotal: 5900,
      notes: "Annual contract proposal",
      createdAt: "2026-10-02T11:00:00.000Z",
    },
    {
      _id: "6601a03",
      quoteId: "QTE-000003",
      customer: {
        customerId: "cust_3",
        customerType: "PERSON",
        displayName: "Bob Jones",
        email: "bob@example.com",
      },
      status: "DECLINED",
      currency: "INR",
      subtotal: 2000,
      taxAmount: 360,
      grandTotal: 2360,
      notes: "Budget exceeded",
      createdAt: "2026-10-03T12:00:00.000Z",
    },
    {
      _id: "6601a04",
      quoteId: "QTE-000004",
      customer: {
        customerId: "cust_4",
        customerType: "COMPANY",
        displayName: "Global Dynamics",
        email: "procurement@global.com",
      },
      status: "DRAFT",
      currency: "INR",
      subtotal: 3000,
      taxAmount: 540,
      grandTotal: 3540,
      notes: null,
      createdAt: "2026-10-04T13:00:00.000Z",
    },
    {
      _id: "6601a05",
      quoteId: "QTE-000005",
      customer: {
        customerId: "cust_5",
        customerType: "PERSON",
        displayName: "Charlie Brown",
      },
      status: "EXPIRED",
      currency: "INR",
      subtotal: 1500,
      taxAmount: 270,
      grandTotal: 1770,
      notes: "Validity past 30 days",
      createdAt: "2026-09-01T09:00:00.000Z",
    },
  ];

  it("1. Parses the authoritative backend nested envelope: { success: true, data: { quotes, total, page, limit, totalPages } }", () => {
    const backendResponse: QuotesApiResponse = {
      success: true,
      data: {
        quotes: sampleQuotes,
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };

    const parsed = parseQuotesResponse(backendResponse);

    expect(Array.isArray(parsed.quotes)).toBe(true);
    expect(parsed.quotes.length).toBe(5);
    expect(parsed.total).toBe(5);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
    expect(parsed.totalPages).toBe(1);
    expect(parsed.quotes[0].quoteId).toBe("QTE-000001");
    expect(parsed.quotes[1].customer?.displayName).toBe("Acme Corp");
  });

  it("2. Parses an empty quotation list without crashing and returns safe defaults", () => {
    const emptyResponse = {
      success: true,
      data: {
        quotes: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };

    const parsed = parseQuotesResponse(emptyResponse);

    expect(Array.isArray(parsed.quotes)).toBe(true);
    expect(parsed.quotes.length).toBe(0);
    expect(parsed.total).toBe(0);
    expect(parsed.page).toBe(1);
    expect(parsed.totalPages).toBe(0);
  });

  it("3. Handles direct paginated object or raw array for backward compatibility", () => {
    // Direct paginated object without outer { success, data }
    const directPaginated = {
      quotes: [sampleQuotes[0]],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const parsedDirect = parseQuotesResponse(directPaginated);
    expect(parsedDirect.quotes.length).toBe(1);
    expect(parsedDirect.total).toBe(1);

    // Direct array
    const directArray = [sampleQuotes[0], sampleQuotes[1]];
    const parsedArray = parseQuotesResponse(directArray);
    expect(parsedArray.quotes.length).toBe(2);
    expect(parsedArray.total).toBe(2);
    expect(parsedArray.totalPages).toBe(1);
  });

  it("4. Rejects malformed API responses and throws errors instead of silently converting to empty success", () => {
    expect(() => parseQuotesResponse(null)).toThrow(/empty or missing/i);
    expect(() => parseQuotesResponse(undefined)).toThrow(/empty or missing/i);
    expect(() => parseQuotesResponse({})).toThrow(/unrecognized response structure/i);
    expect(() => parseQuotesResponse("invalid string")).toThrow(/must be an object or array/i);
    expect(() => parseQuotesResponse({ success: false, message: "Database failure" })).toThrow(/Database failure/i);
    expect(() => parseQuotesResponse({ quotes: "not an array" })).toThrow(/'quotes' property must be an array/i);
  });

  it("5. Parses workspace-wide summary metrics alongside paginated page records", () => {
    const multiPageResponse = {
      success: true,
      data: {
        quotes: [sampleQuotes[0], sampleQuotes[1]], // only 2 items on page 1
        total: 5, // 5 total matching filter
        page: 1,
        limit: 2,
        totalPages: 3,
        summary: {
          total: 10, // 10 total across entire workspace
          sentCount: 3,
          acceptedCount: 4,
          draftCount: 2,
          declinedCount: 1,
          expiredCount: 0,
          totalValue: 125000,
        },
      },
    };

    const parsed = parseQuotesResponse(multiPageResponse);

    expect(parsed.quotes.length).toBe(2);
    expect(parsed.total).toBe(5);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(2);
    expect(parsed.totalPages).toBe(3);

    expect(parsed.summary).toBeDefined();
    expect(parsed.summary?.total).toBe(10);
    expect(parsed.summary?.sentCount).toBe(3);
    expect(parsed.summary?.acceptedCount).toBe(4);
    expect(parsed.summary?.totalValue).toBe(125000);
    expect(parsed.summary?.totalValueByCurrency).toEqual([
      { currency: "INR", totalValue: 125000, count: 0 },
    ]);
  });

  it("6. Parses multi-currency summary breakdown and sets totalValue to null to prevent misleading sums", () => {
    const multiCurrencyResponse = {
      success: true,
      data: {
        quotes: sampleQuotes,
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
        summary: {
          total: 8,
          sentCount: 3,
          acceptedCount: 2,
          draftCount: 3,
          declinedCount: 0,
          expiredCount: 0,
          totalValueByCurrency: [
            { currency: "EUR", totalValue: 4500, count: 2 },
            { currency: "INR", totalValue: 50000, count: 3 },
            { currency: "USD", totalValue: 1200, count: 1 },
          ],
          totalValue: null,
        },
      },
    };

    const parsed = parseQuotesResponse(multiCurrencyResponse);
    expect(parsed.summary).toBeDefined();
    expect(parsed.summary?.totalValue).toBeNull();
    expect(parsed.summary?.totalValueByCurrency.length).toBe(3);
    expect(parsed.summary?.totalValueByCurrency[0]).toEqual({ currency: "EUR", totalValue: 4500, count: 2 });
    expect(parsed.summary?.totalValueByCurrency[1]).toEqual({ currency: "INR", totalValue: 50000, count: 3 });
    expect(parsed.summary?.totalValueByCurrency[2]).toEqual({ currency: "USD", totalValue: 1200, count: 1 });
  });

  it("7. Formats distinct currencies with their proper symbols and never labels mixed amounts as USD", async () => {
    const { formatCurrency, getCurrencySymbol } = await import("../utils/currency-formatter");

    const inrFormatted = formatCurrency(50000, "INR", "en-IN");
    const usdFormatted = formatCurrency(1200, "USD", "en-US");
    const eurFormatted = formatCurrency(4500, "EUR", "en-US");
    const gbpFormatted = formatCurrency(950, "GBP", "en-US");

    expect(inrFormatted).toContain("₹");
    expect(usdFormatted).toContain("$");
    expect(eurFormatted).toContain("€");
    expect(gbpFormatted).toContain("£");

    // Symbol retrieval
    expect(getCurrencySymbol("INR")).toBe("₹");
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("GBP")).toBe("£");

    // A multi-currency list must NEVER be combined into a single dollar sum
    const currencies = [
      { currency: "INR", totalValue: 50000 },
      { currency: "USD", totalValue: 1200 },
    ];
    // Each must be formatted in its own currency
    const formattedList = currencies.map((c) => formatCurrency(c.totalValue, c.currency));
    expect(formattedList[0]).not.toContain("$");
    expect(formattedList[0]).toContain("₹");
    expect(formattedList[1]).toContain("$");
  });

  it("8. Filters parsed quotations by status, search term across quote ID, customer name, and notes", () => {
    const parsed = parseQuotesResponse({
      success: true,
      data: {
        quotes: sampleQuotes,
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });

    const quotes = parsed.quotes;

    // Filter by search term: "Acme"
    const searchAcme = quotes.filter((q) => {
      const term = "acme";
      return (
        q.quoteId.toLowerCase().includes(term) ||
        (q.customer?.displayName && q.customer.displayName.toLowerCase().includes(term)) ||
        (q.notes && q.notes.toLowerCase().includes(term))
      );
    });
    expect(searchAcme.length).toBe(1);
    expect(searchAcme[0].quoteId).toBe("QTE-000002");

    // Filter by search term: "Urgent" (matches in notes)
    const searchUrgent = quotes.filter((q) => {
      const term = "urgent";
      return (
        q.quoteId.toLowerCase().includes(term) ||
        (q.customer?.displayName && q.customer.displayName.toLowerCase().includes(term)) ||
        (q.notes && q.notes.toLowerCase().includes(term))
      );
    });
    expect(searchUrgent.length).toBe(1);
    expect(searchUrgent[0].quoteId).toBe("QTE-000001");

    // Filter by status: ACCEPTED
    const acceptedOnly = quotes.filter((q) => q.status === "ACCEPTED");
    expect(acceptedOnly.length).toBe(1);
    expect(acceptedOnly[0].quoteId).toBe("QTE-000002");
  });

  it("9. Calculates summary KPI statistics accurately from parsed quotes fallback when summary is absent", () => {
    const parsed = parseQuotesResponse({
      success: true,
      data: {
        quotes: sampleQuotes,
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });

    const quotes = parsed.quotes;
    const totalCount = parsed.total;
    const sentCount = quotes.filter((q) => q.status === "SENT").length;
    const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;
    const totalValue = quotes
      .filter((q) => q.status !== "DECLINED" && q.status !== "EXPIRED")
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    expect(totalCount).toBe(5);
    expect(sentCount).toBe(1); // QTE-000001
    expect(acceptedCount).toBe(1); // QTE-000002
    // totalValue: QTE-1 (1180) + QTE-2 (5900) + QTE-4 (3540) = 10620 (DECLINED 2360 and EXPIRED 1770 excluded)
    expect(totalValue).toBe(10620);
  });

  it("10. Safely removes action=create and preserves all other query parameters", () => {
    const url = new URL("https://app.niwa.local/sales/quotes?action=create&search=acme&status=SENT&page=2");
    const params = new URLSearchParams(url.search);

    expect(params.get("action")).toBe("create");
    expect(params.get("search")).toBe("acme");
    expect(params.get("status")).toBe("SENT");
    expect(params.get("page")).toBe("2");

    params.delete("action");

    const nextQuery = params.toString();
    expect(nextQuery).toBe("search=acme&status=SENT&page=2");
    expect(params.get("action")).toBeNull();

    const currentPath = "/sales/quotes";
    const resultingUrl = nextQuery ? `${currentPath}?${nextQuery}` : currentPath;
    expect(resultingUrl).toBe("/sales/quotes?search=acme&status=SENT&page=2");
  });
});
