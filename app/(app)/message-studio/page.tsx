"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { apiClient } from "../../../lib/api/client";
import {
  MediaListResponse,
  MediaRecord,
  OutboundMessageResponse,
  TemplateRecord,
  TemplatesResponse,
} from "../../../lib/api/types";
import {
  buildMessageStudioPreview,
  parseLines,
  parseListSections,
} from "../../../lib/message-studio";

type ComposerMode =
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

const messageModes: Array<{ key: ComposerMode; label: string; tone: string }> = [
  { key: "text", label: "Text", tone: "bg-[#16302b] text-[#f8f1de]" },
  { key: "template", label: "Template", tone: "bg-[#efe3c8] text-[#6f5024]" },
  { key: "image", label: "Image", tone: "bg-[#e6f1ec] text-[#1f5942]" },
  { key: "video", label: "Video", tone: "bg-[#e6f1ec] text-[#1f5942]" },
  { key: "audio", label: "Audio", tone: "bg-[#e6f1ec] text-[#1f5942]" },
  { key: "document", label: "Document", tone: "bg-[#e6f1ec] text-[#1f5942]" },
  { key: "sticker", label: "Sticker", tone: "bg-[#e6f1ec] text-[#1f5942]" },
  { key: "contact", label: "Contact", tone: "bg-[#f1ebff] text-[#5e4287]" },
  { key: "location", label: "Location", tone: "bg-[#fce9db] text-[#8b5220]" },
  { key: "button", label: "Buttons", tone: "bg-[#f8f0de] text-[#755524]" },
  { key: "list", label: "List", tone: "bg-[#f8f0de] text-[#755524]" },
  { key: "reaction", label: "Reaction", tone: "bg-[#fff0da] text-[#8b5b1d]" },
  { key: "cta_url", label: "CTA URL", tone: "bg-[#fff0da] text-[#8b5b1d]" },
  { key: "location_request", label: "Location Request", tone: "bg-[#f1ebff] text-[#5e4287]" },
  { key: "typing_indicator", label: "Typing Indicator", tone: "bg-[#edf1f7] text-[#42597c]" },
];

