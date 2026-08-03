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
    <div className="flex flex-col space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e5ddd3] bg-[#fbf7f1] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25342f]">
            WhatsApp Template Studio
          </h1>
          <p className="text-xs text-[#6f7f75]">
            Meta-approved message templates, variable schemas, and interactive previews
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="bg-[#2d644d] text-white hover:bg-[#255440]"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            type="button"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync From Meta"}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e5ddd3] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#7a8b82]" />
          <Input
            className="rounded-xl border-[#ddd2c3] bg-[#fbf7f1] pl-9 text-xs text-[#25342f] placeholder:text-[#7a8b82]"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates by name..."
            value={query}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6f7f75] px-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            className="h-9 rounded-xl border border-[#ddd2c3] bg-[#fbf7f1] px-3 text-xs text-[#25342f] outline-none"
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="h-9 rounded-xl border border-[#ddd2c3] bg-[#fbf7f1] px-3 text-xs text-[#25342f] outline-none"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">All Categories</option>
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>

          <Input
            className="h-9 w-28 rounded-xl border-[#ddd2c3] bg-[#fbf7f1] text-xs text-[#25342f]"
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en_US"
            value={language}
          />
        </div>
      </div>

      {/* Sync Timestamp Banner */}
      <div className="flex items-center justify-between text-xs text-[#7a8b82] px-2">
        <span>
          Last synced:{" "}
          <strong className="text-[#25342f]">
            {templatesQuery.data?.lastSyncedAt
              ? new Date(templatesQuery.data.lastSyncedAt).toLocaleString()
              : "Not synced yet"}
          </strong>
        </span>
        {typeof syncMutation.data?.count === "number" ? (
          <span className="font-semibold text-[#2d644d]">
            ✓ Synced {syncMutation.data.count} template(s) from Meta
          </span>
        ) : null}
      </div>

      {/* Template Card List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <WhatsAppTemplateCard key={template._id} template={template} />
        ))}

        {!templatesQuery.isLoading && templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd2c3] bg-[#fbf7f1] p-12 text-center text-[#7a8b82]">
            <Sparkles className="h-10 w-10 text-[#a0aca4]" />
            <p className="mt-3 text-sm font-semibold text-[#25342f]">No templates found</p>
            <p className="mt-1 text-xs">
              No Meta templates match your filters. Click "Sync From Meta" to pull the latest templates.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
