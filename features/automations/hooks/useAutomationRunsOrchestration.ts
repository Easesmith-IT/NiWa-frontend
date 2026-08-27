"use client";

import { useState } from "react";
import { useAutomationRunsQuery } from "../automation.queries";

export const formatAutomationRunDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

export function useAutomationRunsOrchestration() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "cancelled" | "completed" | "failed" | "queued" | "running" | "waiting"
  >("all");

  const runsQuery = useAutomationRunsQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );

  const runs = runsQuery.data?.data ?? [];

  return {
    statusFilter,
    setStatusFilter,
    runsQuery,
    runs,
  };
}
