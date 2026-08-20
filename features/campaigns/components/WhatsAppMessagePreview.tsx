"use client";

import React from "react";
import { CheckCheck, ExternalLink, Image as ImageIcon, Phone, Video } from "lucide-react";

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface MetaTemplate {
  _id: string;
  name: string;
  language: string;
  category?: string;
  status?: string;
  components?: TemplateComponent[];
}

interface WhatsAppMessagePreviewProps {
  template: MetaTemplate | null;
  variableValues?: Record<string, string>;
  senderName?: string;
}

export const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({
  template,
  variableValues = {},
  senderName = "Easesmith IT",
}) => {
  if (!template) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center text-sm text-gray-400">
        <p className="font-medium text-gray-500">No template selected</p>
        <p className="mt-1 text-xs">Select a Meta WhatsApp template to preview the message</p>
      </div>
    );
  }

  const headerComponent = template.components?.find((c) => c.type === "HEADER");
  const bodyComponent = template.components?.find((c) => c.type === "BODY");
  const footerComponent = template.components?.find((c) => c.type === "FOOTER");
  const buttonsComponent = template.components?.find((c) => c.type === "BUTTONS");

  const mediaUrl =
    variableValues["headerMediaUrl"] ||
    variableValues["mediaUrl"] ||
    variableValues["header_image"] ||
    variableValues["header_video"] ||
    variableValues["header_document"] ||
    variableValues["header"];

  // Interpolate {{1}}, {{2}} in text
  const formatTextWithVariables = (text?: string) => {
    if (!text) return "";
    return text.replace(/\{\{(\d+)\}\}/g, (match, varIndex) => {
      const mapped = variableValues[varIndex] || variableValues[`{{${varIndex}}}`];
      if (mapped) return mapped;
      return match;
    });
  };

  const formattedHeader = formatTextWithVariables(headerComponent?.text);
  const formattedBody = formatTextWithVariables(bodyComponent?.text);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-[#E5DDD5] shadow-md">
      {/* WhatsApp Chat Header */}
      <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-xs">
          {senderName.charAt(0)}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold leading-tight">{senderName}</p>
          <p className="text-[11px] text-emerald-200">WhatsApp Business</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="p-3">
        <div className="relative rounded-lg bg-white p-3.5 shadow-xs">
          {/* Header Media / Text */}
          {headerComponent && (
            <div className="mb-2">
              {headerComponent.format === "IMAGE" && (
                mediaUrl ? (
                  <div className="overflow-hidden rounded-md border bg-gray-100">
                    <img src={mediaUrl} alt="Header Preview" className="h-36 w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                    <span className="ml-2 text-xs font-medium">Header Image</span>
                  </div>
                )
              )}
              {headerComponent.format === "VIDEO" && (
                mediaUrl ? (
                  <div className="overflow-hidden rounded-md border bg-gray-100">
                    <video src={mediaUrl} controls className="h-36 w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
                    <Video className="h-8 w-8" />
                    <span className="ml-2 text-xs font-medium">Header Video</span>
                  </div>
                )
              )}
              {headerComponent.format === "DOCUMENT" && (
                <div className="flex items-center rounded-md bg-gray-100 p-2.5 text-xs font-medium text-gray-600">
                  📄 {mediaUrl ? "Document Attachment Linked" : "Attachment Document"}
                </div>
              )}
              {headerComponent.format === "TEXT" && formattedHeader && (
                <p className="text-sm font-bold text-gray-900">{formattedHeader}</p>
              )}
            </div>
          )}

          {/* Body Text */}
          {formattedBody && (
            <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{formattedBody}</p>
          )}

          {/* Footer Text */}
          {footerComponent?.text && (
            <p className="mt-2 text-[11px] text-gray-400">{footerComponent.text}</p>
          )}

          {/* Time & Double Checkmark */}
          <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-gray-400">
            <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          {/* Buttons */}
          {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
            <div className="-mx-3.5 -mb-3.5 mt-3 divide-y border-t border-gray-100">
              {buttonsComponent.buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-center text-xs font-semibold text-[#00A884]"
                >
                  {btn.type === "URL" && <ExternalLink className="h-3.5 w-3.5" />}
                  {btn.type === "PHONE_NUMBER" && <Phone className="h-3.5 w-3.5" />}
                  <span>{btn.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
