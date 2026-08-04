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
    return "bg-[#EDF8F3] text-[#16803C]";
  }
  if (status === "read") {
    return "bg-[#E0F2FE] text-[#0284C7]";
  }
  if (status === "delivered") {
    return "bg-[#F4F4F5] text-[#7A8B82]";
  }
  if (status === "failed") {
    return "bg-[#FEE2E2] text-[#C2413A]";
  }

  return "bg-[#FAFAFA] text-muted-foreground";
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
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            WhatsApp Operator Inbox
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            High-concurrency chat workspace for live customer communications, template dispatch, internal notes, and labels.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Threads</p>
            <p className="font-mono text-base font-semibold text-foreground">{conversations.length}</p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unread</p>
            <p className="font-mono text-base font-semibold text-[#176B4D]">
              {conversations.reduce((total, item) => total + item.unreadCount, 0)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        {/* Threads List Sidebar */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Active Threads</h3>
              <span className="rounded bg-[#E4E4E7] px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                {filterMode}
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 text-xs"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search contacts..."
                  value={searchQuery}
                />
              </div>
              <Button
                onClick={() => setFilterMode("all")}
                size="sm"
                type="button"
                variant={filterMode === "all" ? "primary" : "secondary"}
              >
                All
              </Button>
              <Button
                onClick={() => setFilterMode("unread")}
                size="sm"
                type="button"
                variant={filterMode === "unread" ? "primary" : "secondary"}
              >
                Unread
              </Button>
            </div>
          </div>

          <div className="max-h-[72vh] space-y-1 overflow-y-auto p-2 bg-white">
            {conversations.map((conversation) => {
              const isActive = conversation._id === selectedConversationId;
              const title = conversation.contactName || conversation.contactPhoneNumber;
              const labels = getConversationLabels(conversation);

              return (
                <button
                  className={`w-full rounded-md p-3 text-left transition-colors ${
                    isActive
                      ? "border border-[#C4E8DA] bg-[#EDF8F3]"
                      : "border border-transparent hover:bg-[#FAFAFA]"
                  }`}
                  key={conversation._id}
                  onClick={() => setSelectedConversationId(conversation._id)}
                  type="button"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white">
                      {getInitials(conversation.contactName, conversation.contactPhoneNumber)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{title}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {conversation.contactPhoneNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">
                            {formatShortDate(conversation.lastActivityAt)}
                          </p>
                          {conversation.unreadCount > 0 ? (
                            <span className="mt-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#176B4D] px-1 text-[10px] font-bold text-white">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {conversation.lastMessageText || `[${messageTypeLabel(conversation.lastMessageType)}]`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {!conversationsQuery.isLoading && conversations.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">
                No active conversations.
              </div>
            ) : null}
          </div>
        </Card>

        {/* Central Chat Window */}
        <Card className="overflow-hidden p-0 flex flex-col">
          <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white">
                {getInitials(
                  workspaceConversation?.contactName,
                  workspaceConversation?.contactPhoneNumber,
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  {workspaceConversation?.contactName || "Select Thread"}
                </h3>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {workspaceConversation?.contactPhoneNumber || "No contact selected"}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                disabled={!selectedConversationId || clearUnreadMutation.isPending}
                onClick={() => clearUnreadMutation.mutate()}
                size="sm"
                type="button"
                variant="secondary"
              >
                Clear Unread
              </Button>
            </div>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[420px] bg-repeat bg-center"
            style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "450px" }}
          >
            {conversationMessages.map((message) => {
              const isOutgoing = message.direction === "outgoing";

              return (
                <div
                  className={isOutgoing ? "flex justify-end" : "flex justify-start"}
                  key={message._id}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs shadow-subtle ${
                      isOutgoing
                        ? "border border-[#C4E8DA] bg-[#EDF8F3] text-foreground"
                        : "border border-[#E4E4E7] bg-white text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {messageTypeLabel(message.messageType)}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${statusTone(
                          message.status,
                          message.direction,
                        )}`}
                      >
                        {isOutgoing ? message.status : "incoming"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{renderMessageBody(message)}</p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
                      <span>{formatShortTime(message.timestamp)}</span>
                      {isOutgoing ? (
                        <CheckCheck className="h-3 w-3 text-[#34B7F1]" />
                      ) : (
                        <CircleDot className="h-3 w-3 text-[#7A8B82]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!detailQuery.isLoading && conversationMessages.length === 0 ? (
              <div className="flex h-full min-h-[200px] items-center justify-center">
                <div className="text-center text-xs text-muted-foreground">
                  <MessageCircleMore className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  No messages in this conversation yet.
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Reply Form Anchor */}
          <div className="border-t border-[#E4E4E7] bg-white p-3.5">
            <form
              className="space-y-3"
              onSubmit={replyForm.handleSubmit((values) => {
                setReplyError(null);
                replyMutation.mutate(values);
              })}
            >
              <div className="flex gap-1.5">
                <button
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    selectedReplyType === "text"
                      ? "bg-[#176B4D] text-white"
                      : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground"
                  }`}
                  onClick={() => replyForm.reset({ type: "text", body: "" })}
                  type="button"
                >
                  Text
                </button>
                <button
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    selectedReplyType === "template"
                      ? "bg-[#176B4D] text-white"
                      : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground"
                  }`}
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
              </div>

              {selectedReplyType === "text" ? (
                <Textarea
                  className="min-h-20 bg-[#FAFAFA] text-xs"
                  placeholder="Type a message reply..."
                  {...replyForm.register("body")}
                />
              ) : (
                <div className="space-y-2">
                  <select
                    className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary"
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
                    <option value="">Select active template</option>
                    {activeTemplates.map((template) => (
                      <option
                        key={template._id}
                        value={buildTemplateOptionValue(template)}
                      >
                        {template.name} ({template.language})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {replyError ? <p className="text-xs text-[#C2413A]">{replyError}</p> : null}

              <div className="flex justify-end">
                <Button disabled={!selectedConversationId || replyMutation.isPending} type="submit" variant="primary">
                  {replyMutation.isPending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Right Info Pane (Contact Details, Labels, Notes) */}
        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
              <UserRound className="h-4 w-4 text-[#176B4D]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Contact Profile</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Contact Name</p>
                <p className="font-semibold text-foreground">{workspaceConversation?.contactName || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Phone Number</p>
                <p className="font-mono text-xs text-foreground">{workspaceConversation?.contactPhoneNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">WhatsApp ID (waId)</p>
                <p className="font-mono text-xs text-foreground">{workspaceConversation?.waId || "N/A"}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#F0F0F2] pb-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#176B4D]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Labels & Tags</h3>
              </div>
              <Button
                disabled={!selectedConversationId || isWorkspaceBusy}
                onClick={() => labelsMutation.mutate(draftLabels)}
                size="sm"
                type="button"
                variant="primary"
              >
                Save
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {draftLabels.map((label) => (
                <span
                  className="inline-flex items-center gap-1 rounded bg-[#EDF8F3] px-2 py-0.5 text-xs text-[#16803C] border border-[#C4E8DA]"
                  key={label}
                >
                  {label}
                  <button className="text-[10px] font-bold" onClick={() => removeDraftLabel(label)} type="button">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                onChange={(event) => setLabelInput(event.target.value)}
                placeholder="Add label..."
                value={labelInput}
              />
              <Button disabled={!selectedConversationId} onClick={addDraftLabel} size="sm" type="button" variant="secondary">
                Add
              </Button>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground border-b border-[#F0F0F2] pb-2">Internal Notes</h3>
            <Textarea
              className="min-h-16 bg-[#FAFAFA] text-xs"
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Add internal note..."
              value={noteContent}
            />
            <Button
              className="w-full"
              disabled={!selectedConversationId || !noteContent.trim() || addNoteMutation.isPending}
              onClick={() => addNoteMutation.mutate()}
              size="sm"
              type="button"
              variant="secondary"
            >
              Add Note
            </Button>
            <div className="space-y-2 mt-2">
              {sortedNotes.map((note) => (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs" key={note._id}>
                  <p className="font-semibold text-foreground">{note.authorName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(note.updatedAt)}</p>
                  <p className="mt-1.5 text-foreground leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

