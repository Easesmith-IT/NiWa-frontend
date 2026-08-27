import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { useApiLogsOrchestration } from "../hooks/useApiLogsOrchestration";

export interface ApiLogsShellProps {
  orchestration: ReturnType<typeof useApiLogsOrchestration>;
}

export const ApiLogsShell: React.FC<ApiLogsShellProps> = ({ orchestration }) => {
  const {
    page,
    setPage,
    from,
    setFrom,
    to,
    setTo,
    endpoint,
    setEndpoint,
    success,
    setSuccess,
    statusCode,
    setStatusCode,
    logsQuery,
    handleExport,
  } = orchestration;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          API Request Telemetry Logs
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Inspect incoming and outgoing HTTP request payloads, response statuses, and execution latencies.
        </p>
      </section>

      <Card className="space-y-4 p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <Input onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
          <Input onChange={(event) => setTo(event.target.value)} type="date" value={to} />
          <Input className="font-mono text-xs" onChange={(event) => setEndpoint(event.target.value)} placeholder="Endpoint filter..." value={endpoint} />
          <Input onChange={(event) => setSuccess(event.target.value)} placeholder="Success (true/false)" value={success} />
          <Input className="font-mono text-xs" onChange={(event) => setStatusCode(event.target.value)} placeholder="Status code (200)" value={statusCode} />
          <Button onClick={handleExport} type="button" variant="secondary">
            Export JSON
          </Button>
        </div>

        <div className="space-y-3">
          {(logsQuery.data?.logs ?? []).map((log) => (
            <div key={log._id} className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4E7] pb-2.5 dark:border-[#292C2F]">
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    <span className="text-[#176B4D] dark:text-[#359B76] font-bold mr-1.5">{log.method}</span> {log.endpoint}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: <span className="font-mono font-medium text-foreground">{log.statusCode}</span> • {log.durationMs} ms • {log.success ? <span className="text-[#16803C] dark:text-[#3FA66F] font-semibold">Success</span> : <span className="text-[#C2413A] dark:text-[#D7685C] font-semibold">Failure</span>}
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Request Payload</p>
                  <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-3 font-mono text-[11px] text-[#E4E4E7]">
                    {JSON.stringify(log.requestBody, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response Payload</p>
                  <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-3 font-mono text-[11px] text-[#E4E4E7]">
                    {JSON.stringify(log.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
          {!logsQuery.isLoading && !logsQuery.data?.logs.length ? (
            <p className="text-xs text-muted-foreground">No API logs found matching your filters.</p>
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
