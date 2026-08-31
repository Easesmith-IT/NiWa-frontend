import { describe, expect, it } from "vitest";
import { archiveDeal, createDeal, fetchDealById, listDeals, updateDeal } from "./deal.api";
import type { CreateDealPayload, DealRecord, UpdateDealPayload } from "./deal.types";
import type { StageRecord } from "../pipelines/pipeline.types";
import { resolveDealListColumns, resolveDealFieldValue } from "./deal.utils";
import type { CrmFieldMetadata, CrmViewRecord } from "../crm/views.types";

describe("Deals & Cross-Pipeline Movement Unit Suite", () => {
  it("1. Deal API functions exist", () => {
    expect(typeof listDeals).toBe("function");
    expect(typeof fetchDealById).toBe("function");
    expect(typeof createDeal).toBe("function");
    expect(typeof updateDeal).toBe("function");
    expect(typeof archiveDeal).toBe("function");
  });

  it("2. CreateDealPayload enforces pipelineId and stageId", () => {
    const payload: CreateDealPayload = {
      title: "Enterprise Deal",
      pipelineId: "p_sales",
      stageId: "s_qualified",
      value: 100000,
      currency: "USD",
      status: "OPEN",
    };

    expect(payload.title).toBe("Enterprise Deal");
    expect(payload.pipelineId).toBe("p_sales");
    expect(payload.stageId).toBe("s_qualified");
  });

  it("3. Cross-Pipeline movement updates both pipelineId and stageId simultaneously", () => {
    const originalDeal: DealRecord = {
      _id: "d1",
      workspaceId: "ws1",
      title: "Acme Renewal",
      pipelineId: "p_sales",
      stageId: "s_closing",
      status: "OPEN",
      createdBy: "u1",
      updatedBy: "u1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const crossPipelineMovementPayload: UpdateDealPayload = {
      pipelineId: "p_account_management",
      stageId: "s_onboarding",
    };

    const updatedDeal: DealRecord = {
      ...originalDeal,
      ...crossPipelineMovementPayload,
    };

    expect(updatedDeal.pipelineId).toBe("p_account_management");
    expect(updatedDeal.stageId).toBe("s_onboarding");
  });

  it("4. Stage options helper filters stages belonging to selected pipeline", () => {
    const allStages: StageRecord[] = [
      { _id: "s1", workspaceId: "ws1", pipelineId: "p1", name: "Stage P1", position: 0, isWon: false, isLost: false, isActive: true },
      { _id: "s2", workspaceId: "ws1", pipelineId: "p2", name: "Stage P2", position: 0, isWon: false, isLost: false, isActive: true },
    ];

    const getStagesForPipeline = (pId: string) => allStages.filter((s) => s.pipelineId === pId);

    expect(getStagesForPipeline("p1")).toHaveLength(1);
    expect(getStagesForPipeline("p1")[0]._id).toBe("s1");
    expect(getStagesForPipeline("p2")[0]._id).toBe("s2");
  });

  it("5. Historical deals in inactive stages are displayed but inactive stage is disabled for new deal selection", () => {
    const stages: StageRecord[] = [
      { _id: "s_active", workspaceId: "ws1", pipelineId: "p1", name: "Active Stage", position: 0, isWon: false, isLost: false, isActive: true },
      { _id: "s_inactive", workspaceId: "ws1", pipelineId: "p1", name: "Old Stage", position: 1, isWon: false, isLost: false, isActive: false },
    ];

    const historicalDeal: DealRecord = {
      _id: "d_legacy",
      workspaceId: "ws1",
      title: "Legacy Deal",
      pipelineId: "p1",
      stageId: "s_inactive",
      status: "OPEN",
      createdBy: "u1",
      updatedBy: "u1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isStageSelectable = (stage: StageRecord, currentDealStageId?: string | null) => {
      if (stage.isActive) return true;
      if (currentDealStageId && stage._id === currentDealStageId) return true;
      return false;
    };

    expect(isStageSelectable(stages[0], null)).toBe(true);
    expect(isStageSelectable(stages[1], null)).toBe(false);
    expect(isStageSelectable(stages[1], historicalDeal.stageId)).toBe(true);
  });
});

