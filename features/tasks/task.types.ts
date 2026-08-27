export interface TaskRecord {
  _id: string;
  completedAt?: string | null;
  contactId: string;
  conversationId?: string | null;
  createdAt?: string;
  description?: string | null;
  dueAt?: string | null;
  priority: "high" | "low" | "medium";
  reminderAt?: string | null;
  status: "cancelled" | "completed" | "todo";
  title: string;
  updatedAt?: string;
}
