"use client";

import { ApiLogsShell, useApiLogsOrchestration } from "../../../../features/logs";

export default function ApiLogsPage() {
  const orchestration = useApiLogsOrchestration();
  return <ApiLogsShell orchestration={orchestration} />;
}
