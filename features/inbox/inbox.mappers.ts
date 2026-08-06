import type { InboxThreadDetailV1, InboxThreadRecordV1 } from "./inbox.types";
import { withDisplayPhoneNumber, withNullableText } from "../shared/mappers";

export const mapInboxThreadRecordV1 = (record: InboxThreadRecordV1): InboxThreadRecordV1 => ({
  ...record,
  contact: record.contact
    ? {
        ...record.contact,
        company: withNullableText(record.contact.company),
        displayName:
          record.contact.displayName || record.contact.profileName || record.contact.phoneNumber,
        phoneNumber: withDisplayPhoneNumber(record.contact.phoneNumber) ?? record.contact.phoneNumber,
        profileName: withNullableText(record.contact.profileName),
      }
    : null,
});

export const mapInboxThreadDetailV1 = (record: InboxThreadDetailV1): InboxThreadDetailV1 => ({
  ...record,
  activities: Array.isArray(record.activities) ? record.activities : [],
  conversation: record.conversation
    ? {
        ...record.conversation,
        aiMode:
          (record.conversation as any)?.aiMode ||
          (record.conversation as any)?.metadata?.aiMode ||
          "AI_ACTIVE",
      }
    : record.conversation,
  contact: {
    ...record.contact,
    company: withNullableText(record.contact.company),
    displayName:
      record.contact.displayName || record.contact.profileName || record.contact.phoneNumber,
    email: withNullableText(record.contact.email),
    phoneNumber: withDisplayPhoneNumber(record.contact.phoneNumber) ?? record.contact.phoneNumber,
    phoneNumberE164:
      withDisplayPhoneNumber(record.contact.phoneNumberE164 ?? record.contact.phoneNumber) ??
      record.contact.phoneNumberE164,
    profileName: withNullableText(record.contact.profileName),
  },
  messages: Array.isArray(record.messages) ? record.messages : [],
  notes: Array.isArray(record.notes) ? record.notes : [],
});
