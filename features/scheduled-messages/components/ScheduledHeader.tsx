import React from "react";

export interface ScheduledHeaderProps {
  activeCount: number;
  failedCount: number;
}

export const ScheduledHeader: React.FC<ScheduledHeaderProps> = ({
  activeCount,
  failedCount,
}) => {
  return (
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
            <p className="mt-1 text-xl font-bold text-foreground">{activeCount}</p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Failed Delivery</p>
            <p className="mt-1 text-xl font-bold text-[#C2413A] dark:text-[#D7685C]">{failedCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
