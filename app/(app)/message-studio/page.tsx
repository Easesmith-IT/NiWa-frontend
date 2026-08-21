"use client";

import { AxiosError } from "axios";
import {
  CheckCircle2,
  LayoutTemplate,
  MessageSquareText,
  Paperclip,
  Send,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMessageStudioTemplates, useMessageStudioMedia, useSendMessageMutation, useTemplateHeaderUploadMutation, ComposerMode, useMessageStudioOrchestration } from "../../../features/message-studio";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { getMediaDisplayName } from "../../../lib/media";
import {
  buildTemplateOptionValue,
  findTemplateByOptionValue,
  getActiveTemplates,
} from "../../../lib/templates";
import {
  MediaListResponse,
  MediaRecord,
  MediaUploadResponse,
  OutboundMessageResponse,
  TemplateRecord,
  TemplatesResponse,
} from "../../../lib/api/types";
import {
  buildMessageStudioPreview,
  getTemplateUrlButtons,
  parseLines,
  parseListSections,
} from "../../../lib/message-studio";


const messageModes: Array<{ key: ComposerMode; label: string }> = [
  { key: "text", label: "Text" },
  { key: "template", label: "Template" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "document", label: "Document" },
  { key: "sticker", label: "Sticker" },
  { key: "contact", label: "Contact" },
  { key: "location", label: "Location" },
  { key: "button", label: "Buttons" },
  { key: "list", label: "List" },
  { key: "reaction", label: "Reaction" },
  { key: "cta_url", label: "CTA URL" },
  { key: "location_request", label: "Location Request" },
  { key: "typing_indicator", label: "Typing Indicator" },
];

