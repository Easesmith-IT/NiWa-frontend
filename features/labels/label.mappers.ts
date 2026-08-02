import type { LabelRecordV1 } from "../../lib/api/v1-types";
import { withNullableText } from "../shared/mappers";

export const mapLabelRecordV1 = (record: LabelRecordV1): LabelRecordV1 => ({
  ...record,
  description: withNullableText(record.description),
});
