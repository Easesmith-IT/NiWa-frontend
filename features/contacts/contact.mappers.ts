import type { ContactRecord } from "../../lib/api/api-types";
import { withDisplayPhoneNumber, withNullableText } from "../shared/mappers";

export const mapContactRecord = (record: ContactRecord): ContactRecord => ({
  ...record,
  company: withNullableText(record.company),
  displayName: record.displayName || record.profileName || record.phoneNumber,
  email: withNullableText(record.email),
  phoneNumber: withDisplayPhoneNumber(record.phoneNumber) ?? record.phoneNumber,
  phoneNumberE164: withDisplayPhoneNumber(record.phoneNumberE164 ?? record.phoneNumber) ?? record.phoneNumberE164,
  profileName: withNullableText(record.profileName),
});
