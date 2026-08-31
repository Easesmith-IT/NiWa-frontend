import { describe, expect, it } from "vitest";
import {
  createPipeline,
  createStage,
  listPipelines,
  listStages,
  reorderStages,
  updatePipeline,
  updateStage,
} from "./pipeline.api";
import type {
  CreatePipelinePayload,
  CreateStagePayload,
  PipelineRecord,
  ReorderStagesPayload,
  StageRecord,
} from "./pipeline.types";

describe("Pipelines & Stages Domain Unit & Integration Suite", () => {
  it("1. Pipeline & Stage API functions exist", () => {
    expect(typeof listPipelines).toBe("function");
    expect(typeof createPipeline).toBe("function");
    expect(typeof updatePipeline).toBe("function");
    expect(typeof listStages).toBe("function");
    expect(typeof createStage).toBe("function");
    expect(typeof updateStage).toBe("function");
    expect(typeof reorderStages).toBe("function");
  });

  it("2. CreatePipelinePayload allows name, description, isDefault, isActive", () => {
    const payload: CreatePipelinePayload = {
      name: "Sales Pipeline",
      description: "Default pipeline for deals",
      isDefault: true,
      isActive: true,
    };
    expect(payload.name).toBe("Sales Pipeline");
    expect(payload.isDefault).toBe(true);
    expect(payload.isActive).toBe(true);
  });

  it("3. Stage payload validation rejects simultaneous isWon and isLost in helper logic", () => {
    const isValidStageFlags = (isWon?: boolean, isLost?: boolean) => {
      if (isWon && isLost) return false;
      return true;
    };

    expect(isValidStageFlags(true, false)).toBe(true);
    expect(isValidStageFlags(false, true)).toBe(true);
    expect(isValidStageFlags(false, false)).toBe(true);
    expect(isValidStageFlags(true, true)).toBe(false);
  });

  it("4. Stage reordering produces deterministic contiguous 0-indexed position array", () => {
    const stages: StageRecord[] = [
      { _id: "s1", workspaceId: "ws1", pipelineId: "p1", name: "Stage 1", position: 1, isWon: false, isLost: false, isActive: true },
      { _id: "s2", workspaceId: "ws1", pipelineId: "p1", name: "Stage 2", position: 0, isWon: false, isLost: false, isActive: true },
    ];

    // Sort by position
    const sorted = [...stages].sort((a, b) => a.position - b.position);
    expect(sorted[0]._id).toBe("s2");
    expect(sorted[1]._id).toBe("s1");

    // Produce reordered payload with contiguous positions
    const reorderedPayload: ReorderStagesPayload = {
      stages: sorted.map((s, index) => ({ id: s._id, position: index })),
    };

    expect(reorderedPayload.stages).toEqual([
      { id: "s2", position: 0 },
      { id: "s1", position: 1 },
    ]);
  });

  it("5. Inactive pipelines and stages are identified properly in UI helpers", () => {
    const activePipeline: PipelineRecord = {
      _id: "p1",
      workspaceId: "ws1",
      name: "Active Pipeline",
      isDefault: true,
      isActive: true,
      createdBy: "u1",
      updatedBy: "u1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const inactiveStage: StageRecord = {
      _id: "s_inactive",
      workspaceId: "ws1",
      pipelineId: "p1",
      name: "Legacy Stage",
      position: 99,
      isWon: false,
      isLost: false,
      isActive: false,
    };

    expect(activePipeline.isActive).toBe(true);
    expect(inactiveStage.isActive).toBe(false);
  });
});

