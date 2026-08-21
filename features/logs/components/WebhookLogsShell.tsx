import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { useWebhookLogsOrchestration } from "../hooks/useWebhookLogsOrchestration";

export interface WebhookLogsShellProps {
  orchestration: ReturnType<typeof useWebhookLogsOrchestration>;
}

export const WebhookLogsShell: React.FC<WebhookLogsShellProps> = ({ orchestration }) => {
  const {
    page,
    setPage,
    from,
    setFrom,
    to,
    setTo,
    eventType,
    setEventType,
    processed,
    setProcessed,
    responseCode,
    setResponseCode,
    logsQuery,
    handleExport,
  } = orchestration;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          WhatsApp Webhook Event Logs
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Audit inbound Meta Cloud API webhooks, event type dispatches, and processing status.
        </p>
      </section>

      <Card className="space-y-4 p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <Input onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
          <Input onChange={(event) => setTo(event.target.value)} type="date" value={to} />
          <Input className="font-mono text-xs" onChange={(event) => setEventType(event.target.value)} placeholder="Event type..." value={eventType} />
          <Input onChange={(event) => setProcessed(event.target.value)} placeholder="Processed (true/false)" value={processed} />
          <Input className="font-mono text-xs" onChange={(event) => setResponseCode(event.target.value)} placeholder="Response code (200)" value={responseCode} />
          <Button onClick={handleExport} type="button" variant="secondary">
            Export JSON
          </Button>
        </div>

        <div className="space-y-3">
          {(logsQuery.data?.logs ?? []).map((log) => (
            <div key={log._id} className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4E7] pb-2.5 dark:border-[#292C2F]">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#176B4D] dark:text-[#359B76]">
                    {log.eventType}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Response: <span className="font-mono font-medium text-foreground">{log.responseCode}</span> • {log.responseTimeMs} ms • {log.processed ? <span className="text-[#16803C] dark:text-[#3FA66F] font-semibold">Processed</span> : <span className="text-amber-700 dark:text-amber-400 font-semibold">Pending</span>}
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Webhook Event Payload</p>
                <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-3 font-mono text-[11px] text-[#E4E4E7]">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            </div>
          ))}
          {!logsQuery.isLoading && !logsQuery.data?.logs.length ? (
            <p className="text-xs text-muted-foreground">No webhook logs found matching your filters.</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F2] dark:border-[#202326]">
          <p className="text-xs text-muted-foreground">
            Page {logsQuery.data?.pagination.page ?? page} of {logsQuery.data?.pagination.totalPages ?? 1}
          </p>
          <div className="flex gap-2">
            <Button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} size="sm" type="button" variant="secondary">
              Previous
            </Button>
            <Button
              disabled={Boolean(logsQuery.data && page >= logsQuery.data.pagination.totalPages)}
              onClick={() => setPage((current) => current + 1)}
              size="sm"
              type="button"
              variant="primary"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
