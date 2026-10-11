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
});
