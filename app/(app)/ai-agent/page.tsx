"use client";

import { AIAgentShell, useAIAgentOrchestration } from "../../../features/ai-agent";

export default function AIAgentPage() {
  const orchestration = useAIAgentOrchestration();
  return <AIAgentShell orchestration={orchestration} />;
}
