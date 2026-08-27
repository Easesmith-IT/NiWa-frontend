export type ComposerMode =
  | "text"
  | "template"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "sticker"
  | "contact"
  | "location"
  | "button"
  | "list"
  | "reaction"
  | "cta_url"
  | "location_request"
  | "typing_indicator";

import { TemplateRecord, MediaRecord } from "../../lib/api/types";

export interface SendMessageRequest {
  endpoint: string;
  payload: Record<string, unknown>;
}

export interface TemplateHeaderUploadRequest {
  customName: string;
  file: File;
}

// Phase 3-D Component Contracts

export interface MessageModeSelectorProps {
  mode: ComposerMode;
  onModeSelect: (mode: ComposerMode) => void;
}

export interface MessageRecipientFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export interface TextMessageComposerProps {
  body: string;
  onBodyChange: (value: string) => void;
  previewUrl: boolean;
  onPreviewUrlChange: (value: boolean) => void;
}

export interface TemplateMessageComposerProps {
  activeTemplates: TemplateRecord[];
  templateName: string;
  templateLanguage: string;
  onTemplateSelect: (name: string, language: string) => void;
  selectedTemplate: TemplateRecord | null;
  templateBodyVariableValues: string[];
  onBodyVariableChange: (index: number, value: string) => void;
  templateHeaderFormat?: string;
  isUploadingHeaderMedia: boolean;
  templateHeaderUploadName: string;
  onTemplateHeaderUploadNameChange: (name: string) => void;
  templateHeaderMediaId: string;
  onTemplateHeaderMediaIdChange: (id: string) => void;
  filteredTemplateHeaderMedia: MediaRecord[];
  selectedTemplateHeaderMedia: MediaRecord | null;
  onUploadHeaderMedia: (customName: string, file: File) => void;
  templateHeaderUploadMessage: string | null;
  templateHeaderUploadError: string | null;
}

export interface MediaMessageComposerProps {
  mode: ComposerMode;
  filteredMedia: MediaRecord[];
  selectedMediaId: string;
  onMediaIdChange: (id: string) => void;
  mediaCaption: string;
  onMediaCaptionChange: (caption: string) => void;
}

export interface LocationMessageComposerProps {
  locationName: string;
  onLocationNameChange: (value: string) => void;
  locationAddress: string;
  onLocationAddressChange: (value: string) => void;
  latitude: string;
  onLatitudeChange: (value: string) => void;
  longitude: string;
  onLongitudeChange: (value: string) => void;
}

export interface ContactMessageComposerProps {
  contactFormattedName: string;
  onContactFormattedNameChange: (value: string) => void;
  contactFirstName: string;
  onContactFirstNameChange: (value: string) => void;
  contactLastName: string;
  onContactLastNameChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
}

export interface ButtonMessageComposerProps {
  buttonHeader: string;
  onButtonHeaderChange: (value: string) => void;
  buttonBody: string;
  onButtonBodyChange: (value: string) => void;
  buttonFooter: string;
  onButtonFooterChange: (value: string) => void;
  buttonRows: string;
  onButtonRowsChange: (value: string) => void;
}

export interface ListMessageComposerProps {
  listHeader: string;
  onListHeaderChange: (value: string) => void;
  listBody: string;
  onListBodyChange: (value: string) => void;
  listFooter: string;
  onListFooterChange: (value: string) => void;
  listButtonText: string;
  onListButtonTextChange: (value: string) => void;
  listRows: string;
  onListRowsChange: (value: string) => void;
}

export interface ReactionMessageComposerProps {
  reactionMessageId: string;
  onReactionMessageIdChange: (value: string) => void;
  reactionEmoji: string;
  onReactionEmojiChange: (value: string) => void;
}

export interface CtaUrlMessageComposerProps {
  ctaHeader: string;
  onCtaHeaderChange: (value: string) => void;
  ctaBody: string;
  onCtaBodyChange: (value: string) => void;
  ctaFooter: string;
  onCtaFooterChange: (value: string) => void;
  ctaDisplayText: string;
  onCtaDisplayTextChange: (value: string) => void;
  ctaUrl: string;
  onCtaUrlChange: (value: string) => void;
}

export interface LocationRequestComposerProps {
  locationRequestBody: string;
  onLocationRequestBodyChange: (value: string) => void;
}

export interface TypingIndicatorComposerProps {
  typingMessageId: string;
  onTypingMessageIdChange: (value: string) => void;
}

export interface MessageStudioActionsProps {
  destination: string;
  isSending: boolean;
  onSend: () => void;
  submitError: string | null;
}

export interface MessageStudioPreviewPanelProps {
  commonTo: string;
  mode: ComposerMode;
  previewSummary: string;
  selectedMedia: MediaRecord | null;
  selectedTemplateHeaderMedia: MediaRecord | null;
  requestPreview: unknown;
  responsePreview: unknown;
}
