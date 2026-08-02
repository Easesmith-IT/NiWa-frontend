import type { ActivityRecordV1 } from "../../lib/api/v1-types";

export const mapActivityRecordV1 = (record: ActivityRecordV1): ActivityRecordV1 => ({
  ...record,
  description: record.description.trim(),
});
