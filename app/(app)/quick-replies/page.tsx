"use client";

import { QuickRepliesShell, useQuickRepliesOrchestration } from "../../../features/quick-replies";

export default function QuickRepliesPage() {
  const orchestration = useQuickRepliesOrchestration();
  return <QuickRepliesShell orchestration={orchestration} />;
}
