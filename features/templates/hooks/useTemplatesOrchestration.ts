"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSyncTemplatesMutation, useTemplatesPaginatedQuery } from "../templates.queries";

export function useTemplatesOrchestration() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    () => searchParams?.get("action") === "create",
  );

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

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
    isCreateModalOpen,
    setIsCreateModalOpen,
    templatesQuery,
    syncMutation,
    templates,
    handleSyncFromMeta,
  };
}
