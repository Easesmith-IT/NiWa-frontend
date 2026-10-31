import React from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  MousePointerClick,
  SlidersHorizontal,
} from "lucide-react";
import { ComposerMode, MessageModeSelectorProps } from "../message-studio.types";

interface ModeCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  modes: Array<{ key: ComposerMode; label: string }>;
}

const modeCategories: ModeCategory[] = [
  {
    title: "Standard",
    icon: MessageSquare,
    modes: [
      { key: "text", label: "Text" },
      { key: "template", label: "Template" },
    ],
  },
  {
    title: "Media",
    icon: ImageIcon,
    modes: [
      { key: "image", label: "Image" },
      { key: "video", label: "Video" },
      { key: "audio", label: "Audio" },
      { key: "document", label: "Document" },
      { key: "sticker", label: "Sticker" },
    ],
  },
  {
    title: "Interactive",
    icon: MousePointerClick,
    modes: [
      { key: "button", label: "Buttons" },
      { key: "list", label: "List Menu" },
      { key: "cta_url", label: "CTA URL" },
    ],
  },
  {
    title: "Utility & Signals",
    icon: SlidersHorizontal,
    modes: [
      { key: "contact", label: "Share Contact (vCard)" },
      { key: "location", label: "Location" },
      { key: "location_request", label: "Location Request" },
      { key: "reaction", label: "Reaction" },
      { key: "typing_indicator", label: "Typing Indicator" },
    ],
  },
];

export const MessageModeSelector: React.FC<MessageModeSelectorProps> = ({
  mode,
  onModeSelect,
}) => {
  return (
    <div className="mt-3.5 space-y-2 border-t border-[#F0F0F2] pt-3.5 dark:border-[#202326]">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {modeCategories.map((category) => {
          const Icon = category.icon;
          const hasActiveMode = category.modes.some((m) => m.key === mode);

          return (
            <div
              className={`rounded-lg border p-2 transition-colors ${
                hasActiveMode
                  ? "border-[#176B4D]/30 bg-[#F4F9F6] dark:border-[#2D8A67]/30 dark:bg-[#13201A]"
                  : "border-[#E4E4E7]/60 bg-[#FAFAFA]/70 dark:border-[#24282B] dark:bg-[#151719]/60"
              }`}
              key={category.title}
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <Icon
                  className={`h-3 w-3 ${
                    hasActiveMode
                      ? "text-[#176B4D] dark:text-[#359B76]"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.title}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {category.modes.map((item) => (
                  <button
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                      item.key === mode
                        ? "bg-[#176B4D] text-white shadow-xs dark:bg-[#2D8A67]"
                        : "border border-[#E4E4E7] bg-white text-foreground hover:bg-[#F4F4F5] dark:border-[#282C2F] dark:bg-[#1A1D1F] dark:hover:bg-[#25282A]"
                    }`}
                    key={item.key}
                    onClick={() => onModeSelect(item.key)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
