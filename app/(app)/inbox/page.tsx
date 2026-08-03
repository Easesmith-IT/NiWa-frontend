"use client";

import { AxiosError } from "axios";
import { KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Command,
  MessageSquareDot,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  RefreshCw,
  Search,
  SendHorizonal,
  Smile,
  Sparkles,
  Star,
  Tags,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { getAccessToken } from "../../../lib/auth";
import { cn } from "../../../lib/utils";
import { withDisplayPhoneNumber } from "../../../features/shared/mappers";
import {
  useAddContactLabelV1Mutation,
  usePatchContactV1Mutation,
  useRemoveContactLabelV1Mutation,
} from "../../../features/contacts";
import {
  useInboxRealtime,
  useInboxThreadDetailV1Query,
  useInboxThreadStateMutation,
  useInboxThreadsV1Query,
  useSyncInboxThreadHistoryV1Mutation,
} from "../../../features/inbox";
import { useLabelsV1Query } from "../../../features/labels";
import { useSendTextMessageV1Mutation } from "../../../features/messages";
import { getMessageMediaUrlV1 } from "../../../features/messages/message.api";
import {
  useCreateContactNoteV1Mutation,
  useDeleteNoteV1Mutation,
  usePatchNoteV1Mutation,
  useSetNotePinnedV1Mutation,
} from "../../../features/notes";
import { usePatchQuickReplyV1Mutation, useQuickRepliesV1Query } from "../../../features/quick-replies";
import {
  useCreateScheduledMessageV1Mutation,
  useScheduledMessagesV1Query,
} from "../../../features/scheduled-messages";
import {
  useCancelTaskV1Mutation,
  useCompleteTaskV1Mutation,
  useCreateTaskV1Mutation,
  useTasksV1Query,
} from "../../../features/tasks";

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "awaiting_reply", label: "Awaiting" },
  { key: "starred", label: "Starred" },
] as const;

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const formatConversationTime = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

const formatMessageDay = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

