"use client";

import { useState } from "react";
import { exportApiLogs } from "../logs.api";
import { useApiLogsQuery } from "../logs.queries";

export function useApiLogsOrchestration() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [success, setSuccess] = useState("");
  const [statusCode, setStatusCode] = useState("");

  const params = {
    page,
    endpoint: endpoint || undefined,
    from: from || undefined,
    statusCode: statusCode || undefined,
    success: success || undefined,
    to: to || undefined,
  };

  const logsQuery = useApiLogsQuery(params);

  const handleExport = async () => {
    const data = await exportApiLogs(params);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "niwa-api-logs.json";
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
    endpoint,
    setEndpoint,
    success,
    setSuccess,
    statusCode,
    setStatusCode,
    logsQuery,
    handleExport,
  };
}
