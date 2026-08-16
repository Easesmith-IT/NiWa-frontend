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
  lastMessageAt?: string | null;
  lastReadAt?: string | null;
  lastReadMessageId?: string | null;
  lastMessageDirection?: "incoming" | "outgoing";
  lastMessageStatus?: string;
  lastMessageText: string;
  lastMessageType?: string;
  status: "archived" | "closed" | "open";
  unreadCount: number;
  waId: string;
  aiMode?: "co-pilot" | "off" | "on";
  assignedAgentId?: string | null;
}

export interface MessageRecordV1 extends V1RecordBase {
  contactData?: Array<Record<string, unknown>>;
  conversationId?: string;
  contextData?: Record<string, unknown>;
  contactId?: string;
  direction: "incoming" | "outgoing";
  errorCode?: string | null;
  errorDetails?: string | null;
  errorTitle?: string | null;
  interactiveData?: Record<string, unknown>;
  interactiveType?: string | null;
  locationData?: Record<string, unknown>;
  media?: {
    caption?: string;
    filename?: string;
    metaMediaId?: string | null;
    mimeType?: string | null;
    sha256?: string | null;
    voice?: boolean;
  };
  metaMessageId?: string | null;
  metaTimestamp?: string | null;
  messageType: string;
  previewText: string;
  reactionData?: Record<string, unknown>;
  replyTo?: {
    _id: string;
    direction: "incoming" | "outgoing";
    messageType: string;
    previewText: string;
  } | null;
  replyToMessageId?: string | null;
  replyToMetaMessageId?: string | null;
  source?: "api" | "automation" | "manual" | "scheduled" | "template" | "webhook";
  status: string;
  statusTimeline?: Array<{
    at: string;
    status: string;
  }>;
  statusTimestamps?: {
    deliveredAt?: string | null;
    failedAt?: string | null;
    queuedAt?: string | null;
    readAt?: string | null;
    receivedAt?: string | null;
    sentAt?: string | null;
  };
  templateLanguageCode?: string | null;
  templateName?: string | null;
  textBody?: string;
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

export interface ContactImportRecordV1 {
  id: string;
  fileName: string;
  status: "uploaded" | "validating" | "ready" | "importing" | "completed" | "failed";
  headers: string[];
  columnMapping?: Record<string, string>;
  stats: {
    totalRows: number;
    processedRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    existingContacts: number;
    newContacts: number;
    updatedContacts: number;
  };
  preview?: Array<{
    rowNumber: number;
    data: Record<string, unknown>;
    isValid: boolean;
    statusReason: string | null;
    normalizedPhone: string | null;
  }>;
  errorSummary?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
