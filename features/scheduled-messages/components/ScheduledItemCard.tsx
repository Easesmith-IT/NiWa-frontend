import React from "react";
import { PauseCircle, PencilLine, PlayCircle, RotateCcw, Send, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { ScheduledMessageRecord } from "../scheduled-message.types";

export interface ScheduledItemCardProps {
  item: ScheduledMessageRecord;
  editingScheduleId: string | null;
  editingBody: string;
  onEditingBodyChange: (value: string) => void;
  editingDate: string;
  onEditingDateChange: (value: string) => void;
  editingRecurrenceRule: "daily" | "monthly" | "weekly";
  onEditingRecurrenceRuleChange: (value: "daily" | "monthly" | "weekly") => void;
  isSavingEdit: boolean;
  onStartEdit: (item: ScheduledMessageRecord) => void;
  onCancelEdit: () => void;
  onSaveEdit: (item: ScheduledMessageRecord) => void;
  onPauseLifecycle: (id: string) => void;
  onResumeLifecycle: (id: string) => void;
  onRetryLifecycle: (id: string) => void;
  onCancelLifecycle: (id: string) => void;
}

export const ScheduledItemCard: React.FC<ScheduledItemCardProps> = ({
  item,
  editingScheduleId,
  editingBody,
  onEditingBodyChange,
  editingDate,
  onEditingDateChange,
  editingRecurrenceRule,
  onEditingRecurrenceRuleChange,
  isSavingEdit,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onPauseLifecycle,
  onResumeLifecycle,
  onRetryLifecycle,
  onCancelLifecycle,
}) => {
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
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
              onClick={() => onStartEdit(item)}
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
              onClick={() => onPauseLifecycle(item._id)}
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
              onClick={() => onResumeLifecycle(item._id)}
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
              onClick={() => onRetryLifecycle(item._id)}
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
              onClick={() => onCancelLifecycle(item._id)}
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
            onChange={(event) => onEditingBodyChange(event.target.value)}
            value={editingBody}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <Input onChange={(event) => onEditingDateChange(event.target.value)} type="date" value={editingDate} />
            {item.scheduleType === "recurring" ? (
              <select
                className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
                onChange={(event) =>
                  onEditingRecurrenceRuleChange(event.target.value as "daily" | "monthly" | "weekly")
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
              disabled={!editingBody.trim() || !editingDate || isSavingEdit}
              onClick={() => onSaveEdit(item)}
              size="sm"
              type="button"
              variant="primary"
            >
              Save Changes
            </Button>
            <Button
              onClick={onCancelEdit}
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
  );
};
