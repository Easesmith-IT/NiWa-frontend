"use client";

import { AutomationRunsShell, useAutomationRunsOrchestration } from "../../../../features/automations";

export default function AutomationRunsPage() {
  const orchestration = useAutomationRunsOrchestration();
  return <AutomationRunsShell orchestration={orchestration} />;
}
