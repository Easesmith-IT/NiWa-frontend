"use client";

import { Suspense } from "react";
import { TemplatesShell, useTemplatesOrchestration } from "../../../features/templates";

function TemplatesPageContent() {
  const orchestration = useTemplatesOrchestration();
  return <TemplatesShell orchestration={orchestration} />;
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesPageContent />
    </Suspense>
  );
}
