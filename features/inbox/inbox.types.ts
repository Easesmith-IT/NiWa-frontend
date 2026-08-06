import type {
  ActivityRecordV1,
  ContactRecordV1,
  ConversationRecordV1,
  MessageRecordV1,
  NoteRecordV1,
} from "../../lib/api/v1-types";

export type { MessageRecordV1 };

export interface InboxThreadRecordV1 {
  contact: Pick<
    ContactRecordV1,
    "_id" | "company" | "displayName" | "phoneNumber" | "profileName"
  > & {
    avatarUrl?: string | null;
  } | null;
  conversation: ConversationRecordV1 & {
    pinnedAt?: string | null;
    starred?: boolean;
  };
}

export interface InboxThreadDetailV1 {
  activities: ActivityRecordV1[];
  contact: ContactRecordV1;
  conversation: ConversationRecordV1 & {
    awaitingReplyFrom?: "business" | "customer" | "none";
    customerServiceWindowClosesAt?: string | null;
    pinnedAt?: string | null;
    starred?: boolean;
  };
  messages: MessageRecordV1[];
  notes: NoteRecordV1[];
}
