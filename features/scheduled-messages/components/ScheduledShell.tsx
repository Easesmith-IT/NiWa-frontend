import React from "react";
import type { useScheduledMessagesOrchestration } from "../hooks/useScheduledMessagesOrchestration";
import { ScheduledCreateCard } from "./ScheduledCreateCard";
import { ScheduledHeader } from "./ScheduledHeader";
import { ScheduledRegistryCard } from "./ScheduledRegistryCard";

export interface ScheduledShellProps {
  orchestration: ReturnType<typeof useScheduledMessagesOrchestration>;
}

export const ScheduledShell: React.FC<ScheduledShellProps> = ({ orchestration }) => {
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
  } = orchestration;

  return (
    <div className="space-y-4">
      <ScheduledHeader
        activeCount={scheduledCounts.active}
        failedCount={scheduledCounts.failed}
      />

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <ScheduledCreateCard
          body={body}
          contactId={contactId}
          isCreating={createScheduledMessageMutation.isPending}
          onBodyChange={setBody}
          onContactIdChange={setContactId}
          onCreateSchedule={handleCreateSchedule}
          onRecurrenceRuleChange={setRecurrenceRule}
          onScheduleTypeChange={setScheduleType}
          onScheduledForChange={setScheduledFor}
          recurrenceRule={recurrenceRule}
          scheduleType={scheduleType}
          scheduledFor={scheduledFor}
        />

        <ScheduledRegistryCard
          editingBody={editingBody}
          editingDate={editingDate}
          editingRecurrenceRule={editingRecurrenceRule}
          editingScheduleId={editingScheduleId}
          isSavingEdit={patchScheduledMessageMutation.isPending}
          onCancelEdit={handleCancelEdit}
          onCancelLifecycle={handleCancelLifecycle}
          onEditingBodyChange={setEditingBody}
          onEditingDateChange={setEditingDate}
          onEditingRecurrenceRuleChange={setEditingRecurrenceRule}
          onPauseLifecycle={handlePauseLifecycle}
          onResumeLifecycle={handleResumeLifecycle}
          onRetryLifecycle={handleRetryLifecycle}
          onSaveEdit={handleSaveEdit}
          onStartEdit={handleStartEdit}
          onStatusFilterChange={setStatusFilter}
          scheduledMessages={scheduledMessages}
          statusFilter={statusFilter}
        />
      </section>
    </div>
  );
};
