import { useState } from "react";
import { ComposerMode } from "../message-studio.types";
import type { ContactRecord } from "../../contacts/contact.types";

export interface UseMessageStudioComposerStateProps {
  initialMode: ComposerMode;
}

export const useMessageStudioComposerState = ({ initialMode }: UseMessageStudioComposerStateProps) => {
  const [mode, setMode] = useState<ComposerMode>(initialMode);
  const [commonTo, setCommonTo] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [textBody, setTextBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(false);
  const [requestPreview, setRequestPreview] = useState<unknown>(null);
  const [responsePreview, setResponsePreview] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSelect = (contact: ContactRecord | null) => {
    setSelectedContact(contact);
    if (contact) {
      setCommonTo(contact.phoneNumberE164 || contact.phoneNumber || "");
    }
  };

  return {
    mode, setMode,
    commonTo, setCommonTo,
    selectedContact, setSelectedContact,
    handleContactSelect,
    textBody, setTextBody,
    previewUrl, setPreviewUrl,
    requestPreview, setRequestPreview,
    responsePreview, setResponsePreview,
    submitError, setSubmitError,
  };
};
