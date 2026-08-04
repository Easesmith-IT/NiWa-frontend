"use client";

import { useMemo, useState } from "react";
import { PencilLine, Slash, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useCreateQuickReplyV1Mutation,
  usePatchQuickReplyV1Mutation,
  useQuickRepliesV1Query,
} from "../../../features/quick-replies";

const defaultDraft = {
  body: "",
  category: "",
  shortcut: "",
  title: "",
  variables: "",
};

export default function QuickRepliesPage() {
  const [draft, setDraft] = useState(defaultDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const quickRepliesQuery = useQuickRepliesV1Query();
  const createQuickReplyMutation = useCreateQuickReplyV1Mutation();
  const patchQuickReplyMutation = usePatchQuickReplyV1Mutation();

  const quickReplies = quickRepliesQuery.data?.data ?? [];
  const groupedQuickReplies = useMemo(() => {
    return quickReplies.reduce<Record<string, typeof quickReplies>>((groups, quickReply) => {
      const key = quickReply.category?.trim() || "Uncategorized";
      groups[key] = [...(groups[key] ?? []), quickReply];
      return groups;
    }, {});
  }, [quickReplies]);

  const parseVariables = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Quick Reply Library
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Slash commands and dynamic variable shortcuts for rapid customer conversation management.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="space-y-3.5 p-4">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5">
            <Slash className="h-4 w-4 text-[#176B4D]" />
            <h2 className="text-sm font-semibold text-foreground">
              {editingId ? "Edit Quick Reply" : "Create Quick Reply"}
            </h2>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Shortcut *</label>
            <Input
              onChange={(event) => setDraft((current) => ({ ...current, shortcut: event.target.value }))}
              placeholder="e.g. /pricing"
              value={draft.shortcut}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Title *</label>
            <Input
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Pricing follow-up"
              value={draft.title}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Category</label>
            <Input
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
              placeholder="e.g. sales"
              value={draft.category}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Variables (comma-separated)</label>
            <Input
              onChange={(event) => setDraft((current) => ({ ...current, variables: event.target.value }))}
              placeholder="e.g. firstName, company"
              value={draft.variables}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Body Content *</label>
            <Textarea
              className="min-h-32 bg-[#FAFAFA] text-xs"
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="Hi {{firstName}}, sharing the latest pricing for {{company}}."
              value={draft.body}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 font-medium"
              disabled={
                !draft.shortcut.trim() ||
                !draft.title.trim() ||
                !draft.body.trim() ||
                createQuickReplyMutation.isPending ||
                patchQuickReplyMutation.isPending
              }
              onClick={() => {
                const payload = {
                  body: draft.body.trim(),
                  category: draft.category.trim() || undefined,
                  shortcut: draft.shortcut.trim(),
                  title: draft.title.trim(),
                  variables: parseVariables(draft.variables),
                };

                if (editingId) {
                  patchQuickReplyMutation.mutate(
                    {
                      payload,
                      quickReplyId: editingId,
                    },
                    {
                      onSuccess: () => {
                        setEditingId(null);
                        setDraft(defaultDraft);
                      },
                    },
                  );
                  return;
                }

                createQuickReplyMutation.mutate(payload, {
                  onSuccess: () => {
                    setDraft(defaultDraft);
                  },
                });
              }}
              type="button"
              variant="primary"
            >
              <PencilLine className="h-3.5 w-3.5" />
              {editingId ? "Save Quick Reply" : "Create Quick Reply"}
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setDraft(defaultDraft);
              }}
              type="button"
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </Card>

        <div className="space-y-3.5">
          {Object.entries(groupedQuickReplies).map(([group, items]) => (
            <Card className="space-y-3 p-4" key={group}>
              <div className="border-b border-[#F0F0F2] pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <h2 className="text-sm font-semibold text-foreground">Quick Replies</h2>
              </div>
              <div className="space-y-2.5">
                {items.map((quickReply) => (
                  <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5" key={quickReply._id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          <span className="font-mono text-[#176B4D]">{quickReply.shortcut}</span> • {quickReply.title}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                          {quickReply.body}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Variables: {quickReply.variables.length > 0 ? quickReply.variables.join(", ") : "none"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          onClick={() => {
                            setEditingId(quickReply._id);
                            setDraft({
                              body: quickReply.body,
                              category: quickReply.category ?? "",
                              shortcut: quickReply.shortcut,
                              title: quickReply.title,
                              variables: quickReply.variables.join(", "),
                            });
                          }}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() =>
                            patchQuickReplyMutation.mutate({
                              payload: { isActive: !quickReply.isActive },
                              quickReplyId: quickReply._id,
                            })
                          }
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          {quickReply.isActive ? (
                            <ToggleRight className="h-3.5 w-3.5 text-[#16803C]" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {quickReply.isActive ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    </div>
                  </div>
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
}

