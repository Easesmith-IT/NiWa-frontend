export interface CursorPagination {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface OffsetPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ListResponse<TItem> {
  data: TItem[];
  pagination: CursorPagination;
}

export interface OffsetListResponse<TItem> {
  data: TItem[];
  pagination: OffsetPagination;
}

export interface RecordBase {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelRecord extends RecordBase {
  color: string;
  description?: string | null;
  name: string;
  slug: string;
}

export interface ContactCustomFieldRecord {
  key: string;
  type: "boolean" | "date" | "number" | "text";
  value: string;
}

export interface ContactRecord extends RecordBase {
  avatarUrl?: string | null;
  company?: string | null;
  customFields?: ContactCustomFieldRecord[];
  displayName: string;
  email?: string | null;
  isArchived?: boolean;
  labels?: string[];
  phoneNumber: string;
  phoneNumberE164?: string;
  profileName?: string | null;
  waId: string;
}

export interface ConversationRecord extends RecordBase {
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
  aiMode?: "AI_ACTIVE" | "AI_PAUSED" | "HUMAN_ONLY" | "co-pilot" | "off" | "on" | string;
  assignedAgentId?: string | { _id: string } | null;
  metadata?: {
    aiMode?: string;
    [key: string]: unknown;
  };
}

export interface MessageRecord extends RecordBase {
  clientCorrelationId?: string;
  contactData?: Array<Record<string, unknown>>;
  conversationId?: string;
  contextData?: Record<string, unknown>;
  contactId?: string;
  direction: "incoming" | "outgoing";
  errorCode?: string | null;
  errorDetails?: string | null;
  errorTitle?: string | null;
  generatedByAI?: boolean;
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
  source?: "api" | "automation" | "manual" | "scheduled" | "template" | "webhook" | "ai" | string;
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
  tempId?: string;
  templateLanguageCode?: string | null;
  templateName?: string | null;
  textBody?: string;
}

export interface NoteRecord extends RecordBase {
  authorName: string;
  contactId?: string;
  content: string;
  conversationId?: string | null;
  pinned: boolean;
}

export interface ActivityRecord extends RecordBase {
  actorName: string;
  description: string;
  entityId: string;
  entityType: string;
  type: string;
}

export interface ContactImportRecord {
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
  failurePhase?: "validation" | "commit" | null;
  createdAt?: string;
  updatedAt?: string;
}
