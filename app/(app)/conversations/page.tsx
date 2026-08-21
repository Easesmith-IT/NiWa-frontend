"use client";

import {
  CheckCheck,
  CircleDot,
  MessageCircleMore,
  Search,
  Tag,
  UserRound,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  buildTemplateOptionValue,
  findTemplateByOptionValue,
} from "../../../lib/templates";
import { ConversationMessageRecord, ConversationNoteRecord, ConversationRecord } from "../../../lib/api/types";
import { useConversationsOrchestration } from "../../../features/conversations";

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
  const payload = message.payload as Record<string, unknown> | null;
  const type = message.messageType;

  if (type === "location") {
    const location = payload?.location as { name?: string; address?: string; latitude?: number; longitude?: number } | undefined;
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
    const document = (payload?.document ?? {}) as { filename?: string; caption?: string };
    return [document.filename, document.caption].filter(Boolean).join("\n") || message.previewText;
  }

  if (type === "contacts") {
    const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
    return contacts
      .map((contact: { name?: { formatted_name?: string }; phones?: Array<{ phone?: string }> }) => {
        const name = contact?.name?.formatted_name ?? "Contact";
        const phone = contact?.phones?.[0]?.phone ?? "";
        return `${name}${phone ? ` - ${phone}` : ""}`;
      })
      .join("\n");
  }

  if (type === "interactive") {
    const interactive = (payload?.interactive ?? {}) as { button_reply?: { title?: string }; list_reply?: { title?: string } };
    return interactive?.button_reply?.title ?? interactive?.list_reply?.title ?? message.previewText;
  }

  if (type === "reaction") {
    const reaction = payload?.reaction as { emoji?: string } | undefined;
    return reaction?.emoji ? `Reaction: ${reaction.emoji}` : message.previewText;
  }

  if (["image", "video", "audio", "sticker"].includes(type)) {
    const mediaPayload = (payload?.[type] ?? {}) as { id?: string };
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
  const {
    filters: { searchQuery, setSearchQuery, filterMode, setFilterMode },
    selection: { selectedConversationId, setSelectedConversationId },
    workspace: {
      draftLabels,
      labelInput,
      setLabelInput,
      noteContent,
      setNoteContent,
      replyError,
      readError,
      workspaceError,
      addDraftLabel,
      removeDraftLabel,
    },
    reply: {
      replyForm,
      selectedReplyType,
      selectedTemplateName,
      selectedTemplateLanguage,
    },
    conversations,
    activeTemplates,
    workspaceConversation,
    conversationMessages,
    sortedNotes,
    isWorkspaceBusy,
    isLoadingConversations,
    isLoadingDetail,
    isSendingReply,
    isClearingUnread,
    isAddingNote,
    handleReplySubmit,
    handleClearUnread,
    handleSaveLabels,
    handleAddNote,
  } = useConversationsOrchestration();

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

          <div className="max-h-[72vh] space-y-1 overflow-y-auto p-2 bg-white dark:bg-[#121416]">
            {conversations.map((conversation) => {
              const isActive = conversation._id === selectedConversationId;
              const title = conversation.contactName || conversation.contactPhoneNumber;

              return (
                <button
                  className={`w-full rounded-md p-3 text-left transition-colors ${
                    isActive
                      ? "border border-[#C4E8DA] bg-[#EDF8F3] dark:border-[#203D31] dark:bg-[#14251E]"
                      : "border border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#191C1E]"
                  }`}
                  key={conversation._id}
                  onClick={() => setSelectedConversationId(conversation._id)}
                  type="button"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white dark:bg-[#2D8A67]">
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
                            <span className="mt-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#176B4D] px-1 text-[10px] font-bold text-white dark:bg-[#2D8A67]">
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
            {!isLoadingConversations && conversations.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">
                No active conversations.
              </div>
            ) : null}
          </div>
        </Card>

        {/* Central Chat Window */}
        <Card className="overflow-hidden p-0 flex flex-col">
          <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] p-3.5 flex flex-wrap items-center justify-between gap-3 dark:border-[#24272A] dark:bg-[#151719]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white dark:bg-[#2D8A67]">
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
                disabled={!selectedConversationId || isClearingUnread}
                onClick={handleClearUnread}
                size="sm"
                type="button"
                variant="secondary"
              >
                Clear Unread
              </Button>
            </div>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[420px] bg-repeat bg-center bg-[#F7F8FA] dark:bg-[#101312] dark:bg-blend-multiply"
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
                        ? "border border-[#C4E8DA] bg-[#EDF8F3] text-foreground dark:border-[#203D31] dark:bg-[#14251E] dark:text-[#E8F3EE]"
                        : "border border-[#E4E4E7] bg-white text-foreground dark:border-[#282C2F] dark:bg-[#1C1F21] dark:text-[#ECEDEE]"
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
                    <p className="whitespace-pre-wrap leading-relaxed">{renderMessageBody(message)}</p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
                      <span>{formatShortTime(message.timestamp)}</span>
                      {isOutgoing ? (
                        <CheckCheck className="h-3 w-3 text-[#34B7F1] dark:text-[#53BDEB]" />
                      ) : (
                        <CircleDot className="h-3 w-3 text-[#7A8B82] dark:text-[#8D9691]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!isLoadingDetail && conversationMessages.length === 0 ? (
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
              onSubmit={replyForm.handleSubmit(handleReplySubmit)}
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
              {readError ? <p className="text-xs text-[#C2413A]">{readError}</p> : null}

              <div className="flex justify-end">
                <Button disabled={!selectedConversationId || isSendingReply} type="submit" variant="primary">
                  {isSendingReply ? "Sending..." : "Send Reply"}
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
                onClick={handleSaveLabels}
                size="sm"
                type="button"
                variant="primary"
              >
                Save
              </Button>
            </div>
            {workspaceError ? <p className="text-xs text-[#C2413A]">{workspaceError}</p> : null}
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
              disabled={!selectedConversationId || !noteContent.trim() || isAddingNote}
              onClick={handleAddNote}
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