const formatDateInput = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const toIsoFromDateInput = (value: string) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T09:00:00.000Z`).toISOString();
};

const buildInitials = (value?: string | null) => {
  const source = value?.trim();
  if (!source) {
    return "NW";
  }

  const digitsOnly = source.replace(/\D/g, "");
  if (digitsOnly.length >= 7 && (source.startsWith("+") || /^\d+$/.test(source))) {
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      return `9${digitsOnly[2]}`;
    }
    return digitsOnly.slice(0, 2);
  }

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const avatarColorStyles = [
  "bg-[#dfe5dc] text-[#2d644d]",
  "bg-[#e0e8f5] text-[#2b5288]",
  "bg-[#f5e6e0] text-[#883d2b]",
  "bg-[#eee0f5] text-[#632b88]",
  "bg-[#f5f2e0] text-[#70642b]",
  "bg-[#e0f5f2] text-[#2b7d70]",
];

const getAvatarColorStyle = (name?: string | null) => {
  if (!name) return avatarColorStyles[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return avatarColorStyles[hash % avatarColorStyles.length];
};

const ContactAvatar = ({
  avatarUrl,
  className,
  name,
}: {
  avatarUrl?: string | null;
  className?: string;
  name?: string | null;
}) => {
  if (avatarUrl) {
    return (
      <img
        alt={name ?? "Contact"}
        className={cn("rounded-full object-cover", className)}
        referrerPolicy="no-referrer"
        src={avatarUrl}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold transition-colors",
        getAvatarColorStyle(name),
        className,
      )}
    >
      {buildInitials(name)}
    </div>
  );
};

const getContactVariableDefaults = (contact?: {
  company?: string | null;
  displayName?: string;
  phoneNumber?: string;
  profileName?: string | null;
}) => {
  const displayName = contact?.displayName ?? "";
  const firstName = displayName.trim().split(/\s+/)[0] ?? "";

  return {
    company: contact?.company ?? "",
    displayName,
    firstName,
    name: displayName,
    phoneNumber: contact?.phoneNumber ?? "",
    profileName: contact?.profileName ?? "",
  };
};

const extractTemplateVariables = (body: string, explicitVariables: string[]) => {
  const placeholders = Array.from(body.matchAll(/{{\s*([^}]+?)\s*}}/g))
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([...explicitVariables, ...placeholders]));
};

const resolveQuickReplyBody = (
  body: string,
  variables: string[],
  values: Record<string, string>,
) =>
  body.replace(/{{\s*([^}]+?)\s*}}/g, (_match, rawName: string) => {
    const name = rawName.trim();

    if (name in values) {
      return values[name] ?? "";
    }

    const numericIndex = Number(name);
    if (!Number.isNaN(numericIndex) && numericIndex >= 1) {
      return values[variables[numericIndex - 1] ?? ""] ?? "";
    }

    return "";
  });

const areVariableValuesEqual = (left: Record<string, string>, right: Record<string, string>) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};

const getSchedulePreview = (payload: Record<string, unknown>) => {
  if (typeof payload.body === "string" && payload.body.trim()) {
    return payload.body;
  }

  return "Scheduled payload";
};

const messageActionLabels = [
  { action: "read" as const, label: "Mark as read" },
  { action: "pin" as const, label: "Pin conversation" },
  { action: "star" as const, label: "Star conversation" },
  { action: "archive" as const, label: "Archive conversation" },
];

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

const renderOutgoingStatusIcon = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "read":
      return <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />;
    case "delivered":
      return <CheckCheck className="h-3.5 w-3.5 text-[#7a8b82]" />;
    case "sent":
    case "submitted":
      return <Check className="h-3.5 w-3.5 text-[#7a8b82]" />;
    case "queued":
    case "accepted":
      return <Clock3 className="h-3.5 w-3.5 text-[#7a8b82]" />;
    case "failed":
      return <X className="h-3.5 w-3.5 text-[#bf5b4b]" />;
    default:
      return <Check className="h-3.5 w-3.5 text-[#7a8b82]" />;
  }
};

const getMessageTimestamp = (message: {
  createdAt?: string;
  metaTimestamp?: string | null;
}) => message.metaTimestamp || message.createdAt || "";

const buildMessageStatusDetails = (message: {
  errorDetails?: string | null;
  status?: string;
  statusTimestamps?: {
    deliveredAt?: string | null;
    failedAt?: string | null;
    queuedAt?: string | null;
    readAt?: string | null;
    sentAt?: string | null;
  };
}) => {
  const parts = [
    message.statusTimestamps?.queuedAt ? `Queued: ${formatDateTime(message.statusTimestamps.queuedAt)}` : null,
    message.statusTimestamps?.sentAt ? `Sent: ${formatDateTime(message.statusTimestamps.sentAt)}` : null,
    message.statusTimestamps?.deliveredAt
      ? `Delivered: ${formatDateTime(message.statusTimestamps.deliveredAt)}`
      : null,
    message.statusTimestamps?.readAt ? `Read: ${formatDateTime(message.statusTimestamps.readAt)}` : null,
    message.statusTimestamps?.failedAt ? `Failed: ${formatDateTime(message.statusTimestamps.failedAt)}` : null,
    message.status === "failed" && message.errorDetails ? `Reason: ${message.errorDetails}` : null,
  ].filter(Boolean);

  return parts.join("\n");
};

const MessageMedia = ({
  messageId,
  mimeType,
}: {
  messageId: string;
  mimeType?: string | null;
}) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | null = null;

    const load = async () => {
      try {
        const token = getAccessToken();
        const response = await fetch(getMessageMediaUrlV1(messageId), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!disposed) {
          setMediaUrl(objectUrl);
        }
      } catch {
        if (!disposed) {
          setMediaUrl(null);
        }
      }
    };

    void load();

    return () => {
      disposed = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [messageId]);

  if (!mediaUrl) {
    return (
      <div className="mt-2 rounded-xl bg-black/5 px-3 py-2 text-xs text-[#6f7f75]">
        Loading media...
      </div>
    );
  }

  if (mimeType?.startsWith("image/")) {
    return <img alt="WhatsApp media" className="mt-2 max-h-72 rounded-xl object-cover" src={mediaUrl} />;
  }

  if (mimeType?.startsWith("video/")) {
    return <video className="mt-2 max-h-72 rounded-xl" controls src={mediaUrl} />;
  }

  if (mimeType?.startsWith("audio/")) {
    return <audio className="mt-2 w-full" controls src={mediaUrl} />;
  }

  return (
    <a
      className="mt-2 inline-flex rounded-xl bg-black/5 px-3 py-2 text-sm text-[#2d644d] underline-offset-2 hover:underline"
      href={mediaUrl}
      rel="noreferrer"
      target="_blank"
    >
      Open attachment
    </a>
  );
};

type OptimisticInboxMessage = {
  _id: string;
  createdAt: string;
  direction: "outgoing";
  messageType: "text";
  previewText: string;
  status: "failed" | "queued" | "sent";
};

const PanelSection = ({
  title,
  children,
}: {
  children: ReactNode;
  title: string;
}) => (
  <section className="border-t border-[#e5ddd3] px-6 py-5 first:border-t-0">
    <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6f7f75]">
      {title}
    </h3>
    <div className="mt-3">{children}</div>
  </section>
);

export default function InboxPage() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composerBody, setComposerBody] = useState("");
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState("");
  const [quickReplyVariableValues, setQuickReplyVariableValues] = useState<Record<string, string>>({});
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "low" | "medium">("medium");
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledType, setScheduledType] = useState<"one_time" | "recurring">("one_time");
  const [scheduledRule, setScheduledRule] = useState<"daily" | "monthly" | "weekly">("daily");
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [quickReplyPanelOpen, setQuickReplyPanelOpen] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticInboxMessage[]>([]);
  const [composerFeedback, setComposerFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);

  const threadsQuery = useInboxThreadsV1Query({ filter, search });
  const labelsQuery = useLabelsV1Query();
  const quickRepliesQuery = useQuickRepliesV1Query();
  const threadMutation = useInboxThreadStateMutation();
  const addLabelMutation = useAddContactLabelV1Mutation();
  const removeLabelMutation = useRemoveContactLabelV1Mutation();
  const sendTextMutation = useSendTextMessageV1Mutation();
  const createTaskMutation = useCreateTaskV1Mutation();
  const completeTaskMutation = useCompleteTaskV1Mutation();
  const cancelTaskMutation = useCancelTaskV1Mutation();
  const createNoteMutation = useCreateContactNoteV1Mutation();
  const patchNoteMutation = usePatchNoteV1Mutation();
  const deleteNoteMutation = useDeleteNoteV1Mutation();
  const setNotePinnedMutation = useSetNotePinnedV1Mutation();
  const patchQuickReplyMutation = usePatchQuickReplyV1Mutation();
  const createScheduledMessageMutation = useCreateScheduledMessageV1Mutation();

  const threads = threadsQuery.data?.data ?? [];
  const quickReplies = (quickRepliesQuery.data?.data ?? []).filter((item) => item.isActive);

  useEffect(() => {
    const requestedConversationId = searchParams.get("conversationId");
    if (requestedConversationId) {
      setSelectedConversationId(requestedConversationId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (threads.length === 0) {
      if (selectedConversationId !== null) {
        setSelectedConversationId(null);
      }
      return;
    }

    const hasSelectedConversation = selectedConversationId
      ? threads.some((thread) => thread.conversation._id === selectedConversationId)
      : false;

    if (!hasSelectedConversation) {
      setSelectedConversationId(threads[0]?.conversation._id ?? null);
    }
  }, [selectedConversationId, threads]);

  const selectedThread = useMemo(
    () =>
      threads.find((thread) => thread.conversation._id === selectedConversationId) ??
      null,
    [selectedConversationId, threads],
  );

  const activeConversationId = selectedThread?.conversation._id ?? null;
  useInboxRealtime(activeConversationId);

  const detailQuery = useInboxThreadDetailV1Query(activeConversationId, { messageLimit: 1000 });
  const syncHistoryMutation = useSyncInboxThreadHistoryV1Mutation();
  const patchContactMutation = usePatchContactV1Mutation();
  const detail = detailQuery.data?.data ?? null;

  const [editingContact, setEditingContact] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const tasksQuery = useTasksV1Query(detail?.contact?._id ? { contactId: detail.contact._id } : undefined);
  const scheduledMessagesQuery = useScheduledMessagesV1Query(
    detail?.contact?._id ? { contactId: detail.contact._id } : undefined,
  );

  const handleSyncHistory = async () => {
    if (!activeConversationId) return;
    try {
      await syncHistoryMutation.mutateAsync(activeConversationId);
      setComposerFeedback({
        message: "Thread history synchronized successfully.",
        tone: "success",
      });
    } catch (error) {
      setComposerFeedback({
        message: getErrorMessage(error, "Failed to synchronize thread history."),
        tone: "error",
      });
    }
  };

  useEffect(() => {
    setContactInfoOpen(false);
    setSelectedQuickReplyId("");
    setSelectedLabelId("");
    setTaskTitle("");
    setTaskDueDate("");
    setTaskPriority("medium");
    setNoteContent("");
    setNotePinned(false);
    setEditingNoteId(null);
    setEditingNoteContent("");
    setQuickReplyVariableValues({});
    setScheduledDate("");
    setScheduledType("one_time");
    setScheduledRule("daily");
    setActionsOpen(false);
    setComposerMenuOpen(false);
    setScheduleDialogOpen(false);
    setQuickReplyPanelOpen(false);
    setOptimisticMessages([]);
    setComposerFeedback(null);
  }, [activeConversationId]);

  const selectedQuickReply = useMemo(
    () => quickReplies.find((quickReply) => quickReply._id === selectedQuickReplyId) ?? null,
    [quickReplies, selectedQuickReplyId],
  );
  const selectedQuickReplyVariables = useMemo(
    () =>
      selectedQuickReply
        ? extractTemplateVariables(selectedQuickReply.body, selectedQuickReply.variables)
        : [],
    [selectedQuickReply],
  );
  const quickReplyPreview = selectedQuickReply
    ? resolveQuickReplyBody(
        selectedQuickReply.body,
        selectedQuickReplyVariables,
        quickReplyVariableValues,
      )
    : "";

  const contactLabelIds = detail?.contact.labels ?? [];
  const availableLabels = (labelsQuery.data?.data ?? []).filter(
    (label) => !contactLabelIds.includes(label._id),
  );
  const contactLabels = (labelsQuery.data?.data ?? []).filter((label) =>
    contactLabelIds.includes(label._id),
  );
  const tasks = tasksQuery.data?.data ?? [];
  const scheduledItems = scheduledMessagesQuery.data?.data ?? [];

  const quickReplyTrigger = useMemo(() => {
    const match = composerBody.match(/(?:^|\s)\/([\w-]*)$/);
    return match?.[1]?.toLowerCase() ?? null;
  }, [composerBody]);

  const quickReplySuggestions = useMemo(() => {
    if (quickReplyTrigger === null) {
      return [];
    }

    return quickReplies.filter((reply) => {
      const searchValue = `${reply.shortcut} ${reply.title}`.toLowerCase();
      return searchValue.includes(quickReplyTrigger);
    });
  }, [quickReplies, quickReplyTrigger]);

  const displayedMessages = useMemo(() => {
    const persistedMessages = detail?.messages ?? [];

    if (optimisticMessages.length === 0) {
      return persistedMessages;
    }

    const messagesById = new Map<string, (typeof persistedMessages)[number]>();

    optimisticMessages.forEach((message) => {
      messagesById.set(message._id, message);
    });
    persistedMessages.forEach((message) => {
      messagesById.set(message._id, message);
    });

    return Array.from(messagesById.values()).sort((left, right) => {
      const leftTime = getMessageTimestamp(left) ? new Date(getMessageTimestamp(left)).getTime() : 0;
      const rightTime = getMessageTimestamp(right) ? new Date(getMessageTimestamp(right)).getTime() : 0;
      return leftTime - rightTime;
    });
  }, [detail?.messages, optimisticMessages]);

  const messageGroups = useMemo(() => {
    const groups: Array<{ day: string; messages: NonNullable<typeof detail>["messages"] }> = [];
    if (!detail && optimisticMessages.length === 0) {
      return groups;
    }

    displayedMessages.forEach((message) => {
      const day = formatMessageDay(getMessageTimestamp(message));
      const existing = groups[groups.length - 1];

      if (!existing || existing.day !== day) {
        groups.push({ day, messages: [message] });
        return;
      }

      existing.messages.push(message);
    });

    return groups;
  }, [detail, displayedMessages, optimisticMessages.length]);

  useEffect(() => {
    if (!activeConversationId || !detail?.conversation || detail.conversation.unreadCount <= 0) {
      return;
    }

    threadMutation.mutate({
      action: "read",
      conversationId: activeConversationId,
    });
  }, [activeConversationId, detail?.conversation, threadMutation]);

  useEffect(() => {
    if (!selectedQuickReply) {
      setQuickReplyVariableValues((current) => (Object.keys(current).length === 0 ? current : {}));
      return;
    }

    const defaults = getContactVariableDefaults(detail?.contact);
    const nextValues: Record<string, string> = {};

    for (const variable of selectedQuickReplyVariables) {
      const numericIndex = Number(variable);

      if (!Number.isNaN(numericIndex) && numericIndex >= 1) {
        const mappedVariable = selectedQuickReply.variables[numericIndex - 1] ?? "";
        nextValues[variable] = defaults[mappedVariable as keyof typeof defaults] ?? "";
        continue;
      }

      nextValues[variable] = defaults[variable as keyof typeof defaults] ?? "";
    }

    setQuickReplyVariableValues((current) =>
      areVariableValuesEqual(current, nextValues) ? current : nextValues,
    );
  }, [detail?.contact, selectedQuickReply, selectedQuickReplyVariables]);

  const performThreadAction = (
    action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
  ) => {
    if (!activeConversationId) {
      return;
    }

    threadMutation.mutate({
      action,
      conversationId: activeConversationId,
    });
    setActionsOpen(false);
  };

  const insertQuickReply = (quickReplyId = selectedQuickReplyId) => {
    const chosenQuickReply = quickReplies.find((item) => item._id === quickReplyId);
    if (!chosenQuickReply) {
      return;
    }

    setSelectedQuickReplyId(chosenQuickReply._id);
    const replyVariables = extractTemplateVariables(chosenQuickReply.body, chosenQuickReply.variables);
    const resolvedBody = resolveQuickReplyBody(
      chosenQuickReply.body,
      replyVariables,
      quickReplyVariableValues,
    );

    setComposerBody((current) =>
      current.replace(/(?:^|\s)\/([\w-]*)$/, () => {
        const prefix = current.match(/(?:^|\s)\/([\w-]*)$/)?.[0]?.startsWith(" ") ? " " : "";
        return `${prefix}${resolvedBody}`;
      }),
    );
  };

  const sendMessage = () => {
    if (!detail?.contact._id || !composerBody.trim()) {
      return;
    }

    const outboundBody = composerBody.trim();
    const optimisticMessageId = `optimistic-${Date.now()}`;
    const optimisticCreatedAt = new Date().toISOString();

    setComposerFeedback(null);
    setComposerBody("");
    setSelectedQuickReplyId("");
    setQuickReplyVariableValues({});
    setOptimisticMessages((current) => [
      ...current,
      {
        _id: optimisticMessageId,
        createdAt: optimisticCreatedAt,
        direction: "outgoing",
        messageType: "text",
        previewText: outboundBody,
        status: "queued",
      },
    ]);
    sendTextMutation.mutate(
      {
        body: outboundBody,
        contactId: detail.contact._id,
        conversationId: activeConversationId ?? undefined,
      },
      {
        onSuccess: (result) => {
          const storedMessage = result?.message;

          setOptimisticMessages((current) =>
            current.map((message) =>
              message._id === optimisticMessageId
                ? {
                    ...message,
                    _id:
                      typeof storedMessage?._id === "string" && storedMessage._id.length > 0
                        ? storedMessage._id
                        : message._id,
                    createdAt: storedMessage?.createdAt ?? message.createdAt,
                    previewText: storedMessage?.previewText ?? message.previewText,
                    status:
                      (storedMessage?.status as "failed" | "queued" | "sent" | undefined) ??
                      "sent",
                  }
                : message,
            ),
          );
          setComposerFeedback({
            message: "Message sent. Waiting for delivery status...",
            tone: "success",
          });
        },
        onError: (error) => {
          setComposerBody((current) => current || outboundBody);
          setOptimisticMessages((current) =>
            current.map((message) =>
              message._id === optimisticMessageId
                ? {
                    ...message,
                    status: "failed",
                  }
                : message,
            ),
          );
          setComposerFeedback({
            message: getErrorMessage(error, "Message could not be sent."),
            tone: "error",
          });
        },
      },
    );
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-6.75rem)] min-h-[720px] bg-[#f6f1e9] text-[#25342f]">
      <div
        className={cn(
          "grid h-full min-h-0",
          detail
            ? contactInfoOpen
              ? "xl:grid-cols-[340px_minmax(0,1fr)_360px]"
              : "xl:grid-cols-[340px_minmax(0,1fr)]"
            : "xl:grid-cols-[340px_minmax(0,1fr)]",
        )}
      >
        <aside className="flex min-h-0 flex-col border-r border-[#ddd2c3] bg-[#f9f4ec]">
          <div className="border-b border-[#e5ddd3] px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] font-semibold text-[#25342f]">Inbox</h1>
              <div className="flex items-center gap-1">
                <button
                  className="rounded-full p-2 text-[#6e7d74] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full p-2 text-[#6e7d74] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                  type="button"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8b82]" />
              <Input
                className="h-12 rounded-full border-[#ddd2c3] bg-[#fffdf9] pl-11 text-[15px] text-[#25342f] placeholder:text-[#7a8b82]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                value={search}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    filter === item.key
                      ? "border-[#2d644d] bg-[#2d644d] text-white"
                      : "border-[#ddd2c3] bg-[#fffdf9] text-[#65766d] hover:text-[#25342f]",
                  )}
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <button
                className="rounded-full border border-[#ddd2c3] bg-[#fffdf9] px-3 py-2 text-[#65766d] transition hover:text-[#25342f]"
                type="button"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="niwa-scrollbar min-h-0 flex-1 overflow-y-auto">
            {threads.map((thread) => {
              const isActive = thread.conversation._id === activeConversationId;
              const rawName =
                thread.contact?.displayName ||
                thread.contact?.profileName ||
                thread.contact?.phoneNumber ||
                thread.conversation.waId;
              const displayName = withDisplayPhoneNumber(rawName) ?? rawName;

              return (
                <button
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-[#ece1d4] px-6 py-4 text-left transition",
                    isActive ? "bg-[#ece4d8]" : "hover:bg-[#f2ebe2]",
                  )}
                  key={thread.conversation._id}
                  onClick={() => setSelectedConversationId(thread.conversation._id)}
                  type="button"
                >
                  <ContactAvatar
                    avatarUrl={thread.contact?.avatarUrl}
                    className="h-12 w-12 shrink-0 text-sm"
                    name={displayName}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-[15px]",
                            thread.conversation.unreadCount > 0 ? "font-semibold" : "font-medium",
                          )}
                        >
                          {displayName}
                        </p>
                        <p className="mt-1 truncate text-[14px] text-[#65766d]">
                          {thread.conversation.lastMessageText || "No messages yet."}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-[12px] text-[#7a8b82]">
                          {formatConversationTime(thread.conversation.lastMessageAt || thread.conversation.updatedAt)}
                        </span>
                        {thread.conversation.unreadCount > 0 ? (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#2d644d] px-2 py-0.5 text-[11px] font-semibold text-white">
                            {thread.conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {!threadsQuery.isPending && threads.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#7a8b82]">
                No conversations match this view.
              </div>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#fbf7f1]">
          {!detail ? (
            <div className="flex h-full items-center justify-center px-8">
              <div className="max-w-lg text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e6eee6] text-[#2d644d]">
                  <MessageSquareDot className="h-8 w-8" />
                </div>
                <h2 className="mt-6 text-[36px] font-semibold tracking-[-0.03em] text-[#25342f]">
                  {detailQuery.isFetching || detailQuery.isPending ? "Loading conversation" : "NiWa"}
                </h2>
                <p className="mt-3 text-[18px] text-[#4f6258]">
                  {detailQuery.isError
                    ? "This conversation could not be opened."
                    : detailQuery.isFetching || detailQuery.isPending
                      ? "Fetching thread details from the inbox API"
                      : "Select a conversation to start messaging"}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-[#6f7f75]">
                  {detailQuery.isError
                    ? getErrorMessage(detailQuery.error, "The inbox detail request failed.")
                    : "Manage customer conversations, templates and follow-ups from one workspace."}
                </p>
                <p className="mt-14 text-[13px] text-[#7a8b82]">
                  {detailQuery.isError
                    ? "The conversation list is still available while the detail request is being fixed."
                    : "Connected through WhatsApp Business Platform"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex h-[72px] items-center justify-between border-b border-[#ddd2c3] bg-[#fbf7f1] px-5">
                <button
                  className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1 text-left transition hover:bg-[#f2ebe2]"
                  onClick={() => setContactInfoOpen(true)}
                  type="button"
                >
                  <ContactAvatar
                    avatarUrl={detail.contact.avatarUrl}
                    className="h-10 w-10 shrink-0 text-sm"
                    name={detail.contact.displayName}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-medium text-[#25342f]">
                      {withDisplayPhoneNumber(detail.contact.displayName) ?? detail.contact.displayName}
                    </p>
                    <p className="truncate text-[13px] text-[#6f7f75]">
                      {withDisplayPhoneNumber(detail.contact.phoneNumber || detail.conversation.waId)}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 rounded-full border border-[#ddd2c3] bg-[#fffdf9] px-3 py-1.5 text-xs font-medium text-[#4f6258] transition hover:border-[#2d644d] hover:bg-[#efe7db] hover:text-[#25342f] disabled:opacity-50"
                    disabled={syncHistoryMutation.isPending}
                    onClick={handleSyncHistory}
                    title="Sync & Reconcile Chat History"
                    type="button"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", syncHistoryMutation.isPending && "animate-spin")} />
                    <span>{syncHistoryMutation.isPending ? "Syncing..." : "Sync History"}</span>
                  </button>
                  <button
                    className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#f2ebe2] hover:text-[#25342f]"
                    type="button"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <button
                      className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#f2ebe2] hover:text-[#25342f]"
                      onClick={() => setActionsOpen((current) => !current)}
                      type="button"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {actionsOpen ? (
                      <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-[#ddd2c3] bg-white p-2 shadow-[0_12px_32px_rgba(32,38,35,0.14)]">
                        {messageActionLabels.map((item) => (
                          <button
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#25342f] transition hover:bg-[#f6f1e9]"
                            key={item.action}
                            onClick={() =>
                              performThreadAction(
                                item.action === "pin" && detail.conversation.pinnedAt
                                  ? "unpin"
                                  : item.action === "star" && detail.conversation.starred
                                    ? "unstar"
                                    : item.action === "archive" && detail.conversation.status === "archived"
                                      ? "unarchive"
                                      : item.action,
                              )
                            }
                            type="button"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="niwa-scrollbar min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fbf7f1_0%,#f7f0e7_100%)] px-8 py-6">
                {detailQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        className={cn(
                          "h-20 w-[66%] animate-pulse rounded-2xl bg-[#ece4d8]",
                          index % 2 === 0 ? "ml-auto" : "",
                        )}
                        key={index}
                      />
                    ))}
                  </div>
                ) : null}

                {!detailQuery.isLoading && messageGroups.length === 0 ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center">
                    <div className="rounded-[28px] border border-[#e2d8ca] bg-[#fffdf9] px-6 py-5 text-center">
                      <p className="text-sm font-medium text-[#25342f]">No messages in this thread yet.</p>
                      <p className="mt-1 text-sm text-[#7a8b82]">
                        New inbound and outbound messages will appear here automatically.
                      </p>
                    </div>
                  </div>
                ) : null}

                {messageGroups.map((group) => (
                  <div className="mb-6" key={group.day}>
                    <div className="mb-4 flex justify-center">
                      <span className="rounded-full border border-[#e3d8ca] bg-[#fffdf9] px-3 py-1 text-[11px] text-[#7a8b82]">
                        {group.day}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.messages.map((message) => {
                        const outgoing = message.direction === "outgoing";
                        const mediaMimeType = message.media?.mimeType ?? null;
                        const messageTime = getMessageTimestamp(message);
                        const statusDetails = outgoing ? buildMessageStatusDetails(message) : "";
                        const locationData = (message.locationData ?? {}) as {
                          address?: string;
                          latitude?: number;
                          longitude?: number;
                          name?: string;
                        };
                        const hasLocation =
                          typeof locationData.latitude === "number" &&
                          typeof locationData.longitude === "number";

                        return (
                          <div className={cn("flex", outgoing ? "justify-end" : "justify-start")} key={message._id}>
                            <div
                              className={cn(
                                "max-w-[68%] rounded-2xl px-4 py-3 shadow-[0_1px_0_rgba(40,52,47,0.06)]",
                                outgoing
                                  ? "rounded-br-md bg-[#dfeee3]"
                                  : "rounded-bl-md bg-white",
                              )}
                            >
                              {message.replyTo ? (
                                <div className="mb-2 rounded-xl border-l-2 border-black/15 bg-black/5 px-3 py-2 text-xs text-[#5c6d63]">
                                  {message.replyTo.previewText || `[${message.replyTo.messageType}]`}
                                </div>
                              ) : null}
                              {message.textBody ? (
                                <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#25342f]">
                                  {message.textBody}
                                </p>
                              ) : (
                                <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#25342f]">
                                  {message.previewText || `[${message.messageType}]`}
                                </p>
                              )}
                              {message.media?.metaMediaId ? (
                                <MessageMedia messageId={message._id} mimeType={mediaMimeType} />
                              ) : null}
                              {message.media?.caption && message.media.caption !== message.textBody ? (
                                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-5 text-[#44534d]">
                                  {message.media.caption}
                                </p>
                              ) : null}
                              {hasLocation ? (
                                <a
                                  className="mt-2 block rounded-xl bg-black/5 px-3 py-2 text-sm text-[#2d644d] underline-offset-2 hover:underline"
                                  href={`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {locationData.name || locationData.address || "Open location"}
                                </a>
                              ) : null}
                              <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-[#7a8b82]">
                                <span>{formatConversationTime(messageTime)}</span>
                                {outgoing ? (
                                  <span title={statusDetails || undefined}>{renderOutgoingStatusIcon(message.status)}</span>
                                ) : null}
                              </div>
                              {message.status === "failed" && message.errorDetails ? (
                                <p className="mt-2 text-[12px] text-[#bf5b4b]">{message.errorDetails}</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#ddd2c3] bg-[#fbf7f1] px-5 py-3">
                {(selectedQuickReply && quickReplyPanelOpen) ? (
                  <div className="mb-3 rounded-2xl border border-[#e2d8ca] bg-[#fffdf9] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6f7f75]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Quick reply variables
                      </div>
                      <Button
                        className="border-[#ddd2c3] bg-transparent text-[#25342f] hover:bg-[#f6f1e9]"
                        disabled={patchQuickReplyMutation.isPending}
                        onClick={() =>
                          patchQuickReplyMutation.mutate({
                            payload: { variables: selectedQuickReplyVariables },
                            quickReplyId: selectedQuickReply._id,
                          })
                        }
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Sync vars
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedQuickReplyVariables.map((variable) => (
                        <div key={variable}>
                          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                            {variable}
                          </label>
                          <Input
                            className="border-[#ddd2c3] bg-white text-[#25342f]"
                            onChange={(event) =>
                              setQuickReplyVariableValues((current) => ({
                                ...current,
                                [variable]: event.target.value,
                              }))
                            }
                            value={quickReplyVariableValues[variable] ?? ""}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl bg-[#f6f1e9] px-3 py-2 text-sm text-[#5c6d63]">
                      {quickReplyPreview || "Resolved quick reply preview appears here."}
                    </div>
                  </div>
                ) : null}

                {quickReplySuggestions.length > 0 ? (
                  <div className="mb-3 rounded-2xl border border-[#e2d8ca] bg-white">
                    {quickReplySuggestions.slice(0, 6).map((reply) => (
                      <button
                        className="block w-full border-b border-[#eee4d8] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8f3eb]"
                        key={reply._id}
                        onClick={() => insertQuickReply(reply._id)}
                        type="button"
                      >
                        <p className="text-sm font-medium text-[#25342f]">{reply.shortcut}</p>
                        <p className="mt-1 text-xs text-[#7a8b82]">{reply.title}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-end gap-3">
                  <div className="relative">
                    <button
                      className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                      onClick={() => setComposerMenuOpen((current) => !current)}
                      type="button"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    {composerMenuOpen ? (
                      <div className="absolute bottom-12 left-0 z-20 w-52 rounded-2xl border border-[#ddd2c3] bg-white p-2 shadow-[0_12px_32px_rgba(32,38,35,0.14)]">
                        <button
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[#25342f] transition hover:bg-[#f6f1e9]"
                          onClick={() => {
                            setQuickReplyPanelOpen(true);
                            setComposerMenuOpen(false);
                            if (!selectedQuickReplyId && quickReplies[0]) {
                              setSelectedQuickReplyId(quickReplies[0]._id);
                            }
                          }}
                          type="button"
                        >
                          Quick reply
                        </button>
                        <button
                          className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[#25342f] transition hover:bg-[#f6f1e9]"
                          onClick={() => {
                            setScheduleDialogOpen(true);
                            setComposerMenuOpen(false);
                          }}
                          type="button"
                        >
                          Schedule message
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <button
                    className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                    type="button"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <div className="relative min-w-0 flex-1">
                    <Textarea
                      className="min-h-[54px] rounded-[28px] border-[#ddd2c3] bg-white px-4 py-3 text-[15px] text-[#25342f] placeholder:text-[#7a8b82]"
                      disabled={sendTextMutation.isPending}
                      onChange={(event) => setComposerBody(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Type a message"
                      value={composerBody}
                    />
                  </div>
                  <button
                    className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                    onClick={() => {
                      setQuickReplyPanelOpen((current) => !current);
                      if (!selectedQuickReplyId && quickReplies[0]) {
                        setSelectedQuickReplyId(quickReplies[0]._id);
                      }
                    }}
                    type="button"
                  >
                    <Command className="h-5 w-5" />
                  </button>
                  <button
                    className={cn(
                      "rounded-full p-3 text-white transition",
                      sendTextMutation.isPending
                        ? "cursor-not-allowed bg-[#7ea18f]"
                        : "bg-[#2d644d] hover:bg-[#255440]",
                    )}
                    disabled={sendTextMutation.isPending || !composerBody.trim()}
                    onClick={sendMessage}
                    type="button"
                  >
                    {sendTextMutation.isPending ? (
                      <Clock3 className="h-4 w-4 animate-pulse" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {sendTextMutation.isPending ? (
                  <div className="mt-3 rounded-xl bg-[#eef4ef] px-4 py-3 text-sm text-[#315444]">
                    Sending message...
                  </div>
                ) : null}

                {composerFeedback ? (
                  <div
                    className={cn(
                      "mt-3 rounded-xl px-4 py-3 text-sm",
                      composerFeedback.tone === "success"
                        ? "bg-[#e6f3e9] text-[#255440]"
                        : "bg-[#fdeaea] text-[#9d3434]",
                    )}
                  >
                    {composerFeedback.message}
                  </div>
                ) : null}

                {scheduleDialogOpen ? (
                  <div className="mt-3 rounded-2xl border border-[#e2d8ca] bg-[#fffdf9] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[#25342f]">Schedule message</h3>
                        <p className="mt-1 text-xs text-[#7a8b82]">
                          Keep scheduling contextual instead of permanent in the composer.
                        </p>
                      </div>
                      <button
                        className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                        onClick={() => setScheduleDialogOpen(false)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_130px_auto]">
                      <Input
                        className="border-[#ddd2c3] bg-white text-[#25342f]"
                        onChange={(event) => setScheduledDate(event.target.value)}
                        placeholder="Schedule date"
                        type="date"
                        value={scheduledDate}
                      />
                      <select
                        className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                        onChange={(event) => setScheduledType(event.target.value as "one_time" | "recurring")}
                        value={scheduledType}
                      >
                        <option value="one_time">One time</option>
                        <option value="recurring">Recurring</option>
                      </select>
                      <select
                        className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                        disabled={scheduledType !== "recurring"}
                        onChange={(event) => setScheduledRule(event.target.value as "daily" | "monthly" | "weekly")}
                        value={scheduledRule}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <Button
                        className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                        disabled={
                          !detail.contact._id ||
                          !composerBody.trim() ||
                          !scheduledDate ||
                          createScheduledMessageMutation.isPending
                        }
                        onClick={() =>
                          createScheduledMessageMutation.mutate(
                            {
                              contactId: detail.contact._id,
                              conversationId: activeConversationId ?? undefined,
                              payload: { body: composerBody.trim() },
                              payloadType: "text",
                              recurrenceRule: scheduledType === "recurring" ? scheduledRule : undefined,
                              scheduleType: scheduledType,
                              scheduledFor: toIsoFromDateInput(scheduledDate) ?? new Date().toISOString(),
                              timezone: "Asia/Calcutta",
                            },
                            {
                              onSuccess: () => {
                                setScheduledDate("");
                                setScheduledType("one_time");
                                setScheduledRule("daily");
                                setScheduleDialogOpen(false);
                                setComposerFeedback({
                                  message: "Message scheduled successfully.",
                                  tone: "success",
                                });
                              },
                              onError: (error) => {
                                setComposerFeedback({
                                  message: getErrorMessage(error, "Message could not be scheduled."),
                                  tone: "error",
                                });
                              },
                            },
                          )
                        }
                        type="button"
                        variant="secondary"
                      >
                        <CalendarClock className="h-4 w-4" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </section>

        {detail && contactInfoOpen ? (
          <aside className="niwa-scrollbar min-h-0 overflow-y-auto border-l border-[#ddd2c3] bg-[#fbf7f1]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5ddd3] bg-[#fbf7f1] px-6 py-5">
              <div>
                <h2 className="text-[18px] font-semibold text-[#25342f]">Contact info</h2>
                <p className="text-sm text-[#6f7f75]">CRM context for the active conversation</p>
              </div>
              <button
                className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                onClick={() => setContactInfoOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-6">
              {editingContact ? (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Display Name
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Display Name"
                      value={editDisplayName}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Company
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Company Name"
                      value={editCompany}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Email Address
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      value={editEmail}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#6f7f75]">
                      Custom Avatar Image URL
                    </label>
                    <Input
                      className="border-[#ddd2c3] bg-white text-[#25342f]"
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      value={editAvatarUrl}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="bg-[#2d644d] text-white hover:bg-[#255440]"
                      disabled={!editDisplayName.trim() || patchContactMutation.isPending}
                      onClick={() =>
                        patchContactMutation.mutate(
                          {
                            contactId: detail.contact._id,
                            payload: {
                              avatarUrl: editAvatarUrl.trim(),
                              company: editCompany.trim(),
                              displayName: editDisplayName.trim(),
                              email: editEmail.trim(),
                            },
                          },
                          {
                            onSuccess: () => setEditingContact(false),
                          },
                        )
                      }
                      size="sm"
                      type="button"
                    >
                      Save changes
                    </Button>
                    <Button
                      onClick={() => setEditingContact(false)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <ContactAvatar
                    avatarUrl={detail.contact.avatarUrl}
                    className="h-24 w-24 text-2xl"
                    name={detail.contact.displayName}
                  />
                  <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#25342f]">
                    {detail.contact.displayName}
                  </h3>
                  <p className="mt-2 text-[16px] text-[#56675d]">
                    {detail.contact.phoneNumber || "No phone available"}
                  </p>
                  {detail.contact.profileName && detail.contact.profileName !== detail.contact.displayName ? (
                    <p className="mt-1 text-sm text-[#7a8b82]">
                      WhatsApp profile: {detail.contact.profileName}
                    </p>
                  ) : null}
                  {detail.contact.company ? (
                    <p className="mt-1 text-sm text-[#7a8b82]">{detail.contact.company}</p>
                  ) : null}
                  <Button
                    className="mt-4 border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                    onClick={() => {
                      setEditDisplayName(detail.contact.displayName ?? "");
                      setEditCompany(detail.contact.company ?? "");
                      setEditEmail(detail.contact.email ?? "");
                      setEditAvatarUrl(detail.contact.avatarUrl ?? "");
                      setEditingContact(true);
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Edit contact details
                  </Button>
                </div>
              )}
            </div>

            <PanelSection title="Labels">
              <div className="flex flex-wrap gap-2">
                {contactLabels.map((label) => (
                  <button
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm"
                    disabled={removeLabelMutation.isPending}
                    key={label._id}
                    onClick={() =>
                      removeLabelMutation.mutate({ contactId: detail.contact._id, labelId: label._id })
                    }
                    style={{ backgroundColor: label.color, color: "#1b2521" }}
                    type="button"
                  >
                    {label.name}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                {contactLabels.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No labels assigned.</p>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2">
                <select
                  className="h-10 flex-1 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                  onChange={(event) => setSelectedLabelId(event.target.value)}
                  value={selectedLabelId}
                >
                  <option value="">Add a label</option>
                  {availableLabels.map((label) => (
                    <option key={label._id} value={label._id}>
                      {label.name}
                    </option>
                  ))}
                </select>
                <Button
                  className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                  disabled={!selectedLabelId || addLabelMutation.isPending}
                  onClick={() =>
                    addLabelMutation.mutate(
                      { contactId: detail.contact._id, labelId: selectedLabelId },
                      { onSuccess: () => setSelectedLabelId("") },
                    )
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Tags className="h-4 w-4" />
                </Button>
              </div>
            </PanelSection>

            <PanelSection title="Notes">
              <Textarea
                className="min-h-24 border-[#ddd2c3] bg-white text-[#25342f]"
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="Add internal note"
                value={noteContent}
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-[#6f7f75]">
                <input
                  checked={notePinned}
                  onChange={(event) => setNotePinned(event.target.checked)}
                  type="checkbox"
                />
                Pin note
              </label>
              <Button
                className="mt-3 w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                disabled={!noteContent.trim() || createNoteMutation.isPending}
                onClick={() =>
                  createNoteMutation.mutate(
                    {
                      contactId: detail.contact._id,
                      payload: {
                        content: noteContent.trim(),
                        conversationId: activeConversationId ?? undefined,
                        pinned: notePinned,
                      },
                    },
                    {
                      onSuccess: () => {
                        setNoteContent("");
                        setNotePinned(false);
                      },
                    },
                  )
                }
                type="button"
                variant="secondary"
              >
                Add note
              </Button>
              <div className="mt-4 space-y-3">
                {detail.notes.slice(0, 6).map((note) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={note._id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#25342f]">{note.authorName}</p>
                      <button
                        className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                        onClick={() =>
                          setNotePinnedMutation.mutate({ noteId: note._id, pinned: !note.pinned })
                        }
                        type="button"
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                    </div>
                    {editingNoteId === note._id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          className="min-h-20 border-[#ddd2c3] bg-[#fffdf9] text-[#25342f]"
                          onChange={(event) => setEditingNoteContent(event.target.value)}
                          value={editingNoteContent}
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={!editingNoteContent.trim() || patchNoteMutation.isPending}
                            onClick={() =>
                              patchNoteMutation.mutate(
                                { noteId: note._id, payload: { content: editingNoteContent.trim() } },
                                {
                                  onSuccess: () => {
                                    setEditingNoteId(null);
                                    setEditingNoteContent("");
                                  },
                                },
                              )
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
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[#5c6d63]">{note.content}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                        onClick={() => {
                          setEditingNoteId(note._id);
                          setEditingNoteContent(note.content);
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                        disabled={deleteNoteMutation.isPending}
                        onClick={() => deleteNoteMutation.mutate(note._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {detail.notes.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No notes yet.</p>
                ) : null}
              </div>
            </PanelSection>

            <PanelSection title="Tasks">
              <div className="space-y-3">
                <Input
                  className="border-[#ddd2c3] bg-white text-[#25342f]"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Create task"
                  value={taskTitle}
                />
                <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
                  <Input
                    className="border-[#ddd2c3] bg-white text-[#25342f]"
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    type="date"
                    value={taskDueDate}
                  />
                  <select
                    className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
                    onChange={(event) => setTaskPriority(event.target.value as "high" | "low" | "medium")}
                    value={taskPriority}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                  disabled={!taskTitle.trim() || createTaskMutation.isPending}
                  onClick={() =>
                    createTaskMutation.mutate(
                      {
                        contactId: detail.contact._id,
                        conversationId: activeConversationId ?? undefined,
                        dueAt: toIsoFromDateInput(taskDueDate),
                        priority: taskPriority,
                        title: taskTitle.trim(),
                      },
                      {
                        onSuccess: () => {
                          setTaskTitle("");
                          setTaskDueDate("");
                          setTaskPriority("medium");
                        },
                      },
                    )
                  }
                  type="button"
                  variant="secondary"
                >
                  Add task
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {tasks.map((task) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={task._id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#25342f]">{task.title}</p>
                        <p className="mt-1 text-xs text-[#7a8b82]">
                          {task.priority} • {task.status}
                        </p>
                        <p className="mt-1 text-xs text-[#7a8b82]">
                          Due {task.dueAt ? formatDateInput(task.dueAt) : "unscheduled"}
                        </p>
                      </div>
                      {task.status === "todo" ? (
                        <div className="flex gap-1">
                          <button
                            className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                            disabled={completeTaskMutation.isPending}
                            onClick={() => completeTaskMutation.mutate(task._id)}
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                            disabled={cancelTaskMutation.isPending}
                            onClick={() => cancelTaskMutation.mutate(task._id)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 ? <p className="text-sm text-[#7a8b82]">No tasks yet.</p> : null}
              </div>
            </PanelSection>

            <PanelSection title="Scheduled messages">
              <div className="space-y-3">
                {scheduledItems.slice(0, 5).map((item) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={item._id}>
                    <p className="text-sm font-medium text-[#25342f]">{getSchedulePreview(item.payload)}</p>
                    <p className="mt-1 text-xs text-[#7a8b82]">
                      {item.status} • {item.scheduleType}
                    </p>
                    <p className="mt-1 text-xs text-[#7a8b82]">
                      {formatDateTime(item.nextRunAt ?? item.scheduledFor)}
                    </p>
                  </div>
                ))}
                {scheduledItems.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No scheduled sends.</p>
                ) : null}
              </div>
            </PanelSection>

            <PanelSection title="Activity">
              <div className="space-y-3">
                {detail.activities.slice(0, 6).map((activity) => (
                  <div className="rounded-xl bg-white px-4 py-4" key={activity._id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-[#25342f]">{activity.description}</p>
                      <span className="rounded-full bg-[#f6f1e9] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#7a8b82]">
                        {activity.type}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#7a8b82]">
                      {activity.actorName} • {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))}
                {detail.activities.length === 0 ? (
                  <p className="text-sm text-[#7a8b82]">No activity recorded.</p>
                ) : null}
              </div>
            </PanelSection>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
