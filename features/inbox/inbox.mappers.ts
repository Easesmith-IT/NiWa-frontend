import type { InboxThreadDetailV1, InboxThreadRecordV1 } from "./inbox.types";
import { withNullableText } from "../shared/mappers";

export const mapInboxThreadRecordV1 = (record: InboxThreadRecordV1): InboxThreadRecordV1 => ({
  ...record,
  contact: record.contact
    ? {
        ...record.contact,
        company: withNullableText(record.contact.company),
        displayName:
          record.contact.displayName || record.contact.profileName || record.contact.phoneNumber,
        profileName: withNullableText(record.contact.profileName),
      }
    : null,
});

export const mapInboxThreadDetailV1 = (record: InboxThreadDetailV1): InboxThreadDetailV1 => ({
  ...record,
  contact: {
    ...record.contact,
    company: withNullableText(record.contact.company),
    displayName:
      record.contact.displayName || record.contact.profileName || record.contact.phoneNumber,
    email: withNullableText(record.contact.email),
    profileName: withNullableText(record.contact.profileName),
  },
});
