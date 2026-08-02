export interface V1CursorPagination {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface V1ListResponse<TItem> {
  data: TItem[];
  pagination: V1CursorPagination;
}

export interface V1RecordBase {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelRecordV1 extends V1RecordBase {
  color: string;
  description?: string | null;
  name: string;
  slug: string;
}

export interface ContactCustomFieldRecordV1 {
  key: string;
  type: "boolean" | "date" | "number" | "text";
  value: string;
}

export interface ContactRecordV1 extends V1RecordBase {
  avatarUrl?: string | null;
  company?: string | null;
  customFields?: ContactCustomFieldRecordV1[];
  displayName: string;
  email?: string | null;
  isArchived?: boolean;
  labels?: string[];
  phoneNumber: string;
  phoneNumberE164?: string;
  profileName?: string | null;
  waId: string;
}

export interface ConversationRecordV1 extends V1RecordBase {
  contactId: string;
  lastMessageDirection?: "incoming" | "outgoing";
  lastMessageStatus?: string;
  lastMessageText: string;
  lastMessageType?: string;
  status: "archived" | "closed" | "open";
  unreadCount: number;
  waId: string;
}

export interface MessageRecordV1 extends V1RecordBase {
  conversationId?: string;
  contactId?: string;
  direction: "incoming" | "outgoing";
  messageType: string;
  previewText: string;
  status: string;
}

export interface NoteRecordV1 extends V1RecordBase {
  authorName: string;
  contactId?: string;
  content: string;
  conversationId?: string | null;
  pinned: boolean;
}

export interface ActivityRecordV1 extends V1RecordBase {
  actorName: string;
  description: string;
  entityId: string;
  entityType: string;
  type: string;
}
