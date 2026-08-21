"use client";

import { ScheduledShell, useScheduledMessagesOrchestration } from "../../../features/scheduled-messages";

export default function ScheduledPage() {
  const orchestration = useScheduledMessagesOrchestration();
  return <ScheduledShell orchestration={orchestration} />;
}
