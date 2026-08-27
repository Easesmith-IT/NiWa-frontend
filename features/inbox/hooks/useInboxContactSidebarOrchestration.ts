import { useState } from "react";
import { AxiosError } from "axios";

import type { InboxThreadDetail } from "../inbox.types";
import {
  useAddContactLabelMutation,
  usePatchContactMutation,
  useRemoveContactLabelMutation,
} from "../../contacts";
import { useLabelsQuery } from "../../labels";
import {
  useCreateContactNoteMutation,
  useDeleteNoteMutation,
  usePatchNoteMutation,
  useSetNotePinnedMutation,
} from "../../notes";
import {
  useCancelTaskMutation,
  useCompleteTaskMutation,
  useCreateTaskMutation,
  useTasksQuery,
} from "../../tasks";
import {
  useAgentsQuery,
  useTransferConversationAgentMutation,
  useUpdateConversationAIModeMutation,
} from "../../ai-agent";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export interface UseInboxContactSidebarOrchestrationOptions {
  detail: InboxThreadDetail | null;
  activeConversationId: string | null;
  setComposerFeedback: (feedback: { message: string; tone: "error" | "success" } | null) => void;
}

export function useInboxContactSidebarOrchestration({
  detail,
  activeConversationId,
  setComposerFeedback,
}: UseInboxContactSidebarOrchestrationOptions) {
  // Panel Toggles
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Contact Editing State
  const [editingContact, setEditingContact] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  // Labels State
  const [selectedLabelId, setSelectedLabelId] = useState("");

  // Tasks State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "low" | "medium">("medium");

  // Notes State
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Queries
  const labelsQuery = useLabelsQuery();
  const tasksQuery = useTasksQuery(detail?.contact?._id ? { contactId: detail.contact._id } : undefined);
  const agentsQuery = useAgentsQuery();

  // Mutations
  const patchContactMutation = usePatchContactMutation();
  const addLabelMutation = useAddContactLabelMutation();
  const removeLabelMutation = useRemoveContactLabelMutation();
  const createTaskMutation = useCreateTaskMutation();
  const completeTaskMutation = useCompleteTaskMutation();
  const cancelTaskMutation = useCancelTaskMutation();
  const createNoteMutation = useCreateContactNoteMutation();
  const patchNoteMutation = usePatchNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const setNotePinnedMutation = useSetNotePinnedMutation();
  const updateAIModeMutation = useUpdateConversationAIModeMutation();
  const transferAgentMutation = useTransferConversationAgentMutation();

  // Derived label lists
  const contactLabelIds = detail?.contact.labels ?? [];
  const availableLabels = (labelsQuery.data?.data ?? []).filter(
    (label) => !contactLabelIds.includes(label._id),
  );
  const contactLabels = (labelsQuery.data?.data ?? []).filter((label) =>
    contactLabelIds.includes(label._id),
  );

  const tasks = tasksQuery.data?.data ?? [];
  const agents = agentsQuery.data?.agents ?? [];

  // Reset helper
  const resetSidebarState = () => {
    setContactInfoOpen(false);
    setActionsOpen(false);
    setEditingContact(false);
    setSelectedLabelId("");
    setTaskTitle("");
    setTaskDueDate("");
    setTaskPriority("medium");
    setNoteContent("");
    setNotePinned(false);
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  return {
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
    selectedLabelId,
    setSelectedLabelId,
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
    labelsQuery,
    tasksQuery,
    agentsQuery,
    patchContactMutation,
    addLabelMutation,
    removeLabelMutation,
    createTaskMutation,
    completeTaskMutation,
    cancelTaskMutation,
    createNoteMutation,
    patchNoteMutation,
    deleteNoteMutation,
    setNotePinnedMutation,
    updateAIModeMutation,
    transferAgentMutation,
    contactLabelIds,
    availableLabels,
    contactLabels,
    tasks,
    agents,
    resetSidebarState,
  };
}
