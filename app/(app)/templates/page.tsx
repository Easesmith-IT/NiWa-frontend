"use client";

import { TemplatesShell, useTemplatesOrchestration } from "../../../features/templates";

export default function TemplatesPage() {
  const orchestration = useTemplatesOrchestration();
  return <TemplatesShell orchestration={orchestration} />;
}
