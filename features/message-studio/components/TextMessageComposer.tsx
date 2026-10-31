import React, { useRef } from "react";
import { Bold, Italic, Strikethrough, Code } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { TextMessageComposerProps } from "../message-studio.types";

export const TextMessageComposer: React.FC<TextMessageComposerProps> = ({
  body,
  onBodyChange,
  previewUrl,
  onPreviewUrlChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onBodyChange(`${body}${prefix}text${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);

    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}text${suffix}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    onBodyChange(newBody);

    setTimeout(() => {
      textarea.focus();
      const cursorPosition = selected ? start + replacement.length : start + prefix.length;
      textarea.setSelectionRange(cursorPosition, selected ? cursorPosition : cursorPosition + 4);
    }, 0);
  };

  const maxChars = 4096;
  const isNearLimit = body.length > maxChars * 0.9;
  const isOverLimit = body.length > maxChars;

  return (
    <div className="space-y-2.5">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">Message Body *</label>
          <span
            className={`font-mono text-[10px] ${
              isOverLimit
                ? "font-bold text-[#C2413A]"
                : isNearLimit
                  ? "text-[#B7791F]"
                  : "text-muted-foreground"
            }`}
          >
            {body.length.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 rounded-t-md border border-b-0 border-[#E4E4E7] bg-[#F4F4F5] px-2 py-1 dark:border-[#282C2F] dark:bg-[#1A1D1F]">
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-[#25282A]"
            onClick={() => applyFormatting("*")}
            title="Bold (*text*)"
            type="button"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-[#25282A]"
            onClick={() => applyFormatting("_")}
            title="Italic (_text_)"
            type="button"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-[#25282A]"
            onClick={() => applyFormatting("~")}
            title="Strikethrough (~text~)"
            type="button"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-[#25282A]"
            onClick={() => applyFormatting("```")}
            title="Monospace (```text```)"
            type="button"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <span className="ml-auto text-[10px] text-muted-foreground">WhatsApp Markdown</span>
        </div>

        <Textarea
          className="min-h-28 rounded-t-none text-xs"
          onChange={(event) => onBodyChange(event.target.value)}
          placeholder="Enter text message content..."
          ref={textareaRef}
          value={body}
        />
      </div>

      <label className="flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 text-xs text-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
        <input
          checked={previewUrl}
          className="h-3.5 w-3.5 rounded accent-[#176B4D]"
          onChange={(event) => onPreviewUrlChange(event.target.checked)}
          type="checkbox"
        />
        Enable URL preview link cards
      </label>
    </div>
  );
};
