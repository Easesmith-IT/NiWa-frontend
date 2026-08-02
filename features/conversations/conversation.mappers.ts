import type { ConversationRecordV1 } from "../../lib/api/v1-types";

export const mapConversationRecordV1 = (
  record: ConversationRecordV1,
): ConversationRecordV1 => ({
  ...record,
  lastMessageText: record.lastMessageText || "No messages yet",
});
