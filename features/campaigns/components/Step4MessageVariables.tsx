"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCode, Info, Video, Image as ImageIcon, FileText, Folder, Check } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { v1ApiClient } from "../../../lib/api/v1-client";
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

  // Query uploaded media files from NiWa Media Library
  const mediaLibraryQuery = useQuery({
    queryKey: ["media-library-step4"],
    queryFn: async () => {
      const response = await v1ApiClient.get<{ media: Array<{ _id?: string; customName?: string | null; fileName: string; metaMediaId: string; mimeType: string; mediaType: string }> }>("/media");
      return response.data?.media || [];
    },
    enabled: isMediaHeader,
  });

  const mediaList = mediaLibraryQuery.data || [];
  const selectedMediaId = variableValues["headerMediaUrl"] || "";

  // Extract all {{1}}, {{2}} placeholders from template text and button URLs
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
      if (c.type === "BUTTONS" && c.buttons) {
        c.buttons.forEach((btn) => {
          if (btn.url) {
            const matches = btn.url.match(/\{\{(\d+)\}\}/g);
            if (matches) {
              matches.forEach((m) => found.add(m));
            }
          }
        });
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Header {mediaFormat} Media Link
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Required for Media Header</span>
              </div>

              {/* Option A: Pick from NiWa Media Library */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-emerald-600" />
                    Select from NiWa Media Library
                  </span>
                  {mediaLibraryQuery.isLoading && (
                    <span className="text-[10px] text-gray-400 font-normal">Loading NiWa media...</span>
                  )}
                </label>

                {mediaList.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border bg-white divide-y">
                    {mediaList.map((item) => {
                      const itemTitle = item.customName || item.fileName;
                      const isSelected = selectedMediaId === item.metaMediaId;
                      return (
                        <div
                          key={item.metaMediaId || item._id}
                          onClick={() => handleVarChange("headerMediaUrl", item.metaMediaId)}
                          className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors ${
                            isSelected ? "bg-emerald-50 text-emerald-900 font-semibold" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {item.mediaType === "IMAGE" || item.mimeType?.startsWith("image/") ? (
                              <ImageIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                            ) : item.mediaType === "VIDEO" || item.mimeType?.startsWith("video/") ? (
                              <Video className="h-4 w-4 shrink-0 text-blue-600" />
                            ) : (
                              <FileText className="h-4 w-4 shrink-0 text-purple-600" />
                            )}
                            <span className="truncate">{itemTitle}</span>
                          </div>
                          {isSelected && (
                            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="h-3 w-3 mr-0.5" /> Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">
                    {mediaLibraryQuery.isLoading ? "Fetching uploaded media..." : "No media uploaded in NiWa Media Library yet. Upload files on Content → Media page or paste an HTTPS URL below."}
                  </p>
                )}
              </div>

              <div className="relative flex items-center my-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-gray-400">OR Enter Direct URL</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Option B: Direct HTTPS Link */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Header {mediaFormat} Direct HTTPS URL or Meta Media ID
                </label>
                <Input
                  value={variableValues["headerMediaUrl"] || ""}
                  onChange={(e) => handleVarChange("headerMediaUrl", e.target.value)}
                  placeholder={
                    mediaFormat === "IMAGE"
                      ? "https://example.com/header-image.jpg or Meta Media ID"
                      : mediaFormat === "VIDEO"
                      ? "https://example.com/header-video.mp4 or Meta Media ID"
                      : "https://example.com/document.pdf or Meta Media ID"
                  }
                  className="w-full text-xs bg-white"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Enter a public HTTPS URL or select a media item from your NiWa Media Library above.
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
