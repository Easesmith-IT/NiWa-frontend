"use client";

import { useMemo, useState } from "react";
import { useSyncTemplatesV1Mutation, useTemplatesV1Query } from "../templates.queries";

export function useTemplatesOrchestration() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const templatesQuery = useTemplatesV1Query({
    category: category || undefined,
    language: language || undefined,
    query: query || undefined,
    status: status || undefined,
  });

  const syncMutation = useSyncTemplatesV1Mutation();

  const templates = useMemo(() => templatesQuery.data?.templates ?? [], [templatesQuery.data]);

  const handleSyncFromMeta = () => {
    syncMutation.mutate();
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    category,
    setCategory,
    language,
    setLanguage,
    templatesQuery,
    syncMutation,
    templates,
    handleSyncFromMeta,
  };
}
