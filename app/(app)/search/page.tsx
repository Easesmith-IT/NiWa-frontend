"use client";

import { SearchShell, useSearchOrchestration } from "../../../features/search";

export default function SearchPage() {
  const orchestration = useSearchOrchestration();
  return <SearchShell orchestration={orchestration} />;
}
