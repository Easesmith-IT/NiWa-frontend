import { useEffect, useState } from "react";

export interface UseConversationWorkspaceStateProps {
  selectedConversationLabels: string[];
  workspaceConversationId?: string;
}

export const useConversationWorkspaceState = ({
  selectedConversationLabels,
  workspaceConversationId,
}: UseConversationWorkspaceStateProps) => {
  const [draftLabels, setDraftLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const [replyError, setReplyError] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  useEffect(() => {
    setDraftLabels(selectedConversationLabels);
  }, [selectedConversationLabels, workspaceConversationId]);

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

  return {
    draftLabels,
    setDraftLabels,
    labelInput,
    setLabelInput,
    noteContent,
    setNoteContent,
    notePinned,
    setNotePinned,
    editingNoteId,
    setEditingNoteId,
    editingNoteContent,
    setEditingNoteContent,
    replyError,
    setReplyError,
    readError,
    setReadError,
    workspaceError,
    setWorkspaceError,
    addDraftLabel,
    removeDraftLabel,
  };
};
