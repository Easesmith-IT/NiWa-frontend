import { MediaRecord, TemplateRecord } from "./api/types";

export const parseLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

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
          selectedTemplate.variables.length
            ? `Variables: ${selectedTemplate.variables.join(", ")}`
            : "No variables",
          templateHeaderFormat
            ? `Header: ${templateHeaderFormat}${selectedTemplateHeaderMedia ? ` | ${selectedTemplateHeaderMedia.fileName}` : ""}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "Select a template to preview.";
  }
  if (["image", "video", "audio", "document", "sticker"].includes(mode)) {
    return selectedMedia
      ? `${selectedMedia.fileName}\n${selectedMedia.mediaType} | ${selectedMedia.mimeType}\n${
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
