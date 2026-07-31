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
  ConversationDetailResponse,
  ConversationMessageRecord,
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
    return (
      interactive?.button_reply?.title ??
      interactive?.list_reply?.title ??
      message.previewText
    );
  }

  if (type === "reaction") {
    return payload?.reaction?.emoji
      ? `Reaction: ${payload.reaction.emoji}`
      : message.previewText;
  }

  if (["image", "video", "audio", "sticker"].includes(type)) {
    const mediaPayload = payload?.[type] ?? {};
    return [message.previewText, mediaPayload?.id ? `Media ID: ${mediaPayload.id}` : null]
      .filter(Boolean)
      .join("\n");
  }

  return message.previewText || JSON.stringify(message.payload, null, 2);
};

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
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

  const allMedia = useMemo(
    () => mediaQuery.data?.media ?? [],
    [mediaQuery.data],
  );

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation: ConversationRecord) => conversation._id === selectedConversationId) ??
      null,
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

  const lastIncomingMessageId = useMemo(() => {
    const messages = detailQuery.data?.messages ?? [];
    const incomingMessage = [...messages]
      .reverse()
      .find((message) => message.direction === "incoming" && message.waMessageId);
    return incomingMessage?.waMessageId ?? "";
  }, [detailQuery.data]);

  const selectedReplyType = replyForm.watch("type");
  const selectedTemplateName =
    selectedReplyType === "template" ? replyForm.watch("templateName") : undefined;
  const selectedMediaId =
    selectedReplyType !== "text" && selectedReplyType !== "template"
      ? replyForm.watch("mediaId")
      : undefined;
  const selectedTemplate = useMemo(
    () =>
      (templatesQuery.data?.templates ?? []).find(
        (template: TemplateRecord) => template.name === selectedTemplateName,
      ) ?? null,
    [selectedTemplateName, templatesQuery.data],
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
    onSuccess: () => {
      setReplyError(null);
      replyForm.reset({ type: "text", body: "" });
      detailQuery.refetch();
      conversationsQuery.refetch();
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Reply failed."
          : error instanceof Error
            ? error.message
            : "Reply failed.";
      setReplyError(message);
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
    onSuccess: () => {
      setReadError(null);
      conversationsQuery.refetch();
      detailQuery.refetch();
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Failed to clear unread count."
          : error instanceof Error
            ? error.message
            : "Failed to clear unread count.";
      setReadError(message);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiClient.post<OutboundMessageResponse>("/messages/read", {
        messageId,
      });
      return response.data;
    },
    onSuccess: () => {
      setReadError(null);
      conversationsQuery.refetch();
      detailQuery.refetch();
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Failed to mark message as read."
          : error instanceof Error
            ? error.message
            : "Failed to mark message as read.";
      setReadError(message);
    },
  });

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

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="max-h-[70vh] overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-lg font-semibold">Conversation List</h3>
          </div>
          <div className="max-h-[calc(70vh-72px)] overflow-y-auto p-2">
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
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {conversation.lastMessageText || `[${conversation.lastMessageType}]`}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conversation.lastMessageStatus}</span>
                  <span>{new Date(conversation.lastActivityAt).toLocaleString()}</span>
                </div>
              </button>
            ))}
            {!conversationsQuery.isLoading && conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations available yet.</p>
            ) : null}
          </div>
        </Card>

        <Card className="flex min-h-[70vh] flex-col p-0">
          <div className="border-b border-border px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedConversation?.contactName || "Conversation"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedConversation?.contactPhoneNumber || "Select a conversation"}
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
                <p className="mt-3 whitespace-pre-wrap text-sm">
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
                      {markAsReadMutation.isPending ? "Marking..." : "Mark Read"}
                    </Button>
                  </div>
                ) : null}
                <p className="mt-3 text-right text-[11px] opacity-70">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
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
              <div className="flex gap-2">
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
                    placeholder={"Template body variables, one per line"}
                    {...replyForm.register("bodyVariables")}
                  />
                  {selectedTemplate ? (
                    <div className="rounded-2xl bg-[#f7f1e4] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Template Preview
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {selectedTemplate.variables.length
                          ? `Variables: ${selectedTemplate.variables.join(", ")}`
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
                  <Button
                    onClick={() => clearUnreadMutation.mutate()}
                    type="button"
                    variant="ghost"
                  >
                    Clear local unread counter
                  </Button>
                ) : null}
              </div>

              {readError ? <p className="text-sm text-red-600">{readError}</p> : null}
              {replyError ? <p className="text-sm text-red-600">{replyError}</p> : null}

              <Button
                disabled={!selectedConversationId || replyMutation.isPending}
                type="submit"
              >
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
