"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, Bot, ChevronRight } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { useAutomationRunsV1Query } from "../../../../features/automations";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

export default function AutomationRunsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting"
  >("all");
  const runsQuery = useAutomationRunsV1Query(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const runs = runsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(18,41,48,0.96),rgba(44,73,70,0.88))] p-6 text-[#f7f0de] shadow-[0_20px_60px_rgba(13,29,24,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c29b]">
              Automation runs
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Execution trail</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#d9e6dd]">
              Inspect queued, waiting, successful, and failed automation runs with step logs.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-card px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent hover:text-accent-foreground"
            href="/automations"
          >
            Back to automations
          </Link>
        </div>
      </section>

      <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {(["all", "queued", "running", "waiting", "completed", "failed", "cancelled"] as const).map(
            (status) => (
              <Button
                className="rounded-full"
                key={status}
                onClick={() => setStatusFilter(status)}
                size="sm"
                type="button"
                variant={statusFilter === status ? "primary" : "secondary"}
              >
                {status}
              </Button>
            ),
          )}
        </div>

        {runs.map((run) => (
          <Link href={`/automations/runs/${run._id}`} key={run._id}>
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-[1.4rem] bg-[#faf7ef] p-4 transition hover:bg-[#f5efdf]">
              <div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{run.automationName}</p>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {run.triggerType} | {run.status}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Started: {formatDateTime(run.startedAt || run.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last step index: {run.currentStepIndex}
                </p>
                {run.lastError ? (
                  <p className="mt-2 text-sm text-[#a2412d]">{run.lastError}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                {run.logs.length} log entries
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}

        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No automation runs match this filter yet.</p>
        ) : null}
      </Card>
    </div>
  );
}
