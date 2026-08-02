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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(246,240,226,0.94))] p-6 shadow-[0_18px_50px_rgba(44,56,38,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Quick replies
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Slash command library</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Quick replies now carry reusable variables so the inbox composer can resolve contact-aware
          copy before send.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex items-center gap-2">
            <Slash className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit quick reply" : "Create quick reply"}
            </h2>
          </div>
          <Input
            onChange={(event) => setDraft((current) => ({ ...current, shortcut: event.target.value }))}
            placeholder="/pricing"
            value={draft.shortcut}
          />
          <Input
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Pricing follow-up"
            value={draft.title}
          />
          <Input
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            placeholder="sales"
            value={draft.category}
          />
          <Input
            onChange={(event) => setDraft((current) => ({ ...current, variables: event.target.value }))}
            placeholder="firstName, company, phoneNumber"
            value={draft.variables}
          />
          <Textarea
            className="min-h-36 rounded-[1.4rem] bg-[#faf7ef]"
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
            placeholder="Hi {{firstName}}, sharing the latest pricing for {{company}}."
            value={draft.body}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-full"
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
            >
              <PencilLine className="mr-2 h-4 w-4" />
              {editingId ? "Save quick reply" : "Create quick reply"}
            </Button>
            <Button
              className="rounded-full"
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

        <div className="space-y-4">
          {Object.entries(groupedQuickReplies).map(([group, items]) => (
            <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur" key={group}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group}
                </p>
                <h2 className="mt-1 text-lg font-semibold">Stored quick replies</h2>
              </div>
              {items.map((quickReply) => (
                <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={quickReply._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {quickReply.shortcut} | {quickReply.title}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {quickReply.body}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Variables: {quickReply.variables.length > 0 ? quickReply.variables.join(", ") : "none"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="rounded-full"
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
                        className="rounded-full"
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
                          <ToggleRight className="mr-2 h-4 w-4" />
                        ) : (
                          <ToggleLeft className="mr-2 h-4 w-4" />
                        )}
                        {quickReply.isActive ? "Active" : "Inactive"}
                      </Button>
                      <Button
                        className="rounded-full"
                        onClick={() =>
                          patchQuickReplyMutation.mutate({
                            payload: {
                              body: `${quickReply.body}`,
                            },
                            quickReplyId: quickReply._id,
                          })
                        }
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Sync
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          ))}
          {quickReplies.length === 0 ? (
            <Card className="border-white/60 bg-white/78 p-5 text-sm text-muted-foreground backdrop-blur">
              No quick replies exist yet.
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
