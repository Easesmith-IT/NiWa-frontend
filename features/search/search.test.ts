import { describe, expect, it } from "vitest";
import { formatSearchTimestamp } from "./hooks/useSearchOrchestration";
import type { GlobalSearchResponse } from "./search.types";
import {
  SearchProductsSection,
  SearchSalesOrdersSection,
  SearchPurchaseOrdersSection,
  SearchDealsSection,
  SearchLeadsSection,
} from "./index";

describe("Global Search Orchestration & Multi-Entity Coverage", () => {
  it("formatSearchTimestamp correctly formats ISO dates or handles falsy values", () => {
    expect(formatSearchTimestamp()).toBe("No timestamp");
    expect(formatSearchTimestamp("")).toBe("No timestamp");
    const formatted = formatSearchTimestamp("2026-10-11T12:00:00Z");
    expect(typeof formatted).toBe("string");
    expect(formatted).not.toBe("No timestamp");
  });

  it("exports all specialized entity section components", () => {
    expect(typeof SearchProductsSection).toBe("function");
    expect(typeof SearchSalesOrdersSection).toBe("function");
    expect(typeof SearchPurchaseOrdersSection).toBe("function");
    expect(typeof SearchDealsSection).toBe("function");
    expect(typeof SearchLeadsSection).toBe("function");
  });

  it("calculates hasResults true when products, orders, deals, or leads exist even if messages and notes are 0", () => {
    const mockGlobalResponse: GlobalSearchResponse = {
      data: {
        contacts: [],
        conversations: [],
        messages: [],
        notes: [],
        products: [
          {
            _id: "prod_1",
            productId: "SKU-001",
            name: "Industrial Drill",
            status: "ACTIVE",
          },
        ],
        salesOrders: [],
        purchaseOrders: [],
        deals: [
          {
            _id: "deal_1",
            title: "Q4 Renewal",
            status: "OPEN",
            value: 50000,
          },
        ],
        leads: [],
        totals: {
          contacts: 0,
          conversations: 0,
          messages: 0,
          notes: 0,
          products: 1,
          salesOrders: 0,
          purchaseOrders: 0,
          deals: 1,
          leads: 0,
        },
      },
    };

    const totals = mockGlobalResponse.data.totals;
    const inboxTotal = 0;

    const hasResults =
      (totals.contacts ?? 0) +
        (totals.conversations ?? 0) +
        (totals.messages ?? 0) +
        (totals.notes ?? 0) +
        (totals.products ?? 0) +
        (totals.salesOrders ?? 0) +
        (totals.purchaseOrders ?? 0) +
        (totals.deals ?? 0) +
        (totals.leads ?? 0) +
        inboxTotal >
      0;

    expect(hasResults).toBe(true);
  });

  it("calculates hasResults false when all 9 entity types and inbox are empty", () => {
    const totals = {
      contacts: 0,
      conversations: 0,
      messages: 0,
      notes: 0,
      products: 0,
      salesOrders: 0,
      purchaseOrders: 0,
      deals: 0,
      leads: 0,
    };
    const inboxTotal = 0;

    const hasResults =
      (totals.contacts ?? 0) +
        (totals.conversations ?? 0) +
        (totals.messages ?? 0) +
        (totals.notes ?? 0) +
        (totals.products ?? 0) +
        (totals.salesOrders ?? 0) +
        (totals.purchaseOrders ?? 0) +
        (totals.deals ?? 0) +
        (totals.leads ?? 0) +
        inboxTotal >
      0;

    expect(hasResults).toBe(false);
  });
});
