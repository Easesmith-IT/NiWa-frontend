import React from "react";
import { Textarea } from "../../../components/ui/textarea";
import { getMediaDisplayName } from "../../../lib/media";
import { MediaMessageComposerProps } from "../message-studio.types";

export const MediaMessageComposer: React.FC<MediaMessageComposerProps> = ({
  mode,
  filteredMedia,
  selectedMediaId,
  onMediaIdChange,
  mediaCaption,
  onMediaCaptionChange,
}) => {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Stored Media Asset *</label>
        <select
          className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onMediaIdChange(event.target.value)}
          value={selectedMediaId}
        >
          <option value="">Select stored media asset</option>
          {filteredMedia.map((media) => (
            <option key={media._id} value={media.metaMediaId}>
              {getMediaDisplayName(media)} ({media.mediaType})
            </option>
          ))}
        </select>
      </div>
      {["image", "video", "document"].includes(mode) ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Media Caption</label>
          <Textarea
            className="min-h-16 text-xs"
            onChange={(event) => onMediaCaptionChange(event.target.value)}
            placeholder="Optional media caption..."
            value={mediaCaption}
          />
        </div>
      ) : null}
    </>
  );
};
