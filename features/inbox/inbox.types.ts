import type {
  ActivityRecord,
  ContactRecord,
  ConversationRecord,
  MessageRecord,
  NoteRecord,
} from "../../lib/api/api-types";

export type { MessageRecord };

export interface InboxThreadRecord {
  contact: Pick<
    ContactRecord,
    "_id" | "company" | "displayName" | "phoneNumber" | "profileName"
  > & {
    avatarUrl?: string | null;
  } | null;
  conversation: ConversationRecord & {
    pinnedAt?: string | null;
    starred?: boolean;
  };
}

export interface InboxThreadDetail {
  activities: ActivityRecord[];
  contact: ContactRecord;
  conversation: ConversationRecord & {
    awaitingReplyFrom?: "business" | "customer" | "none";
    customerServiceWindowClosesAt?: string | null;
    pinnedAt?: string | null;
    starred?: boolean;
  };
  messages: MessageRecord[];
  notes: NoteRecord[];
}
