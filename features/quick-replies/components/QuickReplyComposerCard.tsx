import React from "react";
import { PencilLine, Slash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export interface QuickReplyComposerCardProps {
  editingId: string | null;
  draft: {
    body: string;
    category: string;
    shortcut: string;
    title: string;
    variables: string;
  };
  onDraftChange: (updater: (current: QuickReplyComposerCardProps["draft"]) => QuickReplyComposerCardProps["draft"]) => void;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const QuickReplyComposerCard: React.FC<QuickReplyComposerCardProps> = ({
  editingId,
  draft,
  onDraftChange,
  isSaving,
  onSave,
  onReset,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <Slash className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <h2 className="text-sm font-semibold text-foreground">
          {editingId ? "Edit Quick Reply" : "Create Quick Reply"}
        </h2>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Shortcut *</label>
        <Input
          onChange={(event) => onDraftChange((current) => ({ ...current, shortcut: event.target.value }))}
          placeholder="e.g. /pricing"
          value={draft.shortcut}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Title *</label>
        <Input
          onChange={(event) => onDraftChange((current) => ({ ...current, title: event.target.value }))}
          placeholder="e.g. Pricing follow-up"
          value={draft.title}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Category</label>
        <Input
          onChange={(event) => onDraftChange((current) => ({ ...current, category: event.target.value }))}
          placeholder="e.g. sales"
          value={draft.category}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Variables (comma-separated)</label>
        <Input
          onChange={(event) => onDraftChange((current) => ({ ...current, variables: event.target.value }))}
          placeholder="e.g. firstName, company"
          value={draft.variables}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Body Content *</label>
        <Textarea
          className="min-h-32 text-xs"
          onChange={(event) => onDraftChange((current) => ({ ...current, body: event.target.value }))}
          placeholder="Hi {{firstName}}, sharing the latest pricing for {{company}}."
          value={draft.body}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1 font-medium"
          disabled={!draft.shortcut.trim() || !draft.title.trim() || !draft.body.trim() || isSaving}
          onClick={onSave}
          type="button"
          variant="primary"
        >
          <PencilLine className="h-3.5 w-3.5" />
          {editingId ? "Save Quick Reply" : "Create Quick Reply"}
        </Button>
        <Button onClick={onReset} type="button" variant="secondary">
          Reset
        </Button>
      </div>
    </Card>
  );
};
