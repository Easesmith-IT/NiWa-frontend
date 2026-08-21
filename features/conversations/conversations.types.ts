import type { UseFormReturn } from "react-hook-form";
import type {
  ConversationMessageRecord,
  ConversationNoteRecord,
  ConversationRecord,
  TemplateRecord,
} from "../../lib/api/types";
import type { ConversationRecordV1 } from "./conversation.types";
import type { ReplyValues } from "./hooks/useConversationReplyState";

export type { ConversationRecordV1 };

export type ReplyType = "text" | "template" | "image" | "video" | "audio" | "document" | "sticker";

export interface TextReplyPayload {
  conversationId: string;
  type: "text";
  body: string;
}

export interface TemplateReplyPayload {
  conversationId: string;
  type: "template";
  templateName: string;
  languageCode: string;
  bodyVariables?: string[];
}

export interface MediaReplyPayload {
  conversationId: string;
  type: "image" | "video" | "audio" | "document" | "sticker";
  mediaId: string;
  caption?: string;
  filename?: string;
}

export type SendReplyRequest = TextReplyPayload | TemplateReplyPayload | MediaReplyPayload;

export interface AddNoteRequest {
  content: string;
  pinned: boolean;
}

export interface UpdateNoteRequest {
  noteId: string;
  content?: string;
  pinned?: boolean;
}

export type FilterMode = "all" | "unread";

// Phase 4-D Component Contracts

export interface ConversationsHeaderProps {
  totalThreadsCount: number;
  unreadCount: number;
}

export interface ConversationsThreadItemProps {
  conversation: ConversationRecord;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export interface ConversationsThreadListProps {
  conversations: ConversationRecord[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  isLoading: boolean;
}

export interface ConversationsMessageBubbleProps {
  message: ConversationMessageRecord;
}

export interface ConversationsMessageListProps {
  messages: ConversationMessageRecord[];
  isLoading: boolean;
}

export interface ConversationsReplyComposerProps {
  selectedConversationId: string | null;
  activeTemplates: TemplateRecord[];
  isSending: boolean;
  replyError: string | null;
  readError: string | null;
  replyForm: UseFormReturn<ReplyValues>;
  selectedReplyType: string;
  selectedTemplateName?: string;
  selectedTemplateLanguage?: string;
  onSubmit: (values: ReplyValues) => void;
}

export interface ConversationsChatWindowProps {
  workspaceConversation: ConversationRecord | null;
  selectedConversationId: string | null;
  isClearingUnread: boolean;
  onClearUnread: () => void;
  messageListNode: React.ReactNode;
  replyComposerNode: React.ReactNode;
}

export interface ConversationsContactProfileProps {
  conversation: ConversationRecord | null;
}

export interface ConversationsLabelsCardProps {
  draftLabels: string[];
  labelInput: string;
  onLabelInputChange: (value: string) => void;
  onAddLabel: () => void;
  onRemoveLabel: (label: string) => void;
  onSaveLabels: () => void;
  isBusy: boolean;
  workspaceError: string | null;
  disabled: boolean;
}

export interface ConversationsNotesCardProps {
  sortedNotes: ConversationNoteRecord[];
  noteContent: string;
  onNoteContentChange: (value: string) => void;
  onAddNote: () => void;
  isAddingNote: boolean;
  disabled: boolean;
}

export interface ConversationsInfoSidebarProps {
  contactProfileNode: React.ReactNode;
  labelsCardNode: React.ReactNode;
  notesCardNode: React.ReactNode;
}

export interface ConversationsShellProps {
  headerNode: React.ReactNode;
  threadsListNode: React.ReactNode;
  chatWindowNode: React.ReactNode;
  infoSidebarNode: React.ReactNode;
}