const formatPreviewTitle = (mode: ComposerMode) =>
  mode
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getBodyVariableKeys = (template?: TemplateRecord | null) =>
  template?.bodyVariables?.length ? template.bodyVariables : template?.variables ?? [];

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

  const {
    composer: {
      mode, setMode, commonTo, setCommonTo, textBody, setTextBody, previewUrl, setPreviewUrl,
      requestPreview, setRequestPreview, responsePreview, setResponsePreview, submitError, setSubmitError,
    },
    template: {
      templateName, setTemplateName, templateLanguage, setTemplateLanguage, templateVariables, setTemplateVariables,
      templateBodyVariableValues, setTemplateBodyVariableValues, templateHeaderVariableValues, setTemplateHeaderVariableValues,
      templateHeaderMediaId, setTemplateHeaderMediaId, templateButtonVariables, setTemplateButtonVariables,
      templateHeaderUploadName, setTemplateHeaderUploadName, templateHeaderUploadMessage, setTemplateHeaderUploadMessage,
      templateHeaderUploadError, setTemplateHeaderUploadError, selectedTemplate, templateHeaderFormat, templateUrlButtons, templateHeaderMediaAccept,
    },
    media: {
      selectedMediaId, setSelectedMediaId, mediaCaption, setMediaCaption, documentFilename, setDocumentFilename,
      selectedMedia, selectedTemplateHeaderMedia, filteredTemplateHeaderMedia, filteredMedia,
    },
    location: {
      locationName, setLocationName, locationAddress, setLocationAddress, latitude, setLatitude, longitude, setLongitude,
    },
    contact: {
      contactFormattedName, setContactFormattedName, contactFirstName, setContactFirstName, contactLastName, setContactLastName, contactPhone, setContactPhone,
    },
    interactive: {
      buttonHeader, setButtonHeader, buttonBody, setButtonBody, buttonFooter, setButtonFooter, buttonRows, setButtonRows,
      listHeader, setListHeader, listBody, setListBody, listFooter, setListFooter, listButtonText, setListButtonText, listRows, setListRows,
      reactionMessageId, setReactionMessageId, reactionEmoji, setReactionEmoji, ctaHeader, setCtaHeader, ctaBody, setCtaBody, ctaFooter, setCtaFooter,
      ctaDisplayText, setCtaDisplayText, ctaUrl, setCtaUrl, locationRequestBody, setLocationRequestBody, typingMessageId, setTypingMessageId,
    },
    previewSummary,
    buildPayload,
  } = useMessageStudioOrchestration({
    initialMode: initialMode,
    initialTemplate: initialTemplate,
    initialLanguage: initialLanguage,
    initialMediaId: initialMediaId,
    activeTemplates,
    mediaList: mediaQuery.data?.media ?? [],
  });



  const sendMutation = useSendMessageMutation();

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
      }
    );
  };

  const templateHeaderUploadMutation = useTemplateHeaderUploadMutation();

  const handleTemplateHeaderUpload = (customName: string, file: File) => {
    setTemplateHeaderUploadMessage(null);
    setTemplateHeaderUploadError(null);
    templateHeaderUploadMutation.mutate(
      { customName, file },
      {
        onSuccess: (data) => {
          setTemplateHeaderUploadError(null);
          setTemplateHeaderUploadMessage(`Uploaded ${getMediaDisplayName(data.media)} successfully.`);
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
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Message Studio & Dispatch Workbench
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Compose, validate, preview, and send Meta Cloud API message payloads (Templates, Text, Interactive, Media).
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#F0F0F2] pt-3 dark:border-[#202326]">
          {messageModes.map((item) => (
            <button
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                item.key === mode
                  ? "bg-[#176B4D] text-white dark:bg-[#2D8A67]"
                  : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground hover:bg-[#F4F4F5] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:bg-[#202326]"
              }`}
              key={item.key}
              onClick={() => {
                setMode(item.key);
                setSubmitError(null);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="border-b border-[#E4E4E7] bg-white p-4 lg:border-b-0 lg:border-r dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
                <Send className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                <h3 className="text-sm font-semibold text-foreground">
                  Composer: {formatPreviewTitle(mode)}
                </h3>
              </div>

              <div className="mt-3.5 space-y-3">
                {mode !== "typing_indicator" ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Recipient Number *</label>
                    <Input
                      className="font-mono text-xs"
                      onChange={(event) => setCommonTo(event.target.value)}
                      placeholder="e.g. +919876543210"
                      value={commonTo}
                    />
                  </div>
                ) : null}

                {mode === "text" ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Message Body *</label>
                      <Textarea
                        className="min-h-28 text-xs"
                        onChange={(event) => setTextBody(event.target.value)}
                        placeholder="Enter text message content..."
                        value={textBody}
                      />
                    </div>
                    <label className="flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs text-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
                      <input
                        checked={previewUrl}
                        onChange={(event) => setPreviewUrl(event.target.checked)}
                        type="checkbox"
                      />
                      Enable URL preview link cards
                    </label>
                  </>
                ) : null}

                {mode === "template" ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Select Active Template *</label>
                      <select
                        className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
                        onChange={(event) => {
                          const nextTemplate = findTemplateByOptionValue(activeTemplates, event.target.value);
                          setTemplateName(nextTemplate?.name ?? "");
                          setTemplateLanguage(nextTemplate?.language ?? "");
                        }}
                        value={templateName ? `${templateName}::${templateLanguage}` : ""}
                      >
                        <option value="">
                          {activeTemplates.length > 0
                            ? "Select approved Meta template"
                            : "No active templates available"}
                        </option>
                        {activeTemplates.map((template) => (
                          <option
                            key={template._id}
                            value={buildTemplateOptionValue(template)}
                          >
                            {template.name} ({template.language})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTemplate ? (
                      <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs space-y-1.5 dark:border-[#292C2F] dark:bg-[#17191B]">
                        <p className="font-semibold text-foreground">{selectedTemplate.name}</p>
                        <p className="text-muted-foreground">
                          Status: <span className="font-semibold text-[#16803C] dark:text-[#3FA66F]">{selectedTemplate.status}</span> • Lang: {selectedTemplate.language}
                        </p>
                        {selectedTemplate.bodyText ? (
                          <p className="text-foreground">{selectedTemplate.bodyText}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {getBodyVariableKeys(selectedTemplate).length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-foreground">Body Variables</label>
                        {getBodyVariableKeys(selectedTemplate).map((variable, index) => (
                          <Input
                            key={`${variable}-${index}`}
                            onChange={(event) =>
                              setTemplateBodyVariableValues((current) => {
                                const next = [...current];
                                next[index] = event.target.value;
                                return next;
                              })
                            }
                            placeholder={`Variable {{${index + 1}}}: ${variable}`}
                            value={templateBodyVariableValues[index] ?? ""}
                          />
                        ))}
                      </div>
                    ) : null}

                    {templateHeaderFormat ? (
                      <div className="space-y-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <label className="block text-xs font-medium text-foreground">
                              Header {templateHeaderFormat.toLowerCase()} media
                            </label>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              This template requires stored {templateHeaderFormat.toLowerCase()} media before send.
                            </p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center rounded-md bg-[#176B4D] px-2.5 py-1.5 text-[11px] font-medium text-white dark:bg-[#2D8A67]">
                            {templateHeaderUploadMutation.isPending ? "Uploading..." : `Upload ${templateHeaderFormat.toLowerCase()}`}
                            <input
                              accept={templateHeaderMediaAccept}
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) {
                                  return;
                                }
                                handleTemplateHeaderUpload(templateHeaderUploadName, file);
                                event.currentTarget.value = "";
                              }}
                              type="file"
                            />
                          </label>
                        </div>

                        <Input
                          className="text-xs"
                          onChange={(event) => setTemplateHeaderUploadName(event.target.value)}
                          placeholder="Optional custom name for next header upload"
                          value={templateHeaderUploadName}
                        />

                        <select
                          className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
                          onChange={(event) => setTemplateHeaderMediaId(event.target.value)}
                          value={templateHeaderMediaId}
                        >
                          <option value="">Select stored {templateHeaderFormat.toLowerCase()} media</option>
                          {filteredTemplateHeaderMedia.map((media) => (
                            <option key={media._id} value={media.metaMediaId}>
                              {getMediaDisplayName(media)} ({media.mediaType})
                            </option>
                          ))}
                        </select>

                        {selectedTemplateHeaderMedia ? (
                          <div className="rounded-md border border-[#E4E4E7] bg-white p-2 text-[11px] text-foreground dark:border-[#282C2F] dark:bg-[#1C1F21]">
                            Selected: <span className="font-medium">{getMediaDisplayName(selectedTemplateHeaderMedia)}</span>
                          </div>
                        ) : null}

                        {filteredTemplateHeaderMedia.length === 0 ? (
                          <p className="text-[11px] font-medium text-[#C2413A] dark:text-[#D7685C]">
                            No stored {templateHeaderFormat.toLowerCase()} media available yet. Upload one here or from Media.
                          </p>
                        ) : null}

                        {templateHeaderUploadMessage ? (
                          <p className="text-[11px] font-medium text-[#16803C] dark:text-[#3FA66F]">
                            {templateHeaderUploadMessage}
                          </p>
                        ) : null}

                        {templateHeaderUploadError ? (
                          <p className="text-[11px] font-medium text-[#C2413A] dark:text-[#D7685C]">
                            {templateHeaderUploadError}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}

                {["image", "video", "audio", "document", "sticker"].includes(mode) ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Stored Media Asset *</label>
                      <select
                        className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
                        onChange={(event) => setSelectedMediaId(event.target.value)}
                        value={selectedMediaId}
                      >
                        <option value="">Select stored media asset</option>
                        {filteredMedia.map((media) => (
                          <option key={media._id} value={media.metaMediaId}>
                            {getMediaDisplayName(media)} ({media.mediaType})
                          </option>
                        ))}
                      </select>
                    </div>
                    {["image", "video", "document"].includes(mode) ? (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Media Caption</label>
                        <Textarea
                          className="min-h-16 text-xs"
                          onChange={(event) => setMediaCaption(event.target.value)}
                          placeholder="Optional media caption..."
                          value={mediaCaption}
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 pt-3 mt-3 dark:border-[#292C2F] dark:bg-[#17191B]">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Dispatch Destination</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {commonTo || "No target number set"}
                    </p>
                  </div>
                  <Button
                    disabled={sendMutation.isPending}
                    onClick={() => {
                      setSubmitError(null);
                      handleSend();
                    }}
                    type="button"
                    variant="primary"
                  >
                    {sendMutation.isPending ? "Dispatching..." : "Send Message"}
                  </Button>
                </div>
                {submitError ? <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{submitError}</p> : null}
              </div>
            </section>

            <section className="bg-[#FAFAFA] p-4 border-t lg:border-t-0 border-[#E4E4E7] dark:border-[#292C2F] dark:bg-[#17191B]">
              <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                  <p className="text-xs font-semibold text-foreground">
                    Device Preview & Telemetry
                  </p>
                </div>
                {responsePreview ? (
                  <span className="inline-flex items-center rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-[10px] font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Sent 200 OK
                  </span>
                ) : null}
              </div>

              <div
                className="mx-auto mt-4 max-w-[280px] rounded-xl border border-[#E4E4E7] p-3 shadow-subtle bg-repeat bg-center dark:border-[#292C2F]"
                style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "300px" }}
              >
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-2.5 dark:border-[#282C2F] dark:bg-[#1C1F21]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">WhatsApp Business</p>
                  <p className="font-mono text-xs font-semibold text-foreground">{commonTo || "+91..."}</p>
                </div>

                <div className="mt-3 min-h-[160px] rounded-lg bg-[#EDF8F3] p-3 border border-[#C4E8DA] dark:border-[#203D31] dark:bg-[#14251E]">
                  <p className="whitespace-pre-wrap text-xs text-foreground leading-relaxed dark:text-[#E8F3EE]">{previewSummary}</p>
                  {mode !== "template" && selectedMedia ? (
                    <div className="mt-2 rounded bg-white p-2 text-[11px] border border-[#E4E4E7] dark:border-[#282C2F] dark:bg-[#1C1F21]">
                      <span className="font-mono font-medium">{getMediaDisplayName(selectedMedia)}</span>
                    </div>
                  ) : null}
                  {mode === "template" && selectedTemplateHeaderMedia ? (
                    <div className="mt-2 rounded bg-white p-2 text-[11px] border border-[#E4E4E7] dark:border-[#282C2F] dark:bg-[#1C1F21]">
                      <span className="font-mono font-medium">
                        Header media: {getMediaDisplayName(selectedTemplateHeaderMedia)}
                      </span>
                    </div>
                  ) : null}
                  <p className="mt-2 text-right text-[9px] text-[#34B7F1] dark:text-[#53BDEB] font-semibold">12:00 PM ✓✓</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Request JSON Payload</p>
                  <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
                    {JSON.stringify(requestPreview, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Meta Graph API Response</p>
                  <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
                    {JSON.stringify(responsePreview, null, 2)}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

