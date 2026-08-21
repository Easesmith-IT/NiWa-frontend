"use client";

import { useMemo, useState } from "react";
import {
  useCreateScheduledMessageV1Mutation,
  usePatchScheduledMessageV1Mutation,
  useScheduledMessageLifecycleV1Mutation,
  useScheduledMessagesV1Query,
} from "../scheduled-message.queries";
import type { ScheduledMessageRecordV1 } from "../scheduled-message.types";

export const getDefaultScheduleDate = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const toIsoFromDateInput = (value: string) => {
  if (!value) {
    return "";
  }

  return new Date(`${value}T09:00:00.000Z`).toISOString();
};

export function useScheduledMessagesOrchestration() {
  const [contactId, setContactId] = useState("");
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState(getDefaultScheduleDate);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "cancelled" | "failed" | "paused" | "queued" | "sent" | "upcoming"
  >("all");
  const [scheduleType, setScheduleType] = useState<"one_time" | "recurring">("one_time");
  const [recurrenceRule, setRecurrenceRule] = useState<"daily" | "monthly" | "weekly">("daily");
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [editingRecurrenceRule, setEditingRecurrenceRule] = useState<"daily" | "monthly" | "weekly">("daily");

  const scheduledMessagesQuery = useScheduledMessagesV1Query(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const createScheduledMessageMutation = useCreateScheduledMessageV1Mutation();
  const patchScheduledMessageMutation = usePatchScheduledMessageV1Mutation();
  const lifecycleMutation = useScheduledMessageLifecycleV1Mutation();

  const scheduledMessages = scheduledMessagesQuery.data?.data ?? [];

  const scheduledCounts = useMemo(
    () => ({
      active: scheduledMessages.filter((item) => ["queued", "upcoming"].includes(item.status)).length,
      failed: scheduledMessages.filter((item) => item.status === "failed").length,
    }),
    [scheduledMessages],
  );

  const handleCreateSchedule = () => {
    if (!contactId.trim() || !body.trim() || createScheduledMessageMutation.isPending) return;

    createScheduledMessageMutation.mutate(
      {
        contactId: contactId.trim(),
        payload: { body: body.trim() },
        payloadType: "text",
        recurrenceRule: scheduleType === "recurring" ? recurrenceRule : undefined,
        scheduleType,
        scheduledFor: toIsoFromDateInput(scheduledFor),
        timezone: "Asia/Calcutta",
      },
      {
        onSuccess: () => {
          setContactId("");
          setBody("");
          setScheduledFor(getDefaultScheduleDate());
          setScheduleType("one_time");
          setRecurrenceRule("daily");
        },
      },
    );
  };

  const handleStartEdit = (item: ScheduledMessageRecordV1) => {
    setEditingScheduleId(item._id);
    setEditingBody(typeof item.payload.body === "string" ? item.payload.body : "");
    setEditingDate(item.scheduledFor.slice(0, 10));
    setEditingRecurrenceRule(item.recurrenceRule ?? "daily");
  };

  const handleCancelEdit = () => {
    setEditingScheduleId(null);
    setEditingBody("");
    setEditingDate("");
  };

  const handleSaveEdit = (item: ScheduledMessageRecordV1) => {
    if (!editingBody.trim() || !editingDate || patchScheduledMessageMutation.isPending) return;

    patchScheduledMessageMutation.mutate(
      {
        payload: {
          payload: { ...item.payload, body: editingBody.trim() },
          recurrenceRule: item.scheduleType === "recurring" ? editingRecurrenceRule : null,
          scheduledFor: toIsoFromDateInput(editingDate),
          timezone: item.timezone,
        },
        scheduledMessageId: item._id,
      },
      {
        onSuccess: () => {
          setEditingScheduleId(null);
          setEditingBody("");
          setEditingDate("");
        },
      },
    );
  };

  const handlePauseLifecycle = (scheduledMessageId: string) => {
    lifecycleMutation.mutate({ action: "pause", scheduledMessageId });
  };

  const handleResumeLifecycle = (scheduledMessageId: string) => {
    lifecycleMutation.mutate({ action: "resume", scheduledMessageId });
  };

  const handleRetryLifecycle = (scheduledMessageId: string) => {
    lifecycleMutation.mutate({ action: "retry", scheduledMessageId });
  };

  const handleCancelLifecycle = (scheduledMessageId: string) => {
    lifecycleMutation.mutate({ action: "cancel", scheduledMessageId });
  };

  return {
    contactId,
    setContactId,
    body,
    setBody,
    scheduledFor,
    setScheduledFor,
    statusFilter,
    setStatusFilter,
    scheduleType,
    setScheduleType,
    recurrenceRule,
    setRecurrenceRule,
    editingScheduleId,
    setEditingScheduleId,
    editingBody,
    setEditingBody,
    editingDate,
    setEditingDate,
    editingRecurrenceRule,
    setEditingRecurrenceRule,
    scheduledMessagesQuery,
    createScheduledMessageMutation,
    patchScheduledMessageMutation,
    lifecycleMutation,
    scheduledMessages,
    scheduledCounts,
    handleCreateSchedule,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handlePauseLifecycle,
    handleResumeLifecycle,
    handleRetryLifecycle,
    handleCancelLifecycle,
  };
}
