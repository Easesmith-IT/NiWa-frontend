"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CheckCheck,
  CircleDot,
  MessageCircleMore,
  Search,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { apiClient } from "../../../lib/api/client";
import { getMediaDisplayName } from "../../../lib/media";
import {
  buildTemplateOptionValue,
  findTemplateByOptionValue,
  getActiveTemplates,
} from "../../../lib/templates";
import {
  ConversationActivityRecord,
  ConversationDetailResponse,
  ConversationLabelsResponse,
  ConversationMessageRecord,
  ConversationNoteMutationResponse,
  ConversationNoteRecord,
  ConversationReadResponse,
  ConversationRecord,
  ConversationsResponse,
  MediaListResponse,
  MediaRecord,
  OutboundMessageResponse,
  TemplateRecord,
  TemplatesResponse,
} from "../../../lib/api/types";

const replySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    body: z.string().min(1, "Reply body is required."),
  }),
  z.object({
    type: z.literal("template"),
    templateName: z.string().min(1, "Template is required."),
    languageCode: z.string().min(2, "Language code is required."),
    bodyVariables: z.string().optional(),
  }),
  z.object({
    type: z.enum(["image", "video", "audio", "document", "sticker"]),
    mediaId: z.string().min(1, "Media selection is required."),
    caption: z.string().optional(),
    filename: z.string().optional(),
  }),
]);

type ReplyValues = z.input<typeof replySchema>;

const parseTemplateVariables = (value?: string) =>
  (value ?? "")
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);

const statusTone = (status: string, direction: "incoming" | "outgoing") => {
  if (direction === "incoming") {
    return "bg-[#e7f5ec] text-[#1f5b43]";
  }
  if (status === "read") {
    return "bg-[#d6efff] text-[#0e5575]";
  }
  if (status === "delivered") {
    return "bg-[#ddefd9] text-[#355f2c]";
  }
  if (status === "failed") {
    return "bg-[#ffe0e0] text-[#8f2323]";
  }

  return "bg-[#efe4c9] text-[#725324]";
};

