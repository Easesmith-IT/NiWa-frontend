import { describe, expect, it } from "vitest";
import { normalizeCustomer360Response } from "./customer-360.utils";

describe("normalizeCustomer360Response", () => {
  it("unwraps standard backend { success: true, data: ... } envelope", () => {
    const rawBackendEnvelope = {
      success: true,
      data: {
        recordType: "Person",
        record: { _id: "p1", displayName: "Aarav Sharma" },
        linkedEntities: { contacts: [{ _id: "c1" }] },
        deals: { items: [{ _id: "d1" }], totalOpenValue: 5000, openCount: 1, wonCount: 0, lostCount: 0 },
        leads: { items: [], totalCount: 2, openCount: 1 },
        tasks: { items: [], pendingCount: 3, overdueCount: 1 },
        timeline: { activities: [{ _id: "act1" }], totalCount: 1 },
        communication: {
          conversations: [{ _id: "conv1" }],
          totalUnreadCount: 2,
          lastContactedAt: "2026-10-13T10:00:00Z",
          activeChannels: ["whatsapp"],
        },
      },
    };

    const normalized = normalizeCustomer360Response(rawBackendEnvelope);

    expect(normalized.recordType).toBe("Person");
    expect(normalized.record.displayName).toBe("Aarav Sharma");
    expect(normalized.communication.conversations).toHaveLength(1);
    expect(normalized.communication.conversations[0]._id).toBe("conv1");
    expect(normalized.deals.totalOpenValue).toBe(5000);
    expect(normalized.timeline.activities).toHaveLength(1);
  });

  it("handles unwrapped direct payload", () => {
    const rawDirectPayload = {
      recordType: "Company",
      record: { _id: "comp1", name: "Acme Corp" },
      communication: {
        conversations: [{ _id: "conv2" }],
        totalUnreadCount: 0,
        lastContactedAt: null,
        activeChannels: [],
      },
    };

    const normalized = normalizeCustomer360Response(rawDirectPayload);

    expect(normalized.recordType).toBe("Company");
    expect(normalized.record.name).toBe("Acme Corp");
    expect(normalized.communication.conversations[0]._id).toBe("conv2");
    expect(normalized.deals.items).toEqual([]);
    expect(normalized.leads.items).toEqual([]);
    expect(normalized.tasks.items).toEqual([]);
    expect(normalized.timeline.activities).toEqual([]);
  });

  it("defends against completely undefined or malformed communication/deals/leads/tasks payloads", () => {
    // Exactly reproducing the shape that caused "Cannot read properties of undefined (reading 'conversations')"
    const malformedOrEmptyPayload = {
      success: true,
      data: {
        recordType: "Person",
        record: { _id: "p2", firstName: "Priya" },
        // communication, deals, leads, tasks, timeline are all missing or null!
      },
    };

    const normalized = normalizeCustomer360Response(malformedOrEmptyPayload);

    expect(normalized.communication).toBeDefined();
    expect(normalized.communication.conversations).toEqual([]);
    expect(normalized.communication.conversations?.[0]?._id).toBeUndefined();
    expect(normalized.deals.items).toEqual([]);
    expect(normalized.leads.items).toEqual([]);
    expect(normalized.tasks.items).toEqual([]);
    expect(normalized.timeline.activities).toEqual([]);
  });

  it("handles null or non-object raw input safely without throwing", () => {
    const fromNull = normalizeCustomer360Response(null);
    expect(fromNull.communication.conversations).toEqual([]);
    expect(fromNull.recordType).toBe("Person");

    const fromUndefined = normalizeCustomer360Response(undefined, "Company");
    expect(fromUndefined.communication.conversations).toEqual([]);
    expect(fromUndefined.recordType).toBe("Company");
  });
});
