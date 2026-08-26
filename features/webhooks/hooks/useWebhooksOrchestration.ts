"use client";

import { useMemo, useState } from "react";
import type { WebhookEventRecord } from "../../../lib/api/types";
import {
  useReconcileWebhookMutation,
  useTestWebhookMutation,
  useWebhooksQuery,
} from "../webhooks.queries";

export const downloadWebhookJson = (fileName: string, value: unknown) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export function useWebhooksOrchestration() {
  const [eventType, setEventType] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [processingState, setProcessingState] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventRecord | null>(null);

  const webhooksQuery = useWebhooksQuery({
    eventCategory: eventCategory || undefined,
    eventType: eventType || undefined,
    processingState: processingState || undefined,
  });

  const testWebhookMutation = useTestWebhookMutation();
  const reconcileWebhookMutation = useReconcileWebhookMutation();

  const latestEvents = useMemo(() => webhooksQuery.data?.events ?? [], [webhooksQuery.data]);
  const missingFields = webhooksQuery.data?.metaWebhookDiagnosticsMissingFields ?? [];
  const subscriptionCount = webhooksQuery.data?.metaAppSubscriptions?.length ?? 0;
  const reconcileMessage = reconcileWebhookMutation.data?.message;

  const handleTestWebhook = () => {
    testWebhookMutation.mutate();
  };

  const handleReconcileWebhook = () => {
    reconcileWebhookMutation.mutate();
  };

  return {
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
  };
}
