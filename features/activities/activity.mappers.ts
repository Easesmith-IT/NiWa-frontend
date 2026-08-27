import type { ActivityRecord } from "../../lib/api/api-types";

export const mapActivityRecord = (record: ActivityRecord): ActivityRecord => ({
  ...record,
  description: record.description.trim(),
});
