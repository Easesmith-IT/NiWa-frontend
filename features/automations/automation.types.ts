export interface AutomationConditionRecord {
  operator: "contains" | "equals" | "exists" | "not_equals";
  source: string;
  value?: string | null;
}

export interface AutomationStepRecord {
  config: Record<string, unknown>;
  type: "create_note" | "create_task" | "send_message" | "wait";
}

export interface AutomationRecord {
  _id: string;
  conditions: AutomationConditionRecord[];
  createdAt?: string;
  description?: string | null;
  name: string;
  status: "active" | "archived" | "paused";
  steps: AutomationStepRecord[];
  trigger: {
    config?: {
      messageTypes?: string[];
    };
    type: "incoming_message" | "manual";
  };
  updatedAt?: string;
}

export interface AutomationRunLogRecord {
  at: string;
  level: "error" | "info" | "success";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationRunRecord {
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
  logs: AutomationRunLogRecord[];
  messageId?: string | null;
  scheduledResumeAt?: string | null;
  startedAt?: string | null;
  status: "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting";
  triggerType: "incoming_message" | "manual";
  updatedAt?: string;
}
