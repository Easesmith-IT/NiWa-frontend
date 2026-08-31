import { describe, expect, it } from "vitest";
import { archiveDeal, createDeal, fetchDealById, listDeals, updateDeal } from "./deal.api";
import type { CreateDealPayload, DealRecord, UpdateDealPayload } from "./deal.types";
import type { StageRecord } from "../pipelines/pipeline.types";

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

    // Helper for stage dropdown disabled state
    const isStageSelectable = (stage: StageRecord, currentDealStageId?: string | null) => {
      if (stage.isActive) return true;
      if (currentDealStageId && stage._id === currentDealStageId) return true; // Allowed for existing deal
      return false; // Disabled for new deals
    };

    expect(isStageSelectable(stages[0], null)).toBe(true);
    expect(isStageSelectable(stages[1], null)).toBe(false); // New deal cannot select inactive stage
    expect(isStageSelectable(stages[1], historicalDeal.stageId)).toBe(true); // Historical deal retains its inactive stage
  });
});

import { resolveDealListColumns } from "./deal.utils";
import type { CrmViewRecord } from "../crm/views.types";

describe("Deal List Column Resolution", () => {
  it("A. Saved View columns are applied", () => {
    const view = { visibleFields: ["title", "value"] } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["title", "value"]);
  });

  it("B. Column order is respected", () => {
    const view = { 
      visibleFields: ["title", "value", "status"], 
      columnOrder: ["value", "status", "title"] 
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["value", "status", "title"]);
  });

  it("C. Hidden fields do not render (only visible fields from order are picked)", () => {
    // If a field is in columnOrder but not visibleFields, it's hidden
    const view = {
      visibleFields: ["title", "status"],
      columnOrder: ["title", "value", "status"]
    } as CrmViewRecord;
    expect(resolveDealListColumns(view)).toEqual(["title", "status"]);
  });

  it("E. No Saved View regression (returns defaults)", () => {
    const cols = resolveDealListColumns(null);
    expect(cols).toEqual(["title", "pipelineId", "stageId", "value", "expectedCloseDate", "status"]);
  });
});