const renderMessageBody = (message: ConversationMessageRecord) => {
  const payload = message.payload as Record<string, any> | null;
  const type = message.messageType;

  if (type === "location") {
    const location = payload?.location;
    return [
      location?.name,
      location?.address,
      location?.latitude && location?.longitude
        ? `${location.latitude}, ${location.longitude}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (type === "document") {
    const document = payload?.document ?? {};
    return [document.filename, document.caption].filter(Boolean).join("\n") || message.previewText;
  }

  if (type === "contacts") {
    const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
    return contacts
      .map((contact: any) => {
        const name = contact?.name?.formatted_name ?? "Contact";
        const phone = contact?.phones?.[0]?.phone ?? "";
        return `${name}${phone ? ` - ${phone}` : ""}`;
      })
      .join("\n");
  }

  if (type === "interactive") {
    const interactive = payload?.interactive ?? {};
    return interactive?.button_reply?.title ?? interactive?.list_reply?.title ?? message.previewText;
  }

  if (type === "reaction") {
    return payload?.reaction?.emoji ? `Reaction: ${payload.reaction.emoji}` : message.previewText;
  }

  if (["image", "video", "audio", "sticker"].includes(type)) {
    const mediaPayload = payload?.[type] ?? {};
    return [message.previewText, mediaPayload?.id ? `Media ID: ${mediaPayload.id}` : null]
      .filter(Boolean)
      .join("\n");
  }

  return message.previewText || JSON.stringify(message.payload, null, 2);
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

const formatShortTime = (value?: string) => {
  if (!value) {
    return "--:--";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (value?: string) => {
  if (!value) {
    return "No activity";
  }

  return new Date(value).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const noteSort = (left: ConversationNoteRecord, right: ConversationNoteRecord) => {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1;
  }

  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
};

const getConversationLabels = (conversation?: Pick<ConversationRecord, "labels"> | null) =>
  Array.isArray(conversation?.labels) ? conversation.labels : [];

const getTemplateVariables = (template?: Pick<TemplateRecord, "variables"> | null) =>
  Array.isArray(template?.variables) ? template.variables : [];

const getNoteHistory = (note?: Pick<ConversationNoteRecord, "history"> | null) =>
  Array.isArray(note?.history) ? note.history : [];

const getInitials = (name?: string, fallback?: string) => {
  const source = name?.trim() || fallback?.trim() || "N";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const messageTypeLabel = (type: string) =>
  type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
  const [draftLabels, setDraftLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const replyForm = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      type: "text",
      body: "",
    },
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations", searchQuery, filterMode],
    queryFn: async () => {
      const response = await apiClient.get<ConversationsResponse>("/conversations", {
        params: {
          query: searchQuery || undefined,
          unreadOnly: filterMode === "unread" ? "true" : undefined,
          limit: 50,
        },
      });
      return response.data;
    },
  });

  const templatesQuery = useQuery({
    queryKey: ["templates", "conversations-reply"],
    queryFn: async () => {
      const response = await apiClient.get<TemplatesResponse>("/templates");
      return response.data;
    },
  });

  const mediaQuery = useQuery({
    queryKey: ["media", "conversations-reply"],
    queryFn: async () => {
      const response = await apiClient.get<MediaListResponse>("/media");
      return response.data;
    },
  });

  const conversations = useMemo(
    () => conversationsQuery.data?.conversations ?? [],
    [conversationsQuery.data],
  );
  const allMedia = useMemo(() => mediaQuery.data?.media ?? [], [mediaQuery.data]);
  const activeTemplates = useMemo(
    () => getActiveTemplates(templatesQuery.data?.templates ?? []),
    [templatesQuery.data],
  );

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const detailQuery = useQuery({
    queryKey: ["conversation-detail", selectedConversationId],
    queryFn: async () => {
      const response = await apiClient.get<ConversationDetailResponse>(
        `/conversations/${selectedConversationId}`,
      );
      return response.data;
    },
    enabled: Boolean(selectedConversationId),
  });

  const workspaceConversation = detailQuery.data?.conversation ?? selectedConversation;
  const conversationMessages = detailQuery.data?.messages ?? [];
  const sortedNotes = useMemo(
    () => [...(workspaceConversation?.notes ?? [])].sort(noteSort),
    [workspaceConversation?.notes],
  );
  const activityFeed = useMemo(
    () => [...(workspaceConversation?.activityFeed ?? [])].reverse(),
    [workspaceConversation?.activityFeed],
  );
  const selectedConversationLabels = useMemo(
    () => getConversationLabels(workspaceConversation),
    [workspaceConversation],
  );

  useEffect(() => {
    setDraftLabels(selectedConversationLabels);
  }, [selectedConversationLabels, workspaceConversation?._id]);

  const lastIncomingMessageId = useMemo(() => {
    const incomingMessage = [...conversationMessages]
      .reverse()
      .find((message) => message.direction === "incoming" && message.waMessageId);
    return incomingMessage?.waMessageId ?? "";
  }, [conversationMessages]);

  const selectedReplyType = replyForm.watch("type");
  const selectedTemplateName = selectedReplyType === "template" ? replyForm.watch("templateName") : undefined;
  const selectedTemplateLanguage =
    selectedReplyType === "template" ? replyForm.watch("languageCode") : undefined;
  const selectedMediaId =
    selectedReplyType !== "text" && selectedReplyType !== "template"
      ? replyForm.watch("mediaId")
      : undefined;
  const selectedTemplate = useMemo(
    () =>
      findTemplateByOptionValue(
        activeTemplates,
        selectedTemplateName && selectedTemplateLanguage
          ? `${selectedTemplateName}::${selectedTemplateLanguage}`
          : "",
      ),
    [activeTemplates, selectedTemplateLanguage, selectedTemplateName],
  );
  const selectedTemplateVariables = useMemo(
    () => getTemplateVariables(selectedTemplate),
    [selectedTemplate],
  );
  const selectedMedia = useMemo(
    () => allMedia.find((item: MediaRecord) => item.metaMediaId === selectedMediaId) ?? null,
    [allMedia, selectedMediaId],
  );

  useEffect(() => {
    if (selectedTemplate) {
      replyForm.setValue("languageCode", selectedTemplate.language || "en");
    }
  }, [replyForm, selectedTemplate]);

  const refreshConversationData = async () => {
    await Promise.all([detailQuery.refetch(), conversationsQuery.refetch()]);
  };

  const toErrorMessage = (error: unknown, fallback: string) =>
    error instanceof AxiosError
      ? error.response?.data?.message ?? fallback
      : error instanceof Error
        ? error.message
        : fallback;

  const replyMutation = useMutation({
    mutationFn: async (values: ReplyValues) => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected.");
      }

      const payload =
        values.type === "text"
          ? {
              conversationId: selectedConversationId,
              type: "text" as const,
              body: values.body,
            }
          : values.type === "template"
            ? {
                conversationId: selectedConversationId,
                type: "template" as const,
                templateName: values.templateName,
                languageCode: values.languageCode,
                bodyVariables: parseTemplateVariables(values.bodyVariables),
              }
            : {
                conversationId: selectedConversationId,
                type: values.type,
                mediaId: values.mediaId,
                caption: values.caption,
                filename: values.filename,
              };

      const response = await apiClient.post<OutboundMessageResponse>("/conversations/reply", payload);
      return response.data;
    },
    onSuccess: async () => {
      setReplyError(null);
      replyForm.reset({ type: "text", body: "" });
      await refreshConversationData();
    },
    onError: (error) => {
      setReplyError(toErrorMessage(error, "Reply failed."));
    },
  });

  const clearUnreadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected.");
      }

      const response = await apiClient.post<ConversationReadResponse>(
        `/conversations/${selectedConversationId}/read`,
      );
      return response.data;
    },
    onSuccess: async () => {
      setReadError(null);
      await refreshConversationData();
    },
    onError: (error) => {
      setReadError(toErrorMessage(error, "Failed to clear unread count."));
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiClient.post<OutboundMessageResponse>("/messages/read", {
        messageId,
      });
      return response.data;
    },
    onSuccess: async () => {
      setReadError(null);
      await refreshConversationData();
    },
    onError: (error) => {
      setReadError(toErrorMessage(error, "Failed to mark message as read."));
    },
  });

  const labelsMutation = useMutation({
    mutationFn: async (labels: string[]) => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected.");
      }

      const response = await apiClient.put<ConversationLabelsResponse>(
        `/conversations/${selectedConversationId}/labels`,
        { labels },
      );
      return response.data;
    },
    onSuccess: async (response) => {
      setWorkspaceError(null);
      setDraftLabels(response.conversation.labels);
      setLabelInput("");
      await refreshConversationData();
    },
    onError: (error) => {
      setWorkspaceError(toErrorMessage(error, "Failed to update labels."));
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected.");
      }

      const response = await apiClient.post<ConversationNoteMutationResponse>(
        `/conversations/${selectedConversationId}/notes`,
        {
          content: noteContent,
          pinned: notePinned,
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      setWorkspaceError(null);
      setNoteContent("");
      setNotePinned(false);
      await refreshConversationData();
    },
    onError: (error) => {
      setWorkspaceError(toErrorMessage(error, "Failed to add note."));
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      content,
      pinned,
    }: {
      noteId: string;
      content?: string;
      pinned?: boolean;
    }) => {
      if (!selectedConversationId) {
        throw new Error("No conversation selected.");
      }

      const response = await apiClient.patch<ConversationNoteMutationResponse>(
        `/conversations/${selectedConversationId}/notes/${noteId}`,
        {
          ...(typeof content === "string" ? { content } : {}),
          ...(typeof pinned === "boolean" ? { pinned } : {}),
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      setWorkspaceError(null);
      setEditingNoteId(null);
      setEditingNoteContent("");
      await refreshConversationData();
    },
    onError: (error) => {
      setWorkspaceError(toErrorMessage(error, "Failed to update note."));
    },
  });

  const addDraftLabel = () => {
    const nextValue = labelInput.trim();

    if (!nextValue) {
      return;
    }

    if (draftLabels.some((label) => label.toLowerCase() === nextValue.toLowerCase())) {
      setLabelInput("");
      return;
    }

    setDraftLabels((current) => [...current, nextValue]);
    setLabelInput("");
  };

  const removeDraftLabel = (value: string) => {
    setDraftLabels((current) => current.filter((label) => label !== value));
  };

  const isWorkspaceBusy =
    labelsMutation.isPending || addNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(250,244,230,0.9))] p-5 shadow-[0_18px_50px_rgba(44,56,38,0.08)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Conversations
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Operator Inbox</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Reworked into a WhatsApp-style workspace with faster scanning, cleaner message bubbles,
            and a reply area that stays anchored to the active thread.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm lg:min-w-[360px]">
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Threads</p>
            <p className="mt-2 text-xl font-semibold">{conversations.length}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Unread</p>
            <p className="mt-2 text-xl font-semibold">
              {conversations.reduce((total, item) => total + item.unreadCount, 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected</p>
            <p className="mt-2 truncate text-sm font-semibold">
              {workspaceConversation?.contactName || workspaceConversation?.contactPhoneNumber || "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)_350px]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-[rgba(255,255,255,0.7)] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Chat List
                </p>
                <h3 className="mt-1 text-lg font-semibold">Recent conversations</h3>
              </div>
              <div className="rounded-full bg-[#16302b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f8f1de]">
                {filterMode}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search contact or last message"
                  value={searchQuery}
                />
              </div>
              <Button
                onClick={() => setFilterMode("all")}
                type="button"
                variant={filterMode === "all" ? "primary" : "secondary"}
              >
                All
              </Button>
              <Button
                onClick={() => setFilterMode("unread")}
                type="button"
                variant={filterMode === "unread" ? "primary" : "secondary"}
              >
                Unread
              </Button>
            </div>
          </div>

          <div className="max-h-[76vh] space-y-2 overflow-y-auto bg-[rgba(255,255,255,0.45)] p-3">
            {conversations.map((conversation) => {
              const isActive = conversation._id === selectedConversationId;
              const title = conversation.contactName || conversation.contactPhoneNumber;
              const labels = getConversationLabels(conversation);

              return (
                <button
                  className={
                    isActive
                      ? "w-full rounded-[26px] border border-[#d2e8dc] bg-[linear-gradient(135deg,#ffffff,#eef7f0)] px-4 py-4 text-left shadow-[0_10px_30px_rgba(32,73,58,0.08)]"
                      : "w-full rounded-[26px] border border-transparent bg-white/80 px-4 py-4 text-left transition hover:border-[#e6dcc7] hover:bg-white"
                  }
                  key={conversation._id}
                  onClick={() => setSelectedConversationId(conversation._id)}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d6f0df,#8ec5a1)] text-sm font-semibold text-[#16302b]">
                      {getInitials(conversation.contactName, conversation.contactPhoneNumber)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{title}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {conversation.contactPhoneNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {formatShortDate(conversation.lastActivityAt)}
                          </p>
                          {conversation.unreadCount > 0 ? (
                            <span className="mt-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {labels.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {labels.slice(0, 2).map((label) => (
                            <span
                              className="rounded-full bg-[#f7efe0] px-2.5 py-1 text-[11px] font-medium text-[#7a5929]"
                              key={label}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {conversation.lastMessageText || `[${messageTypeLabel(conversation.lastMessageType)}]`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {!conversationsQuery.isLoading && conversations.length === 0 ? (
              <div className="rounded-[26px] bg-white/85 p-6 text-sm text-muted-foreground">
                No conversations available yet.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,239,225,0.9))] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d6f0df,#8ec5a1)] font-semibold text-[#16302b]">
                  {getInitials(
                    workspaceConversation?.contactName,
                    workspaceConversation?.contactPhoneNumber,
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {workspaceConversation?.contactName || "Conversation"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {workspaceConversation?.contactPhoneNumber || "Select a conversation"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!selectedConversationId || clearUnreadMutation.isPending}
                  onClick={() => clearUnreadMutation.mutate()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {clearUnreadMutation.isPending ? "Clearing..." : "Clear unread"}
                </Button>
                {lastIncomingMessageId ? (
                  <Button
                    disabled={markAsReadMutation.isPending}
                    onClick={() => markAsReadMutation.mutate(lastIncomingMessageId)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {markAsReadMutation.isPending ? "Marking..." : "Sync read"}
                  </Button>
                ) : null}
              </div>
            </div>
            {selectedConversationLabels.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedConversationLabels.map((label) => (
                  <span
                    className="rounded-full bg-[#efe5cf] px-3 py-1 text-xs font-medium text-[#735327]"
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative flex min-h-[76vh] flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,102,76,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(214,155,76,0.12),transparent_26%),linear-gradient(180deg,#efe7d7_0%,#e8decb_100%)]" />
            <div className="relative flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {conversationMessages.map((message) => {
                const isOutgoing = message.direction === "outgoing";

                return (
                  <div
                    className={isOutgoing ? "flex justify-end" : "flex justify-start"}
                    key={message._id}
                  >
                    <div
                      className={
                        isOutgoing
                          ? "max-w-[82%] rounded-[24px] rounded-br-md bg-[linear-gradient(180deg,#d8f5cf,#c7edb8)] px-4 py-3 text-[#16302b] shadow-[0_10px_28px_rgba(57,110,51,0.12)]"
                          : "max-w-[82%] rounded-[24px] rounded-bl-md bg-white px-4 py-3 text-foreground shadow-[0_10px_28px_rgba(85,67,31,0.08)]"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                          {messageTypeLabel(message.messageType)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusTone(
                            message.status,
                            message.direction,
                          )}`}
                        >
                          {isOutgoing ? message.status : "incoming"}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                        {renderMessageBody(message)}
                      </p>
                      {message.direction === "incoming" &&
                      message.waMessageId &&
                      message.status !== "read" ? (
                        <div className="mt-3 flex justify-end">
                          <Button
                            disabled={markAsReadMutation.isPending}
                            onClick={() => markAsReadMutation.mutate(message.waMessageId!)}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            {markAsReadMutation.isPending ? "Marking..." : "Mark read"}
                          </Button>
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] opacity-70">
                        <span>{formatShortTime(message.timestamp)}</span>
                        {isOutgoing ? (
                          <CheckCheck className="h-3.5 w-3.5" />
                        ) : (
                          <CircleDot className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!detailQuery.isLoading && conversationMessages.length === 0 ? (
                <div className="flex h-full min-h-[260px] items-center justify-center">
                  <div className="rounded-[28px] bg-white/85 px-8 py-10 text-center shadow-[0_16px_40px_rgba(90,70,26,0.08)]">
                    <MessageCircleMore className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No messages in this conversation yet.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative border-t border-border bg-white/85 px-5 py-5 backdrop-blur">
              <form
                className="space-y-4"
                onSubmit={replyForm.handleSubmit((values) => {
                  setReplyError(null);
                  replyMutation.mutate(values);
                })}
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    className={
                      selectedReplyType === "text"
                        ? "rounded-full bg-[#16302b] px-4 py-2 text-sm font-medium text-[#f8f1de]"
                        : "rounded-full bg-[#f4ecdb] px-4 py-2 text-sm font-medium text-[#6e5632]"
                    }
                    onClick={() => replyForm.reset({ type: "text", body: "" })}
                    type="button"
                  >
                    Text
                  </button>
                  <button
                    className={
                      selectedReplyType === "template"
                        ? "rounded-full bg-[#16302b] px-4 py-2 text-sm font-medium text-[#f8f1de]"
                        : "rounded-full bg-[#f4ecdb] px-4 py-2 text-sm font-medium text-[#6e5632]"
                    }
                    onClick={() =>
                      replyForm.reset({
                        type: "template",
                        templateName: "",
                        languageCode: "",
                        bodyVariables: "",
                      })
                    }
                    type="button"
                  >
                    Template
                  </button>
                  <button
                    className={
                      ["image", "video", "audio", "document", "sticker"].includes(selectedReplyType)
                        ? "rounded-full bg-[#16302b] px-4 py-2 text-sm font-medium text-[#f8f1de]"
                        : "rounded-full bg-[#f4ecdb] px-4 py-2 text-sm font-medium text-[#6e5632]"
                    }
                    onClick={() =>
                      replyForm.reset({
                        type: "image",
                        mediaId: "",
                        caption: "",
                        filename: "",
                      })
                    }
                    type="button"
                  >
                    Media
                  </button>
                </div>

                {selectedReplyType === "text" ? (
                  <div className="space-y-3">
                    <Textarea
                      className="min-h-24 rounded-[24px] bg-[#f9f6ef]"
                      placeholder="Write a message"
                      {...replyForm.register("body")}
                    />
                    {"body" in replyForm.formState.errors && replyForm.formState.errors.body ? (
                      <p className="text-sm text-red-600">
                        {replyForm.formState.errors.body.message}
                      </p>
                    ) : null}
                  </div>
                ) : selectedReplyType === "template" ? (
                  <div className="grid gap-3">
                    <select
                      className="flex h-12 w-full rounded-[20px] border border-input bg-[#f9f6ef] px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        const nextTemplate = findTemplateByOptionValue(activeTemplates, nextValue);

                        replyForm.setValue("templateName", nextTemplate?.name ?? "");
                        replyForm.setValue("languageCode", nextTemplate?.language ?? "");
                      }}
                      value={
                        selectedTemplateName && selectedTemplateLanguage
                          ? `${selectedTemplateName}::${selectedTemplateLanguage}`
                          : ""
                      }
                    >
                      <option value="">
                        {activeTemplates.length > 0
                          ? "Select active template"
                          : "No active templates available"}
                      </option>
                      {activeTemplates.map((template) => (
                        <option
                          key={template._id}
                          value={buildTemplateOptionValue(template)}
                        >
                          {template.name} ({template.language})
                        </option>
                      ))}
                    </select>
                    <div className="rounded-[20px] border border-[#eadbbf] bg-[#fffaf0] px-4 py-3 text-sm text-muted-foreground">
                      {activeTemplates.length > 0
                        ? `Active catalog: ${activeTemplates.length} approved Meta templates available for this workspace.`
                        : "No approved sendable templates are available for this workspace right now. Run template sync after checking the active Meta account settings."}
                    </div>
                    <Textarea
                      className="min-h-24 rounded-[24px] bg-[#f9f6ef]"
                      placeholder={
                        selectedTemplate
                          ? "Template body variables, one per line"
                          : "Choose a template first to see whether variables are needed"
                      }
                      {...replyForm.register("bodyVariables")}
                    />
                    {selectedTemplate ? (
                      <div className="rounded-[24px] border border-[#eadbbf] bg-[#fffaf0] p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          Template snapshot
                        </div>
                        <p className="mt-3 text-sm text-foreground">
                          {selectedTemplateVariables.length
                            ? `Variables: ${selectedTemplateVariables.join(", ")}`
                            : "No variables"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Status: {selectedTemplate.status}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Language: {selectedTemplate.language}
                        </p>
                        {selectedTemplate.bodyText ? (
                          <p className="mt-2 text-sm text-foreground">{selectedTemplate.bodyText}</p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-[#eadbbf] bg-[#fffdf7] p-4 text-sm text-muted-foreground">
                        {activeTemplates.length > 0
                          ? "Choose an active template to load its language, variable requirements, and preview text before sending."
                          : "No template preview is available because the active template catalog is empty."}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <select
                      className="flex h-12 w-full rounded-[20px] border border-input bg-[#f9f6ef] px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                      {...replyForm.register("type")}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="document">Document</option>
                      <option value="sticker">Sticker</option>
                    </select>
                    <select
                      className="flex h-12 w-full rounded-[20px] border border-input bg-[#f9f6ef] px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                      {...replyForm.register("mediaId")}
                    >
                      <option value="">Select stored media</option>
                      {allMedia
                        .filter((item) =>
                          selectedReplyType === "document"
                            ? item.mediaType === "document"
                            : selectedReplyType === "sticker"
                              ? item.mediaType === "sticker"
                              : item.mediaType === selectedReplyType,
                        )
                        .map((item) => (
                          <option key={item._id} value={item.metaMediaId}>
                            {getMediaDisplayName(item)} ({item.mediaType})
                          </option>
                        ))}
                    </select>
                    {(selectedReplyType === "image" ||
                      selectedReplyType === "video" ||
                      selectedReplyType === "document") ? (
                      <Textarea
                        className="min-h-20 rounded-[24px] bg-[#f9f6ef]"
                        placeholder="Optional caption"
                        {...replyForm.register("caption")}
                      />
                    ) : null}
                    {selectedReplyType === "document" ? (
                      <Input
                        className="rounded-[20px] bg-[#f9f6ef]"
                        placeholder="Optional filename override"
                        {...replyForm.register("filename")}
                      />
                    ) : null}
                    {selectedMedia ? (
                      <div className="rounded-[24px] border border-[#eadbbf] bg-[#fffaf0] p-4 text-sm">
                        {getMediaDisplayName(selectedMedia)} | {selectedMedia.mediaType} |{" "}
                        {selectedMedia.metaMediaId}
                      </div>
                    ) : null}
                  </div>
                )}

                {readError ? <p className="text-sm text-red-600">{readError}</p> : null}
                {replyError ? <p className="text-sm text-red-600">{replyError}</p> : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Messages are stored in the active conversation thread after send.
                  </p>
                  <Button disabled={!selectedConversationId || replyMutation.isPending} type="submit">
                    {replyMutation.isPending ? "Sending..." : "Send reply"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4ef] text-[#16302b]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contact
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {workspaceConversation?.contactName || "Select a conversation"}
                </h3>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">
                  {workspaceConversation?.contactPhoneNumber || "Not available"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  WhatsApp ID
                </p>
                <p className="mt-1 font-medium">{workspaceConversation?.waId || "Not available"}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Last activity
                </p>
                <p className="mt-1 font-medium">
                  {workspaceConversation
                    ? formatDateTime(workspaceConversation.lastActivityAt)
                    : "Not available"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Labels
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">Conversation tags</h3>
                </div>
              </div>
              <Button
                disabled={!selectedConversationId || isWorkspaceBusy}
                onClick={() => labelsMutation.mutate(draftLabels)}
                size="sm"
                type="button"
              >
                {labelsMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draftLabels.map((label) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e4] px-3 py-1 text-sm text-[#6b4f2a]"
                  key={label}
                >
                  {label}
                  <button className="text-xs" onClick={() => removeDraftLabel(label)} type="button">
                    Remove
                  </button>
                </span>
              ))}
              {draftLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels assigned yet.</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Input
                onChange={(event) => setLabelInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addDraftLabel();
                  }
                }}
                placeholder="Add label"
                value={labelInput}
              />
              <Button disabled={!selectedConversationId} onClick={addDraftLabel} type="button" variant="secondary">
                Add
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Notes
              </p>
              <h3 className="mt-1 text-lg font-semibold">Internal workspace</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="Add an internal note for this conversation"
                value={noteContent}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  checked={notePinned}
                  onChange={(event) => setNotePinned(event.target.checked)}
                  type="checkbox"
                />
                Pin this note
              </label>
              <Button
                disabled={!selectedConversationId || !noteContent.trim() || addNoteMutation.isPending}
                onClick={() => addNoteMutation.mutate()}
                type="button"
              >
                {addNoteMutation.isPending ? "Adding..." : "Add note"}
              </Button>
            </div>
            <div className="space-y-3">
              {sortedNotes.map((note) => (
                <div className="rounded-2xl bg-white/80 p-4" key={note._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{note.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(note.updatedAt)}
                        {getNoteHistory(note).length
                          ? ` | ${getNoteHistory(note).length} edit${getNoteHistory(note).length === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                    <Button
                      disabled={updateNoteMutation.isPending}
                      onClick={() =>
                        updateNoteMutation.mutate({
                          noteId: note._id,
                          pinned: !note.pinned,
                        })
                      }
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </Button>
                  </div>
                  {editingNoteId === note._id ? (
                    <div className="mt-3 space-y-3">
                      <Textarea
                        onChange={(event) => setEditingNoteContent(event.target.value)}
                        value={editingNoteContent}
                      />
                      <div className="flex gap-2">
                        <Button
                          disabled={!editingNoteContent.trim() || updateNoteMutation.isPending}
                          onClick={() =>
                            updateNoteMutation.mutate({
                              noteId: note._id,
                              content: editingNoteContent,
                            })
                          }
                          size="sm"
                          type="button"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteContent("");
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{note.content}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          {note.pinned ? "Pinned note" : "Standard note"}
                        </p>
                        <Button
                          onClick={() => {
                            setEditingNoteId(note._id);
                            setEditingNoteContent(note.content);
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {sortedNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No internal notes added yet.</p>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Activity feed
              </p>
              <h3 className="mt-1 text-lg font-semibold">Audit trail</h3>
            </div>
            <div className="space-y-3">
              {activityFeed.map((entry: ConversationActivityRecord) => (
                <div className="rounded-2xl bg-white/80 p-4" key={entry._id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{entry.description}</p>
                    <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                      {entry.type}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {entry.actorName} | {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              ))}
              {activityFeed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : null}
            </div>
          </Card>

          {workspaceError ? (
            <Card className="border border-red-200 p-4 text-sm text-red-600">{workspaceError}</Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
