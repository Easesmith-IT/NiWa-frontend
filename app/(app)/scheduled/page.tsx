"use client";

import { useMemo, useState } from "react";
import { CalendarClock, PauseCircle, PencilLine, PlayCircle, RotateCcw, Send, XCircle } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useCreateScheduledMessageV1Mutation,
  usePatchScheduledMessageV1Mutation,
  useScheduledMessageLifecycleV1Mutation,
  useScheduledMessagesV1Query,
} from "../../../features/scheduled-messages";

const getDefaultScheduleDate = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

const toIsoFromDateInput = (value: string) => {
  if (!value) {
    return "";
  }

  return new Date(`${value}T09:00:00.000Z`).toISOString();
};

export default function ScheduledPage() {
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

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(18,41,48,0.96),rgba(56,86,78,0.86))] p-6 text-[#f8f1de] shadow-[0_20px_60px_rgba(13,29,24,0.28)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c29b]">
              Scheduled messages
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Queue and delivery calendar</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#d9e6dd]">
              Stage 5 adds restart-safe delivery planning through BullMQ-backed scheduled sends.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[1.4rem] bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4c29b]">Active</p>
              <p className="mt-2 text-2xl font-semibold">{scheduledCounts.active}</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4c29b]">Failed</p>
              <p className="mt-2 text-2xl font-semibold">{scheduledCounts.failed}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[390px_minmax(0,1fr)]">
        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Create schedule</h2>
          </div>
          <Input
            onChange={(event) => setContactId(event.target.value)}
            placeholder="Contact id"
            value={contactId}
          />
          <textarea
            className="min-h-28 w-full rounded-[1.4rem] border border-input bg-[#faf7ef] px-4 py-3 text-sm outline-none"
            onChange={(event) => setBody(event.target.value)}
            placeholder="Scheduled text body"
            value={body}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input onChange={(event) => setScheduledFor(event.target.value)} type="date" value={scheduledFor} />
            <select
              className="h-11 rounded-2xl border border-input bg-[#faf7ef] px-3 text-sm outline-none"
              onChange={(event) => setScheduleType(event.target.value as "one_time" | "recurring")}
              value={scheduleType}
            >
              <option value="one_time">One time</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
          {scheduleType === "recurring" ? (
            <select
              className="h-11 rounded-2xl border border-input bg-[#faf7ef] px-3 text-sm outline-none"
              onChange={(event) => setRecurrenceRule(event.target.value as "daily" | "monthly" | "weekly")}
              value={recurrenceRule}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          ) : null}
          <Button
            className="w-full rounded-full"
            disabled={!contactId.trim() || !body.trim() || createScheduledMessageMutation.isPending}
            onClick={() =>
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
              )
            }
            type="button"
          >
            {createScheduledMessageMutation.isPending ? "Scheduling..." : "Create schedule"}
          </Button>
        </Card>

        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {(["all", "upcoming", "queued", "paused", "sent", "failed", "cancelled"] as const).map((status) => (
              <Button
                className="rounded-full"
                key={status}
                onClick={() => setStatusFilter(status)}
                size="sm"
                type="button"
                variant={statusFilter === status ? "primary" : "secondary"}
              >
                {status}
              </Button>
            ))}
          </div>
          {scheduledMessages.map((item) => (
            <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={item._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {item.payloadType} | {item.scheduleType}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(item.payload.body as string) || "No body preview"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.status} | {new Date(item.scheduledFor).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next run: {item.nextRunAt ? new Date(item.nextRunAt).toLocaleString() : "None"}
                  </p>
                  {item.lastError ? (
                    <p className="mt-2 text-xs text-red-600">{item.lastError}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {item.status !== "sent" && item.status !== "cancelled" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => {
                        setEditingScheduleId(item._id);
                        setEditingBody(typeof item.payload.body === "string" ? item.payload.body : "");
                        setEditingDate(item.scheduledFor.slice(0, 10));
                        setEditingRecurrenceRule(item.recurrenceRule ?? "daily");
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : null}
                  {item.status === "queued" || item.status === "upcoming" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => lifecycleMutation.mutate({ action: "pause", scheduledMessageId: item._id })}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : null}
                  {item.status === "paused" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => lifecycleMutation.mutate({ action: "resume", scheduledMessageId: item._id })}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                  ) : null}
                  {item.status === "failed" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => lifecycleMutation.mutate({ action: "retry", scheduledMessageId: item._id })}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  ) : null}
                  {item.status !== "sent" && item.status !== "cancelled" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => lifecycleMutation.mutate({ action: "cancel", scheduledMessageId: item._id })}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  ) : null}
                  {item.status === "sent" ? (
                    <span className="inline-flex items-center rounded-full bg-[#e4f4e7] px-3 py-2 text-xs font-semibold text-[#235534]">
                      <Send className="mr-2 h-4 w-4" />
                      Sent
                    </span>
                  ) : null}
                </div>
              </div>
              {editingScheduleId === item._id ? (
                <div className="mt-4 rounded-[1.2rem] border border-[#e5dcc9] bg-white/80 p-4">
                  <div className="grid gap-3">
                    <Textarea
                      className="min-h-24 rounded-[1.1rem] bg-white"
                      onChange={(event) => setEditingBody(event.target.value)}
                      value={editingBody}
                    />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input onChange={(event) => setEditingDate(event.target.value)} type="date" value={editingDate} />
                      {item.scheduleType === "recurring" ? (
                        <select
                          className="h-11 rounded-2xl border border-input bg-white px-3 text-sm outline-none"
                          onChange={(event) =>
                            setEditingRecurrenceRule(event.target.value as "daily" | "monthly" | "weekly")
                          }
                          value={editingRecurrenceRule}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="rounded-full"
                        disabled={!editingBody.trim() || !editingDate || patchScheduledMessageMutation.isPending}
                        onClick={() =>
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
                          )
                        }
                        size="sm"
                        type="button"
                      >
                        Save changes
                      </Button>
                      <Button
                        className="rounded-full"
                        onClick={() => {
                          setEditingScheduleId(null);
                          setEditingBody("");
                          setEditingDate("");
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          {scheduledMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduled messages match this filter yet.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
