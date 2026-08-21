import type { MessageRecordV1 } from "./inbox.types";

export function getMessageTimestampMs(message: MessageRecordV1): number {
  const ts = message.metaTimestamp || message.createdAt;
  if (!ts) return 0;
  return new Date(ts).getTime();
}

export function mergeAndReconcileMessages(params: {
  initialMessages?: MessageRecordV1[];
  historicalPages?: MessageRecordV1[][];
  realtimeMessages?: MessageRecordV1[];
  optimisticMessages?: MessageRecordV1[];
}): MessageRecordV1[] {
  const initial = params.initialMessages ?? [];
  const historical = (params.historicalPages ?? []).flat();
  const realtime = params.realtimeMessages ?? [];
  const optimistic = params.optimisticMessages ?? [];

  // Combine server-confirmed messages
  const serverMessages = [...historical, ...initial, ...realtime];

  // Map server messages by _id, metaMessageId, and clientCorrelationId / tempId
  const serverById = new Set<string>();
  const serverByMetaId = new Map<string, MessageRecordV1>();
  const serverByCorrelationId = new Map<string, MessageRecordV1>();

  serverMessages.forEach((msg) => {
    if (msg._id) {
      serverById.add(msg._id);
    }
    if (msg.metaMessageId && typeof msg.metaMessageId === "string" && msg.metaMessageId.length > 0) {
      serverByMetaId.set(msg.metaMessageId, msg);
    }
    const correlationId = msg.clientCorrelationId || msg.tempId;
    if (correlationId && typeof correlationId === "string") {
      serverByCorrelationId.set(correlationId, msg);
    }
  });

  // Filter optimistic messages that have been confirmed on server
  const activeOptimistic = optimistic.filter((optMsg) => {
    // 1. Persisted _id match
    if (serverById.has(optMsg._id)) {
      return false;
    }
    // 2. Client correlation ID match
    const optCorrelationId = optMsg.clientCorrelationId || optMsg.tempId;
    if (optCorrelationId && serverByCorrelationId.has(optCorrelationId)) {
      return false;
    }
    // 3. Meta wamid match
    if (optMsg.metaMessageId && serverByMetaId.has(optMsg.metaMessageId)) {
      return false;
    }
    return true;
  });

  // Deduplicate server messages by canonical identity (_id, then metaMessageId)
  const canonicalServerMap = new Map<string, MessageRecordV1>();
  serverMessages.forEach((msg) => {
    const key = msg._id || msg.metaMessageId || String(Math.random());
    const existing = canonicalServerMap.get(key);
    if (!existing) {
      canonicalServerMap.set(key, msg);
    } else {
      canonicalServerMap.set(key, { ...existing, ...msg });
    }
  });

  const allMessages = [...Array.from(canonicalServerMap.values()), ...activeOptimistic];

  // Deterministic chronological sort:
  // Primary: timestamp (metaTimestamp || createdAt)
  // Secondary: createdAt
  // Tertiary: _id
  return allMessages.sort((left, right) => {
    const leftTime = getMessageTimestampMs(left);
    const rightTime = getMessageTimestampMs(right);

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    if (leftCreated !== rightCreated) {
      return leftCreated - rightCreated;
    }

    return String(left._id).localeCompare(String(right._id));
  });
}
