export interface ScheduledMessageRecordV1 {
  _id: string;
  attemptCount: number;
  contactId: string;
  conversationId?: string | null;
  createdAt?: string;
  createdBy: string;
  lastError?: string | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  payload: Record<string, unknown>;
  payloadType: "audio" | "document" | "image" | "template" | "text" | "video";
  queueJobId?: string | null;
  recurrenceRule?: "daily" | "monthly" | "weekly" | null;
  scheduleType: "one_time" | "recurring";
  scheduledFor: string;
  sentMessageIds?: string[];
  status: "cancelled" | "failed" | "paused" | "queued" | "sent" | "upcoming";
  timezone: string;
  updatedAt?: string;
}
