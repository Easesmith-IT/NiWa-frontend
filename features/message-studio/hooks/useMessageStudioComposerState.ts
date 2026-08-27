import { useState } from "react";
import { ComposerMode } from "../message-studio.types";

export interface UseMessageStudioComposerStateProps {
  initialMode: ComposerMode;
}

export const useMessageStudioComposerState = ({ initialMode }: UseMessageStudioComposerStateProps) => {
  const [mode, setMode] = useState<ComposerMode>(initialMode);
  const [commonTo, setCommonTo] = useState("");
  const [textBody, setTextBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(false);
  const [requestPreview, setRequestPreview] = useState<unknown>(null);
  const [responsePreview, setResponsePreview] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  return {
    mode, setMode,
    commonTo, setCommonTo,
    textBody, setTextBody,
    previewUrl, setPreviewUrl,
    requestPreview, setRequestPreview,
    responsePreview, setResponsePreview,
    submitError, setSubmitError,
  };
};
