import { formatDateTime } from "../utils/formatters";
import { PanelSection } from "./PanelSection";

const getSchedulePreview = (payload: unknown) => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "body" in payload && typeof payload.body === "string") {
    return payload.body;
  }
  return "Scheduled message";
};

export interface ScheduledSendItem {
  _id: string;
  nextRunAt?: string | null;
  payload: unknown;
  scheduleType: string;
  scheduledFor: string;
  status: string;
}

export interface ScheduledMessagesSectionProps {
  scheduledItems: ScheduledSendItem[];
}

export function ScheduledMessagesSection({ scheduledItems }: ScheduledMessagesSectionProps) {
  return (
    <PanelSection title="Scheduled messages">
      <div className="space-y-2.5">
        {scheduledItems.slice(0, 5).map((item) => (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#282B2E] dark:bg-[#17191B]" key={item._id}>
            <p className="text-xs font-semibold text-foreground">{getSchedulePreview(item.payload)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {item.status} • {item.scheduleType}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatDateTime(item.nextRunAt ?? item.scheduledFor)}
            </p>
          </div>
        ))}
        {scheduledItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">No scheduled sends.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
