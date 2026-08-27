import type { ConversationRecord } from "../../lib/api/api-types";

export const mapConversationRecord = (
  record: ConversationRecord,
): ConversationRecord => ({
  ...record,
  lastMessageText: record.lastMessageText || "No messages yet",
});
