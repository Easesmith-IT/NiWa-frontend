"use client";

import { InboxShell, useInboxOrchestration } from "../../../features/inbox";

export default function InboxPage() {
  const orchestration = useInboxOrchestration();
  return <InboxShell orchestration={orchestration} />;
}
