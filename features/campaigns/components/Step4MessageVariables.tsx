"use client";

import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCode, Info, Video, Image as ImageIcon, FileText } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { WhatsAppMessagePreview, MetaTemplate } from "./WhatsAppMessagePreview";

interface Step4Props {
  template: MetaTemplate | null;
  variableValues: Record<string, string>;
  setVariableValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step4MessageVariables: React.FC<Step4Props> = ({
  template,
  variableValues,
  setVariableValues,
  onNext,
  onBack,
}) => {
  const headerComponent = template?.components?.find((c) => c.type === "HEADER");
  const mediaFormat = headerComponent?.format;
  const isMediaHeader = mediaFormat === "IMAGE" || mediaFormat === "VIDEO" || mediaFormat === "DOCUMENT";

  // Extract all {{1}}, {{2}} placeholders from template text
  const extractPlaceholders = (tmpl: MetaTemplate | null): string[] => {
    if (!tmpl?.components) return [];
    const found = new Set<string>();
    tmpl.components.forEach((c) => {
      if (c.text) {
        const matches = c.text.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach((m) => found.add(m));
        }
      }
    });
    return Array.from(found).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });
  };

  const placeholders = extractPlaceholders(template);

  // Set default sample values for unmapped placeholders
  React.useEffect(() => {
    placeholders.forEach((ph, idx) => {
      if (!variableValues[ph]) {
        const sampleDefaults: Record<string, string> = {
          "{{1}}": "John Doe",
          "{{2}}": "ORD-98214",
          "{{3}}": "Valued Customer",
        };
        setVariableValues((prev) => ({
          ...prev,
          [ph]: sampleDefaults[ph] || `Sample ${idx + 1}`,
        }));
      }
    });
  }, [placeholders, setVariableValues, variableValues]);

  const handleVarChange = (ph: string, val: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [ph]: val,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <FileCode className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 4: Message Content & Variable Mapping</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Review template parameters and map dynamic variables for recipient personalization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Variable Mappings */}
        <div className="space-y-6 lg:col-span-7">
          {/* Media Header Input Field if template requires Image/Video/Document header */}
          {isMediaHeader && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Header {mediaFormat} Media Link
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Required for Media Header</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Header {mediaFormat} Direct HTTPS URL
                </label>
                <Input
                  value={variableValues["headerMediaUrl"] || ""}
                  onChange={(e) => handleVarChange("headerMediaUrl", e.target.value)}
                  placeholder={
                    mediaFormat === "IMAGE"
                      ? "https://example.com/header-image.jpg"
                      : mediaFormat === "VIDEO"
                      ? "https://example.com/header-video.mp4"
                      : "https://example.com/document.pdf"
                  }
                  className="w-full text-xs bg-white"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Enter a public HTTPS URL for the {mediaFormat.toLowerCase()} file to send in the WhatsApp message header.
                </p>
              </div>
            </div>
          )}

          {placeholders.length === 0 && !isMediaHeader ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Static Template (No Variables Required)
              </div>
              <p className="mt-1 text-emerald-700">
                This Meta template contains no variable parameters. All recipients will receive the exact message text shown in the preview.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50/60 p-3 text-xs text-blue-800 border border-blue-100">
                <Info className="h-4 w-4 shrink-0 text-blue-600" />
                Map template placeholders to contact fields or enter sample preview values.
              </div>

              {placeholders.map((ph, idx) => (
                <div key={ph} className="rounded-xl border bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      Variable {ph}
                    </span>
                    <span className="text-[11px] text-gray-400">Parameter #{idx + 1}</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Preview / Fallback Value</label>
                    <Input
                      value={variableValues[ph] || ""}
                      onChange={(e) => handleVarChange(ph, e.target.value)}
                      placeholder={`e.g. ${idx === 0 ? "Customer Name" : "Order ID"}`}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Live WhatsApp Preview</p>
            <WhatsAppMessagePreview template={template} variableValues={variableValues} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue to Schedule
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
