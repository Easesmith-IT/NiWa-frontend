import { X } from "lucide-react";
import type { InboxThreadDetail } from "../inbox.types";
import { ActivityItem, ContactActivitySection } from "./ContactActivitySection";
import { ContactLabelsSection, LabelItem } from "./ContactLabelsSection";
import { ContactNotesSection, NoteItem } from "./ContactNotesSection";
import { ContactProfileSection } from "./ContactProfileSection";
import { ContactTasksSection, TaskItem } from "./ContactTasksSection";
import { ContactDealsSection } from "./ContactDealsSection";
import { ScheduledMessagesSection, ScheduledSendItem } from "./ScheduledMessagesSection";

export interface InboxContactSidebarProps {
  detail: InboxThreadDetail;
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
  scheduledItems,
  activities,
}: InboxContactSidebarProps) {
  return (
    <aside className="niwa-scrollbar min-h-0 overflow-y-auto border-l border-[#E4E4E7] bg-white dark:border-[#24272A] dark:bg-[#121416]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E4E7] bg-white px-5 py-4 dark:border-[#24272A] dark:bg-[#121416]">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Contact & CRM Context</h2>
          <p className="text-xs text-muted-foreground">Customer identity, deals, tasks, and notes</p>
        </div>
        <button
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#1F2225]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
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
        isCompletingTask={isCompletingTask}
        isCreatingTask={isCreatingTask}
        onAddTask={onAddTask}
        onCompleteTask={onCompleteTask}
        onTaskDueDateChange={onTaskDueDateChange}
        onTaskPriorityChange={onTaskPriorityChange}
        onTaskTitleChange={onTaskTitleChange}
        taskDueDate={taskDueDate}
        taskPriority={taskPriority}
        tasks={tasks}
        taskTitle={taskTitle}
      />

      <ContactDealsSection
        personId={(detail?.contact as any)?.personId}
        companyId={(detail?.contact as any)?.companyId}
        contactDisplayName={detail?.contact?.displayName || detail?.contact?.phoneNumber}
      />

      <ScheduledMessagesSection scheduledItems={scheduledItems} />

      <ContactActivitySection activities={activities} />
    </aside>
  );
}
