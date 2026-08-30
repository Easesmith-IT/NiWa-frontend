export type LinkedRecordType = "Person" | "Company" | "Lead" | "Deal" | "Conversation";

export interface LinkedRecord {
  recordType: LinkedRecordType;
  recordId: string;
}

export type TaskStatus = "PENDING" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "low" | "medium" | "high";

export interface TaskRecord {
  _id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null;
  linkedRecords: LinkedRecord[];
  contactId?: string | null;
  conversationId?: string | null;
  reminderAt?: string | null;
  createdBy: string;
  updatedBy: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueAt?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string | null;
  linkedRecords?: LinkedRecord[];
  contactId?: string | null;
  conversationId?: string | null;
  reminderAt?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface TaskFilterInput {
  status?: string;
  priority?: string;
  assignedTo?: string;
  contactId?: string;
  dueBefore?: string;
  dueAfter?: string;
  recordType?: LinkedRecordType;
  recordId?: string;
  search?: string;
  limit?: number;
  page?: number;
}
