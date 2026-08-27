import type { LabelRecord } from "../../lib/api/api-types";
import { withNullableText } from "../shared/mappers";

export const mapLabelRecord = (record: LabelRecord): LabelRecord => ({
  ...record,
  description: withNullableText(record.description),
});
