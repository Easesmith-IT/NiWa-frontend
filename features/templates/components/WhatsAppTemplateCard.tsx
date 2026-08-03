"use client";

import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import type { TemplateRecord } from "../../../lib/api/types";

interface WhatsAppTemplateCardProps {
  template: TemplateRecord;
}

const getStatusBadge = (status: string) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8f0] px-2.5 py-0.5 text-xs font-semibold text-[#244b42]">
          <span className="h-2 w-2 rounded-full bg-[#2d644d]" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff8e6] px-2.5 py-0.5 text-xs font-semibold text-[#8a6212]">
          <span className="h-2 w-2 rounded-full bg-[#d4991c]" />
          Pending Review
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0ee] px-2.5 py-0.5 text-xs font-semibold text-[#9a3d33]">
          <span className="h-2 w-2 rounded-full bg-[#d94838]" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {status}
        </span>
      );
  }
};

const getCategoryBadge = (category: string) => {
  const cat = category.toUpperCase();
  switch (cat) {
    case "MARKETING":
      return (
        <span className="rounded-full bg-[#e0e8f5] px-2.5 py-0.5 text-xs font-medium text-[#2b5288]">
          Marketing
        </span>
      );
    case "UTILITY":
      return (
        <span className="rounded-full bg-[#e6eee6] px-2.5 py-0.5 text-xs font-medium text-[#2d644d]">
          Utility
        </span>
      );
    case "AUTHENTICATION":
      return (
        <span className="rounded-full bg-[#eee0f5] px-2.5 py-0.5 text-xs font-medium text-[#632b88]">
          Authentication
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {category}
        </span>
      );
  }
};

export function WhatsAppTemplateCard({ template }: WhatsAppTemplateCardProps) {
  // Extract components
  const headerComp = template.components?.find((c) => c.type === "HEADER");
  const bodyComp = template.components?.find((c) => c.type === "BODY");
  const footerComp = template.components?.find((c) => c.type === "FOOTER");
  const buttonsComp = template.components?.find((c) => c.type === "BUTTONS");

  const headerFormat = headerComp?.format || template.headerFormat;
  const headerText = headerComp?.text;
  const bodyText = bodyComp?.text || "";
  const footerText = footerComp?.text || template.footerText;
  const buttons = buttonsComp?.buttons || [];

  const variables = template.bodyVariables?.length
    ? template.bodyVariables
    : template.variables;

  // Format body text with highlighted variables
  const renderFormattedBody = (text: string) => {
    if (!text) return <span className="italic text-[#7a8b82]">No body text</span>;

    const parts = text.split(/({{\s*\w+\s*}})/g);
    return parts.map((part, idx) => {
      if (/^{{\s*\w+\s*}}$/.test(part)) {
        return (
          <span
            className="mx-0.5 inline-flex items-center rounded-md bg-[#2d644d]/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#164231]"
            key={idx}
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e5ddd3] bg-white shadow-sm transition hover:shadow-md lg:flex-row">
      {/* Left Metadata Column */}
      <div className="flex flex-1 flex-col justify-between p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#25342f]">{template.name}</h3>
              <span className="rounded-md border border-[#ddd2c3] bg-[#fbf7f1] px-2 py-0.5 text-[11px] font-mono font-medium text-[#4f6258]">
                {template.language}
              </span>
            </div>
            {getStatusBadge(template.status)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getCategoryBadge(template.category)}
            {variables.length > 0 ? (
              <span className="rounded-full bg-[#f4efe6] px-2.5 py-0.5 text-xs font-medium text-[#735d2d]">
                {variables.length} variable{variables.length === 1 ? "" : "s"} ({variables.map((v) => `{{${v}}}`).join(", ")})
              </span>
            ) : null}
            {template.isSendable ? (
              <span className="rounded-full bg-[#eef8f0] px-2.5 py-0.5 text-xs font-medium text-[#244b42]">
                Ready to Send
              </span>
            ) : null}
          </div>

          {!template.isSendable && template.sendabilityReason ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#f3d3d3] bg-[#fdeaea] px-3.5 py-2 text-xs text-[#9d3434]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{template.sendabilityReason}</span>
            </div>
          ) : null}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/message-studio?mode=template&template=${encodeURIComponent(template.name)}&language=${encodeURIComponent(template.language)}`}
          >
            <Button className="w-full bg-[#2d644d] text-white hover:bg-[#255440]" type="button">
              <Send className="mr-2 h-4 w-4" />
              Use in Message Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Right WhatsApp Mobile Preview Canvas */}
      <div className="w-full border-t border-[#e5ddd3] bg-[#f7f0e7] p-6 lg:w-[380px] lg:border-l lg:border-t-0 flex flex-col justify-center">
        <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a8b82]">
          WhatsApp Mobile Preview
        </div>

        {/* Authentic WhatsApp Chat Bubble */}
        <div className="overflow-hidden rounded-2xl border border-[#d8ccbc] bg-[#fffdf9] shadow-md space-y-3 p-4">
          {/* Header Preview */}
          {headerFormat ? (
            <div className="rounded-xl bg-[#f4efe6] p-2.5 text-xs font-semibold text-[#44534d] flex items-center gap-2">
              {headerFormat === "IMAGE" ? (
                <>
                  <ImageIcon className="h-4 w-4 text-[#2d644d]" />
                  <span>Header Image</span>
                </>
              ) : headerFormat === "VIDEO" ? (
                <>
                  <Video className="h-4 w-4 text-[#2d644d]" />
                  <span>Header Video</span>
                </>
              ) : headerFormat === "DOCUMENT" ? (
                <>
                  <FileText className="h-4 w-4 text-[#2d644d]" />
                  <span>Header Document</span>
                </>
              ) : (
                <span>{headerText || `HEADER (${headerFormat})`}</span>
              )}
            </div>
          ) : null}

          {/* Body Text */}
          <div className="text-xs leading-relaxed text-[#25342f] whitespace-pre-wrap">
            {renderFormattedBody(bodyText)}
          </div>

          {/* Footer Text */}
          {footerText ? (
            <p className="text-[11px] text-[#7a8b82] border-t border-[#eee4d8] pt-2">
              {footerText}
            </p>
          ) : null}

          {/* Buttons Preview */}
          {buttons.length > 0 || template.urlButtons?.length ? (
            <div className="space-y-1.5 border-t border-[#eee4d8] pt-2.5">
              {buttons.map((btn, idx) => (
                <div
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e0d5c5] bg-white py-1.5 px-3 text-center text-xs font-medium text-[#2d644d] shadow-2xl"
                  key={idx}
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
              {template.urlButtons?.map((btn) => (
                <div
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e0d5c5] bg-white py-1.5 px-3 text-center text-xs font-medium text-[#2d644d] shadow-2xl"
                  key={btn.index}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{btn.text}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
