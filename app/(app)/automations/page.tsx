"use client";

import { AutomationShell, useAutomationOrchestration } from "../../../features/automations";

export default function AutomationsPage() {
  const orchestration = useAutomationOrchestration();
  return <AutomationShell orchestration={orchestration} />;
}
