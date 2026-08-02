import { v1ApiClient } from "../../lib/api/v1-client";
import type { V1ListResponse } from "../../lib/api/v1-types";
import type { AutomationRecordV1, AutomationRunRecordV1 } from "./automation.types";

export const listAutomationsV1 = async (params?: {
  status?: "active" | "archived" | "paused";
}) => {
  const response = await v1ApiClient.get<V1ListResponse<AutomationRecordV1>>("/automations", {
    params,
  });
  return response.data;
};

export const createAutomationV1 = async (payload: {
  conditions: Array<{ operator: "contains" | "equals" | "exists" | "not_equals"; source: string; value?: string }>;
  description?: string;
  name: string;
  steps: Array<{ config: Record<string, unknown>; type: "create_note" | "create_task" | "send_message" | "wait" }>;
  trigger: {
    config?: {
      messageTypes?: string[];
    };
    type: "incoming_message" | "manual";
  };
}) => {
  const response = await v1ApiClient.post<{ data: AutomationRecordV1 }>("/automations", payload);
  return response.data;
};

export const patchAutomationV1 = async (
  automationId: string,
  payload: Partial<{
    conditions: Array<{ operator: "contains" | "equals" | "exists" | "not_equals"; source: string; value?: string }>;
    description: string | null;
    name: string;
    status: "active" | "archived" | "paused";
    steps: Array<{ config: Record<string, unknown>; type: "create_note" | "create_task" | "send_message" | "wait" }>;
    trigger: {
      config?: {
        messageTypes?: string[];
      };
      type: "incoming_message" | "manual";
    };
  }>,
) => {
  const response = await v1ApiClient.patch<{ data: AutomationRecordV1 }>(
    `/automations/${automationId}`,
    payload,
  );
  return response.data;
};

export const setAutomationLifecycleV1 = async (
  automationId: string,
  action: "activate" | "archive" | "pause",
) => {
  const response = await v1ApiClient.post<{ data: AutomationRecordV1 }>(
    `/automations/${automationId}/${action}`,
  );
  return response.data;
};

export const testAutomationV1 = async (
  automationId: string,
  payload: {
    contactId: string;
    conversationId?: string;
    messageId?: string;
  },
) => {
  const response = await v1ApiClient.post<{ data: AutomationRunRecordV1 }>(
    `/automations/${automationId}/test`,
    payload,
  );
  return response.data;
};

export const listAutomationRunsV1 = async (params?: {
  automationId?: string;
  status?: "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting";
}) => {
  const response = await v1ApiClient.get<V1ListResponse<AutomationRunRecordV1>>(
    "/automations/runs",
    { params },
  );
  return response.data;
};

export const getAutomationRunV1 = async (runId: string) => {
  const response = await v1ApiClient.get<{ data: AutomationRunRecordV1 }>(`/automations/runs/${runId}`);
  return response.data;
};
