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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-xs font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#176B4D] dark:bg-[#359B76]" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending Review
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-[#1C1F21] dark:text-slate-300">
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
        <span className="rounded-full bg-[#F4F4F5] border border-[#E4E4E7] px-2.5 py-0.5 text-[11px] font-medium text-foreground dark:border-[#292C2F] dark:bg-[#1C1F21]">
          Marketing
        </span>
      );
    case "UTILITY":
      return (
        <span className="rounded-full bg-[#EDF8F3] border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-[#176B4D] dark:border-[#1F4D3C] dark:bg-[#13251E] dark:text-[#359B76]">
          Utility
        </span>
      );
    case "AUTHENTICATION":
      return (
        <span className="rounded-full bg-[#F4F4F5] border border-[#E4E4E7] px-2.5 py-0.5 text-[11px] font-medium text-foreground dark:border-[#292C2F] dark:bg-[#1C1F21]">
          Authentication
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[#F4F4F5] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-[#1C1F21]">
          {category}
        </span>
      );
  }
};

export function WhatsAppTemplateCard({ template }: WhatsAppTemplateCardProps) {
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

  const renderFormattedBody = (text: string) => {
    if (!text) return <span className="italic text-muted-foreground">No body text</span>;

    const parts = text.split(/({{\s*\w+\s*}})/g);
    return parts.map((part, idx) => {
      if (/^{{\s*\w+\s*}}$/.test(part)) {
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

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#E4E4E7] bg-white shadow-subtle transition-colors hover:border-[#D4D4D8] lg:flex-row dark:border-[#292C2F] dark:bg-[#121416] dark:hover:border-[#3A3E42]">
      {/* Left Column */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
              <span className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
                {template.language}
              </span>
            </div>
            {getStatusBadge(template.status)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getCategoryBadge(template.category)}
            {variables.length > 0 ? (
              <span className="rounded-full bg-[#FAFAFA] border border-[#E4E4E7] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
                {variables.length} variable{variables.length === 1 ? "" : "s"} ({variables.map((v) => `{{${v}}}`).join(", ")})
              </span>
            ) : null}
            {template.isSendable ? (
              <span className="rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-[11px] font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
                Ready to Send
              </span>
            ) : null}
          </div>

          {!template.isSendable && template.sendabilityReason ? (
            <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-[#D7685C]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{template.sendabilityReason}</span>
            </div>
          ) : null}
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <Link
            href={`/message-studio?mode=template&template=${encodeURIComponent(template.name)}&language=${encodeURIComponent(template.language)}`}
          >
            <Button className="w-full" size="sm" type="button" variant="primary">
              <Send className="h-3.5 w-3.5" />
              Use in Message Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Canvas */}
      <div className="w-full border-t border-[#E4E4E7] bg-[#F7F8FA] p-5 lg:w-[360px] lg:border-l lg:border-t-0 flex flex-col justify-center dark:border-[#292C2F] dark:bg-[#17191B]">
        <div className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          WhatsApp Preview
        </div>

        <div className="rounded-lg border border-[#E4E4E7] bg-white p-3 space-y-2 shadow-subtle dark:border-[#282C2F] dark:bg-[#1C1F21]">
          {headerFormat ? (
            <div className="rounded-md bg-[#FAFAFA] p-2 text-xs font-medium text-muted-foreground flex items-center gap-2 dark:bg-[#151719]">
              {headerFormat === "IMAGE" ? (
                <>
                  <ImageIcon className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                  <span>Header Image</span>
                </>
              ) : headerFormat === "VIDEO" ? (
                <>
                  <Video className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                  <span>Header Video</span>
                </>
              ) : headerFormat === "DOCUMENT" ? (
                <>
                  <FileText className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                  <span>Header Document</span>
                </>
              ) : (
                <span>{headerText || `HEADER (${headerFormat})`}</span>
              )}
            </div>
          ) : null}

          <div className="text-xs leading-5 text-foreground whitespace-pre-wrap">
            {renderFormattedBody(bodyText)}
          </div>

          {footerText ? (
            <p className="text-[11px] text-muted-foreground border-t border-[#F0F0F2] pt-2 dark:border-[#282C2F]">
              {footerText}
            </p>
          ) : null}

          {(buttons.length > 0 || template.urlButtons?.length) ? (
            <div className="space-y-1 border-t border-[#F0F0F2] pt-2 dark:border-[#282C2F]">
              {buttons.map((btn, idx) => (
                <div
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white py-1 px-2.5 text-center text-xs font-medium text-[#176B4D] dark:border-[#303438] dark:bg-[#121416] dark:text-[#359B76]"
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
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white py-1 px-2.5 text-center text-xs font-medium text-[#176B4D] dark:border-[#303438] dark:bg-[#121416] dark:text-[#359B76]"
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
