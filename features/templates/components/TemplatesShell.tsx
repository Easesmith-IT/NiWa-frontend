import React from "react";
import { Sparkles } from "lucide-react";
import type { useTemplatesOrchestration } from "../hooks/useTemplatesOrchestration";
import { TemplatesFilterBar } from "./TemplatesFilterBar";
import { TemplatesHeader } from "./TemplatesHeader";
import { WhatsAppTemplateCard } from "./WhatsAppTemplateCard";

export interface TemplatesShellProps {
  orchestration: ReturnType<typeof useTemplatesOrchestration>;
}

export const TemplatesShell: React.FC<TemplatesShellProps> = ({ orchestration }) => {
  const {
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
  } = orchestration;

  return (
    <div className="flex flex-col space-y-4">
      <TemplatesHeader
        isSyncing={syncMutation.isPending}
        onSync={handleSyncFromMeta}
      />

      <TemplatesFilterBar
        category={category}
        language={language}
        onCategoryChange={setCategory}
        onLanguageChange={setLanguage}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        query={query}
        status={status}
      />

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
};
