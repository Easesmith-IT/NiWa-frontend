"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
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
    () =>
      (templatesQuery.data?.templates ?? []).find(
        (template: TemplateRecord) => template.name === templateName,
      ) ?? null,
    [templateName, templatesQuery.data],
  );

  const selectedMedia = useMemo(
    () =>
      (mediaQuery.data?.media ?? []).find(
        (media: MediaRecord) => media.metaMediaId === selectedMediaId,
      ) ?? null,
    [selectedMediaId, mediaQuery.data],
  );

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

  const messageModes = useMemo(
    () =>
      [
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
      ] as Array<{ key: ComposerMode; label: string }>,
    [],
  );

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
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Message Studio
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Compose and Send</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {messageModes.map((item) => (
          <button
            key={item.key}
            className={
              item.key === mode
                ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                : "rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
            }
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

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">{messageModes.find((item) => item.key === mode)?.label}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sends a WhatsApp Cloud API payload through the backend with Meta-oriented validation.
          </p>

          <div className="mt-6 space-y-4">
            {mode !== "typing_indicator" ? (
              <Input onChange={(event) => setCommonTo(event.target.value)} placeholder="Recipient phone number with country code" value={commonTo} />
            ) : null}

            {mode === "text" ? (
              <>
                <Textarea onChange={(event) => setTextBody(event.target.value)} placeholder="Message body" value={textBody} />
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input checked={previewUrl} onChange={(event) => setPreviewUrl(event.target.checked)} type="checkbox" />
                  Enable URL previews
                </label>
              </>
            ) : null}

            {mode === "template" ? (
              <>
                <select className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary" onChange={(event) => setTemplateName(event.target.value)} value={templateName}>
                  <option value="">Select synced template</option>
                  {(templatesQuery.data?.templates ?? []).map((template: TemplateRecord) => (
                    <option key={template._id} value={template.name}>
                      {template.name} ({template.language})
                    </option>
                  ))}
                </select>
                <Input onChange={(event) => setTemplateLanguage(event.target.value)} placeholder="Language code" value={templateLanguage} />
                <Textarea onChange={(event) => setTemplateVariables(event.target.value)} placeholder="Body variables, one per line" value={templateVariables} />
              </>
            ) : null}

            {["image", "video", "audio", "document", "sticker"].includes(mode) ? (
              <>
                <select className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary" onChange={(event) => setSelectedMediaId(event.target.value)} value={selectedMediaId}>
                  <option value="">Select stored media</option>
                  {filteredMedia.map((media: MediaRecord) => (
                    <option key={media._id} value={media.metaMediaId}>
                      {media.fileName} ({media.mediaType})
                    </option>
                  ))}
                </select>
                {["image", "video", "document"].includes(mode) ? <Textarea onChange={(event) => setMediaCaption(event.target.value)} placeholder="Optional caption" value={mediaCaption} /> : null}
                {mode === "document" ? <Input onChange={(event) => setDocumentFilename(event.target.value)} placeholder="Optional filename override" value={documentFilename} /> : null}
              </>
            ) : null}

            {mode === "location" ? (
              <>
                <Input onChange={(event) => setLatitude(event.target.value)} placeholder="Latitude" value={latitude} />
                <Input onChange={(event) => setLongitude(event.target.value)} placeholder="Longitude" value={longitude} />
                <Input onChange={(event) => setLocationName(event.target.value)} placeholder="Optional location name" value={locationName} />
                <Input onChange={(event) => setLocationAddress(event.target.value)} placeholder="Optional address" value={locationAddress} />
              </>
            ) : null}

            {mode === "contact" ? (
              <>
                <Input onChange={(event) => setContactFormattedName(event.target.value)} placeholder="Formatted contact name" value={contactFormattedName} />
                <Input onChange={(event) => setContactFirstName(event.target.value)} placeholder="First name" value={contactFirstName} />
                <Input onChange={(event) => setContactLastName(event.target.value)} placeholder="Optional last name" value={contactLastName} />
                <Input onChange={(event) => setContactPhone(event.target.value)} placeholder="Contact phone number" value={contactPhone} />
              </>
            ) : null}

            {mode === "button" ? (
              <>
                <Input onChange={(event) => setButtonHeader(event.target.value)} placeholder="Optional header text" value={buttonHeader} />
                <Textarea onChange={(event) => setButtonBody(event.target.value)} placeholder="Body text" value={buttonBody} />
                <Input onChange={(event) => setButtonFooter(event.target.value)} placeholder="Optional footer text" value={buttonFooter} />
                <Textarea onChange={(event) => setButtonRows(event.target.value)} placeholder="Buttons, one per line: id|title" value={buttonRows} />
              </>
            ) : null}

            {mode === "list" ? (
              <>
                <Input onChange={(event) => setListHeader(event.target.value)} placeholder="Optional header text" value={listHeader} />
                <Textarea onChange={(event) => setListBody(event.target.value)} placeholder="Body text" value={listBody} />
                <Input onChange={(event) => setListFooter(event.target.value)} placeholder="Optional footer text" value={listFooter} />
                <Input onChange={(event) => setListButtonText(event.target.value)} placeholder="List button text" value={listButtonText} />
                <Textarea onChange={(event) => setListRows(event.target.value)} placeholder="Rows, one per line: id|title|description" value={listRows} />
              </>
            ) : null}

            {mode === "reaction" ? (
              <>
                <Input onChange={(event) => setReactionMessageId(event.target.value)} placeholder="Incoming message ID to react to" value={reactionMessageId} />
                <Input onChange={(event) => setReactionEmoji(event.target.value)} placeholder="Emoji" value={reactionEmoji} />
              </>
            ) : null}

            {mode === "cta_url" ? (
              <>
                <Input onChange={(event) => setCtaHeader(event.target.value)} placeholder="Optional header text" value={ctaHeader} />
                <Textarea onChange={(event) => setCtaBody(event.target.value)} placeholder="Body text" value={ctaBody} />
                <Input onChange={(event) => setCtaFooter(event.target.value)} placeholder="Optional footer text" value={ctaFooter} />
                <Input onChange={(event) => setCtaDisplayText(event.target.value)} placeholder="Button label" value={ctaDisplayText} />
                <Input onChange={(event) => setCtaUrl(event.target.value)} placeholder="https://example.com" value={ctaUrl} />
              </>
            ) : null}

            {mode === "location_request" ? <Textarea onChange={(event) => setLocationRequestBody(event.target.value)} placeholder="Location request body text" value={locationRequestBody} /> : null}

            {mode === "typing_indicator" ? <Input onChange={(event) => setTypingMessageId(event.target.value)} placeholder="Incoming message ID to mark read and show typing" value={typingMessageId} /> : null}

            <Button
              disabled={sendMutation.isPending}
              onClick={() => {
                setSubmitError(null);
                sendMutation.mutate();
              }}
              type="button"
            >
              {sendMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Payload Preview</h3>
          <p className="mt-2 text-sm text-muted-foreground">Live preview, raw outbound request, and Meta response.</p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f7f1e4] p-4 text-xs text-foreground">
                {previewSummary}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Request</p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
                {JSON.stringify(requestPreview, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Response</p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
                {JSON.stringify(responsePreview, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
