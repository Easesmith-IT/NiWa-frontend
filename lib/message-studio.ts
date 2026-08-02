import { MediaRecord, TemplateRecord } from "./api/types";
import { getMediaDisplayName } from "./media";

export interface TemplateUrlButtonConfig {
  index: number;
  text: string;
  url: string;
  requiresParameter: boolean;
}

export const parseLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export const getTemplateUrlButtons = (template?: TemplateRecord | null): TemplateUrlButtonConfig[] =>
  (template?.urlButtons ?? [])
    .map((button, index) => ({
      index: button.index ?? index,
      text: button.text?.trim() || `Button ${index + 1}`,
      url: button.url?.trim() || "",
      requiresParameter: Boolean(button.dynamic),
    }))
    .filter((button) => button.requiresParameter);

const formatVariableValues = (label: string, keys: string[], values: string[]) => {
  const rows = keys
    .map((key, index) => `${key}: ${values[index]?.trim() || "-"}`)
    .filter(Boolean);

  return rows.length ? `${label}: ${rows.join(", ")}` : null;
};

const getBodyVariableKeys = (template?: TemplateRecord | null) =>
  template?.bodyVariables?.length ? template.bodyVariables : template?.variables ?? [];

const getHeaderVariableKeys = (template?: TemplateRecord | null) => template?.headerVariables ?? [];

export const parseListSections = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      return {
        id: parts[0] || `row-${index + 1}`,
        title: parts[1] || parts[0] || `Option ${index + 1}`,
        description: parts[2] || undefined,
      };
    });

export const buildMessageStudioPreview = (params: {
  mode: string;
  textBody?: string;
  selectedTemplate?: TemplateRecord | null;
  templateHeaderFormat?: string;
  selectedMedia?: MediaRecord | null;
  selectedTemplateHeaderMedia?: MediaRecord | null;
  templateBodyVariables?: string[];
  templateHeaderVariables?: string[];
  templateButtonVariables?: string[];
  mediaCaption?: string;
  locationName?: string;
  locationAddress?: string;
  latitude?: string;
  longitude?: string;
  contactFormattedName?: string;
  contactPhone?: string;
  buttonBody?: string;
  buttonRows?: string;
  listBody?: string;
  listRows?: string;
  reactionEmoji?: string;
  ctaBody?: string;
  ctaDisplayText?: string;
  ctaUrl?: string;
  locationRequestBody?: string;
  typingMessageId?: string;
}) => {
  const {
    mode,
    textBody,
    selectedTemplate,
    templateHeaderFormat,
    selectedMedia,
    selectedTemplateHeaderMedia,
    templateBodyVariables,
    templateHeaderVariables,
    templateButtonVariables,
    mediaCaption,
    locationName,
    locationAddress,
    latitude,
    longitude,
    contactFormattedName,
    contactPhone,
    buttonBody,
    buttonRows,
    listBody,
    listRows,
    reactionEmoji,
    ctaBody,
    ctaDisplayText,
    ctaUrl,
    locationRequestBody,
    typingMessageId,
  } = params;

  if (mode === "text") {
    return textBody || "No text entered yet.";
  }
  if (mode === "template") {
    return selectedTemplate
      ? [
          `${selectedTemplate.name} (${selectedTemplate.language})`,
          selectedTemplate.bodyText ? `Body: ${selectedTemplate.bodyText}` : null,
          selectedTemplate.headerText ? `Header text: ${selectedTemplate.headerText}` : null,
          selectedTemplate.footerText ? `Footer: ${selectedTemplate.footerText}` : null,
          formatVariableValues(
            "Body vars",
            getBodyVariableKeys(selectedTemplate),
            templateBodyVariables ?? [],
          ) ??
            (getBodyVariableKeys(selectedTemplate).length ? "Body vars pending" : "No body variables"),
          formatVariableValues(
            "Header vars",
            getHeaderVariableKeys(selectedTemplate),
            templateHeaderVariables ?? [],
          ),
          templateHeaderFormat
            ? `Header: ${templateHeaderFormat}${selectedTemplateHeaderMedia ? ` | ${getMediaDisplayName(selectedTemplateHeaderMedia)}` : ""}`
            : null,
          templateButtonVariables?.length
            ? `Button params: ${templateButtonVariables
                .map((value, index) => `#${index + 1} ${value}`)
                .join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "Select a template to preview.";
  }
  if (["image", "video", "audio", "document", "sticker"].includes(mode)) {
    return selectedMedia
      ? `${getMediaDisplayName(selectedMedia)}\n${selectedMedia.mediaType} | ${selectedMedia.mimeType}\n${
          mediaCaption || "No caption"
        }`
      : "Select stored media.";
  }
  if (mode === "location") {
    return [locationName || "Location", locationAddress, latitude && longitude ? `${latitude}, ${longitude}` : ""]
      .filter(Boolean)
      .join("\n");
  }
  if (mode === "contact") {
    return [contactFormattedName || "Contact", contactPhone].filter(Boolean).join("\n");
  }
  if (mode === "button") {
    return [buttonBody, ...parseLines(buttonRows || "")].filter(Boolean).join("\n");
  }
  if (mode === "list") {
    return [listBody, ...parseListSections(listRows || "").map((row) => row.title)]
      .filter(Boolean)
      .join("\n");
  }
  if (mode === "reaction") {
    return reactionEmoji ? `Reaction: ${reactionEmoji}` : "Enter an emoji reaction.";
  }
  if (mode === "cta_url") {
    return [ctaBody, ctaDisplayText ? `Button: ${ctaDisplayText}` : "", ctaUrl]
      .filter(Boolean)
      .join("\n");
  }
  if (mode === "location_request") {
    return locationRequestBody || "Enter the location request body.";
  }

  return typingMessageId
    ? `Typing indicator for ${typingMessageId}`
    : "Enter an incoming message ID.";
};
