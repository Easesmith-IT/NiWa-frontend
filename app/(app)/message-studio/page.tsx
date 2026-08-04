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
import { getMediaDisplayName } from "../../../lib/media";
import {
  buildTemplateOptionValue,
  findTemplateByOptionValue,
  getActiveTemplates,
} from "../../../lib/templates";
import {
  MediaListResponse,
  MediaRecord,
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
  const [templateBodyVariableValues, setTemplateBodyVariableValues] = useState<string[]>([]);
  const [templateHeaderVariableValues, setTemplateHeaderVariableValues] = useState<string[]>([]);
  const [templateHeaderMediaId, setTemplateHeaderMediaId] = useState("");
  const [templateButtonVariables, setTemplateButtonVariables] = useState<string[]>([]);

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

  const activeTemplates = useMemo(
    () => getActiveTemplates(templatesQuery.data?.templates ?? []),
    [templatesQuery.data],
  );

  const selectedTemplate = useMemo(
    () =>
      findTemplateByOptionValue(
        activeTemplates,
        templateName && templateLanguage ? `${templateName}::${templateLanguage}` : "",
      ),
    [activeTemplates, templateLanguage, templateName],
  );

  const selectedMedia = useMemo(
    () =>
      (mediaQuery.data?.media ?? []).find(
        (media: MediaRecord) => media.metaMediaId === selectedMediaId,
      ) ?? null,
    [selectedMediaId, mediaQuery.data],
  );

  const templateHeaderFormat = useMemo(() => {
    if (
      selectedTemplate?.headerFormat &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(selectedTemplate.headerFormat)
    ) {
      return selectedTemplate.headerFormat;
    }

    const headerComponent = selectedTemplate?.components.find(
      (component) =>
        component.type === "HEADER" &&
        ["IMAGE", "VIDEO", "DOCUMENT"].includes(component.format ?? ""),
    );

    return headerComponent?.format ?? "";
  }, [selectedTemplate]);

  const selectedTemplateHeaderMedia = useMemo(
    () =>
      (mediaQuery.data?.media ?? []).find(
        (media: MediaRecord) => media.metaMediaId === templateHeaderMediaId,
      ) ?? null,
    [templateHeaderMediaId, mediaQuery.data],
  );

  const filteredTemplateHeaderMedia = useMemo(() => {
    if (!templateHeaderFormat) {
      return [];
    }

    return (mediaQuery.data?.media ?? []).filter(
      (media: MediaRecord) => media.mediaType === templateHeaderFormat.toLowerCase(),
    );
  }, [mediaQuery.data, templateHeaderFormat]);

  const templateUrlButtons = useMemo(
    () => getTemplateUrlButtons(selectedTemplate),
    [selectedTemplate],
  );

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.language !== templateLanguage) {
      setTemplateLanguage(selectedTemplate.language);
    }
  }, [selectedTemplate, templateLanguage]);

  useEffect(() => {
    const bodyKeys = getBodyVariableKeys(selectedTemplate);
    const headerKeys = selectedTemplate?.headerVariables ?? [];

    setTemplateBodyVariableValues((current) =>
      bodyKeys.map((_, index) => current[index] ?? ""),
    );
    setTemplateHeaderVariableValues((current) =>
      headerKeys.map((_, index) => current[index] ?? ""),
    );
  }, [selectedTemplate]);

  useEffect(() => {
    setTemplateVariables(templateBodyVariableValues.join("\n"));
  }, [templateBodyVariableValues]);

  useEffect(() => {
    setTemplateHeaderMediaId("");
  }, [selectedTemplate?.name, selectedTemplate?.language]);

  useEffect(() => {
    setTemplateButtonVariables([]);
  }, [selectedTemplate?.name, selectedTemplate?.language]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      if (mode === "text") {
        endpoint = "/messages/text";
        payload = { to: commonTo, body: textBody, previewUrl };
      } else if (mode === "template") {
        const structuredBodyVariables = templateBodyVariableValues.map((value) => value.trim());
        const fallbackBodyVariables = parseLines(templateVariables);
        endpoint = "/messages/template";
        payload = {
          to: commonTo,
          templateName,
          languageCode: templateLanguage,
          bodyVariables:
            structuredBodyVariables.filter(Boolean).length > 0
              ? structuredBodyVariables
              : fallbackBodyVariables,
          ...(templateHeaderVariableValues.filter((value) => value.trim()).length > 0
            ? {
                headerVariables: templateHeaderVariableValues.map((value) => value.trim()),
              }
            : {}),
          ...(templateHeaderMediaId ? { headerMediaId: templateHeaderMediaId } : {}),
          ...(templateUrlButtons.length > 0
            ? { buttonVariables: templateButtonVariables.map((value) => value.trim()) }
            : {}),
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
        templateHeaderFormat,
        selectedMedia,
        selectedTemplateHeaderMedia,
        templateBodyVariables: templateBodyVariableValues,
        templateHeaderVariables: templateHeaderVariableValues,
        templateButtonVariables: templateButtonVariables.map((value) => value.trim()).filter(Boolean),
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
      templateHeaderFormat,
      selectedMedia,
      selectedTemplateHeaderMedia,
      templateBodyVariableValues,
      templateHeaderVariableValues,
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
    ],
  );

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Message Studio & Dispatch Workbench
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Compose, validate, preview, and send Meta Cloud API message payloads (Templates, Text, Interactive, Media).
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#F0F0F2] pt-3">
          {messageModes.map((item) => (
            <button
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                item.key === mode
                  ? "bg-[#176B4D] text-white"
                  : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground hover:bg-[#F4F4F5]"
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
            <section className="border-b border-[#E4E4E7] bg-white p-4 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5">
                <Send className="h-4 w-4 text-[#176B4D]" />
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
                        className="min-h-28 bg-[#FAFAFA] text-xs"
                        onChange={(event) => setTextBody(event.target.value)}
                        placeholder="Enter text message content..."
                        value={textBody}
                      />
                    </div>
                    <label className="flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs text-foreground">
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
                        className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary"
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
                      <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs space-y-1.5">
                        <p className="font-semibold text-foreground">{selectedTemplate.name}</p>
                        <p className="text-muted-foreground">
                          Status: <span className="font-semibold text-[#16803C]">{selectedTemplate.status}</span> • Lang: {selectedTemplate.language}
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
                  </>
                ) : null}

                {["image", "video", "audio", "document", "sticker"].includes(mode) ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Stored Media Asset *</label>
                      <select
                        className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary"
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
                          className="min-h-16 bg-[#FAFAFA] text-xs"
                          onChange={(event) => setMediaCaption(event.target.value)}
                          placeholder="Optional media caption..."
                          value={mediaCaption}
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 pt-3 mt-3">
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
                      sendMutation.mutate();
                    }}
                    type="button"
                    variant="primary"
                  >
                    {sendMutation.isPending ? "Dispatching..." : "Send Message"}
                  </Button>
                </div>
                {submitError ? <p className="text-xs font-medium text-[#C2413A]">{submitError}</p> : null}
              </div>
            </section>

            <section className="bg-[#FAFAFA] p-4 border-t lg:border-t-0 border-[#E4E4E7]">
              <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#176B4D]" />
                  <p className="text-xs font-semibold text-foreground">
                    Device Preview & Telemetry
                  </p>
                </div>
                {responsePreview ? (
                  <span className="inline-flex items-center rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-[10px] font-semibold text-[#16803C]">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Sent 200 OK
                  </span>
                ) : null}
              </div>

              {/* WhatsApp Mobile Bubble Preview */}
              <div className="mx-auto mt-4 max-w-[280px] rounded-xl border border-[#E4E4E7] bg-[#F7F8FA] p-3 shadow-subtle">
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">WhatsApp Business</p>
                  <p className="font-mono text-xs font-semibold text-foreground">{commonTo || "+91..."}</p>
                </div>

                <div className="mt-3 min-h-[160px] rounded-lg bg-[#EDF8F3] p-3 border border-[#C4E8DA]">
                  <p className="whitespace-pre-wrap text-xs text-foreground leading-relaxed">{previewSummary}</p>
                  {selectedMedia ? (
                    <div className="mt-2 rounded bg-white p-2 text-[11px] border border-[#E4E4E7]">
                      <span className="font-mono font-medium">{getMediaDisplayName(selectedMedia)}</span>
                    </div>
                  ) : null}
                  <p className="mt-2 text-right text-[9px] text-[#34B7F1] font-semibold">12:00 PM ✓✓</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Request JSON Payload</p>
                  <pre className="overflow-x-auto rounded-md border border-[#27272A] bg-[#18181B] p-2.5 font-mono text-[10px] text-[#F4F4F5]">
                    {JSON.stringify(requestPreview, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Meta Graph API Response</p>
                  <pre className="overflow-x-auto rounded-md border border-[#27272A] bg-[#18181B] p-2.5 font-mono text-[10px] text-[#F4F4F5]">
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

