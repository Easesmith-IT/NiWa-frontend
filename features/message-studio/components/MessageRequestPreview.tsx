"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Code2 } from "lucide-react";

export interface MessageRequestPreviewProps {
  requestPreview: unknown;
  responsePreview: unknown;
}

export const MessageRequestPreview: React.FC<MessageRequestPreviewProps> = ({
  requestPreview,
  responsePreview,
}) => {
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const hasRequest = requestPreview !== null && requestPreview !== undefined;
  const hasResponse = responsePreview !== null && responsePreview !== undefined;

  const handleCopy = (data: unknown, setCopied: (v: boolean) => void) => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Request Payload */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Request Payload (Outgoing)
            </p>
          </div>
          {hasRequest && (
            <button
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#202326]"
              onClick={() => handleCopy(requestPreview, setCopiedRequest)}
              type="button"
            >
              {copiedRequest ? (
                <>
                  <Check className="h-3 w-3 text-[#16803C]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy JSON
                </>
              )}
            </button>
          )}
        </div>

        {hasRequest ? (
          <pre className="max-h-56 overflow-auto rounded-md bg-[#0F1112] p-2.5 font-mono text-[11px] leading-relaxed text-[#E4E4E7]">
            {JSON.stringify(requestPreview, null, 2)}
          </pre>
        ) : (
          <div className="rounded-md border border-dashed border-[#E4E4E7] p-4 text-center text-xs text-muted-foreground dark:border-[#282C2F]">
            Payload will generate automatically when dispatched.
          </div>
        )}
      </div>

      {/* Response Payload */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meta Graph API Response
            </p>
          </div>
          {hasResponse && (
            <button
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#202326]"
              onClick={() => handleCopy(responsePreview, setCopiedResponse)}
              type="button"
            >
              {copiedResponse ? (
                <>
                  <Check className="h-3 w-3 text-[#16803C]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy JSON
                </>
              )}
            </button>
          )}
        </div>

        {hasResponse ? (
          <pre className="max-h-56 overflow-auto rounded-md bg-[#0F1112] p-2.5 font-mono text-[11px] leading-relaxed text-[#E4E4E7]">
            {JSON.stringify(responsePreview, null, 2)}
          </pre>
        ) : (
          <div className="rounded-md border border-dashed border-[#E4E4E7] p-4 text-center text-xs text-muted-foreground dark:border-[#282C2F]">
            No response received yet. Send a message to view the Meta Graph response.
          </div>
        )}
      </div>
    </div>
  );
};
