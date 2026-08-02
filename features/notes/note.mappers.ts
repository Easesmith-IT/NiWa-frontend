import type { NoteRecordV1 } from "../../lib/api/v1-types";

export const mapNoteRecordV1 = (record: NoteRecordV1): NoteRecordV1 => ({
  ...record,
  content: record.content.trim(),
});
