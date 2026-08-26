import React from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export interface ScheduledCreateCardProps {
  contactId: string;
  onContactIdChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  scheduledFor: string;
  onScheduledForChange: (value: string) => void;
  scheduleType: "one_time" | "recurring";
  onScheduleTypeChange: (value: "one_time" | "recurring") => void;
  recurrenceRule: "daily" | "monthly" | "weekly";
  onRecurrenceRuleChange: (value: "daily" | "monthly" | "weekly") => void;
  isCreating: boolean;
  onCreateSchedule: () => void;
}

export const ScheduledCreateCard: React.FC<ScheduledCreateCardProps> = ({
  contactId,
  onContactIdChange,
  body,
  onBodyChange,
  scheduledFor,
  onScheduledForChange,
  scheduleType,
  onScheduleTypeChange,
  recurrenceRule,
  onRecurrenceRuleChange,
  isCreating,
  onCreateSchedule,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <CalendarClock className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <h2 className="text-sm font-semibold text-foreground">Create Schedule</h2>
      </div>
      <Input
        onChange={(event) => onContactIdChange(event.target.value)}
        placeholder="Contact ID (E.164 / Phone)"
        value={contactId}
      />
      <Textarea
        className="min-h-24 text-xs"
        onChange={(event) => onBodyChange(event.target.value)}
        placeholder="Scheduled message text..."
        value={body}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input onChange={(event) => onScheduledForChange(event.target.value)} type="date" value={scheduledFor} />
        <select
          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onScheduleTypeChange(event.target.value as "one_time" | "recurring")}
          value={scheduleType}
        >
          <option value="one_time">One time</option>
          <option value="recurring">Recurring</option>
        </select>
      </div>
      {scheduleType === "recurring" ? (
        <select
          className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onRecurrenceRuleChange(event.target.value as "daily" | "monthly" | "weekly")}
          value={recurrenceRule}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      ) : null}
      <Button
        className="w-full font-medium"
        disabled={!contactId.trim() || !body.trim() || isCreating}
        onClick={onCreateSchedule}
        type="button"
        variant="primary"
      >
        {isCreating ? "Scheduling..." : "Create Schedule"}
      </Button>
    </Card>
  );
};
