"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";
import {
  WebhookEventRecord,
  WebhookReconcileResponse,
  WebhooksResponse,
} from "../../../lib/api/types";

const downloadJson = (fileName: string, value: unknown) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default function WebhooksPage() {
  const [eventType, setEventType] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [processingState, setProcessingState] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventRecord | null>(null);

  const webhooksQuery = useQuery({
    queryKey: ["webhooks", eventType, eventCategory, processingState],
    queryFn: async () => {
      const response = await apiClient.get<WebhooksResponse>("/webhooks", {
        params: {
          eventType: eventType || undefined,
          eventCategory: eventCategory || undefined,
          processingState: processingState || undefined,
        },
      });
      return response.data;
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/webhooks/test");
    },
    onSuccess: () => {
      webhooksQuery.refetch();
    },
  });

  const reconcileWebhookMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<WebhookReconcileResponse>("/webhooks/reconcile");
      return response.data;
    },
    onSuccess: () => {
      webhooksQuery.refetch();
    },
  });

  const latestEvents = useMemo(() => webhooksQuery.data?.events ?? [], [webhooksQuery.data]);
  const missingFields = webhooksQuery.data?.metaWebhookDiagnosticsMissingFields ?? [];
  const subscriptionCount = webhooksQuery.data?.metaAppSubscriptions?.length ?? 0;
  const reconcileMessage = reconcileWebhookMutation.data?.message;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Webhooks
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Verification and Events</h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold">Webhook Manager</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f1e4] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Meta Verification Endpoint
            </p>
            <p className="mt-3 break-all font-mono text-sm text-foreground">
              {webhooksQuery.data?.metaWebhookEndpoint ?? "Loading..."}
            </p>
          </div>
          <div className="rounded-2xl bg-[#eef4ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Verification State
            </p>
            <p className="mt-3 text-sm text-foreground">
              Verify token configured: {webhooksQuery.data?.verifyTokenConfigured ? "Yes" : "No"}
            </p>
            <p className="mt-2 text-sm text-foreground">
              Subscription health: {webhooksQuery.data?.subscriptionHealth ?? "Unknown"}
            </p>
            {missingFields.length ? (
              <p className="mt-2 text-sm text-red-700">
                Missing Meta settings: {missingFields.join(", ")}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-[#eef4ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Connection
            </p>
            <p className="mt-3 text-sm text-foreground">
              Saved callback URL: {webhooksQuery.data?.configuredWebhookUrl || "Not set"}
            </p>
            <p className="mt-2 text-sm text-foreground">
              Last event: {webhooksQuery.data?.lastEventAt ? new Date(webhooksQuery.data.lastEventAt).toLocaleString() : "None"}
            </p>
            <p className="mt-2 text-sm text-foreground">
              Meta callback URL: {webhooksQuery.data?.metaCallbackUrl || "Not detected from Meta"}
            </p>
            <p className="mt-2 text-sm text-foreground">
              Active Meta app subscriptions: {subscriptionCount}
            </p>
            {webhooksQuery.data?.callbackUrlMatchesBackendEndpoint === false ? (
              <p className="mt-2 text-sm text-red-700">
                Meta is not subscribed to the live backend callback endpoint.
              </p>
            ) : null}
            {webhooksQuery.data?.callbackUrlMatchesBackendEndpoint ? (
              <p className="mt-2 text-sm text-emerald-700">
                Meta callback matches the live backend endpoint.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Input onChange={(event) => setEventType(event.target.value)} placeholder="Event type" value={eventType} />
          <Input onChange={(event) => setEventCategory(event.target.value)} placeholder="Event category" value={eventCategory} />
          <Input onChange={(event) => setProcessingState(event.target.value)} placeholder="Processing state" value={processingState} />
          <Button
            disabled={testWebhookMutation.isPending}
            onClick={() => testWebhookMutation.mutate()}
            type="button"
            variant="secondary"
          >
            {testWebhookMutation.isPending ? "Sending..." : "Create Test Event"}
          </Button>
          <Button
            disabled={reconcileWebhookMutation.isPending || webhooksQuery.isLoading}
            onClick={() => reconcileWebhookMutation.mutate()}
            type="button"
          >
            {reconcileWebhookMutation.isPending ? "Repairing..." : "Repair Subscription"}
          </Button>
        </div>
        {reconcileMessage ? (
          <p className={`mt-4 text-sm ${reconcileWebhookMutation.data?.success ? "text-emerald-700" : "text-red-700"}`}>
            {reconcileMessage}
          </p>
        ) : null}
        {reconcileWebhookMutation.isError ? (
          <p className="mt-4 text-sm text-red-700">
            Failed to repair Meta subscription. Check API logs for the exact Graph response.
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          {latestEvents.map((event) => (
            <div key={event._id} className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {event.eventCategory ?? event.eventType}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.eventSummary ?? event.eventType}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Type: {event.eventType}</span>
                <span>State: {event.processingState ?? (event.processed ? "processed" : "failed")}</span>
                <span>Retry: {event.retryStatus}</span>
                <span>Response {event.responseCode}</span>
              </div>
              {event.errorMessage ? (
                <p className="mt-2 text-sm text-red-600">{event.errorMessage}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => setSelectedEvent(event)} size="sm" type="button" variant="secondary">
                  View JSON
                </Button>
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2));
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Copy JSON
                </Button>
                <Button
                  onClick={() => downloadJson(`webhook-${event._id}.json`, event.payload)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Download JSON
                </Button>
              </div>
            </div>
          ))}
          {!webhooksQuery.isLoading && !latestEvents.length ? (
            <p className="text-sm text-muted-foreground">No webhook events stored yet.</p>
          ) : null}
        </div>
      </Card>

      {selectedEvent ? (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Webhook Detail</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedEvent.eventCategory ?? selectedEvent.eventType}
              </p>
            </div>
            <Button onClick={() => setSelectedEvent(null)} type="button" variant="secondary">
              Close
            </Button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
            {JSON.stringify(selectedEvent.payload, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
