import { describe, expect, it } from "vitest";

import { mergeAndReconcileMessages } from "./inbox.merge";
import type { MessageRecordV1 } from "./inbox.types";

const makeMsg = (id: string, text: string, createdAt: string, metaMessageId?: string, extra?: Record<string, any>): MessageRecordV1 =>
  ({
    _id: id,
    direction: "outgoing",
    messageType: "text",
    previewText: text,
    textBody: text,
    createdAt,
    metaTimestamp: createdAt,
    metaMessageId: metaMessageId ?? null,
    status: "delivered",
    ...extra,
  }) as MessageRecordV1;

describe("mergeAndReconcileMessages canonical utility", () => {
  it("reconciles optimistic messages when server confirmed message arrives with matching _id or metaMessageId", () => {
    const optimisticMsg = makeMsg("opt-101", "Hello world", "2026-08-06T10:00:00.000Z", "wamid.123", {
      status: "queued",
    });

    const initialServerMsg = makeMsg("srv-201", "Hello world", "2026-08-06T10:00:00.000Z", "wamid.123", {
      status: "delivered",
    });

    const result = mergeAndReconcileMessages({
      initialMessages: [initialServerMsg],
      optimisticMessages: [optimisticMsg],
    });

    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("srv-201");
    expect(result[0].status).toBe("delivered");
  });

  it("reconciles optimistic message by clientCorrelationId", () => {
    const optimisticMsg = makeMsg("opt-102", "Sending message...", "2026-08-06T10:01:00.000Z", undefined, {
      tempId: "client-req-999",
      status: "queued",
    });

    const confirmedMsg = makeMsg("srv-202", "Sending message...", "2026-08-06T10:01:01.000Z", "wamid.456", {
      tempId: "client-req-999",
      status: "sent",
    });

    const result = mergeAndReconcileMessages({
      realtimeMessages: [confirmedMsg],
      optimisticMessages: [optimisticMsg],
    });

    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("srv-202");
  });

  it("does NOT incorrectly deduplicate identical message bodies with distinct IDs", () => {
    const msg1 = makeMsg("srv-301", "Hello", "2026-08-06T10:00:00.000Z", "wamid.1");
    const msg2 = makeMsg("srv-302", "Hello", "2026-08-06T10:00:01.000Z", "wamid.2");

    const result = mergeAndReconcileMessages({
      initialMessages: [msg1, msg2],
    });

    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe("srv-301");
    expect(result[1]._id).toBe("srv-302");
  });

  it("sorts historical pages, initial messages, and realtime messages chronologically", () => {
    const historicalMsg = makeMsg("srv-001", "Old msg", "2026-08-06T08:00:00.000Z");
    const initialMsg = makeMsg("srv-002", "Mid msg", "2026-08-06T09:00:00.000Z");
    const realtimeMsg = makeMsg("srv-003", "New msg", "2026-08-06T10:00:00.000Z");

    const result = mergeAndReconcileMessages({
      historicalPages: [[historicalMsg]],
      initialMessages: [initialMsg],
      realtimeMessages: [realtimeMsg],
    });

    expect(result).toHaveLength(3);
    expect(result[0]._id).toBe("srv-001");
    expect(result[1]._id).toBe("srv-002");
    expect(result[2]._id).toBe("srv-003");
  });
});
