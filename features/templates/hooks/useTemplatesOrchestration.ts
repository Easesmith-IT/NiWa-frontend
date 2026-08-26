"use client";

import { useMemo, useState } from "react";
import { useSyncTemplatesMutation, useTemplatesPaginatedQuery } from "../templates.queries";

export function useTemplatesOrchestration() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const templatesQuery = useTemplatesPaginatedQuery({
    category: category || undefined,
    language: language || undefined,
    query: query || undefined,
    status: status || undefined,
  });

  const syncMutation = useSyncTemplatesMutation();

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
