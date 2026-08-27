"use client";

import { ConversationsShell, useConversationsOrchestration } from "../../../features/conversations";

export default function ConversationsPage() {
  const orchestration = useConversationsOrchestration();
  return <ConversationsShell orchestration={orchestration} />;
}
