import { describe, expect, it } from "vitest";
import type { CrmViewRecord } from "./views.types";

describe("Frontend CRM Views Contract", () => {
  it("constructs a valid CrmViewRecord according to Phase 4B canonical contract", () => {
    const view: CrmViewRecord = {
      _id: "view_123",
      workspaceId: "ws_456",
      objectKey: "Deal",
      name: "High Value Deals",
      description: "Deals over 50k",
      visibilityScope: "workspace",
      ownerUserId: "user_789",
      isDefault: true,
      sorting: [{ field: "value", direction: "desc" }],
      visibleFields: ["title", "value", "status"],
      columnOrder: ["title", "value", "status"],
      columnWidths: { title: 200, value: 150 },
      filterAst: {
        type: "PREDICATE",
        field: "value",
        comparator: ">=",
        value: 50000,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(view.objectKey).toBe("Deal");
    expect(view.visibilityScope).toBe("workspace");
    expect(view.isDefault).toBe(true);
    expect(view.filterAst?.type).toBe("PREDICATE");
  });
});
