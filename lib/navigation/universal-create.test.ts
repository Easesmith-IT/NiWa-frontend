import { describe, it, expect } from "vitest";
import {
  UNIVERSAL_CREATE_CONFIG,
  filterCreateOptionsByEnabledModules,
} from "../../components/layout/universal-create-modal";

describe("Universal Create Options Specification & Entitlement Compliance", () => {
  it("contains all 8 required universal creation options", () => {
    const ids = UNIVERSAL_CREATE_CONFIG.map((c) => c.id);
    expect(ids).toEqual([
      "lead",
      "deal",
      "quote",
      "sales-order",
      "contact",
      "product",
      "purchase-order",
      "task",
    ]);
  });

  it("configures direct full-page creation routes or listing create triggers for all route-backed options", () => {
    const quote = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "quote");
    expect(quote?.directRoute).toBe("/sales/quotes?action=create");
    expect(quote?.moduleKey).toBe("sales");

    const salesOrder = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "sales-order");
    expect(salesOrder?.directRoute).toBe("/sales/orders?action=create");
    expect(salesOrder?.moduleKey).toBe("sales");

    const product = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "product");
    expect(product?.directRoute).toBe("/products/new");
    expect(product?.moduleKey).toBe("products");

    const purchaseOrder = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "purchase-order");
    expect(purchaseOrder?.directRoute).toBe("/purchasing/orders/new");
    expect(purchaseOrder?.moduleKey).toBe("purchasing");
  });

  it("configures dedicated modal actions for Lead, Deal, Contact, and Task", () => {
    const lead = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "lead");
    expect(lead?.modalAction).toBe("lead");
    expect(lead?.moduleKey).toBe("crm");

    const deal = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "deal");
    expect(deal?.modalAction).toBe("deal");
    expect(deal?.moduleKey).toBe("crm");

    const contact = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "contact");
    expect(contact?.modalAction).toBe("contact");
    expect(contact?.moduleKey).toBe("crm");

    const task = UNIVERSAL_CREATE_CONFIG.find((c) => c.id === "task");
    expect(task?.modalAction).toBe("task");
    expect(task?.moduleKey).toBe("crm");
  });

  it("filters out options when their parent modules are not enabled", () => {
    // Only core CRM enabled
    const crmOnly = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, ["crm"]);
    const crmOnlyIds = crmOnly.map((c) => c.id);
    expect(crmOnlyIds).toEqual(["lead", "deal", "contact", "task"]);
    expect(crmOnlyIds).not.toContain("quote");
    expect(crmOnlyIds).not.toContain("sales-order");
    expect(crmOnlyIds).not.toContain("product");
    expect(crmOnlyIds).not.toContain("purchase-order");

    // CRM + Sales enabled
    const withSales = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, ["crm", "sales"]);
    const withSalesIds = withSales.map((c) => c.id);
    expect(withSalesIds).toContain("quote");
    expect(withSalesIds).toContain("sales-order");
    expect(withSalesIds).not.toContain("product");
    expect(withSalesIds).not.toContain("purchase-order");

    // CRM + Products + Purchasing
    const withOps = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, [
      "crm",
      "products",
      "purchasing",
    ]);
    const withOpsIds = withOps.map((c) => c.id);
    expect(withOpsIds).toContain("product");
    expect(withOpsIds).toContain("purchase-order");
    expect(withOpsIds).not.toContain("quote");
    expect(withOpsIds).not.toContain("sales-order");

    // All enabled
    const allEnabled = filterCreateOptionsByEnabledModules(UNIVERSAL_CREATE_CONFIG, [
      "crm",
      "sales",
      "products",
      "purchasing",
    ]);
    expect(allEnabled.length).toBe(8);
  });
});
