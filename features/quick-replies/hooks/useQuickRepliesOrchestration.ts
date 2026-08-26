"use client";

import { useMemo, useState } from "react";
import {
  useCreateQuickReplyMutation,
  usePatchQuickReplyMutation,
  useQuickRepliesQuery,
} from "../quick-reply.queries";
import type { QuickReplyRecord } from "../quick-reply.types";

export const defaultQuickReplyDraft = {
  body: "",
  category: "",
  shortcut: "",
  title: "",
  variables: "",
};

export const parseQuickReplyVariables = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function useQuickRepliesOrchestration() {
  const [draft, setDraft] = useState(defaultQuickReplyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const quickRepliesQuery = useQuickRepliesQuery();
  const createQuickReplyMutation = useCreateQuickReplyMutation();
  const patchQuickReplyMutation = usePatchQuickReplyMutation();

  const quickReplies = quickRepliesQuery.data?.data ?? [];

  const groupedQuickReplies = useMemo(() => {
    return quickReplies.reduce<Record<string, QuickReplyRecord[]>>((groups, quickReply) => {
      const key = quickReply.category?.trim() || "Uncategorized";
      groups[key] = [...(groups[key] ?? []), quickReply];
      return groups;
    }, {});
  }, [quickReplies]);

  const handleSaveQuickReply = () => {
    const payload = {
      body: draft.body.trim(),
      category: draft.category.trim() || undefined,
      shortcut: draft.shortcut.trim(),
      title: draft.title.trim(),
      variables: parseQuickReplyVariables(draft.variables),
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
            setDraft(defaultQuickReplyDraft);
          },
        },
      );
      return;
    }

    createQuickReplyMutation.mutate(payload, {
      onSuccess: () => {
        setDraft(defaultQuickReplyDraft);
      },
    });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setDraft(defaultQuickReplyDraft);
  };

  const handleStartEdit = (quickReply: QuickReplyRecord) => {
    setEditingId(quickReply._id);
    setDraft({
      body: quickReply.body,
      category: quickReply.category ?? "",
      shortcut: quickReply.shortcut,
      title: quickReply.title,
      variables: quickReply.variables.join(", "),
    });
  };

  const handleToggleActive = (quickReply: QuickReplyRecord) => {
    patchQuickReplyMutation.mutate({
      payload: { isActive: !quickReply.isActive },
      quickReplyId: quickReply._id,
    });
  };

  return {
    draft,
    setDraft,
    editingId,
    setEditingId,
    quickRepliesQuery,
    createQuickReplyMutation,
    patchQuickReplyMutation,
    quickReplies,
    groupedQuickReplies,
    handleSaveQuickReply,
    handleResetForm,
    handleStartEdit,
    handleToggleActive,
  };
}
