import React from "react";
import Link from "next/link";

export const AutomationHeader: React.FC = () => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Automation Engine
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Build operator automations that react to inbound WhatsApp messages, condition rules, wait steps, and audit execution trails.
          </p>
        </div>
        <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Run Telemetry</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitor active runs, wait queues, and step execution logs.
          </p>
          <Link
            className="mt-2.5 inline-flex h-8 items-center justify-center rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-foreground shadow-subtle transition-colors hover:bg-[#F4F4F5] dark:border-[#292C2F] dark:bg-[#121416] dark:hover:bg-[#1C1F21]"
            href="/automations/runs"
          >
            Open Runs Log
          </Link>
        </div>
      </div>
    </section>
  );
};
