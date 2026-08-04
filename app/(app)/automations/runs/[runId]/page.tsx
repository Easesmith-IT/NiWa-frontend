"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3, TerminalSquare } from "lucide-react";

import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { useAutomationRunV1Query } from "../../../../../features/automations";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

export default function AutomationRunDetailPage() {
  const params = useParams<{ runId: string }>();
  const runId = typeof params?.runId === "string" ? params.runId : null;
  const runQuery = useAutomationRunV1Query(runId);
  const run = runQuery.data?.data ?? null;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{run?.automationName || "Automation Run"}</h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Step-by-step execution timeline, rule evaluation, and technical log output.
            </p>
          </div>
          <Link
            className="inline-flex h-8.5 items-center justify-center rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-foreground shadow-subtle transition-colors hover:bg-[#F4F4F5]"
            href="/automations/runs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Runs
          </Link>
        </div>
      </section>

      {run ? (
        <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Run Status</h2>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                <p className="mt-0.5 font-semibold text-foreground">{run.status}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trigger</p>
                <p className="mt-0.5 font-medium text-foreground">{run.triggerType}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Started</p>
                <p className="mt-0.5 font-medium text-foreground">{formatDateTime(run.startedAt || run.createdAt)}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
                <p className="mt-0.5 font-medium text-foreground">{formatDateTime(run.completedAt)}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Technical IDs</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">Contact: {run.contactId || "None"}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">Conversation: {run.conversationId || "None"}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">Message: {run.messageId || "None"}</p>
              </div>
              {run.lastError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-[#C2413A]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider">Last Error</p>
                  <p className="mt-0.5 font-medium">{run.lastError}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5">
              <TerminalSquare className="h-4 w-4 text-[#176B4D]" />
              <h2 className="text-sm font-semibold text-foreground">Execution Log</h2>
            </div>
            <div className="space-y-2.5">
              {run.logs.map((log, index) => (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3" key={`${log.at}-${index}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-foreground">{log.message}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {log.level} • {formatDateTime(log.at)}
                    </p>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 ? (
                    <pre className="mt-2 overflow-x-auto rounded-md border border-[#E4E4E7] bg-white p-2.5 font-mono text-[11px] text-muted-foreground">
{JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Loading automation run details...</p>
        </Card>
      )}
    </div>
  );
}

