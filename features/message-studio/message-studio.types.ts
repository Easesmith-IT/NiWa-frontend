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


// Phase 3-D Component Contracts (Prepared)

export interface MessageStudioPreviewProps {
  mode: ComposerMode;
  payload: Record<string, unknown> | null;
  response: unknown;
  error: string | null;
}

export interface ComposerModeProps {
  mode: ComposerMode;
  disabled?: boolean;
}

export interface TemplateSelectorProps {
  activeTemplates: TemplateRecord[]; // Using any[] temporarily, replace with TemplateRecord[] in actual extraction if needed
  selectedTemplateName: string;
  selectedLanguage: string;
  onTemplateSelect: (templateName: string, language: string) => void;
}

export interface MediaSelectorProps {
  media: MediaRecord[];
  selectedMediaId: string;
  onMediaSelect: (mediaId: string) => void;
  allowedTypes?: string[];
}
