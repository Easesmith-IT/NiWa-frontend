import React from "react";
import { Input } from "../../../components/ui/input";
import { ReactionMessageComposerProps } from "../message-studio.types";

export const ReactionMessageComposer: React.FC<ReactionMessageComposerProps> = ({
  reactionMessageId,
  onReactionMessageIdChange,
  reactionEmoji,
  onReactionEmojiChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Target Message ID *</label>
        <Input
          className="text-xs font-mono"
          onChange={(event) => onReactionMessageIdChange(event.target.value)}
          placeholder="e.g. wamid.HBgL..."
          value={reactionMessageId}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Emoji *</label>
        <Input
          className="text-xs"
          onChange={(event) => onReactionEmojiChange(event.target.value)}
          placeholder="e.g. 👍"
          value={reactionEmoji}
        />
      </div>
    </div>
  );
};
