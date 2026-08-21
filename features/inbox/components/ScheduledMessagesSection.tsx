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
      <div className="space-y-3">
        {scheduledItems.slice(0, 5).map((item) => (
          <div className="rounded-xl bg-white px-4 py-4" key={item._id}>
            <p className="text-sm font-medium text-[#25342f]">{getSchedulePreview(item.payload)}</p>
            <p className="mt-1 text-xs text-[#7a8b82]">
              {item.status} • {item.scheduleType}
            </p>
            <p className="mt-1 text-xs text-[#7a8b82]">
              {formatDateTime(item.nextRunAt ?? item.scheduledFor)}
            </p>
          </div>
        ))}
        {scheduledItems.length === 0 ? (
          <p className="text-sm text-[#7a8b82]">No scheduled sends.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
