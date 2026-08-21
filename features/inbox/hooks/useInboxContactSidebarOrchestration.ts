import { useState } from "react";
import { AxiosError } from "axios";

import type { InboxThreadDetailV1 } from "../inbox.types";
import {
  useAddContactLabelV1Mutation,
  usePatchContactV1Mutation,
  useRemoveContactLabelV1Mutation,
} from "../../contacts";
import { useLabelsV1Query } from "../../labels";
import {
  useCreateContactNoteV1Mutation,
  useDeleteNoteV1Mutation,
  usePatchNoteV1Mutation,
  useSetNotePinnedV1Mutation,
} from "../../notes";
import {
  useCancelTaskV1Mutation,
  useCompleteTaskV1Mutation,
  useCreateTaskV1Mutation,
  useTasksV1Query,
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
  detail: InboxThreadDetailV1 | null;
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
  const labelsQuery = useLabelsV1Query();
  const tasksQuery = useTasksV1Query(detail?.contact?._id ? { contactId: detail.contact._id } : undefined);
  const agentsQuery = useAgentsQuery();

  // Mutations
  const patchContactMutation = usePatchContactV1Mutation();
  const addLabelMutation = useAddContactLabelV1Mutation();
  const removeLabelMutation = useRemoveContactLabelV1Mutation();
  const createTaskMutation = useCreateTaskV1Mutation();
  const completeTaskMutation = useCompleteTaskV1Mutation();
  const cancelTaskMutation = useCancelTaskV1Mutation();
  const createNoteMutation = useCreateContactNoteV1Mutation();
  const patchNoteMutation = usePatchNoteV1Mutation();
  const deleteNoteMutation = useDeleteNoteV1Mutation();
  const setNotePinnedMutation = useSetNotePinnedV1Mutation();
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