const formatPreviewTitle = (mode: ComposerMode) =>
  mode
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function MessageStudioPage() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ComposerMode | null) ?? "text";
  const initialTemplate = searchParams.get("template") ?? "";
  const initialLanguage = searchParams.get("language") ?? "en";
  const initialMediaId = searchParams.get("mediaId") ?? "";

  const [mode, setMode] = useState<ComposerMode>(initialMode);
  const [requestPreview, setRequestPreview] = useState<unknown>(null);
  const [responsePreview, setResponsePreview] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [commonTo, setCommonTo] = useState("");
  const [textBody, setTextBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(false);

  const [templateName, setTemplateName] = useState(initialTemplate);
  const [templateLanguage, setTemplateLanguage] = useState(initialLanguage);
  const [templateVariables, setTemplateVariables] = useState("");

  const [selectedMediaId, setSelectedMediaId] = useState(initialMediaId);
  const [mediaCaption, setMediaCaption] = useState("");
  const [documentFilename, setDocumentFilename] = useState("");

  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [contactFormattedName, setContactFormattedName] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [buttonHeader, setButtonHeader] = useState("");
  const [buttonBody, setButtonBody] = useState("");
  const [buttonFooter, setButtonFooter] = useState("");
  const [buttonRows, setButtonRows] = useState("");

  const [listHeader, setListHeader] = useState("");
  const [listBody, setListBody] = useState("");
  const [listFooter, setListFooter] = useState("");
  const [listButtonText, setListButtonText] = useState("");
  const [listRows, setListRows] = useState("");

  const [reactionMessageId, setReactionMessageId] = useState("");
  const [reactionEmoji, setReactionEmoji] = useState("");

  const [ctaHeader, setCtaHeader] = useState("");
  const [ctaBody, setCtaBody] = useState("");
  const [ctaFooter, setCtaFooter] = useState("");
  const [ctaDisplayText, setCtaDisplayText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [locationRequestBody, setLocationRequestBody] = useState("");
  const [typingMessageId, setTypingMessageId] = useState("");

  const templatesQuery = useQuery({
    queryKey: ["templates", "message-studio"],
    queryFn: async () => {
      const response = await apiClient.get<TemplatesResponse>("/templates");
      return response.data;
    },
  });

  const mediaQuery = useQuery({
    queryKey: ["media", "message-studio"],
    queryFn: async () => {
      const response = await apiClient.get<MediaListResponse>("/media");
      return response.data;
    },
  });

  const selectedTemplate = useMemo(
    () => {
      const templates = templatesQuery.data?.templates ?? [];

      return (
        templates.find(
          (template: TemplateRecord) =>
            template.name === templateName && template.language === templateLanguage,
        ) ??
        templates.find((template: TemplateRecord) => template.name === templateName) ??
        null
      );
    },
    [templateLanguage, templateName, templatesQuery.data],
  );

  const selectedMedia = useMemo(
    () =>
      (mediaQuery.data?.media ?? []).find(
        (media: MediaRecord) => media.metaMediaId === selectedMediaId,
      ) ?? null,
    [selectedMediaId, mediaQuery.data],
  );

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.language !== templateLanguage) {
      setTemplateLanguage(selectedTemplate.language);
    }
  }, [selectedTemplate, templateLanguage]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      if (mode === "text") {
        endpoint = "/messages/text";
        payload = { to: commonTo, body: textBody, previewUrl };
      } else if (mode === "template") {
        endpoint = "/messages/template";
        payload = {
          to: commonTo,
          templateName,
          languageCode: templateLanguage,
          bodyVariables: parseLines(templateVariables),
        };
      } else if (["image", "video", "audio", "document", "sticker"].includes(mode)) {
        endpoint = `/messages/${mode}`;
        payload = {
          to: commonTo,
          type: mode,
          mediaId: selectedMediaId,
          ...(mediaCaption ? { caption: mediaCaption } : {}),
          ...(mode === "document" && documentFilename ? { filename: documentFilename } : {}),
        };
      } else if (mode === "location") {
        endpoint = "/messages/location";
        payload = {
          to: commonTo,
          latitude: Number(latitude),
          longitude: Number(longitude),
          ...(locationName ? { name: locationName } : {}),
          ...(locationAddress ? { address: locationAddress } : {}),
        };
      } else if (mode === "contact") {
        endpoint = "/messages/contact";
        payload = {
          to: commonTo,
          contacts: [
            {
              name: {
                formatted_name: contactFormattedName,
                first_name: contactFirstName,
                ...(contactLastName ? { last_name: contactLastName } : {}),
              },
              phones: [
                {
                  phone: contactPhone,
                  type: "CELL",
                },
              ],
            },
          ],
        };
      } else if (mode === "button") {
        endpoint = "/messages/button";
        payload = {
          to: commonTo,
          ...(buttonHeader ? { headerText: buttonHeader } : {}),
          bodyText: buttonBody,
          ...(buttonFooter ? { footerText: buttonFooter } : {}),
          buttons: parseLines(buttonRows).slice(0, 3).map((line, index) => {
            const [id, title] = line.split("|").map((part) => part.trim());
            return {
              id: id || `btn-${index + 1}`,
              title: title || id || `Button ${index + 1}`,
            };
          }),
        };
      } else if (mode === "list") {
        endpoint = "/messages/list";
        payload = {
          to: commonTo,
          ...(listHeader ? { headerText: listHeader } : {}),
          bodyText: listBody,
          ...(listFooter ? { footerText: listFooter } : {}),
          buttonText: listButtonText,
          sections: [
            {
              title: "Options",
              rows: parseListSections(listRows),
            },
          ],
        };
      } else if (mode === "reaction") {
        endpoint = "/messages/reaction";
        payload = {
          to: commonTo,
          messageId: reactionMessageId,
          emoji: reactionEmoji,
        };
      } else if (mode === "cta_url") {
        endpoint = "/messages/cta-url";
        payload = {
          to: commonTo,
          ...(ctaHeader ? { headerText: ctaHeader } : {}),
          bodyText: ctaBody,
          ...(ctaFooter ? { footerText: ctaFooter } : {}),
          displayText: ctaDisplayText,
          url: ctaUrl,
        };
      } else if (mode === "location_request") {
        endpoint = "/messages/location-request";
        payload = {
          to: commonTo,
          bodyText: locationRequestBody,
        };
      } else {
        endpoint = "/messages/typing-indicator";
        payload = {
          messageId: typingMessageId,
        };
      }

      setRequestPreview(payload);
      const response = await apiClient.post<OutboundMessageResponse>(endpoint, payload);
      return response.data;
    },
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
  });

  const filteredMedia = useMemo(() => {
    const allMedia = mediaQuery.data?.media ?? [];
    if (["image", "video", "audio", "document", "sticker"].includes(mode)) {
      return allMedia.filter((item) => item.mediaType === mode);
    }
    return allMedia;
  }, [mediaQuery.data, mode]);

  const previewSummary = useMemo(
    () =>
      buildMessageStudioPreview({
        mode,
        textBody,
        selectedTemplate,
        selectedMedia,
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
      }),
    [
      mode,
      textBody,
      selectedTemplate,
      selectedMedia,
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
    ],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(250,244,230,0.92))] p-5 shadow-[0_18px_50px_rgba(44,56,38,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Message Studio
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Compose and Send</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The studio is now organized around a WhatsApp-like device preview, with the actual
              API form beside it instead of a raw developer-only layout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {messageModes.map((item) => (
              <button
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  item.key === mode
                    ? item.tone
                    : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground"
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
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="border-b border-border bg-[rgba(255,255,255,0.75)] p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16302b] text-[#f8f1de]">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Active composer
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{formatPreviewTitle(mode)}</h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {mode !== "typing_indicator" ? (
                  <Input
                    className="rounded-[20px] bg-[#faf7f1]"
                    onChange={(event) => setCommonTo(event.target.value)}
                    placeholder="Recipient phone number with country code"
                    value={commonTo}
                  />
                ) : null}

                {mode === "text" ? (
                  <>
                    <Textarea
                      className="min-h-28 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setTextBody(event.target.value)}
                      placeholder="Message body"
                      value={textBody}
                    />
                    <label className="flex items-center gap-3 rounded-[20px] bg-[#f8f1de] px-4 py-3 text-sm text-foreground">
                      <input
                        checked={previewUrl}
                        onChange={(event) => setPreviewUrl(event.target.checked)}
                        type="checkbox"
                      />
                      Enable URL previews
                    </label>
                  </>
                ) : null}

                {mode === "template" ? (
                  <>
                    <select
                      className="flex h-12 w-full rounded-[20px] border border-input bg-[#faf7f1] px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                      onChange={(event) => setTemplateName(event.target.value)}
                      value={templateName}
                    >
                      <option value="">Select synced template</option>
                      {(templatesQuery.data?.templates ?? []).map((template) => (
                        <option key={template._id} value={template.name}>
                          {template.name} ({template.language})
                        </option>
                      ))}
                    </select>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setTemplateLanguage(event.target.value)}
                      placeholder="Language code"
                      value={templateLanguage}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setTemplateVariables(event.target.value)}
                      placeholder="Body variables, one per line"
                      value={templateVariables}
                    />
                    {selectedTemplate ? (
                      <div className="rounded-[24px] border border-[#eadbbf] bg-[#fff8ea] p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <LayoutTemplate className="h-4 w-4" />
                          Template details
                        </div>
                        <p className="mt-3 text-sm font-medium text-foreground">
                          {selectedTemplate.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedTemplate.status} | {selectedTemplate.language}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {["image", "video", "audio", "document", "sticker"].includes(mode) ? (
                  <>
                    <select
                      className="flex h-12 w-full rounded-[20px] border border-input bg-[#faf7f1] px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                      onChange={(event) => setSelectedMediaId(event.target.value)}
                      value={selectedMediaId}
                    >
                      <option value="">Select stored media</option>
                      {filteredMedia.map((media) => (
                        <option key={media._id} value={media.metaMediaId}>
                          {media.fileName} ({media.mediaType})
                        </option>
                      ))}
                    </select>
                    {["image", "video", "document"].includes(mode) ? (
                      <Textarea
                        className="min-h-20 rounded-[26px] bg-[#faf7f1]"
                        onChange={(event) => setMediaCaption(event.target.value)}
                        placeholder="Optional caption"
                        value={mediaCaption}
                      />
                    ) : null}
                    {mode === "document" ? (
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setDocumentFilename(event.target.value)}
                        placeholder="Optional filename override"
                        value={documentFilename}
                      />
                    ) : null}
                  </>
                ) : null}

                {mode === "location" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setLatitude(event.target.value)}
                        placeholder="Latitude"
                        value={latitude}
                      />
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setLongitude(event.target.value)}
                        placeholder="Longitude"
                        value={longitude}
                      />
                    </div>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setLocationName(event.target.value)}
                      placeholder="Optional location name"
                      value={locationName}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setLocationAddress(event.target.value)}
                      placeholder="Optional address"
                      value={locationAddress}
                    />
                  </>
                ) : null}

                {mode === "contact" ? (
                  <>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setContactFormattedName(event.target.value)}
                      placeholder="Formatted contact name"
                      value={contactFormattedName}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setContactFirstName(event.target.value)}
                        placeholder="First name"
                        value={contactFirstName}
                      />
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setContactLastName(event.target.value)}
                        placeholder="Optional last name"
                        value={contactLastName}
                      />
                    </div>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="Contact phone number"
                      value={contactPhone}
                    />
                  </>
                ) : null}

                {mode === "button" ? (
                  <>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setButtonHeader(event.target.value)}
                      placeholder="Optional header text"
                      value={buttonHeader}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setButtonBody(event.target.value)}
                      placeholder="Body text"
                      value={buttonBody}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setButtonFooter(event.target.value)}
                      placeholder="Optional footer text"
                      value={buttonFooter}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setButtonRows(event.target.value)}
                      placeholder="Buttons, one per line: id|title"
                      value={buttonRows}
                    />
                  </>
                ) : null}

                {mode === "list" ? (
                  <>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setListHeader(event.target.value)}
                      placeholder="Optional header text"
                      value={listHeader}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setListBody(event.target.value)}
                      placeholder="Body text"
                      value={listBody}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setListFooter(event.target.value)}
                      placeholder="Optional footer text"
                      value={listFooter}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setListButtonText(event.target.value)}
                      placeholder="List button text"
                      value={listButtonText}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setListRows(event.target.value)}
                      placeholder="Rows, one per line: id|title|description"
                      value={listRows}
                    />
                  </>
                ) : null}

                {mode === "reaction" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setReactionMessageId(event.target.value)}
                      placeholder="Incoming message ID to react to"
                      value={reactionMessageId}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setReactionEmoji(event.target.value)}
                      placeholder="Emoji"
                      value={reactionEmoji}
                    />
                  </div>
                ) : null}

                {mode === "cta_url" ? (
                  <>
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setCtaHeader(event.target.value)}
                      placeholder="Optional header text"
                      value={ctaHeader}
                    />
                    <Textarea
                      className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                      onChange={(event) => setCtaBody(event.target.value)}
                      placeholder="Body text"
                      value={ctaBody}
                    />
                    <Input
                      className="rounded-[20px] bg-[#faf7f1]"
                      onChange={(event) => setCtaFooter(event.target.value)}
                      placeholder="Optional footer text"
                      value={ctaFooter}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setCtaDisplayText(event.target.value)}
                        placeholder="Button label"
                        value={ctaDisplayText}
                      />
                      <Input
                        className="rounded-[20px] bg-[#faf7f1]"
                        onChange={(event) => setCtaUrl(event.target.value)}
                        placeholder="https://example.com"
                        value={ctaUrl}
                      />
                    </div>
                  </>
                ) : null}

                {mode === "location_request" ? (
                  <Textarea
                    className="min-h-24 rounded-[26px] bg-[#faf7f1]"
                    onChange={(event) => setLocationRequestBody(event.target.value)}
                    placeholder="Location request body text"
                    value={locationRequestBody}
                  />
                ) : null}

                {mode === "typing_indicator" ? (
                  <Input
                    className="rounded-[20px] bg-[#faf7f1]"
                    onChange={(event) => setTypingMessageId(event.target.value)}
                    placeholder="Incoming message ID to mark read and show typing"
                    value={typingMessageId}
                  />
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-[#fff8ea] px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Recipient
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {commonTo || "Enter a target number to prepare the request"}
                    </p>
                  </div>
                  <Button
                    disabled={sendMutation.isPending}
                    onClick={() => {
                      setSubmitError(null);
                      sendMutation.mutate();
                    }}
                    type="button"
                  >
                    {sendMutation.isPending ? "Sending..." : "Send request"}
                  </Button>
                </div>
                {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
              </div>
            </section>

            <section className="bg-[linear-gradient(180deg,#e3ddd1_0%,#d8d0c0_100%)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Device preview
                  </p>
                </div>
                {responsePreview ? (
                  <div className="flex items-center gap-2 rounded-full bg-[#d9efda] px-3 py-1 text-xs font-medium text-[#28552a]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Last request sent
                  </div>
                ) : null}
              </div>

              <div className="mx-auto mt-5 max-w-[320px] rounded-[36px] border border-[#0f2f28] bg-[#0f2f28] p-3 shadow-[0_24px_50px_rgba(35,43,34,0.18)]">
                <div className="rounded-[30px] bg-[linear-gradient(180deg,#e8d7b5_0%,#f5efe4_38%,#e6f3eb_100%)] p-4">
                  <div className="mb-4 rounded-[22px] bg-[#f6fbf7] px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">NiWa sender</p>
                        <p className="text-[11px] text-muted-foreground">
                          {commonTo || "Recipient preview"}
                        </p>
                      </div>
                      <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="min-h-[360px] space-y-4 rounded-[26px] bg-[rgba(255,255,255,0.5)] p-4 backdrop-blur">
                    <div className="flex justify-start">
                      <div className="max-w-[82%] rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-sm text-foreground shadow-sm">
                        Incoming reference message
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[86%] rounded-[20px] rounded-br-md bg-[#d8f6cb] px-4 py-3 text-sm text-[#16302b] shadow-sm">
                        <p className="whitespace-pre-wrap leading-6">{previewSummary}</p>
                        {selectedMedia ? (
                          <div className="mt-3 rounded-2xl bg-[rgba(22,48,43,0.08)] px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-3.5 w-3.5" />
                              {selectedMedia.fileName}
                            </div>
                          </div>
                        ) : null}
                        {selectedTemplate ? (
                          <div className="mt-3 rounded-2xl bg-[rgba(22,48,43,0.08)] px-3 py-2 text-xs">
                            Template: {selectedTemplate.name}
                          </div>
                        ) : null}
                        <p className="mt-3 text-right text-[11px] opacity-70">Preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-[#17362f] p-4 text-[#f8f1de]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8bfa8]">
                    Request payload
                  </p>
                  <pre className="mt-3 overflow-x-auto text-xs">
                    {JSON.stringify(requestPreview, null, 2)}
                  </pre>
                </div>
                <div className="rounded-[24px] bg-[#17362f] p-4 text-[#f8f1de]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c8bfa8]">
                    <Sparkles className="h-4 w-4" />
                    Meta response
                  </div>
                  <pre className="mt-3 overflow-x-auto text-xs">
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
