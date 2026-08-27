import React from "react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { ListMessageComposerProps } from "../message-studio.types";

export const ListMessageComposer: React.FC<ListMessageComposerProps> = ({
  listHeader,
  onListHeaderChange,
  listBody,
  onListBodyChange,
  listFooter,
  onListFooterChange,
  listButtonText,
  onListButtonTextChange,
  listRows,
  onListRowsChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Header Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onListHeaderChange(event.target.value)}
          placeholder="Optional list header..."
          value={listHeader}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Body Text *</label>
        <Textarea
          className="min-h-20 text-xs"
          onChange={(event) => onListBodyChange(event.target.value)}
          placeholder="List message body text..."
          value={listBody}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Footer Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onListFooterChange(event.target.value)}
          placeholder="Optional list footer..."
          value={listFooter}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Menu Button Label *</label>
        <Input
          className="text-xs"
          onChange={(event) => onListButtonTextChange(event.target.value)}
          placeholder="e.g. Select Option"
          value={listButtonText}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">List Rows (Format: id|title|description)</label>
        <Textarea
          className="min-h-20 text-xs font-mono"
          onChange={(event) => onListRowsChange(event.target.value)}
          placeholder={"opt-1 | Option 1 | First description\nopt-2 | Option 2 | Second description"}
          value={listRows}
        />
      </div>
    </div>
  );
};
