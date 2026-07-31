"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { apiClient } from "../../../../lib/api/client";
import { WebhookLogsResponse } from "../../../../lib/api/types";

export default function WebhookLogsPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [eventType, setEventType] = useState("");
  const [processed, setProcessed] = useState("");
  const [responseCode, setResponseCode] = useState("");

  const logsQuery = useQuery({
    queryKey: ["logs", "webhooks", page, from, to, eventType, processed, responseCode],
    queryFn: async () => {
      const response = await apiClient.get<WebhookLogsResponse>("/logs/webhooks", {
        params: {
          page,
          from: from || undefined,
          to: to || undefined,
          eventType: eventType || undefined,
          processed: processed || undefined,
          responseCode: responseCode || undefined,
        },
      });
      return response.data;
    },
  });

  const handleExport = async () => {
    const response = await apiClient.get("/logs/webhooks", {
      params: {
        export: "json",
        from: from || undefined,
        to: to || undefined,
        eventType: eventType || undefined,
        processed: processed || undefined,
        responseCode: responseCode || undefined,
      },
    });
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "niwa-webhook-logs.json";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Logs
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Webhook Logs</h2>
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-5">
          <Input onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
          <Input onChange={(event) => setTo(event.target.value)} type="date" value={to} />
          <Input onChange={(event) => setEventType(event.target.value)} placeholder="Filter event type" value={eventType} />
          <Input onChange={(event) => setProcessed(event.target.value)} placeholder="processed: true / false" value={processed} />
          <Input onChange={(event) => setResponseCode(event.target.value)} placeholder="Response code" value={responseCode} />
          <Button className="md:col-span-5 xl:col-span-1" onClick={handleExport} type="button" variant="secondary">
            Export JSON
          </Button>
        </div>

        <div className="space-y-3">
          {(logsQuery.data?.logs ?? []).map((log) => (
            <div key={log._id} className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{log.eventType}</p>
                  <p className="text-sm text-muted-foreground">
                    Response {log.responseCode} | {log.responseTimeMs} ms | {log.processed ? "Processed" : "Pending"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          ))}
          {!logsQuery.isLoading && !logsQuery.data?.logs.length ? (
            <p className="text-sm text-muted-foreground">No webhook logs found.</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {logsQuery.data?.pagination.page ?? page} of {logsQuery.data?.pagination.totalPages ?? 1}
          </p>
          <div className="flex gap-3">
            <Button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button" variant="secondary">
              Previous
            </Button>
            <Button
              disabled={Boolean(logsQuery.data && page >= logsQuery.data.pagination.totalPages)}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
