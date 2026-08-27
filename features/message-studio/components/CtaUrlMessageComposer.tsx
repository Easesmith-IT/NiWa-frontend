import React from "react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { CtaUrlMessageComposerProps } from "../message-studio.types";

export const CtaUrlMessageComposer: React.FC<CtaUrlMessageComposerProps> = ({
  ctaHeader,
  onCtaHeaderChange,
  ctaBody,
  onCtaBodyChange,
  ctaFooter,
  onCtaFooterChange,
  ctaDisplayText,
  onCtaDisplayTextChange,
  ctaUrl,
  onCtaUrlChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Header Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onCtaHeaderChange(event.target.value)}
          placeholder="Optional header..."
          value={ctaHeader}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Body Text *</label>
        <Textarea
          className="min-h-20 text-xs"
          onChange={(event) => onCtaBodyChange(event.target.value)}
          placeholder="CTA body message..."
          value={ctaBody}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Footer Text</label>
        <Input
          className="text-xs"
          onChange={(event) => onCtaFooterChange(event.target.value)}
          placeholder="Optional footer..."
          value={ctaFooter}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Button Display Text *</label>
        <Input
          className="text-xs"
          onChange={(event) => onCtaDisplayTextChange(event.target.value)}
          placeholder="e.g. Visit Website"
          value={ctaDisplayText}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">URL *</label>
        <Input
          className="text-xs font-mono"
          onChange={(event) => onCtaUrlChange(event.target.value)}
          placeholder="https://example.com"
          value={ctaUrl}
        />
      </div>
    </div>
  );
};
