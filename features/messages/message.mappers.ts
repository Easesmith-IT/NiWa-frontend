import type { MessageRecordV1 } from "../../lib/api/v1-types";

export const mapMessageRecordV1 = (record: MessageRecordV1): MessageRecordV1 => ({
  ...record,
  previewText: record.previewText || `[${record.messageType}]`,
});
