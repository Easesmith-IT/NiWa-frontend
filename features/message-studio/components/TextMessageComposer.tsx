import React from "react";
import { Textarea } from "../../../components/ui/textarea";
import { TextMessageComposerProps } from "../message-studio.types";

export const TextMessageComposer: React.FC<TextMessageComposerProps> = ({
  body,
  onBodyChange,
  previewUrl,
  onPreviewUrlChange,
}) => {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Message Body *</label>
        <Textarea
          className="min-h-28 text-xs"
          onChange={(event) => onBodyChange(event.target.value)}
          placeholder="Enter text message content..."
          value={body}
        />
      </div>
      <label className="flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs text-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
        <input
          checked={previewUrl}
          onChange={(event) => onPreviewUrlChange(event.target.checked)}
          type="checkbox"
        />
        Enable URL preview link cards
      </label>
    </>
  );
};
