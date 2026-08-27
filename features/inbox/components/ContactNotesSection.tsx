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
        className="min-h-24 border-[#ddd2c3] bg-white text-[#25342f]"
        onChange={(event) => onNoteContentChange(event.target.value)}
        placeholder="Add internal note"
        value={noteContent}
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-[#6f7f75]">
        <input
          checked={notePinned}
          onChange={(event) => onNotePinnedChange(event.target.checked)}
          type="checkbox"
        />
        Pin note
      </label>
      <Button
        className="mt-3 w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
        disabled={!noteContent.trim() || isCreatingNote}
        onClick={onAddNote}
        type="button"
        variant="secondary"
      >
        Add note
      </Button>
      <div className="mt-4 space-y-3">
        {notes.slice(0, 6).map((note) => (
          <div className="rounded-xl bg-white px-4 py-4" key={note._id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#25342f]">{note.authorName}</p>
              <button
                className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                onClick={() => onTogglePinNote(note._id, note.pinned)}
                type="button"
              >
                <Pin className="h-4 w-4" />
              </button>
            </div>
            {editingNoteId === note._id ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  className="min-h-20 border-[#ddd2c3] bg-[#fffdf9] text-[#25342f]"
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
                  onEditingNoteIdChange(note._id);
                  onEditingNoteContentChange(note.content);
                }}
                size="sm"
                type="button"
                variant="secondary"
              >
                Edit
              </Button>
              <Button
                className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
                disabled={isDeletingNote}
                onClick={() => onDeleteNote(note._id)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {notes.length === 0 ? (
          <p className="text-sm text-[#7a8b82]">No notes yet.</p>
        ) : null}
      </div>
    </PanelSection>
  );
}
