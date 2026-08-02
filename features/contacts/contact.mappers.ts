import type { ContactRecordV1 } from "../../lib/api/v1-types";
import { withNullableText } from "../shared/mappers";

export const mapContactRecordV1 = (record: ContactRecordV1): ContactRecordV1 => ({
  ...record,
  company: withNullableText(record.company),
  displayName: record.displayName || record.profileName || record.phoneNumber,
  email: withNullableText(record.email),
  profileName: withNullableText(record.profileName),
});
