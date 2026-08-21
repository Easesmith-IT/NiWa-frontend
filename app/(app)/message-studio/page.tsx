"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import {
  ComposerMode,
  useMessageStudioTemplates,
  useMessageStudioMedia,
  useSendMessageMutation,
  useTemplateHeaderUploadMutation,
  useMessageStudioOrchestration,
  MessageStudioShell,
  MessageComposer,
  MessagePreviewPanel,
} from "../../../features/message-studio";
import { getActiveTemplates } from "../../../lib/templates";

export default function MessageStudioPage() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ComposerMode | null) ?? "text";
  const initialTemplate = searchParams.get("template") ?? "";
  const initialLanguage = searchParams.get("language") ?? "en";
  const initialMediaId = searchParams.get("mediaId") ?? "";

  const templatesQuery = useMessageStudioTemplates();
  const mediaQuery = useMessageStudioMedia();

  const activeTemplates = useMemo(
    () => getActiveTemplates(templatesQuery.data?.templates ?? []),
    [templatesQuery.data],
  );

  const orchestration = useMessageStudioOrchestration({
    initialMode,
    initialTemplate,
    initialLanguage,
    initialMediaId,
    activeTemplates,
    mediaList: mediaQuery.data?.media ?? [],
  });

  const {
    composer: {
      mode,
      setMode,
      commonTo,
      setCommonTo,
      textBody,
      setTextBody,
      previewUrl,
      setPreviewUrl,
      requestPreview,
      setRequestPreview,
      responsePreview,
      setResponsePreview,
      submitError,
      setSubmitError,
    },
    template: {
      templateName,
      setTemplateName,
      templateLanguage,
      setTemplateLanguage,
      templateBodyVariableValues,
      setTemplateBodyVariableValues,
      templateHeaderMediaId,
      setTemplateHeaderMediaId,
      templateHeaderUploadName,
      setTemplateHeaderUploadName,
      templateHeaderUploadMessage,
      setTemplateHeaderUploadMessage,
      templateHeaderUploadError,
      setTemplateHeaderUploadError,
      selectedTemplate,
      templateHeaderFormat,
    },
    media: {
      selectedMediaId,
      setSelectedMediaId,
      mediaCaption,
      setMediaCaption,
      selectedMedia,
      selectedTemplateHeaderMedia,
      filteredTemplateHeaderMedia,
      filteredMedia,
    },
    location: {
      locationName,
      setLocationName,
      locationAddress,
      setLocationAddress,
      latitude,
      setLatitude,
      longitude,
      setLongitude,
    },
    contact: {
      contactFormattedName,
      setContactFormattedName,
      contactFirstName,
      setContactFirstName,
      contactLastName,
      setContactLastName,
      contactPhone,
      setContactPhone,
    },
    interactive: {
      buttonHeader,
      setButtonHeader,
      buttonBody,
      setButtonBody,
      buttonFooter,
      setButtonFooter,
      buttonRows,
      setButtonRows,
      listHeader,
      setListHeader,
      listBody,
      setListBody,
      listFooter,
      setListFooter,
      listButtonText,
      setListButtonText,
      listRows,
      setListRows,
      reactionMessageId,
      setReactionMessageId,
      reactionEmoji,
      setReactionEmoji,
      ctaHeader,
      setCtaHeader,
      ctaBody,
      setCtaBody,
      ctaFooter,
      setCtaFooter,
      ctaDisplayText,
      setCtaDisplayText,
      ctaUrl,
      setCtaUrl,
      locationRequestBody,
      setLocationRequestBody,
      typingMessageId,
      setTypingMessageId,
    },
    previewSummary,
    buildPayload,
  } = orchestration;

  const sendMutation = useSendMessageMutation();
  const templateHeaderUploadMutation = useTemplateHeaderUploadMutation();

  const handleSend = () => {
    const { endpoint, payload } = buildPayload();
    setRequestPreview(payload);

    sendMutation.mutate(
      { endpoint, payload },
      {
        onSuccess: (data) => {
          setSubmitError(null);
          setResponsePreview(data.response);
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? error.response?.data?.message ?? "Message request failed."
              : "Message request failed.";
          setSubmitError(message);
        },
      },
    );
  };

  const handleTemplateHeaderUpload = (customName: string, file: File) => {
    setTemplateHeaderUploadMessage(null);
    setTemplateHeaderUploadError(null);
    templateHeaderUploadMutation.mutate(
      { customName, file },
      {
        onSuccess: (data) => {
          setTemplateHeaderUploadError(null);
          setTemplateHeaderUploadMessage("Uploaded header media successfully.");
          setTemplateHeaderUploadName("");
          setTemplateHeaderMediaId(data.media.metaMediaId);
          mediaQuery.refetch();
        },
        onError: (error) => {
          setTemplateHeaderUploadMessage(null);
          setTemplateHeaderUploadError(
            error instanceof AxiosError
              ? error.response?.data?.message ?? "Header media upload failed."
              : "Header media upload failed.",
          );
        },
      },
    );
  };

  const handleBodyVariableChange = (index: number, value: string) => {
    setTemplateBodyVariableValues((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  return (
    <MessageStudioShell
      composerNode={
        <MessageComposer
          activeTemplates={activeTemplates}
          buttonBody={buttonBody}
          buttonFooter={buttonFooter}
          buttonHeader={buttonHeader}
          buttonRows={buttonRows}
          commonTo={commonTo}
          contactFirstName={contactFirstName}
          contactFormattedName={contactFormattedName}
          contactLastName={contactLastName}
          contactPhone={contactPhone}
          ctaBody={ctaBody}
          ctaDisplayText={ctaDisplayText}
          ctaFooter={ctaFooter}
          ctaHeader={ctaHeader}
          ctaUrl={ctaUrl}
          filteredMedia={filteredMedia}
          filteredTemplateHeaderMedia={filteredTemplateHeaderMedia}
          isSending={sendMutation.isPending}
          isUploadingHeaderMedia={templateHeaderUploadMutation.isPending}
          latitude={latitude}
          listBody={listBody}
          listButtonText={listButtonText}
          listFooter={listFooter}
          listHeader={listHeader}
          listRows={listRows}
          locationAddress={locationAddress}
          locationName={locationName}
          locationRequestBody={locationRequestBody}
          longitude={longitude}
          mediaCaption={mediaCaption}
          mode={mode}
          onBodyVariableChange={handleBodyVariableChange}
          onButtonBodyChange={setButtonBody}
          onButtonFooterChange={setButtonFooter}
          onButtonHeaderChange={setButtonHeader}
          onButtonRowsChange={setButtonRows}
          onCommonToChange={setCommonTo}
          onContactFirstNameChange={setContactFirstName}
          onContactFormattedNameChange={setContactFormattedName}
          onContactLastNameChange={setContactLastName}
          onContactPhoneChange={setContactPhone}
          onCtaBodyChange={setCtaBody}
          onCtaDisplayTextChange={setCtaDisplayText}
          onCtaFooterChange={setCtaFooter}
          onCtaHeaderChange={setCtaHeader}
          onCtaUrlChange={setCtaUrl}
          onLatitudeChange={setLatitude}
          onListBodyChange={setListBody}
          onListButtonTextChange={setListButtonText}
          onListFooterChange={setListFooter}
          onListHeaderChange={setListHeader}
          onListRowsChange={setListRows}
          onLocationAddressChange={setLocationAddress}
          onLocationNameChange={setLocationName}
          onLocationRequestBodyChange={setLocationRequestBody}
          onLongitudeChange={setLongitude}
          onMediaCaptionChange={setMediaCaption}
          onMediaIdChange={setSelectedMediaId}
          onPreviewUrlChange={setPreviewUrl}
          onReactionEmojiChange={setReactionEmoji}
          onReactionMessageIdChange={setReactionMessageId}
          onSend={() => {
            setSubmitError(null);
            handleSend();
          }}
          onTemplateHeaderMediaIdChange={setTemplateHeaderMediaId}
          onTemplateHeaderUploadNameChange={setTemplateHeaderUploadName}
          onTemplateSelect={(name, language) => {
            setTemplateName(name);
            setTemplateLanguage(language);
          }}
          onTextBodyChange={setTextBody}
          onTypingMessageIdChange={setTypingMessageId}
          onUploadHeaderMedia={handleTemplateHeaderUpload}
          previewUrl={previewUrl}
          reactionEmoji={reactionEmoji}
          reactionMessageId={reactionMessageId}
          selectedMediaId={selectedMediaId}
          selectedTemplate={selectedTemplate}
          selectedTemplateHeaderMedia={selectedTemplateHeaderMedia}
          submitError={submitError}
          templateBodyVariableValues={templateBodyVariableValues}
          templateHeaderFormat={templateHeaderFormat}
          templateHeaderMediaId={templateHeaderMediaId}
          templateHeaderUploadError={templateHeaderUploadError}
          templateHeaderUploadMessage={templateHeaderUploadMessage}
          templateHeaderUploadName={templateHeaderUploadName}
          templateLanguage={templateLanguage}
          templateName={templateName}
          textBody={textBody}
          typingMessageId={typingMessageId}
        />
      }
      mode={mode}
      onModeSelect={(newMode) => {
        setMode(newMode);
        setSubmitError(null);
      }}
      previewNode={
        <MessagePreviewPanel
          commonTo={commonTo}
          mode={mode}
          previewSummary={previewSummary}
          requestPreview={requestPreview}
          responsePreview={responsePreview}
          selectedMedia={selectedMedia}
          selectedTemplateHeaderMedia={selectedTemplateHeaderMedia}
        />
      }
    />
  );
}
