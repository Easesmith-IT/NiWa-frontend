"use client";

import { WebhookLogsShell, useWebhookLogsOrchestration } from "../../../../features/logs";

export default function WebhookLogsPage() {
  const orchestration = useWebhookLogsOrchestration();
  return <WebhookLogsShell orchestration={orchestration} />;
}
