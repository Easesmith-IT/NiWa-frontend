import { apiClient } from "../../lib/api/api-client";
import type { ListResponse } from "../../lib/api/api-types";
import type { ScheduledMessageRecord } from "./scheduled-message.types";

export const listScheduledMessages = async (params?: {
  contactId?: string;
  status?: string;
}) => {
  const response = await apiClient.get<ListResponse<ScheduledMessageRecord>>(
    "/scheduled-messages",
    { params },
  );
  return response.data;
};

export const createScheduledMessage = async (payload: {
  contactId: string;
  conversationId?: string;
  payload: Record<string, unknown>;
  payloadType: "audio" | "document" | "image" | "template" | "text" | "video";
  recurrenceRule?: "daily" | "monthly" | "weekly";
  scheduleType: "one_time" | "recurring";
  scheduledFor: string;
  timezone: string;
}) => {
  const response = await apiClient.post<{ data: ScheduledMessageRecord }>(
    "/scheduled-messages",
    payload,
  );
  return response.data;
};

export const patchScheduledMessage = async (
  scheduledMessageId: string,
  payload: Partial<{
    payload: Record<string, unknown>;
    recurrenceRule: "daily" | "monthly" | "weekly" | null;
    scheduledFor: string;
    timezone: string;
  }>,
) => {
  const response = await apiClient.patch<{ data: ScheduledMessageRecord }>(
    `/scheduled-messages/${scheduledMessageId}`,
    payload,
  );
  return response.data;
};

export const setScheduledMessageLifecycle = async (
  scheduledMessageId: string,
  action: "cancel" | "pause" | "resume" | "retry",
) => {
  const response = await apiClient.post<{ data: ScheduledMessageRecord }>(
    `/scheduled-messages/${scheduledMessageId}/${action}`,
  );
  return response.data;
};
