import { v1ApiClient } from "../../lib/api/v1-client";
import type { V1ListResponse } from "../../lib/api/v1-types";
import type { ScheduledMessageRecordV1 } from "./scheduled-message.types";

export const listScheduledMessagesV1 = async (params?: {
  contactId?: string;
  status?: string;
}) => {
  const response = await v1ApiClient.get<V1ListResponse<ScheduledMessageRecordV1>>(
    "/scheduled-messages",
    { params },
  );
  return response.data;
};

export const createScheduledMessageV1 = async (payload: {
  contactId: string;
  conversationId?: string;
  payload: Record<string, unknown>;
  payloadType: "audio" | "document" | "image" | "template" | "text" | "video";
  recurrenceRule?: "daily" | "monthly" | "weekly";
  scheduleType: "one_time" | "recurring";
  scheduledFor: string;
  timezone: string;
}) => {
  const response = await v1ApiClient.post<{ data: ScheduledMessageRecordV1 }>(
    "/scheduled-messages",
    payload,
  );
  return response.data;
};

export const patchScheduledMessageV1 = async (
  scheduledMessageId: string,
  payload: Partial<{
    payload: Record<string, unknown>;
    recurrenceRule: "daily" | "monthly" | "weekly" | null;
    scheduledFor: string;
    timezone: string;
  }>,
) => {
  const response = await v1ApiClient.patch<{ data: ScheduledMessageRecordV1 }>(
    `/scheduled-messages/${scheduledMessageId}`,
    payload,
  );
  return response.data;
};

export const setScheduledMessageLifecycleV1 = async (
  scheduledMessageId: string,
  action: "cancel" | "pause" | "resume" | "retry",
) => {
  const response = await v1ApiClient.post<{ data: ScheduledMessageRecordV1 }>(
    `/scheduled-messages/${scheduledMessageId}/${action}`,
  );
  return response.data;
};
