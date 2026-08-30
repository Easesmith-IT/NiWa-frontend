export type ActivityType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "NOTE"
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "STATUS_CHANGED"
  | "LEAD_CONVERTED"
  | "call"
  | "email"
  | "meeting"
  | "note";

export type ActivityRecordType = "Person" | "Company" | "Lead" | "Deal";

export interface ActivityRecord {
  _id: string;
  workspaceId?: string;
  type: ActivityType | string;
  subject?: string;
  description?: string;
  dueAt?: string | null;
  completedAt?: string | null;
  ownerUserId?: string | null;
  relatedRecordType?: ActivityRecordType | null;
  relatedRecordId?: string | null;
  actorId?: string | null;
  actorName?: string;
  actorType?: string;
  contactId?: string | null;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActivityPayload {
  type: ActivityType;
  subject?: string;
  description?: string;
  dueAt?: string | null;
  completedAt?: string | null;
  ownerUserId?: string | null;
  relatedRecordType?: ActivityRecordType;
  relatedRecordId?: string;
  contactId?: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}
