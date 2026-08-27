import type { NoteRecord } from "../../lib/api/api-types";

export const mapNoteRecord = (record: NoteRecord): NoteRecord => ({
  ...record,
  content: record.content.trim(),
});
