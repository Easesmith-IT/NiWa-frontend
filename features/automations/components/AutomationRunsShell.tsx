import React from "react";
import Link from "next/link";
import { Activity, Bot, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { useAutomationRunsOrchestration } from "../hooks/useAutomationRunsOrchestration";
import { formatAutomationRunDateTime } from "../hooks/useAutomationRunsOrchestration";

export interface AutomationRunsShellProps {
  orchestration: ReturnType<typeof useAutomationRunsOrchestration>;
}

export const AutomationRunsShell: React.FC<AutomationRunsShellProps> = ({ orchestration }) => {
  const { statusFilter, setStatusFilter, runs } = orchestration;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Automation Execution Log
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Audit queued, active, completed, and failed automation runs with step execution logs.
            </p>
          </div>
          <Link
            className="inline-flex h-8.5 items-center justify-center rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-foreground shadow-subtle transition-colors hover:bg-[#F4F4F5]"
            href="/automations"
          >
            Back to Automations
          </Link>
        </div>
      </section>

      <Card className="space-y-3.5 p-4">
        <div className="flex flex-wrap gap-1.5 border-b border-[#F0F0F2] pb-3">
          {(["all", "queued", "running", "waiting", "completed", "failed", "cancelled"] as const).map(
            (status) => (
              <Button
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

        <div className="space-y-2.5">
          {runs.map((run) => (
            <Link href={`/automations/runs/${run._id}`} key={run._id}>
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 transition-colors hover:border-[#D4D4D8] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:border-[#3A3E42]">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                    <p className="text-sm font-semibold text-foreground">{run.automationName}</p>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {run.triggerType} • {run.status}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Started: {formatAutomationRunDateTime(run.startedAt || run.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Step Index: {run.currentStepIndex}
                  </p>
                  {run.lastError ? (
                    <p className="mt-1.5 text-xs text-[#C2413A] dark:text-[#D7685C]">{run.lastError}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  {run.logs.length} log entry{run.logs.length === 1 ? "" : "s"}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {runs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No automation runs match this filter.</p>
        ) : null}
      </Card>
    </div>
  );
};
