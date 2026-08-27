import React from "react";
import { Input } from "../../../components/ui/input";
import { TypingIndicatorComposerProps } from "../message-studio.types";

export const TypingIndicatorComposer: React.FC<TypingIndicatorComposerProps> = ({
  typingMessageId,
  onTypingMessageIdChange,
}) => {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">Message ID (Optional)</label>
      <Input
        className="text-xs font-mono"
        onChange={(event) => onTypingMessageIdChange(event.target.value)}
        placeholder="Optional message ID context..."
        value={typingMessageId}
      />
    </div>
  );
};
