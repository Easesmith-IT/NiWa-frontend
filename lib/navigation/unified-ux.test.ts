import { describe, it, expect } from "vitest";
import {
  navigationGroups,
  routeMeta,
  filterNavigationByModules,
} from "../../components/layout/navigation";

describe("Unified UX Navigation Specification Compliance", () => {
  it("includes all essential operational and workflow routes in navigationGroups", () => {
    const allHrefs = navigationGroups.flatMap((g) => g.items.map((i) => i.href));

    // P2 Workflow routes
    expect(allHrefs).toContain("/sales/quotes");
    expect(allHrefs).toContain("/purchasing/returns");
    expect(allHrefs).toContain("/crm/customer-360");
    expect(allHrefs).toContain("/leads");
    expect(allHrefs).toContain("/ai-calling");
  });

  it("registers route metadata for all newly added unified UX routes", () => {
    expect(routeMeta.has("/sales/quotes")).toBe(true);
    expect(routeMeta.has("/purchasing/returns")).toBe(true);
    expect(routeMeta.has("/crm/customer-360")).toBe(true);
    expect(routeMeta.has("/leads")).toBe(true);
    expect(routeMeta.has("/ai-calling")).toBe(true);
  });

  it("correctly filters AI Calling when module entitlement changes", () => {
    // When ai_calling is not enabled, /ai-calling is filtered out
    const disabled = filterNavigationByModules(navigationGroups, ["crm", "sales"]);
    const disabledHrefs = disabled.flatMap((g) => g.items.map((i) => i.href));
    expect(disabledHrefs).not.toContain("/ai-calling");

    // When ai_calling is enabled, /ai-calling is present
    const enabled = filterNavigationByModules(navigationGroups, ["crm", "sales", "ai_calling"]);
    const enabledHrefs = enabled.flatMap((g) => g.items.map((i) => i.href));
    expect(enabledHrefs).toContain("/ai-calling");
  });

  it("correctly filters Sales Quotes when sales module entitlement changes", () => {
    const withoutSales = filterNavigationByModules(navigationGroups, ["crm"]);
    const withoutSalesHrefs = withoutSales.flatMap((g) => g.items.map((i) => i.href));
    expect(withoutSalesHrefs).not.toContain("/sales/quotes");

    const withSales = filterNavigationByModules(navigationGroups, ["sales"]);
    const withSalesHrefs = withSales.flatMap((g) => g.items.map((i) => i.href));
    expect(withSalesHrefs).toContain("/sales/quotes");
  });
});
