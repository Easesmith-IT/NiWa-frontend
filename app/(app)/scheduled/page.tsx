"use client";

import { CalendarClock, PauseCircle, PencilLine, PlayCircle, RotateCcw, Send, XCircle } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useScheduledMessagesOrchestration } from "../../../features/scheduled-messages";

export default function ScheduledPage() {
  const {
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
    editingBody,
    setEditingBody,
    editingDate,
    setEditingDate,
    editingRecurrenceRule,
    setEditingRecurrenceRule,
    createScheduledMessageMutation,
    patchScheduledMessageMutation,
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
  } = useScheduledMessagesOrchestration();

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Scheduled Messages & Queue
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Configure one-time or recurring message schedules, track BullMQ delivery queues, and monitor status.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Queued</p>
              <p className="mt-1 text-xl font-bold text-foreground">{scheduledCounts.active}</p>
            </div>
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Failed Delivery</p>
              <p className="mt-1 text-xl font-bold text-[#C2413A] dark:text-[#D7685C]">{scheduledCounts.failed}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="space-y-3.5 p-4">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            <CalendarClock className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
            <h2 className="text-sm font-semibold text-foreground">Create Schedule</h2>
          </div>
          <Input
            onChange={(event) => setContactId(event.target.value)}
            placeholder="Contact ID (E.164 / V1 ID)"
            value={contactId}
          />
          <Textarea
            className="min-h-24 text-xs"
            onChange={(event) => setBody(event.target.value)}
            placeholder="Scheduled message text..."
            value={body}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input onChange={(event) => setScheduledFor(event.target.value)} type="date" value={scheduledFor} />
            <select
              className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
              onChange={(event) => setScheduleType(event.target.value as "one_time" | "recurring")}
              value={scheduleType}
            >
              <option value="one_time">One time</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
          {scheduleType === "recurring" ? (
            <select
              className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
              onChange={(event) => setRecurrenceRule(event.target.value as "daily" | "monthly" | "weekly")}
              value={recurrenceRule}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          ) : null}
          <Button
            className="w-full font-medium"
            disabled={!contactId.trim() || !body.trim() || createScheduledMessageMutation.isPending}
            onClick={handleCreateSchedule}
            type="button"
            variant="primary"
          >
            {createScheduledMessageMutation.isPending ? "Scheduling..." : "Create Schedule"}
          </Button>
        </Card>

        <Card className="space-y-3.5 p-4">
          <div className="flex flex-wrap gap-1.5 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            {(["all", "upcoming", "queued", "paused", "sent", "failed", "cancelled"] as const).map((status) => (
              <Button
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
          <div className="space-y-2.5">
            {scheduledMessages.map((item) => (
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]" key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {item.payloadType} • {item.scheduleType}
                    </p>
                    <p className="mt-1 text-xs text-foreground">
                      {(item.payload.body as string) || "No body preview"}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.status} • {new Date(item.scheduledFor).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Next run: {item.nextRunAt ? new Date(item.nextRunAt).toLocaleString() : "None"}
                    </p>
                    {item.lastError ? (
                      <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">{item.lastError}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {item.status !== "sent" && item.status !== "cancelled" ? (
                      <Button
                        onClick={() => handleStartEdit(item)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    ) : null}
                    {item.status === "queued" || item.status === "upcoming" ? (
                      <Button
                        onClick={() => handlePauseLifecycle(item._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <PauseCircle className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                    ) : null}
                    {item.status === "paused" ? (
                      <Button
                        onClick={() => handleResumeLifecycle(item._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        Resume
                      </Button>
                    ) : null}
                    {item.status === "failed" ? (
                      <Button
                        onClick={() => handleRetryLifecycle(item._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retry
                      </Button>
                    ) : null}
                    {item.status !== "sent" && item.status !== "cancelled" ? (
                      <Button
                        onClick={() => handleCancelLifecycle(item._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    ) : null}
                    {item.status === "sent" ? (
                      <span className="inline-flex items-center rounded-full bg-[#EDF8F3] px-2.5 py-1 text-xs font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
                        <Send className="mr-1 h-3 w-3" />
                        Sent
                      </span>
                    ) : null}
                  </div>
                </div>
                {editingScheduleId === item._id ? (
                  <div className="mt-3 rounded-md border border-[#E4E4E7] bg-white p-3 space-y-2.5 dark:border-[#292C2F] dark:bg-[#121416]">
                    <Textarea
                      className="min-h-20 text-xs"
                      onChange={(event) => setEditingBody(event.target.value)}
                      value={editingBody}
                    />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input onChange={(event) => setEditingDate(event.target.value)} type="date" value={editingDate} />
                      {item.scheduleType === "recurring" ? (
                        <select
                          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
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
                        disabled={!editingBody.trim() || !editingDate || patchScheduledMessageMutation.isPending}
                        onClick={() => handleSaveEdit(item)}
                        size="sm"
                        type="button"
                        variant="primary"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {scheduledMessages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No scheduled messages match this filter.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
