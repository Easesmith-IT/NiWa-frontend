import assert from "node:assert";
import { describe, it } from "node:test";

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

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]._id, "srv-201");
    assert.strictEqual(result[0].status, "delivered");
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

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]._id, "srv-202");
  });

  it("does NOT incorrectly deduplicate identical message bodies with distinct IDs", () => {
    const msg1 = makeMsg("srv-301", "Hello", "2026-08-06T10:00:00.000Z", "wamid.1");
    const msg2 = makeMsg("srv-302", "Hello", "2026-08-06T10:00:01.000Z", "wamid.2");

    const result = mergeAndReconcileMessages({
      initialMessages: [msg1, msg2],
    });

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0]._id, "srv-301");
    assert.strictEqual(result[1]._id, "srv-302");
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

    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0]._id, "srv-001");
    assert.strictEqual(result[1]._id, "srv-002");
    assert.strictEqual(result[2]._id, "srv-003");
  });
});
