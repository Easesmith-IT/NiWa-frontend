"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";
import { TemplateRecord, TemplatesResponse, TemplateSyncResponse } from "../../../lib/api/types";

const componentPreview = (template: TemplateRecord) =>
  template.components
    .map((component) => `${component.type}${component.format ? ` (${component.format})` : ""}${component.text ? `: ${component.text}` : ""}`)
    .join("\n");

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
          query: query || undefined,
          status: status || undefined,
          category: category || undefined,
          language: language || undefined,
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Templates
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Synced WhatsApp Templates</h2>
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_160px_auto]">
          <Input onChange={(event) => setQuery(event.target.value)} placeholder="Search templates by name" value={query} />
          <Input onChange={(event) => setStatus(event.target.value)} placeholder="Status" value={status} />
          <Input onChange={(event) => setCategory(event.target.value)} placeholder="Category" value={category} />
          <Input onChange={(event) => setLanguage(event.target.value)} placeholder="Language" value={language} />
          <Button disabled={syncMutation.isPending} onClick={() => syncMutation.mutate()} variant="secondary">
            {syncMutation.isPending ? "Syncing..." : "Sync From Meta"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Last sync:{" "}
            {templatesQuery.data?.lastSyncedAt
              ? new Date(templatesQuery.data.lastSyncedAt).toLocaleString()
              : "Not synced yet"}
          </span>
          {typeof syncMutation.data?.count === "number" ? (
            <span>
              Synced {syncMutation.data.count} template{syncMutation.data.count === 1 ? "" : "s"}.
            </span>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card className="p-6" key={template._id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {template.language} | {template.category} | {template.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {template.variables.length} variable{template.variables.length === 1 ? "" : "s"}
                </div>
                <div className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-medium text-[#1f513e]">
                  {template.isSendable ? "Sendable" : "Not sendable"}
                </div>
                <Link href={`/message-studio?mode=template&template=${encodeURIComponent(template.name)}&language=${encodeURIComponent(template.language)}`}>
                  <Button size="sm" type="button" variant="secondary">
                    Use in Studio
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Variables
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {template.variables.length ? template.variables.join(", ") : "No body variables"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Components
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
                  {componentPreview(template) || "No component preview"}
                </pre>
              </div>
            </div>
          </Card>
        ))}
        {!templatesQuery.isLoading && templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates stored yet. Run a sync first.</p>
        ) : null}
      </div>
    </div>
  );
}
