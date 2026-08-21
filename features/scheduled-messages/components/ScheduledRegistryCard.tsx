import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { ScheduledMessageRecordV1 } from "../scheduled-message.types";
import { ScheduledItemCard } from "./ScheduledItemCard";

export interface ScheduledRegistryCardProps {
  statusFilter: "all" | "cancelled" | "failed" | "paused" | "queued" | "sent" | "upcoming";
  onStatusFilterChange: (status: "all" | "cancelled" | "failed" | "paused" | "queued" | "sent" | "upcoming") => void;
  scheduledMessages: ScheduledMessageRecordV1[];
  editingScheduleId: string | null;
  editingBody: string;
  onEditingBodyChange: (value: string) => void;
  editingDate: string;
  onEditingDateChange: (value: string) => void;
  editingRecurrenceRule: "daily" | "monthly" | "weekly";
  onEditingRecurrenceRuleChange: (value: "daily" | "monthly" | "weekly") => void;
  isSavingEdit: boolean;
  onStartEdit: (item: ScheduledMessageRecordV1) => void;
  onCancelEdit: () => void;
  onSaveEdit: (item: ScheduledMessageRecordV1) => void;
  onPauseLifecycle: (id: string) => void;
  onResumeLifecycle: (id: string) => void;
  onRetryLifecycle: (id: string) => void;
  onCancelLifecycle: (id: string) => void;
}

export const ScheduledRegistryCard: React.FC<ScheduledRegistryCardProps> = ({
  statusFilter,
  onStatusFilterChange,
  scheduledMessages,
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
    <Card className="space-y-3.5 p-4">
      <div className="flex flex-wrap gap-1.5 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        {(["all", "upcoming", "queued", "paused", "sent", "failed", "cancelled"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => onStatusFilterChange(status)}
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
          <ScheduledItemCard
            editingBody={editingBody}
            editingDate={editingDate}
            editingRecurrenceRule={editingRecurrenceRule}
            editingScheduleId={editingScheduleId}
            isSavingEdit={isSavingEdit}
            item={item}
            key={item._id}
            onCancelEdit={onCancelEdit}
            onCancelLifecycle={onCancelLifecycle}
            onEditingBodyChange={onEditingBodyChange}
            onEditingDateChange={onEditingDateChange}
            onEditingRecurrenceRuleChange={onEditingRecurrenceRuleChange}
            onPauseLifecycle={onPauseLifecycle}
            onResumeLifecycle={onResumeLifecycle}
            onRetryLifecycle={onRetryLifecycle}
            onSaveEdit={onSaveEdit}
            onStartEdit={onStartEdit}
          />
        ))}
      </div>
      {scheduledMessages.length === 0 ? (
        <p className="text-xs text-muted-foreground">No scheduled messages match this filter.</p>
      ) : null}
    </Card>
  );
};
