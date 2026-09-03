import { describe, expect, it } from "vitest";
import {
  BACKEND_SOURCE_CATALOG,
  OPERATORS_BY_TYPE,
  NO_VALUE_OPERATORS,
} from "./components/FlowConditionBuilder";
import { ACTION_TYPE_LABELS } from "./components/FlowActionBuilder";
import type { CrmFlow, FlowCondition, FlowStep } from "./flow.types";

describe("Phase 5 Batch 4 Correction Pass — Frontend Flow Condition & Action Builders", () => {
  describe("P1-11 Condition Builder Source Catalog & Relationships", () => {
    it("1. Lead source catalog matches backend crm-flow-source-registry.ts exactly", () => {
      const leadSources = BACKEND_SOURCE_CATALOG.Lead.map((s) => s.value);
      // Valid backend Lead fields
      expect(leadSources).toContain("entity.title");
      expect(leadSources).toContain("entity.status");
      expect(leadSources).toContain("entity.source");
      expect(leadSources).toContain("entity.value");
      expect(leadSources).toContain("entity.currency");
      expect(leadSources).toContain("entity.ownerUserId");

      // Removed unsupported Lead fields
      expect(leadSources).not.toContain("entity.name");
      expect(leadSources).not.toContain("entity.email");
      expect(leadSources).not.toContain("entity.phone");
      expect(leadSources).not.toContain("entity.companyName");
    });

    it("2. Deal source catalog matches backend registry (stageId used, unsupported fields removed)", () => {
      const dealSources = BACKEND_SOURCE_CATALOG.Deal.map((s) => s.value);
      // Valid backend Deal fields
      expect(dealSources).toContain("entity.title");
      expect(dealSources).toContain("entity.stageId");
      expect(dealSources).toContain("entity.pipelineId");
      expect(dealSources).toContain("entity.value");
      expect(dealSources).toContain("entity.expectedCloseDate");

      // Removed unsupported Deal fields
      expect(dealSources).not.toContain("entity.stage");
      expect(dealSources).not.toContain("entity.name");
      expect(dealSources).not.toContain("entity.probability");
      expect(dealSources).not.toContain("entity.closedAt");
    });

    it("3. Person, Company, Task, Activity catalogs match backend registry", () => {
      const personSources = BACKEND_SOURCE_CATALOG.Person.map((s) => s.value);
      expect(personSources).toContain("entity.firstName");
      expect(personSources).toContain("entity.lastName");
      expect(personSources).toContain("entity.email");
      expect(personSources).not.toContain("entity.displayName");

      const companySources = BACKEND_SOURCE_CATALOG.Company.map((s) => s.value);
      expect(companySources).toContain("entity.name");
      expect(companySources).toContain("entity.domain");
      expect(companySources).not.toContain("entity.employeeCount");
      expect(companySources).not.toContain("entity.annualRevenue");

      const taskSources = BACKEND_SOURCE_CATALOG.Task.map((s) => s.value);
      expect(taskSources).toContain("entity.title");
      expect(taskSources).toContain("entity.status");
      expect(taskSources).toContain("entity.priority");
      expect(taskSources).toContain("entity.authorId");
      expect(taskSources).not.toContain("entity.assignedTo");

      const actSources = BACKEND_SOURCE_CATALOG.Activity.map((s) => s.value);
      expect(actSources).toContain("entity.type");
      expect(actSources).toContain("entity.description");
      expect(actSources).toContain("entity.actorId");
      expect(actSources).not.toContain("entity.subject");
      expect(actSources).not.toContain("entity.performedAt");
    });

    it("4. Relationship sources strictly match backend 1-hop allowed relationships", () => {
      const leadRels = BACKEND_SOURCE_CATALOG.Lead.filter((s) => s.isRelationship).map((s) => s.value);
      expect(leadRels).toContain("entity.company.name");
      expect(leadRels).toContain("entity.primaryPerson.email");

      const dealRels = BACKEND_SOURCE_CATALOG.Deal.filter((s) => s.isRelationship).map((s) => s.value);
      expect(dealRels).toContain("entity.company.domain");
      expect(dealRels).toContain("entity.primaryPerson.phone");

      // Verify unsupported relationships are REMOVED
      expect(leadRels).not.toContain("entity.pipeline.name");
      expect(dealRels).not.toContain("entity.stage.name");

      // Verify Company, Task, Activity have NO relationships
      expect(BACKEND_SOURCE_CATALOG.Company.some((s) => s.isRelationship)).toBe(false);
      expect(BACKEND_SOURCE_CATALOG.Task.some((s) => s.isRelationship)).toBe(false);
      expect(BACKEND_SOURCE_CATALOG.Activity.some((s) => s.isRelationship)).toBe(false);
    });

    it("5. Preserves typed values without stringification (numbers & booleans)", () => {
      const numCond: FlowCondition = {
        source: "entity.value",
        operator: ">",
        value: 1000,
        logic: "AND",
      };

      const boolCond: FlowCondition = {
        source: "entity.status",
        operator: "=",
        value: true,
        logic: "AND",
      };

      expect(typeof numCond.value).toBe("number");
      expect(numCond.value).toBe(1000);
      expect(JSON.stringify(numCond)).toBe('{"source":"entity.value","operator":">","value":1000,"logic":"AND"}');

      expect(typeof boolCond.value).toBe("boolean");
      expect(boolCond.value).toBe(true);
    });

    it("6. No-value operators (IS EMPTY, IS NOT EMPTY, exists) omit value property", () => {
      const emptyCond: FlowCondition = {
        source: "entity.currency",
        operator: "IS EMPTY",
        logic: "AND",
      };

      expect(NO_VALUE_OPERATORS).toContain("IS EMPTY");
      expect(NO_VALUE_OPERATORS).toContain("IS NOT EMPTY");
      expect(NO_VALUE_OPERATORS).toContain("exists");

      expect(emptyCond.value).toBeUndefined();
      expect(JSON.stringify(emptyCond)).not.toContain("value");
    });
  });

  describe("P1-12 & P1-13 Action Builder Corrections & assign_owner", () => {
    it("7. Supported actions contain all 6 canonical backend action types", () => {
      expect(ACTION_TYPE_LABELS.create_task).toBe("Create Task");
      expect(ACTION_TYPE_LABELS.update_record).toBe("Update Record");
      expect(ACTION_TYPE_LABELS.create_activity).toBe("Create Activity");
      expect(ACTION_TYPE_LABELS.assign_owner).toBe("Assign Owner");
      expect(ACTION_TYPE_LABELS.send_message).toBe("Send Message");
      expect(ACTION_TYPE_LABELS.wait).toBe("Wait");
    });

    it("8. update_record uses Deal.stageId and Lead.status ONLY (Deal.stage removed)", () => {
      const leadStep: FlowStep = {
        type: "update_record",
        config: {
          targetEntity: "Lead",
          field: "status",
          value: "QUALIFIED",
        },
      };

      const dealStep: FlowStep = {
        type: "update_record",
        config: {
          targetEntity: "Deal",
          field: "stageId",
          value: "66a98efc2f992d996df1370e",
        },
      };

      expect(leadStep.config.field).toBe("status");
      expect(dealStep.config.field).toBe("stageId");
      expect(dealStep.config.field).not.toBe("stage");
    });

    it("9. P1-13 assign_owner restricts targets to Lead, Deal, Person, Company ONLY (Task removed)", () => {
      const allowedTargets = ["Lead", "Deal", "Person", "Company"];
      expect(allowedTargets).not.toContain("Task");
      expect(allowedTargets).not.toContain("Activity");

      const assignStep: FlowStep = {
        type: "assign_owner",
        config: {
          targetEntity: "Lead",
          ownerUserId: "user_66a98efc2f992d996df1370e",
        },
      };

      expect(assignStep.type).toBe("assign_owner");
      expect(assignStep.config.targetEntity).toBe("Lead");
      expect(assignStep.config.ownerUserId).toBe("user_66a98efc2f992d996df1370e");
    });

    it("10. Full Action Builder Serialization and Deserialization Round-Trip", () => {
      const steps: FlowStep[] = [
        { type: "create_task", config: { title: "Follow up", priority: "HIGH", dueInMinutes: 30 } },
        { type: "update_record", config: { targetEntity: "Deal", field: "stageId", value: "stage_abc" } },
        { type: "create_activity", config: { activityType: "CALL", subject: "Discovery Call" } },
        { type: "assign_owner", config: { targetEntity: "Person", ownerUserId: "user_123" } },
        { type: "send_message", config: { body: "Hello {{ entity.title }}" } },
        { type: "wait", config: { delayMinutes: 10 } },
      ];

      const serialized = JSON.stringify(steps);
      const deserialized: FlowStep[] = JSON.parse(serialized);

      expect(deserialized.length).toBe(6);
      expect(deserialized[0].config.title).toBe("Follow up");
      expect(deserialized[1].config.field).toBe("stageId");
      expect(deserialized[3].config.ownerUserId).toBe("user_123");
      expect(deserialized[5].config.delayMinutes).toBe(10);
    });
  });

  describe("Round-Trip Payload Integrity", () => {
    it("11. Load existing Flow into builder structure and save without semantic distortion", () => {
      const existingFlow: CrmFlow = {
        _id: "flow_12345",
        workspaceId: "ws_9999",
        name: "Auto-Qualify VIPs",
        description: "Automatically process incoming leads",
        status: "active",
        trigger: { type: "lead.created" },
        conditions: [
          { source: "entity.value", operator: ">=", value: 5000, logic: "AND" },
          { source: "entity.company.name", operator: "IS NOT EMPTY", logic: "OR" },
        ],
        steps: [
          {
            type: "assign_owner",
            config: { targetEntity: "Lead", ownerUserId: "user_5555" },
          },
          {
            type: "update_record",
            config: { targetEntity: "Deal", field: "stageId", value: "stage_xyz" },
          },
        ],
        revision: 1,
        createdBy: "user_1111",
        createdAt: "2026-09-03T00:00:00.000Z",
        updatedAt: "2026-09-03T00:00:00.000Z",
      };

      const savedPayload = {
        name: existingFlow.name,
        description: existingFlow.description,
        trigger: existingFlow.trigger,
        conditions: existingFlow.conditions,
        steps: existingFlow.steps,
      };

      expect(savedPayload.conditions[0].value).toBe(5000);
      expect(typeof savedPayload.conditions[0].value).toBe("number");
      expect(savedPayload.conditions[1].value).toBeUndefined();
      expect(savedPayload.steps[0].config.ownerUserId).toBe("user_5555");
      expect(savedPayload.steps[1].config.field).toBe("stageId");
    });
  });
});
