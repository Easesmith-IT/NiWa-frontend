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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(20,37,39,0.95),rgba(47,69,61,0.88))] p-6 text-[#f7f0de] shadow-[0_20px_60px_rgba(13,29,24,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c29b]">
              Run detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{run?.automationName || "Automation run"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#d9e6dd]">
              Inspect step-by-step execution, wait resumptions, and final errors without leaving NiWa.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-card px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent hover:text-accent-foreground"
            href="/automations/runs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to runs
          </Link>
        </div>
      </section>

      {run ? (
        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Run status</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-[1.2rem] bg-[#faf7ef] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">{run.status}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#faf7ef] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Trigger</p>
                <p className="mt-1 font-medium">{run.triggerType}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#faf7ef] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Started</p>
                <p className="mt-1 font-medium">{formatDateTime(run.startedAt || run.createdAt)}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#faf7ef] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
                <p className="mt-1 font-medium">{formatDateTime(run.completedAt)}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#faf7ef] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Context ids</p>
                <p className="mt-1 font-medium">Contact: {run.contactId || "None"}</p>
                <p className="mt-1 font-medium">Conversation: {run.conversationId || "None"}</p>
                <p className="mt-1 font-medium">Message: {run.messageId || "None"}</p>
              </div>
              {run.lastError ? (
                <div className="rounded-[1.2rem] bg-[#fee9df] p-3 text-[#9f3e29]">
                  <p className="text-xs uppercase tracking-[0.18em]">Last error</p>
                  <p className="mt-1 font-medium">{run.lastError}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Run log</h2>
            </div>
            <div className="space-y-3">
              {run.logs.map((log, index) => (
                <div className="rounded-[1.3rem] bg-[#faf7ef] p-4" key={`${log.at}-${index}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{log.message}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {log.level} | {formatDateTime(log.at)}
                    </p>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 ? (
                    <pre className="mt-3 overflow-x-auto rounded-[1rem] bg-white/80 p-3 text-xs text-muted-foreground">
{JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : (
        <Card className="border-white/60 bg-white/78 p-5 backdrop-blur">
          <p className="text-sm text-muted-foreground">Loading automation run...</p>
        </Card>
      )}
    </div>
  );
}
