import type { MessageRecord } from "../../lib/api/api-types";

export const mapMessageRecord = (record: MessageRecord): MessageRecord => ({
  ...record,
  previewText: record.previewText || `[${record.messageType}]`,
});
