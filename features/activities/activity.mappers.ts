import type { ActivityRecord } from "./activity.types";

export const mapActivityRecord = (record: ActivityRecord): ActivityRecord => ({
  ...record,
  description: record.description ? record.description.trim() : "",
});
