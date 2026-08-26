import React from "react";
import { Card } from "../../../components/ui/card";
import type { useQuickRepliesOrchestration } from "../hooks/useQuickRepliesOrchestration";
import type { QuickReplyRecord } from "../quick-reply.types";

import { QuickRepliesHeader } from "./QuickRepliesHeader";
import { QuickReplyComposerCard } from "./QuickReplyComposerCard";
import { QuickReplyItemCard } from "./QuickReplyItemCard";

export interface QuickRepliesShellProps {
  orchestration: ReturnType<typeof useQuickRepliesOrchestration>;
}

export const QuickRepliesShell: React.FC<QuickRepliesShellProps> = ({ orchestration }) => {
  const {
    draft,
    setDraft,
    editingId,
    createQuickReplyMutation,
    patchQuickReplyMutation,
    quickReplies,
    groupedQuickReplies,
    handleSaveQuickReply,
    handleResetForm,
    handleStartEdit,
    handleToggleActive,
  } = orchestration;

  const isSaving = createQuickReplyMutation.isPending || patchQuickReplyMutation.isPending;

  return (
    <div className="space-y-4">
      <QuickRepliesHeader />

      <section className="grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
        <QuickReplyComposerCard
          draft={draft}
          editingId={editingId}
          isSaving={isSaving}
          onDraftChange={setDraft}
          onReset={handleResetForm}
          onSave={handleSaveQuickReply}
        />

        <div className="space-y-3.5">
          {Object.entries(groupedQuickReplies).map(([group, items]: [string, QuickReplyRecord[]]) => (
            <Card className="space-y-3 p-4" key={group}>
              <div className="border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <h2 className="text-sm font-semibold text-foreground">Quick Replies</h2>
              </div>
              <div className="space-y-2.5">
                {items.map((quickReply) => (
                  <QuickReplyItemCard
                    key={quickReply._id}
                    onStartEdit={handleStartEdit}
                    onToggleActive={handleToggleActive}
                    quickReply={quickReply}
                  />
                ))}
              </div>
            </Card>
          ))}
          {quickReplies.length === 0 ? (
            <Card className="p-4 text-xs text-muted-foreground">
              No quick replies created yet.
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
};
