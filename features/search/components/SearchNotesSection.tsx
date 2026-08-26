import React from "react";
import { NotebookPen } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { SearchNoteResult } from "../search.types";
import { formatSearchTimestamp } from "../hooks/useSearchOrchestration";

export interface SearchNotesSectionProps {
  isLoading: boolean;
  notes: SearchNoteResult[];
}

export const SearchNotesSection: React.FC<SearchNotesSectionProps> = ({
  isLoading,
  notes,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <NotebookPen className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Internal Notes</h2>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="h-3.5 w-32 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
            <div className="h-3 w-full rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
          </div>
        ) : null}
        {notes.map((item) => (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]" key={item.note._id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {item.contact?.displayName || "Unknown contact"}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.note.pinned ? "Pinned" : "Standard"} • {item.note.authorName}
                </p>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{formatSearchTimestamp(item.note.updatedAt)}</p>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-xs text-foreground">{item.note.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
