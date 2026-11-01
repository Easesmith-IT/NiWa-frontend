"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useCreateTemplateMutation } from "../templates.queries";
import type { CreateTemplatePayload, TemplateComponent } from "../templates.types";
import { SearchableLanguageSelect } from "./SearchableLanguageSelect";
import { MediaSampleDropzone } from "./MediaSampleDropzone";

interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTemplate?: {
    name: string;
    category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  } | null;
}

interface ButtonItem {
  id: string;
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  urlExample?: string;
  phoneNumber?: string;
}

export function TemplateCreateModal({
  isOpen,
  onClose,
  onSuccess,
  initialTemplate,
}: TemplateCreateModalProps) {
  const createMutation = useCreateTemplateMutation();

  // Basic Details
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"MARKETING" | "UTILITY" | "AUTHENTICATION">("MARKETING");
  const [language, setLanguage] = useState("en_US");

  // Header Component: "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION"
  const [headerType, setHeaderType] = useState<
    "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION"
  >("NONE");
  const [headerText, setHeaderText] = useState("");
  const [headerSample, setHeaderSample] = useState("");
  const [headerMediaHandle, setHeaderMediaHandle] = useState<string | null>(null);
  const [headerMediaFileName, setHeaderMediaFileName] = useState<string | null>(null);
  const [headerMediaPreviewUrl, setHeaderMediaPreviewUrl] = useState<string | null>(null);

  // Body Component
  const [bodyText, setBodyText] = useState("");
  const [bodySamples, setBodySamples] = useState<Record<number, string>>({});

  // Footer Component
  const [footerText, setFooterText] = useState("");

  // Buttons Component
  const [buttons, setButtons] = useState<ButtonItem[]>([]);

  // Preview Mode: true = with samples, false = with {{1}} placeholders
  const [previewWithSamples, setPreviewWithSamples] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial template if provided (e.g. adding a new language variant)
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setCategory(initialTemplate.category);
    } else {
      setName("");
      setCategory("MARKETING");
    }
  }, [initialTemplate, isOpen]);

  // Auto extract body variables {{1}}, {{2}}, etc.
  const detectedBodyVars = useMemo(() => {
    const matches = Array.from(bodyText.matchAll(/{{\s*(\d+)\s*}}/g)).map((m) =>
      parseInt(m[1], 10),
    );
    return Array.from(new Set(matches)).sort((a, b) => a - b);
  }, [bodyText]);

  const hasHeaderVar = headerText.includes("{{1}}");

  // Add variable helper into body
  const handleInsertBodyVariable = () => {
    const nextVarIndex = detectedBodyVars.length > 0 ? Math.max(...detectedBodyVars) + 1 : 1;
    setBodyText((prev) => `${prev}{{${nextVarIndex}}}`);
  };

  // Add Button helper
  const handleAddButton = (type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER") => {
    if (buttons.length >= 10) return;
    const newBtn: ButtonItem = {
      id: Math.random().toString(36).substring(7),
      type,
      text: type === "QUICK_REPLY" ? "Quick Reply" : type === "URL" ? "Visit Website" : "Call Support",
      url: type === "URL" ? "https://example.com" : undefined,
      urlExample: "",
      phoneNumber: type === "PHONE_NUMBER" ? "+16505551234" : undefined,
    };
    setButtons((prev) => [...prev, newBtn]);
  };

  const handleRemoveButton = (id: string) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateButton = (id: string, updates: Partial<ButtonItem>) => {
    setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Name sanitize helper
  const handleNameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    setName(sanitized);
  };

  // Validation Rules according to Meta Specifications
  const isNameValid = useMemo(() => {
    return /^[a-z0-9_]{1,512}$/.test(name.trim());
  }, [name]);

  const isBodyValid = useMemo(() => {
    return bodyText.trim().length > 0 && bodyText.length <= 1024;
  }, [bodyText]);

  const areBodyVarsSequential = useMemo(() => {
    if (detectedBodyVars.length === 0) return true;
    for (let i = 0; i < detectedBodyVars.length; i++) {
      if (detectedBodyVars[i] !== i + 1) return false;
    }
    return true;
  }, [detectedBodyVars]);

  const areBodySamplesProvided = useMemo(() => {
    if (detectedBodyVars.length === 0) return true;
    return detectedBodyVars.every((v) => !!bodySamples[v]?.trim());
  }, [detectedBodyVars, bodySamples]);

  const isHeaderValid = useMemo(() => {
    if (headerType === "NONE" || headerType === "LOCATION") return true;
    if (headerType === "TEXT") {
      if (!headerText.trim()) return false;
      if (hasHeaderVar && !headerSample.trim()) return false;
      return true;
    }
    if (["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType)) {
      return !!headerMediaHandle;
    }
    return true;
  }, [headerType, headerText, hasHeaderVar, headerSample, headerMediaHandle]);

  const areButtonsValid = useMemo(() => {
    return buttons.every((b) => {
      if (!b.text.trim()) return false;
      if (b.type === "URL") {
        if (!b.url?.trim()) return false;
        if (b.url.includes("{{1}}") && !b.urlExample?.trim()) return false;
      }
      if (b.type === "PHONE_NUMBER") {
        if (!b.phoneNumber?.trim()) return false;
      }
      return true;
    });
  }, [buttons]);

  const isValidForSubmission =
    isNameValid &&
    isBodyValid &&
    areBodyVarsSequential &&
    areBodySamplesProvided &&
    isHeaderValid &&
    areButtonsValid;

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!isValidForSubmission) return;

    try {
      const components: TemplateComponent[] = [];

      // Header component
      if (headerType === "TEXT" && headerText.trim()) {
        const headerComp: TemplateComponent = {
          type: "HEADER",
          format: "TEXT",
          text: headerText.trim(),
        };
        if (hasHeaderVar && headerSample.trim()) {
          headerComp.example = {
            header_text: [headerSample.trim()],
          };
        }
        components.push(headerComp);
      } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType)) {
        if (!headerMediaHandle) {
          setErrorMsg(`Please upload a sample ${headerType.toLowerCase()} file for Meta review.`);
          return;
        }
        components.push({
          type: "HEADER",
          format: headerType as "IMAGE" | "VIDEO" | "DOCUMENT",
          example: {
            header_handle: [headerMediaHandle],
          },
        });
      } else if (headerType === "LOCATION") {
        components.push({
          type: "HEADER",
          format: "LOCATION",
        });
      }

      // Body component
      const bodyComp: TemplateComponent = {
        type: "BODY",
        text: bodyText.trim(),
      };
      if (detectedBodyVars.length > 0) {
        const sampleRow = detectedBodyVars.map((v) => bodySamples[v]?.trim() || `Sample ${v}`);
        bodyComp.example = {
          body_text: [sampleRow],
        };
      }
      components.push(bodyComp);

      // Footer component
      if (footerText.trim()) {
        components.push({
          type: "FOOTER",
          text: footerText.trim(),
        });
      }

      // Buttons component
      if (buttons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: buttons.map((b) => {
            if (b.type === "URL") {
              const btnObj: any = {
                type: "URL",
                text: b.text.trim(),
                url: b.url?.trim() || "https://example.com",
              };
              if (b.url?.includes("{{1}}") && b.urlExample?.trim()) {
                btnObj.example = [b.urlExample.trim()];
              }
              return btnObj;
            }
            if (b.type === "PHONE_NUMBER") {
              return {
                type: "PHONE_NUMBER",
                text: b.text.trim(),
                phone_number: b.phoneNumber?.trim() || "+16505551234",
              };
            }
            return {
              type: "QUICK_REPLY",
              text: b.text.trim(),
            };
          }),
        });
      }

      const payload: CreateTemplatePayload = {
        name: name.trim(),
        category,
        language,
        components,
        allow_category_change: true,
      };

      await createMutation.mutateAsync(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create template. Please check the requirements.";
      setErrorMsg(msg);
    }
  };

  // Preview formatting helper
  const renderPreviewBody = () => {
    let text = bodyText || "Your template body message will appear here.";
    if (previewWithSamples && detectedBodyVars.length > 0) {
      detectedBodyVars.forEach((v) => {
        const sample = bodySamples[v]?.trim();
        text = text.replace(new RegExp(`{{\\s*${v}\\s*}}`, "g"), sample || `{{${v}}}`);
      });
    }

    const parts = text.split(/({{\s*\d+\s*}})/g);
    return parts.map((part, idx) => {
      if (/^{{\s*\d+\s*}}$/.test(part)) {
        return (
          <span
            className="mx-0.5 inline-flex items-center rounded bg-[#EDF8F3] border border-emerald-200 px-1 py-0.2 text-xs font-medium text-[#176B4D] dark:border-[#1F4D3C] dark:bg-[#13251E] dark:text-[#359B76]"
            key={idx}
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const renderPreviewHeader = () => {
    if (headerType === "NONE") return null;

    if (headerType === "TEXT") {
      if (!headerText) return null;
      let text = headerText;
      if (previewWithSamples && hasHeaderVar) {
        text = text.replace(/{{\s*1\s*}}/g, headerSample.trim() || "{{1}}");
      }
      return <div className="font-semibold text-xs text-foreground mb-1">{text}</div>;
    }

    if (headerType === "IMAGE") {
      return (
        <div className="overflow-hidden rounded-md border border-[#E0DCD5] bg-[#F4F4F5] dark:border-[#27343D] dark:bg-[#1A242B] mb-2">
          {headerMediaPreviewUrl ? (
            <img
              alt="Header preview"
              className="h-32 w-full object-cover"
              src={headerMediaPreviewUrl}
            />
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageIcon className="h-7 w-7 text-[#176B4D] dark:text-[#359B76]" />
              <span className="text-[11px] font-medium">Header Image Preview</span>
            </div>
          )}
        </div>
      );
    }

    if (headerType === "VIDEO") {
      return (
        <div className="relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-md border border-[#E0DCD5] bg-[#121416] text-white mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Video className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="mt-1 text-[11px] font-medium text-white/80">Header Video Preview</span>
          <span className="absolute bottom-1 right-2 text-[10px] text-white/60">0:15</span>
        </div>
      );
    }

    if (headerType === "DOCUMENT") {
      return (
        <div className="flex items-center gap-2.5 rounded-md border border-[#E0DCD5] bg-[#F4F4F5] p-2 dark:border-[#27343D] dark:bg-[#1A242B] mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="truncate text-xs">
            <p className="font-medium text-foreground truncate">
              {headerMediaFileName || "document_sample.pdf"}
            </p>
            <p className="text-[10px] text-muted-foreground">PDF Document</p>
          </div>
        </div>
      );
    }

    if (headerType === "LOCATION") {
      return (
        <div className="flex items-center gap-2.5 rounded-md border border-[#E0DCD5] bg-[#EDF8F3] p-2 dark:border-[#1F4D3C] dark:bg-[#13251E] mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-100 text-[#176B4D] dark:bg-[#1D3B2F] dark:text-[#359B76]">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div className="text-xs">
            <p className="font-medium text-foreground">Location Pin Header</p>
            <p className="text-[10px] text-muted-foreground">Coordinates provided at send time</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent
        hideClose
        className="max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#121416] border-[#E4E4E7] dark:border-[#292C2F] [&>div]:p-0 [&>div]:flex [&>div]:flex-col [&>div]:h-[85vh] [&>div]:max-h-[85vh] [&>div]:overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[#E4E4E7] px-6 py-4 bg-white dark:border-[#282B2E] dark:bg-[#121416]">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#176B4D] dark:text-[#359B76]" />
              {initialTemplate ? `Add Language Variant (${initialTemplate.name})` : "Create WhatsApp Template"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Submit a new template directly to Meta WhatsApp Business API for review and approval.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              disabled={!isValidForSubmission || createMutation.isPending}
              onClick={handleSubmit}
              size="sm"
              type="button"
              variant="primary"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Submitting...
                </>
              ) : (
                "Submit Template"
              )}
            </Button>
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#25282B]"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mx-6 mt-3 shrink-0 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Two-Column Split Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Left Column: Form Configuration */}
          <div className="flex-1 space-y-5">
            {/* Template Information */}
            <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#17191B]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Template Information
                </h4>
                {initialTemplate ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-[#176B4D] dark:bg-[#1D3B2F] dark:text-[#359B76]">
                    Language Variant Mode
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Template Name *
                  </label>
                  <Input
                    className="h-8.5 font-mono text-xs"
                    disabled={!!initialTemplate}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. order_confirmed_v1"
                    value={name}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {initialTemplate
                      ? "Name is fixed to match the template family across languages."
                      : "Lowercase letters, numbers, and underscores only."}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#121416]"
                    disabled={!!initialTemplate}
                    onChange={(e) => setCategory(e.target.value as any)}
                    value={category}
                  >
                    <option value="MARKETING">Marketing (Promotions, Offers, Sales)</option>
                    <option value="UTILITY">Utility (Confirmations, Updates, Alerts)</option>
                    <option value="AUTHENTICATION">Authentication (Verification Codes)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Language * (90+ Meta Locales Supported)
                  </label>
                  <SearchableLanguageSelect
                    onChange={(newLang) => setLanguage(newLang)}
                    value={language}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Search and choose any Meta WhatsApp Business language or regional dialect.
                  </p>
                </div>
              </div>
            </div>

            {/* Header Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Header (Optional)
                </h4>
                <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[#E4E4E7] bg-[#F7F8FA] p-1 dark:border-[#282B2E] dark:bg-[#151719]">
                  {(
                    [
                      { format: "NONE", label: "None", icon: null },
                      { format: "TEXT", label: "Text", icon: FileText },
                      { format: "IMAGE", label: "Image", icon: ImageIcon },
                      { format: "VIDEO", label: "Video", icon: Video },
                      { format: "DOCUMENT", label: "Document", icon: FileText },
                      { format: "LOCATION", label: "Location", icon: MapPin },
                    ] as const
                  ).map(({ format, label, icon: FormatIcon }) => {
                    const isSelected = headerType === format;
                    return (
                      <button
                        key={format}
                        type="button"
                        onClick={() => {
                          setHeaderType(format);
                          if (format === "TEXT" || format === "NONE" || format === "LOCATION") {
                            setHeaderMediaHandle(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#176B4D] text-white shadow-xs dark:bg-[#359B76]"
                            : "text-muted-foreground hover:bg-white hover:text-foreground dark:hover:bg-[#1F2224]"
                        }`}
                      >
                        {FormatIcon ? <FormatIcon className="h-3 w-3" /> : null}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {headerType === "TEXT" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Header Text</label>
                    <span className="text-[11px] text-muted-foreground">{headerText.length}/60</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      className="h-8.5 text-xs"
                      maxLength={60}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. Order Update: {{1}}"
                      value={headerText}
                    />
                    {!hasHeaderVar ? (
                      <button
                        type="button"
                        onClick={() => setHeaderText((prev) => `${prev}{{1}}`)}
                        className="inline-flex items-center gap-1 h-8.5 px-3 rounded-md border border-[#D4D4D8] bg-white text-xs font-medium text-foreground whitespace-nowrap shadow-xs hover:border-[#176B4D] hover:bg-[#F2FBF7] hover:text-[#176B4D] dark:border-[#303438] dark:bg-[#1C1F21] dark:hover:border-[#359B76] dark:hover:bg-[#13251E] dark:hover:text-[#359B76] transition-colors"
                      >
                        + {"{{1}}"}
                      </button>
                    ) : null}
                  </div>
                  {hasHeaderVar ? (
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Sample Value for Header {"{{1}}"} *
                      </label>
                      <Input
                        className="h-8.5 text-xs"
                        onChange={(e) => setHeaderSample(e.target.value)}
                        placeholder="e.g. Summer Sale"
                        value={headerSample}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType) ? (
                <MediaSampleDropzone
                  fileName={headerMediaFileName}
                  filePreviewUrl={headerMediaPreviewUrl}
                  format={headerType as "IMAGE" | "VIDEO" | "DOCUMENT"}
                  headerHandle={headerMediaHandle}
                  onRemove={() => {
                    setHeaderMediaHandle(null);
                    setHeaderMediaFileName(null);
                    setHeaderMediaPreviewUrl(null);
                  }}
                  onUploadSuccess={(handle, fileTitle, previewUrl) => {
                    setHeaderMediaHandle(handle);
                    setHeaderMediaFileName(fileTitle);
                    setHeaderMediaPreviewUrl(previewUrl ?? null);
                  }}
                />
              ) : null}

              {headerType === "LOCATION" ? (
                <div className="rounded-md border border-emerald-200 bg-[#EDF8F3] p-3 text-xs text-[#176B4D] dark:border-[#1F4D3C] dark:bg-[#13251E] dark:text-[#359B76] flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    Location headers display a map pin. No sample asset is required by Meta; you will provide GPS latitude/longitude when sending the message.
                  </span>
                </div>
              ) : null}
            </div>

            {/* Body Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Body * (Message Content)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    The core text of your template. Use sequential variables like {"{{1}}"}, {"{{2}}"}.
                  </p>
                </div>
                <button
                  onClick={handleInsertBodyVariable}
                  type="button"
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-[#D4D4D8] bg-white text-xs font-medium text-foreground whitespace-nowrap shadow-xs hover:border-[#176B4D] hover:bg-[#F2FBF7] hover:text-[#176B4D] dark:border-[#303438] dark:bg-[#1C1F21] dark:hover:border-[#359B76] dark:hover:bg-[#13251E] dark:hover:text-[#359B76] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                  <span>Add Variable</span>
                </button>
              </div>

              <div className="space-y-1">
                <Textarea
                  className="min-h-[110px] text-xs leading-relaxed font-sans"
                  maxLength={1024}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="e.g. Hello {{1}}, your order {{2}} is on its way and will arrive by {{3}}!"
                  value={bodyText}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Formatting: *bold*, _italic_, ~strikethrough~, ```code```</span>
                  <span>{bodyText.length}/1024</span>
                </div>
              </div>

              {/* Variable Sample Values Input */}
              {detectedBodyVars.length > 0 ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-[#EDF8F3] p-3 space-y-2 dark:border-[#1F4D3C] dark:bg-[#13251E]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#176B4D] dark:text-[#359B76]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sample Values for Meta Review (Required)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Meta requires realistic sample values for each variable to evaluate template quality and prevent spam.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {detectedBodyVars.map((v) => (
                      <div key={v}>
                        <label className="block text-[11px] font-medium text-foreground mb-0.5">
                          Sample for {"{{" + v + "}}"} *
                        </label>
                        <Input
                          className="h-7.5 text-xs bg-white dark:bg-[#121416]"
                          onChange={(e) =>
                            setBodySamples((prev) => ({
                              ...prev,
                              [v]: e.target.value,
                            }))
                          }
                          placeholder={`e.g. John Doe`}
                          value={bodySamples[v] ?? ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-2 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Footer (Optional)
                </h4>
                <span className="text-[11px] text-muted-foreground">{footerText.length}/60</span>
              </div>
              <Input
                className="h-8.5 text-xs"
                maxLength={60}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="e.g. Reply STOP to unsubscribe or for assistance"
                value={footerText}
              />
              <p className="text-[11px] text-muted-foreground">
                Plain text only. Variables are not permitted in footers.
              </p>
            </div>

            {/* Buttons Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interactive Buttons (Optional, max 10)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Add quick reply chips, website URLs, or call phone numbers.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    disabled={buttons.length >= 10}
                    onClick={() => handleAddButton("QUICK_REPLY")}
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#D4D4D8] bg-white text-xs font-medium text-foreground whitespace-nowrap shadow-xs hover:border-[#176B4D] hover:bg-[#F2FBF7] hover:text-[#176B4D] dark:border-[#303438] dark:bg-[#1C1F21] dark:hover:border-[#359B76] dark:hover:bg-[#13251E] dark:hover:text-[#359B76] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                    <span>Quick Reply</span>
                  </button>
                  <button
                    disabled={buttons.length >= 10}
                    onClick={() => handleAddButton("URL")}
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#D4D4D8] bg-white text-xs font-medium text-foreground whitespace-nowrap shadow-xs hover:border-[#176B4D] hover:bg-[#F2FBF7] hover:text-[#176B4D] dark:border-[#303438] dark:bg-[#1C1F21] dark:hover:border-[#359B76] dark:hover:bg-[#13251E] dark:hover:text-[#359B76] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                    <span>Website URL</span>
                  </button>
                  <button
                    disabled={buttons.length >= 10}
                    onClick={() => handleAddButton("PHONE_NUMBER")}
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#D4D4D8] bg-white text-xs font-medium text-foreground whitespace-nowrap shadow-xs hover:border-[#176B4D] hover:bg-[#F2FBF7] hover:text-[#176B4D] dark:border-[#303438] dark:bg-[#1C1F21] dark:hover:border-[#359B76] dark:hover:bg-[#13251E] dark:hover:text-[#359B76] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                    <span>Call Phone</span>
                  </button>
                </div>
              </div>

              {buttons.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {buttons.map((btn, index) => (
                    <div
                      className="flex flex-col gap-2.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs dark:border-[#282B2E] dark:bg-[#17191B]"
                      key={btn.id}
                    >
                      <div className="flex items-center justify-between border-b border-[#EAEAEF] pb-2 dark:border-[#26292C]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E0ECE6] text-[10px] font-bold text-[#176B4D] dark:bg-[#1F3D31] dark:text-[#3FA66F]">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            {btn.type === "QUICK_REPLY" ? (
                              <>
                                <Plus className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                                Quick Reply Button
                              </>
                            ) : btn.type === "URL" ? (
                              <>
                                <Globe className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                                Website URL Button
                              </>
                            ) : (
                              <>
                                <Phone className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                                Phone Call Button
                              </>
                            )}
                          </span>
                        </div>
                        <button
                          className="rounded p-1 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                          onClick={() => handleRemoveButton(btn.id)}
                          type="button"
                          title="Remove button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-foreground mb-1">
                            Button Label Text * <span className="text-muted-foreground">(max 25)</span>
                          </label>
                          <Input
                            className="h-8 text-xs bg-white dark:bg-[#121416]"
                            maxLength={25}
                            onChange={(e) => handleUpdateButton(btn.id, { text: e.target.value })}
                            value={btn.text}
                            placeholder="e.g. View Order"
                          />
                        </div>

                        {btn.type === "URL" ? (
                          <>
                            <div>
                              <label className="block text-[11px] font-medium text-foreground mb-1">
                                Website URL *
                              </label>
                              <Input
                                className="h-8 text-xs bg-white dark:bg-[#121416]"
                                onChange={(e) => handleUpdateButton(btn.id, { url: e.target.value })}
                                placeholder="https://example.com/order/{{1}}"
                                value={btn.url ?? ""}
                              />
                            </div>
                            {btn.url?.includes("{{1}}") ? (
                              <div className="md:col-span-2">
                                <label className="block text-[11px] font-medium text-foreground mb-1">
                                  Sample URL Suffix for {"{{1}}"} *
                                </label>
                                <Input
                                  className="h-8 text-xs bg-white dark:bg-[#121416]"
                                  onChange={(e) =>
                                    handleUpdateButton(btn.id, { urlExample: e.target.value })
                                  }
                                  placeholder="e.g. 12345"
                                  value={btn.urlExample ?? ""}
                                />
                              </div>
                            ) : null}
                          </>
                        ) : null}

                        {btn.type === "PHONE_NUMBER" ? (
                          <div>
                            <label className="block text-[11px] font-medium text-foreground mb-1">
                              Phone Number * <span className="text-muted-foreground">(with country code)</span>
                            </label>
                            <Input
                              className="h-8 text-xs bg-white dark:bg-[#121416]"
                              onChange={(e) =>
                                handleUpdateButton(btn.id, { phoneNumber: e.target.value })
                              }
                              placeholder="+16505551234"
                              value={btn.phoneNumber ?? ""}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-3 text-center text-xs text-muted-foreground dark:border-[#282B2E] dark:bg-[#151719]">
                  No interactive buttons added yet. Click an option above to add up to 10 interactive buttons.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live WhatsApp Mobile Canvas */}
          <div className="w-full lg:w-[350px] shrink-0 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Live Mobile Canvas
              </span>
              <button
                className="flex items-center gap-1 text-[11px] text-[#176B4D] dark:text-[#359B76] font-medium"
                onClick={() => setPreviewWithSamples((prev) => !prev)}
                type="button"
              >
                <Eye className="h-3 w-3" />
                {previewWithSamples ? "Samples Mode" : "Placeholders Mode"}
              </button>
            </div>

            {/* Phone Card Mockup */}
            <div className="rounded-2xl border-4 border-[#2A2F32] bg-[#EFEAE2] dark:bg-[#0B141A] p-4 shadow-xl flex flex-col justify-between min-h-[380px]">
              {/* WhatsApp Chat Bubble */}
              <div className="rounded-lg rounded-tl-none bg-white dark:bg-[#1F2C34] p-3 shadow-sm space-y-2 border border-[#E0DCD5] dark:border-[#27343D]">
                {renderPreviewHeader()}

                <div className="text-xs leading-5 text-foreground whitespace-pre-wrap break-words">
                  {renderPreviewBody()}
                </div>

                {footerText ? (
                  <p className="text-[11px] text-muted-foreground border-t border-[#F0F0F2] dark:border-[#282F35] pt-1.5">
                    {footerText}
                  </p>
                ) : null}

                <div className="flex justify-end text-[10px] text-muted-foreground">
                  <span>10:30 AM ✓✓</span>
                </div>
              </div>

              {/* Action Buttons in Preview */}
              {buttons.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {buttons.map((btn) => (
                    <div
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#D1D7DB] bg-white dark:border-[#2C3840] dark:bg-[#1F2C34] py-1.5 px-3 text-center text-xs font-medium text-[#00A884] shadow-xs"
                      key={btn.id}
                    >
                      {btn.type === "URL" ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : btn.type === "PHONE_NUMBER" ? (
                        <Phone className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>{btn.text}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Meta Requirements Checklist */}
              <div className="mt-4 rounded-lg bg-white/80 dark:bg-[#121416]/80 p-3 text-[11px] space-y-1.5 border border-[#D5D0C8] dark:border-[#25282B]">
                <p className="font-semibold text-foreground text-[11px]">Meta Template Readiness</p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {isNameValid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>Name: lowercase letters & underscores</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {isBodyValid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>Body message content present</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {areBodyVarsSequential ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>Sequential numbering starting from {"{{1}}"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {areBodySamplesProvided ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>Sample values provided for variables</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {isHeaderValid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>
                    Header:{" "}
                    {["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType)
                      ? "Sample media asset handle uploaded"
                      : "Valid configuration"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7] px-6 py-3.5 bg-[#FAFAFA] dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="text-xs">
            {isValidForSubmission ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                All Meta requirements met — ready to submit
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Fill required fields (name, body message & samples) to submit
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Button disabled={createMutation.isPending} onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={!isValidForSubmission || createMutation.isPending}
              onClick={handleSubmit}
              type="button"
              variant="primary"
              className="gap-1.5 shadow-sm"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting to Meta...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Submit to Meta for Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
