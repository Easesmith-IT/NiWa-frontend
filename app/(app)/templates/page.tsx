"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";
import { WhatsAppTemplateCard } from "../../../features/templates";
import type { TemplateRecord, TemplatesResponse, TemplateSyncResponse } from "../../../lib/api/types";

export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const templatesQuery = useQuery({
    queryKey: ["templates", query, status, category, language],
    queryFn: async () => {
      const response = await apiClient.get<TemplatesResponse>("/templates", {
        params: {
          category: category || undefined,
          language: language || undefined,
          query: query || undefined,
          status: status || undefined,
        },
      });
      return response.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<TemplateSyncResponse>("/templates/sync");
      return response.data;
    },
    onSuccess: () => {
      templatesQuery.refetch();
    },
  });

  const templates = useMemo(() => templatesQuery.data?.templates ?? [], [templatesQuery.data]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-3.5 rounded-lg border border-[#E4E4E7] bg-white p-4 shadow-subtle md:flex-row md:items-center md:justify-between dark:border-[#292C2F] dark:bg-[#121416]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            WhatsApp Template Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Meta-approved message templates, schemas, and live message preview canvas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            size="sm"
            type="button"
            variant="primary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync From Meta"}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4E7] bg-white p-3.5 shadow-subtle md:flex-row md:items-center md:justify-between dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8.5 rounded-md border-[#D4D4D8] bg-[#FAFAFA] pl-8.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white dark:border-[#303438] dark:bg-[#17191B] dark:focus:bg-[#121416]"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates by name..."
            value={query}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">All Categories</option>
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>

          <Input
            className="h-8.5 w-24 rounded-md border-[#D4D4D8] bg-[#FAFAFA] text-xs text-foreground dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en_US"
            value={language}
          />
        </div>
      </div>

      {/* Sync Timestamp Banner */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Last synced:{" "}
          <strong className="font-semibold text-foreground">
            {templatesQuery.data?.lastSyncedAt
              ? new Date(templatesQuery.data.lastSyncedAt).toLocaleString()
              : "Not synced yet"}
          </strong>
        </span>
        {typeof syncMutation.data?.count === "number" ? (
          <span className="font-semibold text-[#176B4D] dark:text-[#359B76]">
            ✓ Synced {syncMutation.data.count} template(s) from Meta
          </span>
        ) : null}
      </div>

      {/* Template Card List */}
      <div className="space-y-3.5">
        {templates.map((template) => (
          <WhatsAppTemplateCard key={template._id} template={template} />
        ))}

        {!templatesQuery.isLoading && templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E4E4E7] bg-white p-10 text-center text-muted-foreground dark:border-[#292C2F] dark:bg-[#121416]">
            <Sparkles className="h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-semibold text-foreground">No templates found</p>
            <p className="mt-0.5 text-xs">
              No Meta templates match your filters. Click "Sync From Meta" to update catalog.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

