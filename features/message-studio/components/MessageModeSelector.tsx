import React from "react";
import { ComposerMode, MessageModeSelectorProps } from "../message-studio.types";

const messageModes: Array<{ key: ComposerMode; label: string }> = [
  { key: "text", label: "Text" },
  { key: "template", label: "Template" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "document", label: "Document" },
  { key: "sticker", label: "Sticker" },
  { key: "contact", label: "Contact" },
  { key: "location", label: "Location" },
  { key: "button", label: "Buttons" },
  { key: "list", label: "List" },
  { key: "reaction", label: "Reaction" },
  { key: "cta_url", label: "CTA URL" },
  { key: "location_request", label: "Location Request" },
  { key: "typing_indicator", label: "Typing Indicator" },
];

export const MessageModeSelector: React.FC<MessageModeSelectorProps> = ({
  mode,
  onModeSelect,
}) => {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#F0F0F2] pt-3 dark:border-[#202326]">
      {messageModes.map((item) => (
        <button
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            item.key === mode
              ? "bg-[#176B4D] text-white dark:bg-[#2D8A67]"
              : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground hover:bg-[#F4F4F5] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:bg-[#202326]"
          }`}
          key={item.key}
          onClick={() => onModeSelect(item.key)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
