import { useCallback, useState } from "react";

export interface OptimisticInboxMessage {
  _id: string;
  createdAt: string;
  direction: "outgoing";
  messageType: "text";
  previewText: string;
  status: "failed" | "queued" | "sent";
}

export type InboxFilterType = "all" | "unread" | "awaiting_reply" | "starred";

export function useInboxState() {
  // Filters & Thread Selection
  const [filter, setFilter] = useState<InboxFilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Composer State
  const [composerBody, setComposerBody] = useState("");
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  const [composerFeedback, setComposerFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticInboxMessage[]>([]);

  // Quick Reply State
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState("");
  const [quickReplyVariableValues, setQuickReplyVariableValues] = useState<Record<string, string>>({});
  const [quickReplyPanelOpen, setQuickReplyPanelOpen] = useState(false);

  // Labels & Contact Info & Editing State
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  // Tasks State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "low" | "medium">("medium");

  // Notes State
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Scheduled Messages State
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledType, setScheduledType] = useState<"one_time" | "recurring">("one_time");
  const [scheduledRule, setScheduledRule] = useState<"daily" | "monthly" | "weekly">("daily");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Scroll & Lightbox State
  const [hasInitialScrollCompleted, setHasInitialScrollCompleted] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  // Reset thread-dependent state when switching active conversations
  const resetThreadDependentState = useCallback(() => {
    setHasInitialScrollCompleted(false);
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
    setShowJumpToBottom(false);
    setNewMessageCount(0);
  }, []);

  return {
    filter,
    setFilter,
    search,
    setSearch,
    selectedConversationId,
    setSelectedConversationId,

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

    selectedLabelId,
    setSelectedLabelId,
    contactInfoOpen,
    setContactInfoOpen,
    actionsOpen,
    setActionsOpen,
    editingContact,
    setEditingContact,
    editDisplayName,
    setEditDisplayName,
    editCompany,
    setEditCompany,
    editEmail,
    setEditEmail,
    editAvatarUrl,
    setEditAvatarUrl,

    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,
    taskPriority,
    setTaskPriority,

    noteContent,
    setNoteContent,
    notePinned,
    setNotePinned,
    editingNoteId,
    setEditingNoteId,
    editingNoteContent,
    setEditingNoteContent,

    scheduledDate,
    setScheduledDate,
    scheduledType,
    setScheduledType,
    scheduledRule,
    setScheduledRule,
    scheduleDialogOpen,
    setScheduleDialogOpen,

    hasInitialScrollCompleted,
    setHasInitialScrollCompleted,
    showJumpToBottom,
    setShowJumpToBottom,
    newMessageCount,
    setNewMessageCount,
    lightboxImageId,
    setLightboxImageId,

    resetThreadDependentState,
  };
}
