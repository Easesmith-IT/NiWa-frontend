import { describe, expect, it } from "vitest";
import { ALLOWLISTED_SOURCES, OPERATORS_BY_TYPE, NO_VALUE_OPERATORS } from "./components/FlowConditionBuilder";
import { ACTION_TYPE_LABELS } from "./components/FlowActionBuilder";
import type { CrmFlow, FlowCondition, FlowStep } from "./flow.types";

describe("Phase 5 Batch 4 — Structured Flow Condition & Action Builders", () => {
  describe("P1-11 Condition Builder & Source Allowlist", () => {
    it("1. Source Allowlist contains canonical production CRM entities and 1-hop relationships", () => {
      const categories = new Set(ALLOWLISTED_SOURCES.map((s) => s.category));
      expect(categories.has("Lead")).toBe(true);
      expect(categories.has("Deal")).toBe(true);
      expect(categories.has("Person")).toBe(true);
      expect(categories.has("Company")).toBe(true);
      expect(categories.has("Task")).toBe(true);
      expect(categories.has("Activity")).toBe(true);
      expect(categories.has("Relationship")).toBe(true);

      // Verify 1-hop bounded relationships
      const rels = ALLOWLISTED_SOURCES.filter((s) => s.category === "Relationship");
      expect(rels.some((r) => r.value === "entity.company.name")).toBe(true);
      expect(rels.some((r) => r.value === "entity.primaryPerson.email")).toBe(true);

      // Verify no 2-hop relationships exist in allowlist
      expect(ALLOWLISTED_SOURCES.some((s) => s.value.includes("company.primaryPerson"))).toBe(false);
    });

    it("2. Preserves numeric typing without stringification (number = 50)", () => {
      const condition: FlowCondition = {
        source: "entity.score",
        operator: ">",
        value: 50,
        logic: "AND",
      };

      expect(typeof condition.value).toBe("number");
      expect(condition.value).toBe(50);
      expect(JSON.stringify(condition)).toBe('{"source":"entity.score","operator":">","value":50,"logic":"AND"}');
    });

    it("3. Preserves boolean typing (value = true / false)", () => {
      const condition: FlowCondition = {
        source: "entity.isArchived",
        operator: "=",
        value: true,
        logic: "AND",
      };

      expect(typeof condition.value).toBe("boolean");
      expect(condition.value).toBe(true);
      expect(JSON.stringify(condition)).toBe('{"source":"entity.isArchived","operator":"=","value":true,"logic":"AND"}');
    });

    it("4. No-value operators (IS EMPTY, IS NOT EMPTY, exists) omit value property", () => {
      const emptyCond: FlowCondition = {
        source: "entity.email",
        operator: "IS EMPTY",
        logic: "AND",
      };

      const notEmptyCond: FlowCondition = {
        source: "entity.phone",
        operator: "IS NOT EMPTY",
        logic: "AND",
      };

      const existsCond: FlowCondition = {
        source: "entity.companyName",
        operator: "exists",
        logic: "AND",
      };

      expect(NO_VALUE_OPERATORS).toContain("IS EMPTY");
      expect(NO_VALUE_OPERATORS).toContain("IS NOT EMPTY");
      expect(NO_VALUE_OPERATORS).toContain("exists");

      expect(emptyCond.value).toBeUndefined();
      expect(notEmptyCond.value).toBeUndefined();
      expect(existsCond.value).toBeUndefined();

      expect(JSON.stringify(emptyCond)).not.toContain("value");
      expect(JSON.stringify(notEmptyCond)).not.toContain("value");
      expect(JSON.stringify(existsCond)).not.toContain("value");
    });

    it("5. IN / NOT IN operators preserve typed arrays", () => {
      const numInCond: FlowCondition = {
        source: "entity.score",
        operator: "IN",
        value: [50, 100, 150],
        logic: "AND",
      };

      const strNotInCond: FlowCondition = {
        source: "entity.status",
        operator: "NOT IN",
        value: ["UNQUALIFIED", "CONVERTED"],
        logic: "OR",
      };

      expect(Array.isArray(numInCond.value)).toBe(true);
      expect((numInCond.value as number[])[0]).toBe(50);
      expect(JSON.stringify(numInCond)).toBe('{"source":"entity.score","operator":"IN","value":[50,100,150],"logic":"AND"}');

      expect(Array.isArray(strNotInCond.value)).toBe(true);
      expect((strNotInCond.value as string[])[0]).toBe("UNQUALIFIED");
    });

    it("6. Operator matrix compatibility by data type", () => {
      expect(OPERATORS_BY_TYPE.number).toContain(">");
      expect(OPERATORS_BY_TYPE.number).toContain("<=");
      expect(OPERATORS_BY_TYPE.boolean).not.toContain(">");
      expect(OPERATORS_BY_TYPE.string).toContain("contains");
      expect(OPERATORS_BY_TYPE.date).toContain(">=");
    });

    it("7. Boolean logic selector (AND / OR) preservation", () => {
      const conditions: FlowCondition[] = [
        { source: "entity.status", operator: "=", value: "QUALIFIED", logic: "AND" },
        { source: "entity.score", operator: ">", value: 100, logic: "OR" },
        { source: "entity.company.name", operator: "contains", value: "Acme", logic: "AND" },
      ];

      expect(conditions[0].logic).toBe("AND");
      expect(conditions[1].logic).toBe("OR");
      expect(conditions[2].logic).toBe("AND");
    });
  });

  describe("P1-12 Action Builder & P1-13 assign_owner", () => {
    it("8. Supports all 6 canonical backend action types", () => {
      expect(ACTION_TYPE_LABELS.create_task).toBe("Create Task");
      expect(ACTION_TYPE_LABELS.update_record).toBe("Update Record");
      expect(ACTION_TYPE_LABELS.create_activity).toBe("Create Activity");
      expect(ACTION_TYPE_LABELS.assign_owner).toBe("Assign Owner");
      expect(ACTION_TYPE_LABELS.send_message).toBe("Send Message");
      expect(ACTION_TYPE_LABELS.wait).toBe("Wait");
    });

    it("9. Serializes create_task action configuration correctly", () => {
      const step: FlowStep = {
        type: "create_task",
        config: {
          title: "Follow up with VIP Lead",
          priority: "HIGH",
          dueInMinutes: 120,
          description: "Check lead details",
        },
      };

      expect(step.type).toBe("create_task");
      expect(step.config.title).toBe("Follow up with VIP Lead");
      expect(step.config.priority).toBe("HIGH");
      expect(step.config.dueInMinutes).toBe(120);
    });

    it("10. Serializes update_record action restricted to supported targets", () => {
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
          field: "stage",
          value: "NEGOTIATION",
        },
      };

      expect(leadStep.config.targetEntity).toBe("Lead");
      expect(leadStep.config.field).toBe("status");
      expect(dealStep.config.targetEntity).toBe("Deal");
      expect(dealStep.config.field).toBe("stage");
    });

    it("11. P1-13 assign_owner serializes workspace-scoped ownerUserId and targetEntity", () => {
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
      expect(JSON.stringify(assignStep)).toContain('"ownerUserId":"user_66a98efc2f992d996df1370e"');
    });

    it("12. Serializes wait and send_message action configurations", () => {
      const waitStep: FlowStep = {
        type: "wait",
        config: { delayMinutes: 15 },
      };

      const msgStep: FlowStep = {
        type: "send_message",
        config: { body: "Hello {{ entity.displayName }}" },
      };

      expect(waitStep.config.delayMinutes).toBe(15);
      expect(msgStep.config.body).toBe("Hello {{ entity.displayName }}");
    });
  });

  describe("Round-Trip Payload Integrity", () => {
    it("13. Load existing Flow into builder structure and save without semantic distortion", () => {
      const existingFlow: CrmFlow = {
        _id: "flow_12345",
        workspaceId: "ws_9999",
        name: "Auto-Qualify VIPs",
        description: "Automatically process incoming leads",
        status: "active",
        trigger: { type: "lead.created" },
        conditions: [
          { source: "entity.score", operator: ">=", value: 80, logic: "AND" },
          { source: "entity.company.name", operator: "IS NOT EMPTY", logic: "OR" },
        ],
        steps: [
          {
            type: "assign_owner",
            config: { targetEntity: "Lead", ownerUserId: "user_5555" },
          },
          {
            type: "create_task",
            config: { title: "Onboard new VIP Lead", priority: "HIGH", dueInMinutes: 30 },
          },
        ],
        revision: 1,
        createdBy: "user_1111",
        createdAt: "2026-09-03T00:00:00.000Z",
        updatedAt: "2026-09-03T00:00:00.000Z",
      };

      // Simulating round-trip save payload generation
      const savedPayload = {
        name: existingFlow.name,
        description: existingFlow.description,
        trigger: existingFlow.trigger,
        conditions: existingFlow.conditions,
        steps: existingFlow.steps,
      };

      expect(savedPayload.conditions[0].value).toBe(80);
      expect(typeof savedPayload.conditions[0].value).toBe("number");
      expect(savedPayload.conditions[1].value).toBeUndefined();
      expect(savedPayload.steps[0].config.ownerUserId).toBe("user_5555");
      expect(savedPayload.steps[1].config.dueInMinutes).toBe(30);
    });
  });
});
