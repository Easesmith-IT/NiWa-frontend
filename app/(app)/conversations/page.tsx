"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { apiClient } from "../../../lib/api/client";
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
    return "bg-[#eef4ef] text-[#1f513e]";
  }
  if (status === "read") {
    return "bg-[#dff2ff] text-[#0b5a7a]";
  }
  if (status === "delivered") {
    return "bg-[#e8f5e9] text-[#275d2c]";
  }
  if (status === "failed") {
    return "bg-[#fde8e8] text-[#9b1c1c]";
  }

  return "bg-accent text-accent-foreground";
};

const renderMessageBody = (message: ConversationMessageRecord) => {
  const payload = message.payload as Record<string, any> | null;
  const type = message.messageType;

  if (type === "location") {
    const location = payload?.location;
    return [location?.name, location?.address, location?.latitude && location?.longitude
      ? `${location.latitude}, ${location.longitude}`
      : null]
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

  const conversations = useMemo(() => conversationsQuery.data?.conversations ?? [], [conversationsQuery.data]);
  const allMedia = useMemo(() => mediaQuery.data?.media ?? [], [mediaQuery.data]);

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
    const messages = detailQuery.data?.messages ?? [];
    const incomingMessage = [...messages]
      .reverse()
      .find((message) => message.direction === "incoming" && message.waMessageId);
    return incomingMessage?.waMessageId ?? "";
  }, [detailQuery.data]);

  const selectedReplyType = replyForm.watch("type");
  const selectedTemplateName = selectedReplyType === "template" ? replyForm.watch("templateName") : undefined;
  const selectedMediaId =
    selectedReplyType !== "text" && selectedReplyType !== "template" ? replyForm.watch("mediaId") : undefined;
  const selectedTemplate = useMemo(
    () =>
      (templatesQuery.data?.templates ?? []).find(
        (template: TemplateRecord) => template.name === selectedTemplateName,
      ) ?? null,
    [selectedTemplateName, templatesQuery.data],
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
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Conversations
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Operator Inbox</h2>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, phone, or recent message"
            value={searchQuery}
          />
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
      </Card>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <Card className="max-h-[74vh] overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-lg font-semibold">Conversation List</h3>
          </div>
          <div className="max-h-[calc(74vh-72px)] overflow-y-auto p-2">
            {conversations.map((conversation: ConversationRecord) => (
              <button
                className={
                  conversation._id === selectedConversationId
                    ? "mb-2 w-full rounded-2xl border border-primary bg-[#eef4ef] p-4 text-left"
                    : "mb-2 w-full rounded-2xl border border-transparent bg-white/70 p-4 text-left"
                }
                key={conversation._id}
                onClick={() => setSelectedConversationId(conversation._id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {conversation.contactName || conversation.contactPhoneNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {conversation.contactPhoneNumber}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
                {getConversationLabels(conversation).length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getConversationLabels(conversation).slice(0, 3).map((label) => (
                      <span
                        className="rounded-full bg-[#f7f1e4] px-2 py-1 text-[11px] font-medium text-[#6b4f2a]"
                        key={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {conversation.lastMessageText || `[${conversation.lastMessageType}]`}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conversation.lastMessageStatus}</span>
                  <span>{formatDateTime(conversation.lastActivityAt)}</span>
                </div>
              </button>
            ))}
            {!conversationsQuery.isLoading && conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations available yet.</p>
            ) : null}
          </div>
        </Card>

        <Card className="flex min-h-[74vh] flex-col p-0">
          <div className="border-b border-border px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {workspaceConversation?.contactName || "Conversation"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {workspaceConversation?.contactPhoneNumber || "Select a conversation"}
                </p>
              </div>
              <Button
                disabled={!selectedConversationId || clearUnreadMutation.isPending}
                onClick={() => clearUnreadMutation.mutate()}
                size="sm"
                type="button"
                variant="secondary"
              >
                {clearUnreadMutation.isPending ? "Clearing..." : "Clear Unread"}
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {(detailQuery.data?.messages ?? []).map((message: ConversationMessageRecord) => (
              <div
                className={
                  message.direction === "outgoing"
                    ? "ml-auto max-w-[80%] rounded-3xl rounded-br-lg bg-[#16302b] px-4 py-3 text-[#f8f1de]"
                    : "max-w-[80%] rounded-3xl rounded-bl-lg bg-white px-4 py-3 text-foreground"
                }
                key={message._id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {message.messageType}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusTone(
                      message.status,
                      message.direction,
                    )}`}
                  >
                    {message.direction === "incoming" ? "incoming" : message.status}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{renderMessageBody(message)}</p>
                {message.direction === "incoming" && message.waMessageId && message.status !== "read" ? (
                  <div className="mt-3 flex justify-end">
                    <Button
                      disabled={markAsReadMutation.isPending}
                      onClick={() => markAsReadMutation.mutate(message.waMessageId!)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {markAsReadMutation.isPending ? "Marking..." : "Mark Read"}
                    </Button>
                  </div>
                ) : null}
                <p className="mt-3 text-right text-[11px] opacity-70">{formatDateTime(message.timestamp)}</p>
              </div>
            ))}
            {!detailQuery.isLoading && (detailQuery.data?.messages ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
            ) : null}
          </div>

          <div className="border-t border-border px-6 py-5">
            <form
              className="space-y-4"
              onSubmit={replyForm.handleSubmit(async (values) => {
                setReplyError(null);
                await replyMutation.mutateAsync(values);
              })}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  className={
                    selectedReplyType === "text"
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                  }
                  onClick={() => replyForm.reset({ type: "text", body: "" })}
                  type="button"
                >
                  Text Reply
                </button>
                <button
                  className={
                    selectedReplyType === "template"
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                  }
                  onClick={() =>
                    replyForm.reset({
                      type: "template",
                      templateName: "",
                      languageCode: "en",
                      bodyVariables: "",
                    })
                  }
                  type="button"
                >
                  Template Reply
                </button>
                <button
                  className={
                    ["image", "video", "audio", "document", "sticker"].includes(selectedReplyType)
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
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
                  Media Reply
                </button>
              </div>

              {selectedReplyType === "text" ? (
                <div className="space-y-3">
                  <Textarea placeholder="Write a reply" {...replyForm.register("body")} />
                  {"body" in replyForm.formState.errors && replyForm.formState.errors.body ? (
                    <p className="text-sm text-red-600">{replyForm.formState.errors.body.message}</p>
                  ) : null}
                </div>
              ) : selectedReplyType === "template" ? (
                <div className="space-y-3">
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    {...replyForm.register("templateName")}
                  >
                    <option value="">Select a template</option>
                    {(templatesQuery.data?.templates ?? []).map((template: TemplateRecord) => (
                      <option key={template._id} value={template.name}>
                        {template.name} ({template.language})
                      </option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="Template body variables, one per line"
                    {...replyForm.register("bodyVariables")}
                  />
                  {selectedTemplate ? (
                    <div className="rounded-2xl bg-[#f7f1e4] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Template Preview
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {selectedTemplateVariables.length
                          ? `Variables: ${selectedTemplateVariables.join(", ")}`
                          : "No variables"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Status: {selectedTemplate.status}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    {...replyForm.register("type")}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                    <option value="sticker">Sticker</option>
                  </select>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
                      .map((item: MediaRecord) => (
                        <option key={item._id} value={item.metaMediaId}>
                          {item.fileName} ({item.mediaType})
                        </option>
                      ))}
                  </select>
                  {(selectedReplyType === "image" ||
                    selectedReplyType === "video" ||
                    selectedReplyType === "document") ? (
                    <Textarea placeholder="Optional caption" {...replyForm.register("caption")} />
                  ) : null}
                  {selectedReplyType === "document" ? (
                    <Input placeholder="Optional filename override" {...replyForm.register("filename")} />
                  ) : null}
                  {selectedMedia ? (
                    <div className="rounded-2xl bg-[#f7f1e4] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Selected Media
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {selectedMedia.fileName} | {selectedMedia.mediaType} | {selectedMedia.metaMediaId}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {lastIncomingMessageId ? (
                  <Button
                    disabled={markAsReadMutation.isPending}
                    onClick={() => markAsReadMutation.mutate(lastIncomingMessageId)}
                    type="button"
                    variant="secondary"
                  >
                    {markAsReadMutation.isPending ? "Marking..." : "Mark Latest Incoming Read"}
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">No incoming message available for read sync.</div>
                )}
                {selectedConversationId ? (
                  <Button onClick={() => clearUnreadMutation.mutate()} type="button" variant="ghost">
                    Clear local unread counter
                  </Button>
                ) : null}
              </div>

              {readError ? <p className="text-sm text-red-600">{readError}</p> : null}
              {replyError ? <p className="text-sm text-red-600">{replyError}</p> : null}

              <Button disabled={!selectedConversationId || replyMutation.isPending} type="submit">
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Customer Profile
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                {workspaceConversation?.contactName || "Select a conversation"}
              </h3>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl bg-white/70 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{workspaceConversation?.contactPhoneNumber || "Not available"}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">WhatsApp ID</p>
                <p className="mt-1 font-medium">{workspaceConversation?.waId || "Not available"}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last Activity</p>
                <p className="mt-1 font-medium">
                  {workspaceConversation ? formatDateTime(workspaceConversation.lastActivityAt) : "Not available"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Labels</p>
                <h3 className="mt-1 text-lg font-semibold">Conversation Labels</h3>
              </div>
              <Button
                disabled={!selectedConversationId || isWorkspaceBusy}
                onClick={() => labelsMutation.mutate(draftLabels)}
                size="sm"
                type="button"
              >
                {labelsMutation.isPending ? "Saving..." : "Save Labels"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draftLabels.map((label) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e4] px-3 py-1 text-sm text-[#6b4f2a]"
                  key={label}
                >
                  {label}
                  <button
                    className="text-xs"
                    onClick={() => removeDraftLabel(label)}
                    type="button"
                  >
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
              <h3 className="mt-1 text-lg font-semibold">Internal Workspace</h3>
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
                {addNoteMutation.isPending ? "Adding..." : "Add Note"}
              </Button>
            </div>
            <div className="space-y-3">
              {sortedNotes.map((note) => (
                <div className="rounded-2xl bg-white/70 p-4" key={note._id}>
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
                        <p className="text-xs text-muted-foreground">{note.pinned ? "Pinned note" : "Standard note"}</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Activity Feed</p>
              <h3 className="mt-1 text-lg font-semibold">Conversation Audit Trail</h3>
            </div>
            <div className="space-y-3">
              {activityFeed.map((entry: ConversationActivityRecord) => (
                <div className="rounded-2xl bg-white/70 p-4" key={entry._id}>
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
