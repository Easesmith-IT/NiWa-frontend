import { useMemo } from "react";
import { TemplateRecord, MediaRecord } from "../../../lib/api/types";
import { buildMessageStudioPreview, parseLines, parseListSections } from "../../../lib/message-studio";
import { ComposerMode } from "../message-studio.types";

import { useMessageStudioComposerState } from "./useMessageStudioComposerState";
import { useMessageStudioTemplateState } from "./useMessageStudioTemplateState";
import { useMessageStudioMediaState } from "./useMessageStudioMediaState";
import { useMessageStudioLocationState } from "./useMessageStudioLocationState";
import { useMessageStudioContactState } from "./useMessageStudioContactState";
import { useMessageStudioInteractiveState } from "./useMessageStudioInteractiveState";

export interface UseMessageStudioOrchestrationProps {
  initialMode: ComposerMode;
  initialTemplate: string;
  initialLanguage: string;
  initialMediaId: string;
  activeTemplates: TemplateRecord[];
  mediaList: MediaRecord[];
}

export const useMessageStudioOrchestration = ({
  initialMode,
  initialTemplate,
  initialLanguage,
  initialMediaId,
  activeTemplates,
  mediaList,
}: UseMessageStudioOrchestrationProps) => {
  const composer = useMessageStudioComposerState({ initialMode });
  const template = useMessageStudioTemplateState({
    initialTemplate,
    initialLanguage,
    initialMediaId,
    activeTemplates,
  });
  const media = useMessageStudioMediaState({
    initialMediaId,
    mediaList,
    mode: composer.mode,
    templateHeaderFormat: template.templateHeaderFormat,
    templateHeaderMediaId: template.templateHeaderMediaId,
  });
  const location = useMessageStudioLocationState();
  const contact = useMessageStudioContactState();
  const interactive = useMessageStudioInteractiveState();

  const previewSummary = useMemo(
    () =>
      buildMessageStudioPreview({
        mode: composer.mode,
        textBody: composer.textBody,
        selectedTemplate: template.selectedTemplate,
        templateHeaderFormat: template.templateHeaderFormat,
        selectedMedia: media.selectedMedia,
        selectedTemplateHeaderMedia: media.selectedTemplateHeaderMedia,
        templateBodyVariables: template.templateBodyVariableValues,
        templateHeaderVariables: template.templateHeaderVariableValues,
        templateButtonVariables: template.templateButtonVariables,
        mediaCaption: media.mediaCaption,
        locationName: location.locationName,
        locationAddress: location.locationAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        contactFormattedName: contact.contactFormattedName,
        contactPhone: contact.contactPhone,
        buttonBody: interactive.buttonBody,
        buttonRows: interactive.buttonRows,
        listBody: interactive.listBody,
        listRows: interactive.listRows,
        reactionEmoji: interactive.reactionEmoji,
        ctaBody: interactive.ctaBody,
        ctaDisplayText: interactive.ctaDisplayText,
        ctaUrl: interactive.ctaUrl,
        locationRequestBody: interactive.locationRequestBody,
        typingMessageId: interactive.typingMessageId,
      }),
    [
      composer.mode,
      composer.textBody,
      template.selectedTemplate,
      template.templateHeaderFormat,
      media.selectedMedia,
      media.selectedTemplateHeaderMedia,
      template.templateBodyVariableValues,
      template.templateHeaderVariableValues,
      template.templateButtonVariables,
      media.mediaCaption,
      location.locationName,
      location.locationAddress,
      location.latitude,
      location.longitude,
      contact.contactFormattedName,
      contact.contactPhone,
      interactive.buttonBody,
      interactive.buttonRows,
      interactive.listBody,
      interactive.listRows,
      interactive.reactionEmoji,
      interactive.ctaBody,
      interactive.ctaDisplayText,
      interactive.ctaUrl,
      interactive.locationRequestBody,
      interactive.typingMessageId,
    ],
  );

  const buildPayload = () => {
    let endpoint = "";
    let payload: Record<string, unknown> = {};

    if (composer.mode === "text") {
      endpoint = "/messages/text";
      payload = { to: composer.commonTo, body: composer.textBody, previewUrl: composer.previewUrl };
    } else if (composer.mode === "template") {
      const structuredBodyVariables = template.templateBodyVariableValues.map((value) => value.trim());
      const fallbackBodyVariables = parseLines(template.templateVariables);
      endpoint = "/messages/template";
      payload = {
        to: composer.commonTo,
        templateName: template.templateName,
        languageCode: template.templateLanguage,
        bodyVariables:
          structuredBodyVariables.filter(Boolean).length > 0
            ? structuredBodyVariables
            : fallbackBodyVariables,
        ...(template.templateHeaderVariableValues.filter((value) => value.trim()).length > 0
          ? {
              headerVariables: template.templateHeaderVariableValues.map((value) => value.trim()),
            }
          : {}),
        ...(template.templateHeaderMediaId ? { headerMediaId: template.templateHeaderMediaId } : {}),
        ...(template.templateUrlButtons.length > 0
          ? { buttonVariables: template.templateButtonVariables.map((value) => value.trim()) }
          : {}),
      };
    } else if (["image", "video", "audio", "document", "sticker"].includes(composer.mode)) {
      endpoint = `/messages/${composer.mode}`;
      payload = {
        to: composer.commonTo,
        type: composer.mode,
        mediaId: media.selectedMediaId,
        ...(media.mediaCaption ? { caption: media.mediaCaption } : {}),
        ...(composer.mode === "document" && media.documentFilename ? { filename: media.documentFilename } : {}),
      };
    } else if (composer.mode === "location") {
      endpoint = "/messages/location";
      payload = {
        to: composer.commonTo,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        ...(location.locationName ? { name: location.locationName } : {}),
        ...(location.locationAddress ? { address: location.locationAddress } : {}),
      };
    } else if (composer.mode === "contact") {
      endpoint = "/messages/contact";
      payload = {
        to: composer.commonTo,
        contacts: [
          {
            name: {
              formatted_name: contact.contactFormattedName,
              first_name: contact.contactFirstName,
              ...(contact.contactLastName ? { last_name: contact.contactLastName } : {}),
            },
            phones: [
              {
                phone: contact.contactPhone,
                type: "CELL",
              },
            ],
          },
        ],
      };
    } else if (composer.mode === "button") {
      endpoint = "/messages/button";
      payload = {
        to: composer.commonTo,
        ...(interactive.buttonHeader ? { headerText: interactive.buttonHeader } : {}),
        bodyText: interactive.buttonBody,
        ...(interactive.buttonFooter ? { footerText: interactive.buttonFooter } : {}),
        buttons: parseLines(interactive.buttonRows).slice(0, 3).map((line, index) => {
          const [id, title] = line.split("|").map((part) => part.trim());
          return {
            id: id || `btn-${index + 1}`,
            title: title || id || `Button ${index + 1}`,
          };
        }),
      };
    } else if (composer.mode === "list") {
      endpoint = "/messages/list";
      payload = {
        to: composer.commonTo,
        ...(interactive.listHeader ? { headerText: interactive.listHeader } : {}),
        bodyText: interactive.listBody,
        ...(interactive.listFooter ? { footerText: interactive.listFooter } : {}),
        buttonText: interactive.listButtonText,
        sections: [
          {
            title: "Options",
            rows: parseListSections(interactive.listRows),
          },
        ],
      };
    } else if (composer.mode === "reaction") {
      endpoint = "/messages/reaction";
      payload = {
        to: composer.commonTo,
        messageId: interactive.reactionMessageId,
        emoji: interactive.reactionEmoji,
      };
    } else if (composer.mode === "cta_url") {
      endpoint = "/messages/cta-url";
      payload = {
        to: composer.commonTo,
        ...(interactive.ctaHeader ? { headerText: interactive.ctaHeader } : {}),
        bodyText: interactive.ctaBody,
        ...(interactive.ctaFooter ? { footerText: interactive.ctaFooter } : {}),
        displayText: interactive.ctaDisplayText,
        url: interactive.ctaUrl,
      };
    } else if (composer.mode === "location_request") {
      endpoint = "/messages/location-request";
      payload = {
        to: composer.commonTo,
        bodyText: interactive.locationRequestBody,
      };
    } else {
      endpoint = "/messages/typing-indicator";
      payload = {
        messageId: interactive.typingMessageId,
      };
    }
    return { endpoint, payload };
  };

  return {
    composer,
    template,
    media,
    location,
    contact,
    interactive,
    previewSummary,
    buildPayload,
  };
};
