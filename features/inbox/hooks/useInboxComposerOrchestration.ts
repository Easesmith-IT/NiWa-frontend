import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import type { OptimisticInboxMessage } from "./useInboxState";
import type { InboxThreadDetailV1 } from "../inbox.types";
import {
  areVariableValuesEqual,
  extractTemplateVariables,
  getContactVariableDefaults,
  resolveQuickReplyBody,
} from "../utils/quick-replies";
import { toIsoFromDateInput } from "../utils/formatters";
import { useSendTextMessageV1Mutation } from "../../messages";
import { usePatchQuickReplyV1Mutation, useQuickRepliesV1Query } from "../../quick-replies";
import {
  useCreateScheduledMessageV1Mutation,
  useScheduledMessagesV1Query,
} from "../../scheduled-messages";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export interface UseInboxComposerOrchestrationOptions {
  optimisticMessages: OptimisticInboxMessage[];
  setOptimisticMessages: React.Dispatch<React.SetStateAction<OptimisticInboxMessage[]>>;
  composerFeedback: { message: string; tone: "error" | "success" } | null;
  setComposerFeedback: React.Dispatch<React.SetStateAction<{ message: string; tone: "error" | "success" } | null>>;
  detail: InboxThreadDetailV1 | null;
  activeConversationId: string | null;
}

export function useInboxComposerOrchestration({
  detail,
  activeConversationId,
  optimisticMessages,
  setOptimisticMessages,
  composerFeedback,
  setComposerFeedback,
}: UseInboxComposerOrchestrationOptions) {
  // Composer State
  const [composerBody, setComposerBody] = useState("");
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  
  

  // Quick Reply State
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState("");
  const [quickReplyVariableValues, setQuickReplyVariableValues] = useState<Record<string, string>>({});
  const [quickReplyPanelOpen, setQuickReplyPanelOpen] = useState(false);

  // Scheduled Messages State
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledType, setScheduledType] = useState<"one_time" | "recurring">("one_time");
  const [scheduledRule, setScheduledRule] = useState<"daily" | "monthly" | "weekly">("daily");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Queries
  const quickRepliesQuery = useQuickRepliesV1Query();
  const scheduledMessagesQuery = useScheduledMessagesV1Query(
    detail?.contact?._id ? { contactId: detail.contact._id } : undefined,
  );

  // Mutations
  const sendTextMutation = useSendTextMessageV1Mutation();
  const patchQuickReplyMutation = usePatchQuickReplyV1Mutation();
  const createScheduledMessageMutation = useCreateScheduledMessageV1Mutation();

  const quickReplies = (quickRepliesQuery.data?.data ?? []).filter((item) => item.isActive);
  const scheduledItems = scheduledMessagesQuery.data?.data ?? [];

  // Quick Reply Computations
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

  // Sync variable defaults when selectedQuickReply changes
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
    if (!composerBody.trim()) {
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
        contactId: detail?.contact._id ?? undefined,
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

  const handleScheduleMessage = () => {
    if (!detail?.contact._id || !composerBody.trim() || !scheduledDate) return;
    createScheduledMessageMutation.mutate(
      {
        contactId: detail?.contact._id ?? undefined,
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
    );
  };

  const resetComposerState = () => {
    setComposerBody("");
    setComposerMenuOpen(false);
    setComposerFeedback(null);
    setOptimisticMessages([]);
    setSelectedQuickReplyId("");
    setQuickReplyVariableValues({});
    setQuickReplyPanelOpen(false);
    setScheduledDate("");
    setScheduledType("one_time");
    setScheduledRule("daily");
    setScheduleDialogOpen(false);
  };

  return {
    composerBody,
    setComposerBody,
    composerMenuOpen,
    setComposerMenuOpen,
    composerFeedback,
    setComposerFeedback,
    optimisticMessages,
    setOptimisticMessages,
    selectedQuickReplyId,
    setSelectedQuickReplyId,
    quickReplyVariableValues,
    setQuickReplyVariableValues,
    quickReplyPanelOpen,
    setQuickReplyPanelOpen,
    scheduledDate,
    setScheduledDate,
    scheduledType,
    setScheduledType,
    scheduledRule,
    setScheduledRule,
    scheduleDialogOpen,
    setScheduleDialogOpen,
    quickRepliesQuery,
    scheduledMessagesQuery,
    sendTextMutation,
    patchQuickReplyMutation,
    createScheduledMessageMutation,
    quickReplies,
    scheduledItems,
    selectedQuickReply,
    selectedQuickReplyVariables,
    quickReplyPreview,
    quickReplyTrigger,
    quickReplySuggestions,
    insertQuickReply,
    sendMessage,
    handleScheduleMessage,
    resetComposerState,
  };
}





