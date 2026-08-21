import { useState, useMemo } from "react";
import { MediaRecord } from "../../../lib/api/types";
import { ComposerMode } from "../message-studio.types";

export interface UseMessageStudioMediaStateProps {
  initialMediaId: string;
  mediaList: MediaRecord[];
  mode: ComposerMode;
  templateHeaderFormat?: string;
  templateHeaderMediaId?: string;
}

export const useMessageStudioMediaState = ({
  initialMediaId,
  mediaList,
  mode,
  templateHeaderFormat,
  templateHeaderMediaId,
}: UseMessageStudioMediaStateProps) => {
  const [selectedMediaId, setSelectedMediaId] = useState(initialMediaId);
  const [mediaCaption, setMediaCaption] = useState("");
  const [documentFilename, setDocumentFilename] = useState("");

  const selectedMedia = useMemo(
    () => mediaList.find((media) => media.metaMediaId === selectedMediaId) ?? null,
    [selectedMediaId, mediaList],
  );

  const selectedTemplateHeaderMedia = useMemo(
    () => mediaList.find((media) => media.metaMediaId === templateHeaderMediaId) ?? null,
    [templateHeaderMediaId, mediaList],
  );

  const filteredTemplateHeaderMedia = useMemo(() => {
    if (!templateHeaderFormat) {
      return [];
    }
    return mediaList.filter(
      (media) => media.mediaType === templateHeaderFormat.toLowerCase(),
    );
  }, [mediaList, templateHeaderFormat]);

  const filteredMedia = useMemo(() => {
    if (["image", "video", "audio", "document", "sticker"].includes(mode)) {
      return mediaList.filter((item) => item.mediaType === mode);
    }
    return mediaList;
  }, [mediaList, mode]);

  return {
    selectedMediaId,
    setSelectedMediaId,
    mediaCaption,
    setMediaCaption,
    documentFilename,
    setDocumentFilename,
    selectedMedia,
    selectedTemplateHeaderMedia,
    filteredTemplateHeaderMedia,
    filteredMedia,
  };
};
