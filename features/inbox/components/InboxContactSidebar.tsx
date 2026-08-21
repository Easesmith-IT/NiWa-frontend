import { X } from "lucide-react";
import type { InboxThreadDetailV1 } from "../inbox.types";
import { ActivityItem, ContactActivitySection } from "./ContactActivitySection";
import { ContactLabelsSection, LabelItem } from "./ContactLabelsSection";
import { ContactNotesSection, NoteItem } from "./ContactNotesSection";
import { ContactProfileSection } from "./ContactProfileSection";
import { ContactTasksSection, TaskItem } from "./ContactTasksSection";
import { ScheduledMessagesSection, ScheduledSendItem } from "./ScheduledMessagesSection";

export interface InboxContactSidebarProps {
  detail: InboxThreadDetailV1;
  onClose: () => void;

  // Contact profile edit props
  editingContact: boolean;
  onEditingContactChange: (editing: boolean) => void;
  editDisplayName: string;
  onEditDisplayNameChange: (val: string) => void;
  editCompany: string;
  onEditCompanyChange: (val: string) => void;
  editEmail: string;
  onEditEmailChange: (val: string) => void;
  editAvatarUrl: string;
  onEditAvatarUrlChange: (val: string) => void;
  onSaveContact: () => void;
  isSavingContact: boolean;

  // Labels props
  contactLabels: LabelItem[];
  availableLabels: LabelItem[];
  selectedLabelId: string;
  onSelectLabelId: (id: string) => void;
  onAddLabel: () => void;
  isAddingLabel: boolean;
  onRemoveLabel: (id: string) => void;
  isRemovingLabel: boolean;

  // Notes props
  notes: NoteItem[];
  noteContent: string;
  onNoteContentChange: (val: string) => void;
  notePinned: boolean;
  onNotePinnedChange: (pinned: boolean) => void;
  onAddNote: () => void;
  isCreatingNote: boolean;
  editingNoteId: string | null;
  onEditingNoteIdChange: (id: string | null) => void;
  editingNoteContent: string;
  onEditingNoteContentChange: (val: string) => void;
  onSaveNoteEdit: (noteId: string) => void;
  isPatchingNote: boolean;
  onTogglePinNote: (noteId: string, currentPinned: boolean) => void;
  onDeleteNote: (noteId: string) => void;
  isDeletingNote: boolean;

  // Tasks props
  tasks: TaskItem[];
  taskTitle: string;
  onTaskTitleChange: (val: string) => void;
  taskDueDate: string;
  onTaskDueDateChange: (val: string) => void;
  taskPriority: "high" | "low" | "medium";
  onTaskPriorityChange: (val: "high" | "low" | "medium") => void;
  onAddTask: () => void;
  isCreatingTask: boolean;
  onCompleteTask: (taskId: string) => void;
  isCompletingTask: boolean;
  onCancelTask: (taskId: string) => void;
  isCancelingTask: boolean;

  // Scheduled messages props
  scheduledItems: ScheduledSendItem[];

  // Activity props
  activities: ActivityItem[];
}

export function InboxContactSidebar({
  detail,
  onClose,
  editingContact,
  onEditingContactChange,
  editDisplayName,
  onEditDisplayNameChange,
  editCompany,
  onEditCompanyChange,
  editEmail,
  onEditEmailChange,
  editAvatarUrl,
  onEditAvatarUrlChange,
  onSaveContact,
  isSavingContact,
  contactLabels,
  availableLabels,
  selectedLabelId,
  onSelectLabelId,
  onAddLabel,
  isAddingLabel,
  onRemoveLabel,
  isRemovingLabel,
  notes,
  noteContent,
  onNoteContentChange,
  notePinned,
  onNotePinnedChange,
  onAddNote,
  isCreatingNote,
  editingNoteId,
  onEditingNoteIdChange,
  editingNoteContent,
  onEditingNoteContentChange,
  onSaveNoteEdit,
  isPatchingNote,
  onTogglePinNote,
  onDeleteNote,
  isDeletingNote,
  tasks,
  taskTitle,
  onTaskTitleChange,
  taskDueDate,
  onTaskDueDateChange,
  taskPriority,
  onTaskPriorityChange,
  onAddTask,
  isCreatingTask,
  onCompleteTask,
  isCompletingTask,
  onCancelTask,
  isCancelingTask,
  scheduledItems,
  activities,
}: InboxContactSidebarProps) {
  return (
    <aside className="niwa-scrollbar min-h-0 overflow-y-auto border-l border-[#ddd2c3] bg-[#fbf7f1]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5ddd3] bg-[#fbf7f1] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-semibold text-[#25342f]">Contact info</h2>
          <p className="text-sm text-[#6f7f75]">CRM context for the active conversation</p>
        </div>
        <button
          className="rounded-full p-2 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <ContactProfileSection
        contact={detail.contact}
        editAvatarUrl={editAvatarUrl}
        editCompany={editCompany}
        editDisplayName={editDisplayName}
        editEmail={editEmail}
        editingContact={editingContact}
        isSaving={isSavingContact}
        onEditAvatarUrlChange={onEditAvatarUrlChange}
        onEditCompanyChange={onEditCompanyChange}
        onEditDisplayNameChange={onEditDisplayNameChange}
        onEditEmailChange={onEditEmailChange}
        onEditingContactChange={onEditingContactChange}
        onSaveContact={onSaveContact}
      />

      <ContactLabelsSection
        availableLabels={availableLabels}
        contactLabels={contactLabels}
        isAddingLabel={isAddingLabel}
        isRemovingLabel={isRemovingLabel}
        onAddLabel={onAddLabel}
        onRemoveLabel={onRemoveLabel}
        onSelectLabelId={onSelectLabelId}
        selectedLabelId={selectedLabelId}
      />

      <ContactNotesSection
        editingNoteContent={editingNoteContent}
        editingNoteId={editingNoteId}
        isCreatingNote={isCreatingNote}
        isDeletingNote={isDeletingNote}
        isPatchingNote={isPatchingNote}
        noteContent={noteContent}
        notePinned={notePinned}
        notes={notes}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
        onEditingNoteContentChange={onEditingNoteContentChange}
        onEditingNoteIdChange={onEditingNoteIdChange}
        onNoteContentChange={onNoteContentChange}
        onNotePinnedChange={onNotePinnedChange}
        onSaveNoteEdit={onSaveNoteEdit}
        onTogglePinNote={onTogglePinNote}
      />

      <ContactTasksSection
        isCancelingTask={isCancelingTask}
        isCompletingTask={isCompletingTask}
        isCreatingTask={isCreatingTask}
        onAddTask={onAddTask}
        onCancelTask={onCancelTask}
        onCompleteTask={onCompleteTask}
        onTaskDueDateChange={onTaskDueDateChange}
        onTaskPriorityChange={onTaskPriorityChange}
        onTaskTitleChange={onTaskTitleChange}
        taskDueDate={taskDueDate}
        taskPriority={taskPriority}
        tasks={tasks}
        taskTitle={taskTitle}
      />

      <ScheduledMessagesSection scheduledItems={scheduledItems} />

      <ContactActivitySection activities={activities} />
    </aside>
  );
}
