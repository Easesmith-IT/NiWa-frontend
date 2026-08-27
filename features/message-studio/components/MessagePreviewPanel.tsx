import React from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import { ComposerMode } from "../message-studio.types";
import { MediaRecord } from "../../../lib/api/types";
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
}

export const MessagePreviewPanel: React.FC<MessagePreviewPanelProps> = ({
  commonTo,
  mode,
  previewSummary,
  selectedMedia,
  selectedTemplateHeaderMedia,
  requestPreview,
  responsePreview,
}) => {
  return (
    <section className="bg-[#FAFAFA] p-4 border-t lg:border-t-0 border-[#E4E4E7] dark:border-[#292C2F] dark:bg-[#17191B]">
      <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
          <p className="text-xs font-semibold text-foreground">
            Device Preview & Telemetry
          </p>
        </div>
        {responsePreview ? (
          <span className="inline-flex items-center rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-[10px] font-semibold text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Sent 200 OK
          </span>
        ) : null}
      </div>

      <div
        className="mx-auto mt-4 max-w-[280px] rounded-xl border border-[#E4E4E7] p-3 shadow-subtle bg-repeat bg-center dark:border-[#292C2F]"
        style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "300px" }}
      >
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-2.5 dark:border-[#282C2F] dark:bg-[#1C1F21]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">WhatsApp Business</p>
          <p className="font-mono text-xs font-semibold text-foreground">{commonTo || "+91..."}</p>
        </div>

        <div className="mt-3 min-h-[160px] rounded-lg bg-[#EDF8F3] p-3 border border-[#C4E8DA] dark:border-[#203D31] dark:bg-[#14251E]">
          <p className="whitespace-pre-wrap text-xs text-foreground leading-relaxed dark:text-[#E8F3EE]">
            {previewSummary}
          </p>
          {mode !== "template" && selectedMedia ? (
            <div className="mt-2 rounded bg-white p-2 text-[11px] border border-[#E4E4E7] dark:border-[#282C2F] dark:bg-[#1C1F21]">
              <span className="font-mono font-medium">{getMediaDisplayName(selectedMedia)}</span>
            </div>
          ) : null}
          {mode === "template" && selectedTemplateHeaderMedia ? (
            <div className="mt-2 rounded bg-white p-2 text-[11px] border border-[#E4E4E7] dark:border-[#282C2F] dark:bg-[#1C1F21]">
              <span className="font-mono font-medium">
                Header media: {getMediaDisplayName(selectedTemplateHeaderMedia)}
              </span>
            </div>
          ) : null}
          <p className="mt-2 text-right text-[9px] text-[#34B7F1] dark:text-[#53BDEB] font-semibold">12:00 PM ✓✓</p>
        </div>
      </div>

      <MessageRequestPreview
        requestPreview={requestPreview}
        responsePreview={responsePreview}
      />
    </section>
  );
};
