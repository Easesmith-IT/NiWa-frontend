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
      <div className="space-y-2.5">
        {activities.slice(0, 6).map((activity) => (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#282B2E] dark:bg-[#17191B]" key={activity._id}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-foreground">{activity.description}</p>
              <span className="rounded bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:bg-[#25282B]">
                {activity.type}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {activity.actorName} • {formatDateTime(activity.createdAt)}
            </p>
          </div>
        ))}
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity recorded.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
