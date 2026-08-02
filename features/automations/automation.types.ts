export interface AutomationConditionRecordV1 {
  operator: "contains" | "equals" | "exists" | "not_equals";
  source: string;
  value?: string | null;
}

export interface AutomationStepRecordV1 {
  config: Record<string, unknown>;
  type: "create_note" | "create_task" | "send_message" | "wait";
}

export interface AutomationRecordV1 {
  _id: string;
  conditions: AutomationConditionRecordV1[];
  createdAt?: string;
  description?: string | null;
  name: string;
  status: "active" | "archived" | "paused";
  steps: AutomationStepRecordV1[];
  trigger: {
    config?: {
      messageTypes?: string[];
    };
    type: "incoming_message" | "manual";
  };
  updatedAt?: string;
}

export interface AutomationRunLogRecordV1 {
  at: string;
  level: "error" | "info" | "success";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationRunRecordV1 {
  _id: string;
  automationId: string;
  automationName: string;
  completedAt?: string | null;
  contactId?: string | null;
  context?: Record<string, unknown>;
  conversationId?: string | null;
  createdAt?: string;
  currentStepIndex: number;
  lastError?: string | null;
  logs: AutomationRunLogRecordV1[];
  messageId?: string | null;
  scheduledResumeAt?: string | null;
  startedAt?: string | null;
  status: "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting";
  triggerType: "incoming_message" | "manual";
  updatedAt?: string;
}
