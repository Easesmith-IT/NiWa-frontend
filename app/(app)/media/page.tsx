"use client";

import { MediaShell, useMediaOrchestration } from "../../../features/media";

export default function MediaPage() {
  const orchestration = useMediaOrchestration();
  return <MediaShell orchestration={orchestration} />;
}
