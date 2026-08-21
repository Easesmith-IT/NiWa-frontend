"use client";

import { useState } from "react";
import { exportWebhookLogsV1 } from "../logs.api";
import { useWebhookLogsV1Query } from "../logs.queries";

export function useWebhookLogsOrchestration() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [eventType, setEventType] = useState("");
  const [processed, setProcessed] = useState("");
  const [responseCode, setResponseCode] = useState("");

  const params = {
    page,
    eventType: eventType || undefined,
    from: from || undefined,
    processed: processed || undefined,
    responseCode: responseCode || undefined,
    to: to || undefined,
  };

  const logsQuery = useWebhookLogsV1Query(params);

  const handleExport = async () => {
    const data = await exportWebhookLogsV1(params);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "niwa-webhook-logs.json";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
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
  };
}
