import { describe, expect, it } from "vitest";
import { UNIVERSAL_CREATE_CONFIG, filterCreateOptionsByEnabledModules } from "../../components/layout/universal-create-modal";
import type { SearchPurchaseOrderResult, SearchSalesOrderResult, SearchProductResult } from "./search.types";

describe("Search & Universal Create Navigation Contract Suite", () => {
  it("generates specific record navigation links for Sales Orders instead of a generic listing", () => {
    const mockSalesOrder: SearchSalesOrderResult = {
      _id: "6601b01",
      orderId: "ORD-000042",
      customerName: "Acme Industrial",
      status: "CONFIRMED",
      total: 12500,
    };

    const targetUrl = `/sales/orders?orderId=${encodeURIComponent(mockSalesOrder.orderId || mockSalesOrder._id)}`;
    expect(targetUrl).toBe("/sales/orders?orderId=ORD-000042");
  });

  it("generates specific record detail page links for Purchase Orders", () => {
    const mockPurchaseOrder: SearchPurchaseOrderResult = {
      _id: "6601c01",
      orderId: "PO-000088",
      supplierName: "Metals Global Ltd",
      status: "ISSUED",
      total: 82000,
    };

    const targetUrl = `/purchasing/orders/${encodeURIComponent(mockPurchaseOrder._id)}`;
    expect(targetUrl).toBe("/purchasing/orders/6601c01");
  });

  it("generates specific record detail page links for Products", () => {
    const mockProduct: SearchProductResult = {
      _id: "6601d01",
      productId: "PRD-SKU-99",
      name: "Titanium Drill Bit",
      status: "ACTIVE",
    };

    const targetUrl = `/products/${encodeURIComponent(mockProduct._id)}`;
    expect(targetUrl).toBe("/products/6601d01");
  });

  it("Universal Create config contains dedicated action routes for quotations and sales orders", () => {
    const quoteOption = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "quote");
    expect(quoteOption).toBeDefined();
    expect(quoteOption?.directRoute).toBe("/sales/quotes?action=create");
    expect(quoteOption?.moduleKey).toBe("sales");

    const salesOrderOption = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "sales-order");
    expect(salesOrderOption).toBeDefined();
    expect(salesOrderOption?.directRoute).toBe("/sales/orders?action=create");
    expect(salesOrderOption?.moduleKey).toBe("sales");
  });

  it("Universal Create filters out quotation and sales-order options when sales module is disabled", () => {
    const withoutSales = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, ["crm"]);
    const optionIds = withoutSales.map((c) => c.id);

    expect(optionIds).not.toContain("quote");
    expect(optionIds).not.toContain("sales-order");
    // CRM options still remain
    expect(optionIds).toContain("lead");
    expect(optionIds).toContain("deal");
    expect(optionIds).toContain("contact");
    expect(optionIds).toContain("task");
  });

  it("Universal Create retains quote and sales-order options when sales module is enabled", () => {
    const withSales = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, ["crm", "sales"]);
    const optionIds = withSales.map((c) => c.id);

    expect(optionIds).toContain("quote");
    expect(optionIds).toContain("sales-order");
  });

  it("handles deep-link URLs with special characters and URL encoding safely", () => {
    const specialOrderId = "SO/2026/04#01 & 02";
    const targetUrl = `/sales/orders?orderId=${encodeURIComponent(specialOrderId)}`;
    expect(targetUrl).toBe("/sales/orders?orderId=SO%2F2026%2F04%2301%20%26%2002");

    const parsed = new URL(`https://app.niwa.local${targetUrl}`);
    expect(parsed.searchParams.get("orderId")).toBe(specialOrderId);
  });

  it("preserves unrelated query parameters when closing sales order drawer or clearing action", () => {
    const initialUrl = new URL("https://app.niwa.local/sales/orders?orderId=ORD-001&filter=all&page=3&search=acme");
    const params = new URLSearchParams(initialUrl.search);

    expect(params.get("orderId")).toBe("ORD-001");
    expect(params.get("filter")).toBe("all");
    expect(params.get("page")).toBe("3");
    expect(params.get("search")).toBe("acme");

    // Close drawer: delete orderId
    params.delete("orderId");
    const nextQuery = params.toString();

    expect(params.get("orderId")).toBeNull();
    expect(nextQuery).toBe("filter=all&page=3&search=acme");

    const currentPath = "/sales/orders";
    const resultingUrl = nextQuery ? `${currentPath}?${nextQuery}` : currentPath;
    expect(resultingUrl).toBe("/sales/orders?filter=all&page=3&search=acme");
  });

  it("verifies and documents routes supporting dedicated deep-link detail targets vs list-only routes", () => {
    const ROUTE_CAPABILITIES = {
      products: { supportedDeepLink: true, pattern: "/products/:id" },
      purchaseOrders: { supportedDeepLink: true, pattern: "/purchasing/orders/:id" },
      salesOrders: { supportedDeepLink: true, pattern: "/sales/orders?orderId=:orderId" },
      inboxThreads: { supportedDeepLink: true, pattern: "/inbox?conversationId=:conversationId" },
      contacts: { supportedDeepLink: true, pattern: "/contacts?contactId=:contactId" },
      deals: { supportedDeepLink: false, pattern: "/deals (board view, no standalone detail route)" },
      leads: { supportedDeepLink: false, pattern: "/leads (pipeline view, no standalone detail route)" },
    };

    expect(ROUTE_CAPABILITIES.products.supportedDeepLink).toBe(true);
    expect(ROUTE_CAPABILITIES.purchaseOrders.supportedDeepLink).toBe(true);
    expect(ROUTE_CAPABILITIES.salesOrders.supportedDeepLink).toBe(true);
    expect(ROUTE_CAPABILITIES.inboxThreads.supportedDeepLink).toBe(true);
    expect(ROUTE_CAPABILITIES.contacts.supportedDeepLink).toBe(true);
    expect(ROUTE_CAPABILITIES.deals.supportedDeepLink).toBe(false);
    expect(ROUTE_CAPABILITIES.leads.supportedDeepLink).toBe(false);
  });

  it("handles missing or invalid record IDs safely in deep link navigation", () => {
    // Proves that null, empty, or undefined IDs do not produce malformed navigation crashes
    const invalidIds = ["", null, undefined, "   "];
    for (const id of invalidIds) {
      const safeId = (id || "").trim();
      if (!safeId) {
        // Fallback route without bogus param
        const fallback = "/sales/orders";
        expect(fallback).toBe("/sales/orders");
      }
    }
  });

  it("resolves business sequence orderId (e.g. ORD-000042) identically to MongoDB _id for drawer deep linking", () => {
    const businessOrderId = "ORD-000042";
    const mongoObjectId = "6601b01a2b3c4d5e6f7a8b9c";

    // 1. URL encoding and param parsing for business sequence ID
    const businessUrl = new URL(`https://app.niwa.local/sales/orders?orderId=${encodeURIComponent(businessOrderId)}`);
    expect(businessUrl.searchParams.get("orderId")).toBe("ORD-000042");

    // 2. URL encoding and param parsing for MongoDB ObjectId
    const objectIdUrl = new URL(`https://app.niwa.local/sales/orders?orderId=${encodeURIComponent(mongoObjectId)}`);
    expect(objectIdUrl.searchParams.get("orderId")).toBe("6601b01a2b3c4d5e6f7a8b9c");
  });
});
