import { describe, it, expect } from "vitest";
import { filterNavigationByModules, NavigationGroup } from "../../components/layout/navigation";
import { LayoutDashboard, Inbox, ContactRound, Briefcase, Package, Boxes } from "lucide-react";

describe("Frontend Navigation Module Filtering", () => {
  const mockGroups: NavigationGroup[] = [
    {
      label: "Workspace",
      items: [
        {
          href: "/",
          icon: LayoutDashboard,
          label: "Dashboard",
          description: "Dashboard",
        },
        {
          href: "/inbox",
          icon: Inbox,
          label: "Inbox",
          description: "Inbox",
        },
      ],
    },
    {
      label: "CRM",
      moduleKey: "crm",
      items: [
        {
          href: "/contacts",
          icon: ContactRound,
          label: "Contacts",
          description: "Contacts",
        },
        {
          href: "/deals",
          icon: Briefcase,
          label: "Deals",
          description: "Deals",
        },
      ],
    },
    {
      label: "Catalog",
      moduleKey: "products",
      items: [
        {
          href: "/products",
          icon: Package,
          label: "Products",
          description: "Products",
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          href: "/inventory",
          icon: Boxes,
          label: "Inventory",
          description: "Inventory",
          moduleKey: "inventory",
        },
      ],
    },
  ];

  it("always keeps core workspace items without moduleKey", () => {
    const filtered = filterNavigationByModules(mockGroups, []);
    expect(filtered.length).toBe(1);
    expect(filtered[0].label).toBe("Workspace");
    expect(filtered[0].items.map((i) => i.label)).toEqual(["Dashboard", "Inbox"]);
  });

  it("includes modules when they are in enabledModuleKeys", () => {
    const filtered = filterNavigationByModules(mockGroups, ["crm", "products"]);
    expect(filtered.map((g) => g.label)).toEqual(["Workspace", "CRM", "Catalog"]);
  });

  it("hides groups when their module is not enabled", () => {
    const filtered = filterNavigationByModules(mockGroups, ["crm"]);
    const labels = filtered.map((g) => g.label);
    expect(labels).toContain("Workspace");
    expect(labels).toContain("CRM");
    expect(labels).not.toContain("Catalog");
    expect(labels).not.toContain("Operations");
  });

  it("hides individual items whose moduleKey is disabled even if group has no moduleKey", () => {
    // When inventory is enabled, Operations group appears
    const withInventory = filterNavigationByModules(mockGroups, ["inventory"]);
    expect(withInventory.map((g) => g.label)).toContain("Operations");

    // When inventory is not enabled, Operations group has 0 items and is omitted
    const withoutInventory = filterNavigationByModules(mockGroups, ["crm"]);
    expect(withoutInventory.map((g) => g.label)).not.toContain("Operations");
  });
});
