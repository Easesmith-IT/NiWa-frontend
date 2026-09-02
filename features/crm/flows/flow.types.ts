export type FlowStatus = "active" | "paused" | "archived";

export type FlowTriggerType =
  | "lead.created"
  | "lead.status_changed"
  | "deal.created"
  | "deal.stage_changed"
  | "deal.won"
  | "deal.lost"
  | "field_value.changed"
  | "task.due"
  | "incoming_message"
  | "manual";

export type FlowOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "IN"
  | "NOT IN"
  | "IS EMPTY"
  | "IS NOT EMPTY"
  | "contains"
  | "exists";

export interface FlowCondition {
  source: string;
  operator: FlowOperator;
  value?: unknown;
  logic?: "AND" | "OR";
}

export type FlowActionType =
  | "create_task"
  | "update_record"
  | "create_activity"
  | "assign_owner"
  | "send_message"
  | "wait";

export interface FlowStep {
  type: FlowActionType;
  config: Record<string, unknown>;
}

export interface CrmFlow {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  status: FlowStatus;
  trigger: {
    type: FlowTriggerType;
    config?: Record<string, unknown>;
  };
  conditions: FlowCondition[];
  steps: FlowStep[];
  revision: number;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlowRunLog {
  at: string;
  level: "info" | "success" | "error";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface CrmFlowRun {
  _id: string;
  workspaceId: string;
  flowId?: string;
  automationName?: string;
  triggerType: FlowTriggerType;
  status: "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled";
  currentStepIndex: number;
  flowSnapshot?: Record<string, unknown>;
  lastError?: string | null;
  logs: FlowRunLog[];
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
