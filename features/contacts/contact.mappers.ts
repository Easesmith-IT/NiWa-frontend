import type { ContactRecordV1 } from "../../lib/api/v1-types";
import { withDisplayPhoneNumber, withNullableText } from "../shared/mappers";

export const mapContactRecordV1 = (record: ContactRecordV1): ContactRecordV1 => ({
  ...record,
  company: withNullableText(record.company),
  displayName: record.displayName || record.profileName || record.phoneNumber,
  email: withNullableText(record.email),
  phoneNumber: withDisplayPhoneNumber(record.phoneNumber) ?? record.phoneNumber,
  phoneNumberE164: withDisplayPhoneNumber(record.phoneNumberE164 ?? record.phoneNumber) ?? record.phoneNumberE164,
  profileName: withNullableText(record.profileName),
});
