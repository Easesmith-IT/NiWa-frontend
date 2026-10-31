"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  Globe,
  Loader2,
  Phone,
  Plus,
  Sparkles,
  Trash2,
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

interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ButtonItem {
  id: string;
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  urlExample?: string;
  phoneNumber?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en_US", label: "English (US)" },
  { code: "en_GB", label: "English (UK)" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "pt_BR", label: "Portuguese (BR)" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
];

export function TemplateCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: TemplateCreateModalProps) {
  const createMutation = useCreateTemplateMutation();

  // Basic Details
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"MARKETING" | "UTILITY" | "AUTHENTICATION">("MARKETING");
  const [language, setLanguage] = useState("en_US");

  // Header Component
  const [headerType, setHeaderType] = useState<"NONE" | "TEXT">("NONE");
  const [headerText, setHeaderText] = useState("");
  const [headerSample, setHeaderSample] = useState("");

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
    const sanitized = val.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setName(sanitized);
  };

  // Check validation readiness
  const isNameValid = name.trim().length > 0 && /^[a-z0-9_]+$/.test(name);
  const isBodyValid = bodyText.trim().length > 0;
  const areBodyVarsSequential =
    detectedBodyVars.length === 0 ||
    detectedBodyVars.every((num, idx) => num === idx + 1);
  const areBodySamplesProvided = detectedBodyVars.every(
    (v) => (bodySamples[v] ?? "").trim().length > 0,
  );
  const isHeaderValid = !hasHeaderVar || headerSample.trim().length > 0;

  const isValidForSubmission =
    isNameValid &&
    isBodyValid &&
    areBodyVarsSequential &&
    areBodySamplesProvided &&
    isHeaderValid;

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!isValidForSubmission) {
      if (!isNameValid) setErrorMsg("Template name must contain only lowercase letters, numbers, and underscores.");
      else if (!isBodyValid) setErrorMsg("Body text is required.");
      else if (!areBodyVarsSequential) setErrorMsg("Variables must be sequential numbers starting from {{1}}.");
      else if (!areBodySamplesProvided) setErrorMsg("Please provide sample values for all body variables.");
      else if (!isHeaderValid) setErrorMsg("Please provide a sample value for the header variable {{1}}.");
      return;
    }

    try {
      const components: TemplateComponent[] = [];

      // Header
      if (headerType === "TEXT" && headerText.trim()) {
        const headerComp: TemplateComponent = {
          type: "HEADER",
          format: "TEXT",
          text: headerText.trim(),
        };
        if (hasHeaderVar) {
          headerComp.example = {
            header_text: [headerSample.trim() || "Header Sample"],
          };
        }
        components.push(headerComp);
      }

      // Body
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

      // Footer
      if (footerText.trim()) {
        components.push({
          type: "FOOTER",
          text: footerText.trim(),
        });
      }

      // Buttons
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
    if (headerType !== "TEXT" || !headerText) return null;
    let text = headerText;
    if (previewWithSamples && hasHeaderVar) {
      text = text.replace(/{{\s*1\s*}}/g, headerSample.trim() || "{{1}}");
    }
    return <div className="font-semibold text-xs text-foreground mb-1">{text}</div>;
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white dark:bg-[#121416] border-[#E4E4E7] dark:border-[#292C2F]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E4E7] p-5 dark:border-[#282B2E]">
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#176B4D] dark:text-[#359B76]" />
              Create WhatsApp Template
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Submit a new template directly to Meta WhatsApp Business API for review and approval.
            </DialogDescription>
          </div>
          <button
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#25282B]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Two-Column Split Body */}
        <div className="flex flex-col lg:flex-row p-6 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Form Configuration */}
          <div className="flex-1 space-y-5">
            {/* Basic Info */}
            <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#17191B]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Template Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Template Name *
                  </label>
                  <Input
                    className="h-8.5 font-mono text-xs"
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. order_confirmed_v1"
                    value={name}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Lowercase letters, numbers, and underscores only.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Category *
                  </label>
                  <select
                    className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#121416]"
                    onChange={(e) => setCategory(e.target.value as any)}
                    value={category}
                  >
                    <option value="MARKETING">Marketing (Promotions, Offers, Sales)</option>
                    <option value="UTILITY">Utility (Confirmations, Updates, Alerts)</option>
                    <option value="AUTHENTICATION">Authentication (Verification Codes)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Language *
                  </label>
                  <select
                    className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#121416]"
                    onChange={(e) => setLanguage(e.target.value)}
                    value={language}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Header Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Header (Optional)
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      headerType === "NONE"
                        ? "bg-[#176B4D] text-white dark:bg-[#359B76]"
                        : "bg-[#F4F4F5] text-muted-foreground dark:bg-[#1C1F21]"
                    }`}
                    onClick={() => setHeaderType("NONE")}
                    type="button"
                  >
                    None
                  </button>
                  <button
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      headerType === "TEXT"
                        ? "bg-[#176B4D] text-white dark:bg-[#359B76]"
                        : "bg-[#F4F4F5] text-muted-foreground dark:bg-[#1C1F21]"
                    }`}
                    onClick={() => setHeaderType("TEXT")}
                    type="button"
                  >
                    Text
                  </button>
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
                      <Button
                        onClick={() => setHeaderText((prev) => `${prev}{{1}}`)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        + {"{{1}}"}
                      </Button>
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
            </div>

            {/* Body Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Body * (Message Content)
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{bodyText.length}/1024</span>
                  <Button
                    onClick={handleInsertBodyVariable}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Variable
                  </Button>
                </div>
              </div>

              <Textarea
                className="min-h-28 text-xs leading-5"
                maxLength={1024}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Hello {{1}}, your order {{2}} has been confirmed and will arrive by {{3}}."
                value={bodyText}
              />

              {/* Dynamic Sample Values for Body Variables */}
              {detectedBodyVars.length > 0 ? (
                <div className="rounded-md border border-emerald-100 bg-[#EDF8F3]/60 p-3 space-y-2 dark:border-emerald-950/40 dark:bg-[#13251E]/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#176B4D] dark:text-[#359B76]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sample Values for Meta Review (Required)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Meta requires realistic sample values for each variable to evaluate template quality and prevent spam.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {detectedBodyVars.map((varNum) => (
                      <div key={varNum}>
                        <label className="block text-[11px] font-medium text-foreground mb-0.5">
                          Sample for {"{{" + varNum + "}}"} *
                        </label>
                        <Input
                          className="h-7.5 text-xs bg-white dark:bg-[#121416]"
                          onChange={(e) =>
                            setBodySamples((prev) => ({ ...prev, [varNum]: e.target.value }))
                          }
                          placeholder={`e.g. Sample ${varNum}`}
                          value={bodySamples[varNum] ?? ""}
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
                placeholder="e.g. Reply STOP to unsubscribe"
                value={footerText}
              />
              <p className="text-[10px] text-muted-foreground">
                Plain text only. Variables are not permitted in footers.
              </p>
            </div>

            {/* Buttons Component */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-4 space-y-3 dark:border-[#292C2F] dark:bg-[#121416]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interactive Buttons (Optional, max 10)
                </h4>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => handleAddButton("QUICK_REPLY")}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    + Quick Reply
                  </Button>
                  <Button
                    onClick={() => handleAddButton("URL")}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    + Website URL
                  </Button>
                  <Button
                    onClick={() => handleAddButton("PHONE_NUMBER")}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    + Call Phone
                  </Button>
                </div>
              </div>

              {buttons.length > 0 ? (
                <div className="space-y-2">
                  {buttons.map((btn) => (
                    <div
                      className="flex flex-col gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs dark:border-[#282B2E] dark:bg-[#17191B]"
                      key={btn.id}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {btn.type === "QUICK_REPLY"
                            ? "Quick Reply"
                            : btn.type === "URL"
                              ? "Website URL"
                              : "Phone Call"}
                        </span>
                        <button
                          className="text-rose-500 hover:text-rose-700"
                          onClick={() => handleRemoveButton(btn.id)}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                            Button Label (max 25)
                          </label>
                          <Input
                            className="h-7.5 text-xs bg-white dark:bg-[#121416]"
                            maxLength={25}
                            onChange={(e) => handleUpdateButton(btn.id, { text: e.target.value })}
                            value={btn.text}
                          />
                        </div>

                        {btn.type === "URL" ? (
                          <>
                            <div>
                              <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                                Website URL
                              </label>
                              <Input
                                className="h-7.5 text-xs bg-white dark:bg-[#121416]"
                                onChange={(e) => handleUpdateButton(btn.id, { url: e.target.value })}
                                placeholder="https://example.com/order/{{1}}"
                                value={btn.url ?? ""}
                              />
                            </div>
                            {btn.url?.includes("{{1}}") ? (
                              <div className="md:col-span-2">
                                <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                                  Sample URL Suffix for {"{{1}}"} *
                                </label>
                                <Input
                                  className="h-7.5 text-xs bg-white dark:bg-[#121416]"
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
                            <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                              Phone Number (with +country code)
                            </label>
                            <Input
                              className="h-7.5 text-xs bg-white dark:bg-[#121416]"
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
                <p className="text-xs text-muted-foreground italic">
                  No interactive buttons added yet.
                </p>
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
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#E4E4E7] p-4 bg-[#FAFAFA] dark:border-[#282B2E] dark:bg-[#17191B]">
          <Button disabled={createMutation.isPending} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!isValidForSubmission || createMutation.isPending}
            onClick={handleSubmit}
            type="button"
            variant="primary"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                Submitting to Meta...
              </>
            ) : (
              "Submit to Meta for Approval"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
