import { formatDateTime } from "../utils/formatters";
import { PanelSection } from "./PanelSection";

export interface ActivityItem {
  _id: string;
  actorName: string;
  createdAt?: string;
  description: string;
  type: string;
}

export interface ContactActivitySectionProps {
  activities: ActivityItem[];
}

export function ContactActivitySection({ activities }: ContactActivitySectionProps) {
  return (
    <PanelSection title="Activity">
      <div className="space-y-3">
        {activities.slice(0, 6).map((activity) => (
          <div className="rounded-xl bg-white px-4 py-4" key={activity._id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#25342f]">{activity.description}</p>
              <span className="rounded-full bg-[#f6f1e9] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#7a8b82]">
                {activity.type}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#7a8b82]">
              {activity.actorName} • {formatDateTime(activity.createdAt)}
            </p>
          </div>
        ))}
        {activities.length === 0 ? (
          <p className="text-sm text-[#7a8b82]">No activity recorded.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
