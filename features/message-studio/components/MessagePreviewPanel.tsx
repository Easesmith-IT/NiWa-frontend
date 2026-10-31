"use client";

import React, { useState } from "react";
import { CheckCircle2, Smartphone, Terminal, CheckCheck } from "lucide-react";
import { ComposerMode } from "../message-studio.types";
import { MediaRecord } from "../../../lib/api/types";
import type { ContactRecord } from "../../contacts/contact.types";
import { getMediaDisplayName } from "../../../lib/media";
import { MessageRequestPreview } from "./MessageRequestPreview";

export interface MessagePreviewPanelProps {
  commonTo: string;
  mode: ComposerMode;
  previewSummary: string;
  selectedMedia: MediaRecord | null;
  selectedTemplateHeaderMedia: MediaRecord | null;
  requestPreview: unknown;
  responsePreview: unknown;
  selectedContact?: ContactRecord | null;
}

export const MessagePreviewPanel: React.FC<MessagePreviewPanelProps> = ({
  commonTo,
  mode,
  previewSummary,
  selectedMedia,
  selectedTemplateHeaderMedia,
  requestPreview,
  responsePreview,
  selectedContact = null,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "telemetry">("preview");

  const recipientDisplayName = selectedContact
    ? selectedContact.displayName
    : commonTo || "WhatsApp Customer";

  return (
    <section className="border-t border-[#E4E4E7] bg-[#FAFAFA] p-4 lg:border-t-0 dark:border-[#292C2F] dark:bg-[#17191B]">
      {/* Top Header & Tab Toggle */}
      <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <div className="flex items-center rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] p-0.5 dark:border-[#282C2F] dark:bg-[#1A1D1F]">
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white text-foreground shadow-sm dark:bg-[#25282A] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("preview")}
            type="button"
          >
            <Smartphone className="h-3 w-3 text-[#176B4D] dark:text-[#359B76]" />
            Device Preview
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeTab === "telemetry"
                ? "bg-white text-foreground shadow-sm dark:bg-[#25282A] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("telemetry")}
            type="button"
          >
            <Terminal className="h-3 w-3 text-[#176B4D] dark:text-[#359B76]" />
            API Telemetry
          </button>
        </div>

        {responsePreview ? (
          <span className="inline-flex items-center rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-[10px] font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Sent 200 OK
          </span>
        ) : null}
      </div>

      {activeTab === "preview" ? (
        <div className="mt-4 flex flex-col items-center">
          {/* Realistic Phone Mockup Shell */}
          <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-[#E4E4E7] bg-[#EFEAE2] shadow-md dark:border-[#2F3438] dark:bg-[#0B141A]">
            {/* Phone WhatsApp Header */}
            <div className="flex items-center justify-between bg-[#128C7E] px-3.5 py-2.5 text-white shadow-xs dark:bg-[#1F2C34]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold text-xs text-white">
                  {recipientDisplayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-tight text-white">
                    {recipientDisplayName}
                  </p>
                  <p className="text-[10px] text-white/80 leading-tight">
                    {commonTo ? commonTo : "online"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Canvas */}
            <div className="min-h-[260px] p-3.5 flex flex-col justify-end">
              {/* WhatsApp Message Bubble */}
              <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-xs bg-[#DCF8C6] p-2.5 shadow-xs border border-[#C5E1B1] dark:border-[#1F4236] dark:bg-[#005C4B]">
                {/* Media Header Preview if available */}
                {mode === "template" && selectedTemplateHeaderMedia && (
                  <div className="mb-2 rounded bg-white/80 p-1.5 text-[10px] font-medium text-foreground dark:bg-black/30 dark:text-white">
                    🖼️ Header: {getMediaDisplayName(selectedTemplateHeaderMedia)}
                  </div>
                )}
                {mode !== "template" && selectedMedia && (
                  <div className="mb-2 rounded bg-white/80 p-1.5 text-[10px] font-medium text-foreground dark:bg-black/30 dark:text-white">
                    📎 {getMediaDisplayName(selectedMedia)}
                  </div>
                )}

                {/* Message Body */}
                <p className="whitespace-pre-wrap text-xs text-foreground leading-relaxed dark:text-[#E8F3EE]">
                  {previewSummary || "Compose a message to preview it here..."}
                </p>

                {/* Timestamp & Double Checkmarks */}
                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[#7A8B82] dark:text-[#8696A0]">
                  <span>12:00 PM</span>
                  <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Simulated Meta WhatsApp Cloud message rendering.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <MessageRequestPreview
            requestPreview={requestPreview}
            responsePreview={responsePreview}
          />
        </div>
      )}
    </section>
  );
};
