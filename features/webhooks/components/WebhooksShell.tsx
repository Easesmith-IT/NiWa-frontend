import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { useWebhooksOrchestration } from "../hooks/useWebhooksOrchestration";
import { downloadWebhookJson } from "../hooks/useWebhooksOrchestration";
import { WebhooksHeader } from "./WebhooksHeader";

export interface WebhooksShellProps {
  orchestration: ReturnType<typeof useWebhooksOrchestration>;
}

export const WebhooksShell: React.FC<WebhooksShellProps> = ({ orchestration }) => {
  const {
    eventType,
    setEventType,
    eventCategory,
    setEventCategory,
    processingState,
    setProcessingState,
    selectedEvent,
    setSelectedEvent,
    webhooksQuery,
    testWebhookMutation,
    reconcileWebhookMutation,
    latestEvents,
    missingFields,
    subscriptionCount,
    reconcileMessage,
    handleTestWebhook,
    handleReconcileWebhook,
  } = orchestration;

  return (
    <div className="space-y-4">
      <WebhooksHeader />

      <Card className="space-y-4 p-4">
        <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
          <h2 className="text-sm font-semibold text-foreground">Webhook Verification & Diagnostics</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meta Verification Endpoint
            </p>
            <p className="mt-1 break-all font-mono text-xs text-foreground">
              {webhooksQuery.data?.metaWebhookEndpoint ?? "Loading..."}
            </p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Verification State
            </p>
            <p className="mt-1 text-xs text-foreground">
              Verify token configured: <span className="font-semibold">{webhooksQuery.data?.verifyTokenConfigured ? "Yes" : "No"}</span>
            </p>
            <p className="mt-0.5 text-xs text-foreground">
              Subscription health: <span className="font-semibold text-[#176B4D] dark:text-[#359B76]">{webhooksQuery.data?.subscriptionHealth ?? "Unknown"}</span>
            </p>
            {missingFields.length ? (
              <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">
                Missing: {missingFields.join(", ")}
              </p>
            ) : null}
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Callback Health
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
              Saved URL: {webhooksQuery.data?.configuredWebhookUrl || "Not set"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last Event: {webhooksQuery.data?.lastEventAt ? new Date(webhooksQuery.data.lastEventAt).toLocaleString() : "None"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Subscriptions: {subscriptionCount}
            </p>
            {webhooksQuery.data?.callbackUrlMatchesBackendEndpoint === false ? (
              <p className="mt-1 text-xs text-[#C2413A] dark:text-[#D7685C]">
                Meta callback URL does not match live backend.
              </p>
            ) : null}
            {webhooksQuery.data?.callbackUrlMatchesBackendEndpoint ? (
              <p className="mt-1 text-xs text-[#16803C] dark:text-[#3FA66F] font-semibold">
                Meta callback URL verified matching live backend.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5 border-y border-[#F0F0F2] py-3 dark:border-[#202326]">
          <Input className="font-mono text-xs" onChange={(event) => setEventType(event.target.value)} placeholder="Event type..." value={eventType} />
          <Input onChange={(event) => setEventCategory(event.target.value)} placeholder="Category..." value={eventCategory} />
          <Input onChange={(event) => setProcessingState(event.target.value)} placeholder="Processing state..." value={processingState} />
          <Button
            disabled={testWebhookMutation.isPending}
            onClick={handleTestWebhook}
            type="button"
            variant="secondary"
          >
            {testWebhookMutation.isPending ? "Sending..." : "Create Test Event"}
          </Button>
          <Button
            disabled={reconcileWebhookMutation.isPending || webhooksQuery.isLoading}
            onClick={handleReconcileWebhook}
            type="button"
            variant="primary"
          >
            {reconcileWebhookMutation.isPending ? "Repairing..." : "Repair Subscription"}
          </Button>
        </div>
        {reconcileMessage ? (
          <p className={`text-xs font-medium ${reconcileWebhookMutation.data?.success ? "text-[#16803C] dark:text-[#3FA66F]" : "text-[#C2413A] dark:text-[#D7685C]"}`}>
            {reconcileMessage}
          </p>
        ) : null}
        {reconcileWebhookMutation.isError ? (
          <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">
            Failed to repair Meta subscription. Check API logs for exact Graph response.
          </p>
        ) : null}

        <div className="space-y-2.5">
          {latestEvents.map((event) => (
            <div key={event._id} className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E4E7] pb-2 dark:border-[#202326]">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {event.eventCategory ?? event.eventType}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.eventSummary ?? event.eventType}
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono text-[#176B4D] dark:text-[#359B76]">Type: {event.eventType}</span>
                <span>• State: {event.processingState ?? (event.processed ? "processed" : "failed")}</span>
                <span>• Retry: {event.retryStatus}</span>
                <span>• Response: {event.responseCode}</span>
              </div>
              {event.errorMessage ? (
                <p className="mt-1.5 text-xs text-[#C2413A] dark:text-[#D7685C]">{event.errorMessage}</p>
              ) : null}
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button onClick={() => setSelectedEvent(event)} size="sm" type="button" variant="secondary">
                  View Payload JSON
                </Button>
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2));
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Copy JSON
                </Button>
                <Button
                  onClick={() => downloadWebhookJson(`webhook-${event._id}.json`, event.payload)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Download JSON
                </Button>
              </div>
            </div>
          ))}
          {!webhooksQuery.isLoading && !latestEvents.length ? (
            <p className="text-xs text-muted-foreground">No webhook events recorded yet.</p>
          ) : null}
        </div>
      </Card>

      {selectedEvent ? (
        <Card className="space-y-3.5 p-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Webhook Event Detail Payload</h3>
              <p className="mt-0.5 font-mono text-xs text-[#176B4D] dark:text-[#359B76]">
                {selectedEvent.eventCategory ?? selectedEvent.eventType}
              </p>
            </div>
            <Button onClick={() => setSelectedEvent(null)} size="sm" type="button" variant="secondary">
              Close
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-3 font-mono text-[11px] text-[#E4E4E7]">
            {JSON.stringify(selectedEvent.payload, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
};
