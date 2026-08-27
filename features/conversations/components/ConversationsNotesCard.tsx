import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Textarea } from "../../../components/ui/textarea";
import { ConversationsNotesCardProps } from "../conversations.types";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

export const ConversationsNotesCard: React.FC<ConversationsNotesCardProps> = ({
  sortedNotes,
  noteContent,
  onNoteContentChange,
  onAddNote,
  isAddingNote,
  disabled,
}) => {
  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground border-b border-[#F0F0F2] pb-2">Internal Notes</h3>
      <Textarea
        className="min-h-16 bg-[#FAFAFA] text-xs"
        onChange={(event) => onNoteContentChange(event.target.value)}
        placeholder="Add internal note..."
        value={noteContent}
      />
      <Button
        className="w-full"
        disabled={disabled || !noteContent.trim() || isAddingNote}
        onClick={onAddNote}
        size="sm"
        type="button"
        variant="secondary"
      >
        Add Note
      </Button>
      <div className="space-y-2 mt-2">
        {sortedNotes.map((note) => (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs" key={note._id}>
            <p className="font-semibold text-foreground">{note.authorName}</p>
            <p className="text-[10px] text-muted-foreground">{formatDateTime(note.updatedAt)}</p>
            <p className="mt-1.5 text-foreground leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
