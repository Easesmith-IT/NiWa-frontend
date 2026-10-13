import { Pin } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { PanelSection } from "./PanelSection";

export interface NoteItem {
  _id: string;
  authorName: string;
  content: string;
  pinned: boolean;
}

export interface ContactNotesSectionProps {
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
}

export function ContactNotesSection({
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
}: ContactNotesSectionProps) {
  return (
    <PanelSection title="Notes">
      <Textarea
        className="min-h-20 text-xs"
        onChange={(event) => onNoteContentChange(event.target.value)}
        placeholder="Add internal note"
        value={noteContent}
      />
      <label className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
        <input
          checked={notePinned}
          onChange={(event) => onNotePinnedChange(event.target.checked)}
          type="checkbox"
        />
        Pin note
      </label>
      <Button
        className="mt-2.5 w-full text-xs"
        disabled={!noteContent.trim() || isCreatingNote}
        onClick={onAddNote}
        size="sm"
        type="button"
        variant="outline"
      >
        Add note
      </Button>
      <div className="mt-3 space-y-2.5">
        {notes.slice(0, 6).map((note) => (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#282B2E] dark:bg-[#17191B]" key={note._id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{note.authorName}</p>
              <button
                className="rounded-md p-1 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#25282B]"
                onClick={() => onTogglePinNote(note._id, note.pinned)}
                type="button"
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
            </div>
            {editingNoteId === note._id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  className="min-h-16 text-xs"
                  onChange={(event) => onEditingNoteContentChange(event.target.value)}
                  value={editingNoteContent}
                />
                <div className="flex gap-2">
                  <Button
                    disabled={!editingNoteContent.trim() || isPatchingNote}
                    onClick={() => onSaveNoteEdit(note._id)}
                    size="sm"
                    type="button"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      onEditingNoteIdChange(null);
                      onEditingNoteContentChange("");
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">{note.content}</p>
            )}
            <div className="mt-2.5 flex gap-2">
              <Button
                onClick={() => {
                  onEditingNoteIdChange(note._id);
                  onEditingNoteContentChange(note.content);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                disabled={isDeletingNote}
                onClick={() => onDeleteNote(note._id)}
                size="sm"
                type="button"
                variant="outline"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No notes yet.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