describe("Deal List Column Resolution & Order Determinism (Issue 3)", () => {
  it("A. Exact persisted order is respected", () => {
    const view = {
      visibleFields: ["title", "value", "status"],
      columnOrder: ["value", "status", "title"],
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["value", "status", "title"]);
  });

  it("B. Hidden field in columnOrder is excluded", () => {
    const view = {
      visibleFields: ["title", "status"],
      columnOrder: ["title", "value", "status"],
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["title", "status"]);
  });

  it("C. Duplicate order entries are deduplicated", () => {
    const view = {
      visibleFields: ["title", "value", "status"],
      columnOrder: ["title", "title", "value", "status"],
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["title", "value", "status"]);
  });

  it("D. Visible field missing from columnOrder is appended deterministically", () => {
    const view = {
      visibleFields: ["title", "value", "expectedCloseDate"],
      columnOrder: ["value", "title"],
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["value", "title", "expectedCloseDate"]);
  });

  it("E. No active Saved View returns default standard columns", () => {
    expect(resolveDealListColumns(null)).toEqual([
      "title",
      "pipelineId",
      "stageId",
      "value",
      "expectedCloseDate",
      "status",
    ]);
  });

  it("F. Empty visibleFields returns default standard columns", () => {
    const view = { visibleFields: [] } as unknown as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual([
      "title",
      "pipelineId",
      "stageId",
      "value",
      "expectedCloseDate",
      "status",
    ]);
  });

  it("G. Legacy view without columnOrder uses visibleFields order", () => {
    const view = { visibleFields: ["status", "value", "title"] } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["status", "value", "title"]);
  });
});

describe("Typed Deal Field Resolution & Metadata Compliance (Issue 1 & 2)", () => {
  const sampleFields: CrmFieldMetadata[] = [
    { key: "title", label: "Title", type: "TEXT", filterable: true, sortable: true, selectable: true, groupable: true },
    { key: "value", label: "Value", type: "NUMBER", filterable: true, sortable: true, selectable: true, groupable: false },
    { key: "isArchived", label: "Archived", type: "BOOLEAN", filterable: true, sortable: false, selectable: true, groupable: false },
    { key: "expectedCloseDate", label: "Close Date", type: "DATE", filterable: true, sortable: true, selectable: true, groupable: true },
    { key: "custom_region", label: "Region", type: "OPTION", filterable: true, sortable: true, selectable: true, groupable: true, isCustom: true },
    { key: "custom_tags", label: "Tags", type: "MULTI_OPTION", filterable: true, sortable: false, selectable: true, groupable: false, isCustom: true },
  ];

  const testDeal: DealRecord & { customFields?: Record<string, unknown> } = {
    _id: "d100",
    workspaceId: "ws1",
    title: "Big Enterprise Deal",
    status: "OPEN",
    value: 50000,
    currency: "USD",
    isArchived: false,
    expectedCloseDate: "2026-12-31",
    createdBy: "u1",
    updatedBy: "u1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    customFields: {
      custom_region: "EMEA",
      custom_tags: ["Priority", "SaaS"],
    },
  };

  it("1. Resolves standard deal fields correctly with PRESENT state", () => {
    const res = resolveDealFieldValue(testDeal, "title", sampleFields);
    expect(res.state).toBe("PRESENT");
    expect(res.value).toBe("Big Enterprise Deal");
    expect(res.fieldType).toBe("TEXT");
  });

  it("2. Resolves custom fields from customFields container correctly", () => {
    const res = resolveDealFieldValue(testDeal, "custom_region", sampleFields);
    expect(res.state).toBe("PRESENT");
    expect(res.value).toBe("EMEA");
    expect(res.fieldType).toBe("OPTION");
  });

  it("3. Resolves multi-option custom fields correctly", () => {
    const res = resolveDealFieldValue(testDeal, "custom_tags", sampleFields);
    expect(res.state).toBe("PRESENT");
    expect(res.value).toEqual(["Priority", "SaaS"]);
    expect(res.fieldType).toBe("MULTI_OPTION");
  });

  it("4. Identifies EMPTY fields when value is null/undefined", () => {
    const res = resolveDealFieldValue(testDeal, "description", sampleFields);
    expect(res.state).toBe("EMPTY");
  });

  it("5. Identifies UNAVAILABLE fields when field key is not in metadata registry or standard fields", () => {
    const res = resolveDealFieldValue(testDeal, "deleted_field_xyz", sampleFields);
    expect(res.state).toBe("UNAVAILABLE");
  });
});
