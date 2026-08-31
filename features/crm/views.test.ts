import { describe, expect, it } from "vitest";
import type {
  CrmComparator,
  CrmFieldMetadata,
  CrmFieldType,
  CrmViewRecord,
  FilterAstNode,
  FilterValue,
  PredicateAstNode,
} from "./views.types";

describe("Frontend CRM Views Contract & 5-Issue Type-Safety Suite", () => {
  it("1. constructs a valid CrmViewRecord according to Phase 4B canonical contract", () => {
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

  it("2. ISSUE 4 — Enforces finite CrmFieldType union and safe metadata representation", () => {
    const supportedTypes: CrmFieldType[] = [
      "TEXT",
      "LONG_TEXT",
      "NUMBER",
      "CURRENCY",
      "BOOLEAN",
      "DATE",
      "DATE_TIME",
      "OPTION",
      "MULTI_OPTION",
      "EMAIL",
      "PHONE",
      "URL",
      "RECORD_RELATIONSHIP",
    ];

    const metadata: CrmFieldMetadata = {
      key: "custom_score",
      label: "Lead Score",
      type: "NUMBER",
      filterable: true,
      sortable: true,
      selectable: true,
      groupable: false,
      comparators: [">=", "<=", "=", "!="],
    };

    expect(supportedTypes).toContain(metadata.type);
    expect(metadata.comparators).toContain(">=");
  });

  it("3. ISSUE 5 — Restricts CrmFieldMetadata.comparators to CrmComparator union", () => {
    const validComparators: CrmComparator[] = [
      "=",
      "!=",
      ">",
      "<",
      ">=",
      "<=",
      "IN",
      "NOT IN",
      "IS EMPTY",
      "IS NOT EMPTY",
    ];

    const fieldMeta: CrmFieldMetadata = {
      key: "status",
      label: "Status",
      type: "OPTION",
      filterable: true,
      sortable: true,
      selectable: true,
      groupable: true,
      comparators: ["=", "!=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
    };

    fieldMeta.comparators?.forEach((comp) => {
      expect(validComparators).toContain(comp);
    });
  });

  it("4. ISSUE 2 & 3 — Enforces strongly-typed FilterValue in PredicateAstNode", () => {
    const textPredicate: PredicateAstNode = {
      type: "PREDICATE",
      field: "title",
      comparator: "=",
      value: "Acme Corp Renewal",
    };

    const numPredicate: PredicateAstNode = {
      type: "PREDICATE",
      field: "value",
      comparator: ">=",
      value: 100000,
    };

    const boolPredicate: PredicateAstNode = {
      type: "PREDICATE",
      field: "isArchived",
      comparator: "=",
      value: false,
    };

    const multiOptPredicate: PredicateAstNode = {
      type: "PREDICATE",
      field: "tags",
      comparator: "IN",
      value: ["SaaS", "Enterprise"],
    };

    const nullPredicate: PredicateAstNode = {
      type: "PREDICATE",
      field: "closedAt",
      comparator: "IS EMPTY",
      value: undefined,
    };

    expect(textPredicate.value).toBe("Acme Corp Renewal");
    expect(numPredicate.value).toBe(100000);
    expect(boolPredicate.value).toBe(false);
    expect(multiOptPredicate.value).toEqual(["SaaS", "Enterprise"]);
    expect(nullPredicate.value).toBeUndefined();
  });

  it("5. ISSUE 1 — Verifies logical AST condition composition without any casts", () => {
    const logicalNode: FilterAstNode = {
      type: "LOGICAL",
      operator: "AND",
      conditions: [
        { type: "PREDICATE", field: "status", comparator: "=", value: "OPEN" },
        { type: "PREDICATE", field: "value", comparator: ">", value: 20000 },
      ],
    };

    expect(logicalNode.type).toBe("LOGICAL");
    if (logicalNode.type === "LOGICAL") {
      expect(logicalNode.operator).toBe("AND");
      expect(logicalNode.conditions).toHaveLength(2);
      const cond0 = logicalNode.conditions[0];
      if (cond0.type === "PREDICATE") {
        expect(cond0.field).toBe("status");
      }
    }
  });
});
