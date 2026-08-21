"use client";

import { WebhooksShell, useWebhooksOrchestration } from "../../../features/webhooks";

export default function WebhooksPage() {
  const orchestration = useWebhooksOrchestration();
  return <WebhooksShell orchestration={orchestration} />;
}
