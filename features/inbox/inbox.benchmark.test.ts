import assert from "node:assert";
import { describe, it } from "node:test";

import { mergeAndReconcileMessages } from "./inbox.merge";
import type { MessageRecordV1 } from "./inbox.types";

const generateSyntheticMessages = (count: number): MessageRecordV1[] => {
  const baseTime = new Date("2026-08-01T00:00:00.000Z").getTime();
  const messages: MessageRecordV1[] = [];

  for (let i = 0; i < count; i++) {
    const timestampIso = new Date(baseTime + i * 1000).toISOString();
    messages.push({
      _id: `507f1f77bcf86cd7994${(i + 10000).toString(16)}`,
      direction: i % 2 === 0 ? "incoming" : "outgoing",
      messageType: "text",
      previewText: `Benchmark test message #${i + 1}`,
      textBody: `Benchmark test message #${i + 1}`,
      createdAt: timestampIso,
      metaTimestamp: timestampIso,
      metaMessageId: `wamid.bench.${i + 1}`,
      status: "delivered",
    } as MessageRecordV1);
  }

  return messages;
};

describe("5k / 10k Inbox Stream Stress Benchmark", () => {
  it("processes and reconciles 5,000 messages cleanly", () => {
    const synthetic5k = generateSyntheticMessages(5000);
    const initialPage = synthetic5k.slice(4950, 5000);
    const historicalBatch = synthetic5k.slice(0, 4950);
    const optimistic = [
      {
        _id: "opt-benchmark-1",
        direction: "outgoing",
        messageType: "text",
        previewText: "Optimistic pending message",
        textBody: "Optimistic pending message",
        createdAt: new Date().toISOString(),
        metaTimestamp: new Date().toISOString(),
        status: "queued",
      } as MessageRecordV1,
    ];

    const startTime = performance.now();
    const result = mergeAndReconcileMessages({
      initialMessages: initialPage,
      historicalPages: [historicalBatch],
      optimisticMessages: optimistic,
    });
    const endTime = performance.now();
    const durationMs = endTime - startTime;

    assert.strictEqual(result.length, 5001);
    assert.ok(durationMs < 100, `5k merge took ${durationMs.toFixed(2)}ms, expected < 100ms`);

    console.log(`[STRESS BENCHMARK 5,000 Messages] Duration: ${durationMs.toFixed(2)}ms | Rendered items: ${result.length}`);
  });

  it("processes and reconciles 10,000 messages cleanly", () => {
    const synthetic10k = generateSyntheticMessages(10000);
    const initialPage = synthetic10k.slice(9950, 10000);
    const historicalBatch = synthetic10k.slice(0, 9950);

    const startTime = performance.now();
    const result = mergeAndReconcileMessages({
      initialMessages: initialPage,
      historicalPages: [historicalBatch],
    });
    const endTime = performance.now();
    const durationMs = endTime - startTime;

    assert.strictEqual(result.length, 10000);
    assert.ok(durationMs < 200, `10k merge took ${durationMs.toFixed(2)}ms, expected < 200ms`);

    console.log(`[STRESS BENCHMARK 10,000 Messages] Duration: ${durationMs.toFixed(2)}ms | Rendered items: ${result.length}`);
  });
});
