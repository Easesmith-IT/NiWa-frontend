import { apiClient } from "../../lib/api/api-client";
import type { ListResponse } from "../../lib/api/api-types";
import type { AutomationRecord, AutomationRunRecord } from "./automation.types";

export const listAutomations = async (params?: {
  status?: "active" | "archived" | "paused";
}) => {
  const response = await apiClient.get<ListResponse<AutomationRecord>>("/automations", {
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
  const response = await apiClient.post<{ data: AutomationRecord }>("/automations", payload);
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
  const response = await apiClient.patch<{ data: AutomationRecord }>(
    `/automations/${automationId}`,
    payload,
  );
  return response.data;
};

export const setAutomationLifecycleV1 = async (
  automationId: string,
  action: "activate" | "archive" | "pause",
) => {
  const response = await apiClient.post<{ data: AutomationRecord }>(
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
  const response = await apiClient.post<{ data: AutomationRunRecord }>(
    `/automations/${automationId}/test`,
    payload,
  );
  return response.data;
};

export const listAutomationRuns = async (params?: {
  automationId?: string;
  status?: "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting";
}) => {
  const response = await apiClient.get<ListResponse<AutomationRunRecord>>(
    "/automations/runs",
    { params },
  );
  return response.data;
};

export const getAutomationRunV1 = async (runId: string) => {
  const response = await apiClient.get<{ data: AutomationRunRecord }>(`/automations/runs/${runId}`);
  return response.data;
};
