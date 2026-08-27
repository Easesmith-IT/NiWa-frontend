import React from "react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { ButtonMessageComposerProps } from "../message-studio.types";

export const ButtonMessageComposer: React.FC<ButtonMessageComposerProps> = ({
  buttonHeader,
  onButtonHeaderChange,
  buttonBody,
  onButtonBodyChange,
  buttonFooter,
  onButtonFooterChange,
  buttonRows,
  onButtonRowsChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Header Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onButtonHeaderChange(event.target.value)}
          placeholder="Optional header text..."
          value={buttonHeader}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Body Text *</label>
        <Textarea
          className="min-h-20 text-xs"
          onChange={(event) => onButtonBodyChange(event.target.value)}
          placeholder="Interactive message body content..."
          value={buttonBody}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Footer Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onButtonFooterChange(event.target.value)}
          placeholder="Optional footer text..."
          value={buttonFooter}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Buttons (One per line, format: id|title)</label>
        <Textarea
          className="min-h-20 text-xs font-mono"
          onChange={(event) => onButtonRowsChange(event.target.value)}
          placeholder={"btn-1 | Yes\nbtn-2 | No"}
          value={buttonRows}
        />
      </div>
    </div>
  );
};
