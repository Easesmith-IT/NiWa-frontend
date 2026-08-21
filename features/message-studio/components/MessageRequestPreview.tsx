import React from "react";

export interface MessageRequestPreviewProps {
  requestPreview: unknown;
  responsePreview: unknown;
}

export const MessageRequestPreview: React.FC<MessageRequestPreviewProps> = ({
  requestPreview,
  responsePreview,
}) => {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Request JSON Payload
        </p>
        <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
          {JSON.stringify(requestPreview, null, 2)}
        </pre>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Meta Graph API Response
        </p>
        <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
          {JSON.stringify(responsePreview, null, 2)}
        </pre>
      </div>
    </div>
  );
};
