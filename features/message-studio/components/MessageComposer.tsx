import React from "react";
import { Send } from "lucide-react";
import { ComposerMode } from "../message-studio.types";
import { TemplateRecord, MediaRecord } from "../../../lib/api/types";
import { MessageRecipientField } from "./MessageRecipientField";
import { TextMessageComposer } from "./TextMessageComposer";
import { TemplateMessageComposer } from "./TemplateMessageComposer";
import { MediaMessageComposer } from "./MediaMessageComposer";
import { LocationMessageComposer } from "./LocationMessageComposer";
import { ContactMessageComposer } from "./ContactMessageComposer";
import { ButtonMessageComposer } from "./ButtonMessageComposer";
import { ListMessageComposer } from "./ListMessageComposer";
import { ReactionMessageComposer } from "./ReactionMessageComposer";
import { CtaUrlMessageComposer } from "./CtaUrlMessageComposer";
import { LocationRequestComposer } from "./LocationRequestComposer";
import { TypingIndicatorComposer } from "./TypingIndicatorComposer";
import { MessageStudioActions } from "./MessageStudioActions";

const formatPreviewTitle = (mode: ComposerMode) =>
  mode
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export interface MessageComposerProps {
  mode: ComposerMode;
  commonTo: string;
  onCommonToChange: (value: string) => void;
  // Text
  textBody: string;
  onTextBodyChange: (value: string) => void;
  previewUrl: boolean;
  onPreviewUrlChange: (value: boolean) => void;
  // Template
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
  // Media
  filteredMedia: MediaRecord[];
  selectedMediaId: string;
  onMediaIdChange: (id: string) => void;
  mediaCaption: string;
  onMediaCaptionChange: (caption: string) => void;
  // Location
  locationName: string;
  onLocationNameChange: (value: string) => void;
  locationAddress: string;
  onLocationAddressChange: (value: string) => void;
  latitude: string;
  onLatitudeChange: (value: string) => void;
  longitude: string;
  onLongitudeChange: (value: string) => void;
  // Contact
  contactFormattedName: string;
  onContactFormattedNameChange: (value: string) => void;
  contactFirstName: string;
  onContactFirstNameChange: (value: string) => void;
  contactLastName: string;
  onContactLastNameChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
  // Button
  buttonHeader: string;
  onButtonHeaderChange: (value: string) => void;
  buttonBody: string;
  onButtonBodyChange: (value: string) => void;
  buttonFooter: string;
  onButtonFooterChange: (value: string) => void;
  buttonRows: string;
  onButtonRowsChange: (value: string) => void;
  // List
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
  // Reaction
  reactionMessageId: string;
  onReactionMessageIdChange: (value: string) => void;
  reactionEmoji: string;
  onReactionEmojiChange: (value: string) => void;
  // CTA URL
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
  // Location Request
  locationRequestBody: string;
  onLocationRequestBodyChange: (value: string) => void;
  // Typing
  typingMessageId: string;
  onTypingMessageIdChange: (value: string) => void;
  // Actions
  isSending: boolean;
  onSend: () => void;
  submitError: string | null;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  mode,
  commonTo,
  onCommonToChange,
  textBody,
  onTextBodyChange,
  previewUrl,
  onPreviewUrlChange,
  activeTemplates,
  templateName,
  templateLanguage,
  onTemplateSelect,
  selectedTemplate,
  templateBodyVariableValues,
  onBodyVariableChange,
  templateHeaderFormat,
  isUploadingHeaderMedia,
  templateHeaderUploadName,
  onTemplateHeaderUploadNameChange,
  templateHeaderMediaId,
  onTemplateHeaderMediaIdChange,
  filteredTemplateHeaderMedia,
  selectedTemplateHeaderMedia,
  onUploadHeaderMedia,
  templateHeaderUploadMessage,
  templateHeaderUploadError,
  filteredMedia,
  selectedMediaId,
  onMediaIdChange,
  mediaCaption,
  onMediaCaptionChange,
  locationName,
  onLocationNameChange,
  locationAddress,
  onLocationAddressChange,
  latitude,
  onLatitudeChange,
  longitude,
  onLongitudeChange,
  contactFormattedName,
  onContactFormattedNameChange,
  contactFirstName,
  onContactFirstNameChange,
  contactLastName,
  onContactLastNameChange,
  contactPhone,
  onContactPhoneChange,
  buttonHeader,
  onButtonHeaderChange,
  buttonBody,
  onButtonBodyChange,
  buttonFooter,
  onButtonFooterChange,
  buttonRows,
  onButtonRowsChange,
  listHeader,
  onListHeaderChange,
  listBody,
  onListBodyChange,
  listFooter,
  onListFooterChange,
  listButtonText,
  onListButtonTextChange,
  listRows,
  onListRowsChange,
  reactionMessageId,
  onReactionMessageIdChange,
  reactionEmoji,
  onReactionEmojiChange,
  ctaHeader,
  onCtaHeaderChange,
  ctaBody,
  onCtaBodyChange,
  ctaFooter,
  onCtaFooterChange,
  ctaDisplayText,
  onCtaDisplayTextChange,
  ctaUrl,
  onCtaUrlChange,
  locationRequestBody,
  onLocationRequestBodyChange,
  typingMessageId,
  onTypingMessageIdChange,
  isSending,
  onSend,
  submitError,
}) => {
  const renderModeComposer = () => {
    switch (mode) {
      case "text":
        return (
          <TextMessageComposer
            body={textBody}
            onBodyChange={onTextBodyChange}
            onPreviewUrlChange={onPreviewUrlChange}
            previewUrl={previewUrl}
          />
        );
      case "template":
        return (
          <TemplateMessageComposer
            activeTemplates={activeTemplates}
            filteredTemplateHeaderMedia={filteredTemplateHeaderMedia}
            isUploadingHeaderMedia={isUploadingHeaderMedia}
            onBodyVariableChange={onBodyVariableChange}
            onTemplateHeaderMediaIdChange={onTemplateHeaderMediaIdChange}
            onTemplateHeaderUploadNameChange={onTemplateHeaderUploadNameChange}
            onTemplateSelect={onTemplateSelect}
            onUploadHeaderMedia={onUploadHeaderMedia}
            selectedTemplate={selectedTemplate}
            selectedTemplateHeaderMedia={selectedTemplateHeaderMedia}
            templateBodyVariableValues={templateBodyVariableValues}
            templateHeaderFormat={templateHeaderFormat}
            templateHeaderMediaId={templateHeaderMediaId}
            templateHeaderUploadError={templateHeaderUploadError}
            templateHeaderUploadMessage={templateHeaderUploadMessage}
            templateHeaderUploadName={templateHeaderUploadName}
            templateLanguage={templateLanguage}
            templateName={templateName}
          />
        );
      case "image":
      case "video":
      case "audio":
      case "document":
      case "sticker":
        return (
          <MediaMessageComposer
            filteredMedia={filteredMedia}
            mediaCaption={mediaCaption}
            mode={mode}
            onMediaCaptionChange={onMediaCaptionChange}
            onMediaIdChange={onMediaIdChange}
            selectedMediaId={selectedMediaId}
          />
        );
      case "location":
        return (
          <LocationMessageComposer
            latitude={latitude}
            locationAddress={locationAddress}
            locationName={locationName}
            longitude={longitude}
            onLatitudeChange={onLatitudeChange}
            onLocationAddressChange={onLocationAddressChange}
            onLocationNameChange={onLocationNameChange}
            onLongitudeChange={onLongitudeChange}
          />
        );
      case "contact":
        return (
          <ContactMessageComposer
            contactFirstName={contactFirstName}
            contactFormattedName={contactFormattedName}
            contactLastName={contactLastName}
            contactPhone={contactPhone}
            onContactFirstNameChange={onContactFirstNameChange}
            onContactFormattedNameChange={onContactFormattedNameChange}
            onContactLastNameChange={onContactLastNameChange}
            onContactPhoneChange={onContactPhoneChange}
          />
        );
      case "button":
        return (
          <ButtonMessageComposer
            buttonBody={buttonBody}
            buttonFooter={buttonFooter}
            buttonHeader={buttonHeader}
            buttonRows={buttonRows}
            onButtonBodyChange={onButtonBodyChange}
            onButtonFooterChange={onButtonFooterChange}
            onButtonHeaderChange={onButtonHeaderChange}
            onButtonRowsChange={onButtonRowsChange}
          />
        );
      case "list":
        return (
          <ListMessageComposer
            listBody={listBody}
            listButtonText={listButtonText}
            listFooter={listFooter}
            listHeader={listHeader}
            listRows={listRows}
            onListBodyChange={onListBodyChange}
            onListButtonTextChange={onListButtonTextChange}
            onListFooterChange={onListFooterChange}
            onListHeaderChange={onListHeaderChange}
            onListRowsChange={onListRowsChange}
          />
        );
      case "reaction":
        return (
          <ReactionMessageComposer
            onReactionEmojiChange={onReactionEmojiChange}
            onReactionMessageIdChange={onReactionMessageIdChange}
            reactionEmoji={reactionEmoji}
            reactionMessageId={reactionMessageId}
          />
        );
      case "cta_url":
        return (
          <CtaUrlMessageComposer
            ctaBody={ctaBody}
            ctaDisplayText={ctaDisplayText}
            ctaFooter={ctaFooter}
            ctaHeader={ctaHeader}
            ctaUrl={ctaUrl}
            onCtaBodyChange={onCtaBodyChange}
            onCtaDisplayTextChange={onCtaDisplayTextChange}
            onCtaFooterChange={onCtaFooterChange}
            onCtaHeaderChange={onCtaHeaderChange}
            onCtaUrlChange={onCtaUrlChange}
          />
        );
      case "location_request":
        return (
          <LocationRequestComposer
            locationRequestBody={locationRequestBody}
            onLocationRequestBodyChange={onLocationRequestBodyChange}
          />
        );
      case "typing_indicator":
        return (
          <TypingIndicatorComposer
            onTypingMessageIdChange={onTypingMessageIdChange}
            typingMessageId={typingMessageId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="border-b border-[#E4E4E7] bg-white p-4 lg:border-b-0 lg:border-r dark:border-[#292C2F] dark:bg-[#121416]">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <Send className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <h3 className="text-sm font-semibold text-foreground">
          Composer: {formatPreviewTitle(mode)}
        </h3>
      </div>

      <div className="mt-3.5 space-y-3">
        {mode !== "typing_indicator" ? (
          <MessageRecipientField onChange={onCommonToChange} value={commonTo} />
        ) : null}

        {renderModeComposer()}

        <MessageStudioActions
          destination={commonTo}
          isSending={isSending}
          onSend={onSend}
          submitError={submitError}
        />
      </div>
    </section>
  );
};
