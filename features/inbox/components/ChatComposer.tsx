import { KeyboardEvent } from "react";
import { CalendarClock, Clock3, Command, Plus, Send, Smile, Sparkles, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";

export interface QuickReplyItem {
  _id: string;
  body: string;
  isActive: boolean;
  shortcut: string;
  title: string;
  variables: string[];
}

export interface ChatComposerProps {
  composerBody: string;
  onComposerBodyChange: (value: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
  composerMenuOpen: boolean;
  onComposerMenuOpenChange: (updater: boolean | ((prev: boolean) => boolean)) => void;
  composerFeedback: { message: string; tone: "error" | "success" } | null;
  selectedQuickReply: QuickReplyItem | null;
  selectedQuickReplyId: string;
  onSelectQuickReplyId: (id: string) => void;
  selectedQuickReplyVariables: string[];
  quickReplyVariableValues: Record<string, string>;
  onQuickReplyVariableValuesChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  quickReplyPanelOpen: boolean;
  onQuickReplyPanelOpenChange: (updater: boolean | ((prev: boolean) => boolean)) => void;
  quickReplyPreview: string;
  quickReplySuggestions: QuickReplyItem[];
  onInsertQuickReply: (id?: string) => void;
  onPatchQuickReplyVars: (id: string, vars: string[]) => void;
  isPatchingQuickReply: boolean;
  scheduleDialogOpen: boolean;
  onScheduleDialogOpenChange: (open: boolean) => void;
  scheduledDate: string;
  onScheduledDateChange: (val: string) => void;
  scheduledType: "one_time" | "recurring";
  onScheduledTypeChange: (val: "one_time" | "recurring") => void;
  scheduledRule: "daily" | "monthly" | "weekly";
  onScheduledRuleChange: (val: "daily" | "monthly" | "weekly") => void;
  onScheduleMessage: () => void;
  isScheduling: boolean;
  quickReplies: QuickReplyItem[];
  contactId?: string;
}

export function ChatComposer({
  composerBody,
  onComposerBodyChange,
  onSendMessage,
  isSending,
  composerMenuOpen,
  onComposerMenuOpenChange,
  composerFeedback,
  selectedQuickReply,
  selectedQuickReplyId,
  onSelectQuickReplyId,
  selectedQuickReplyVariables,
  quickReplyVariableValues,
  onQuickReplyVariableValuesChange,
  quickReplyPanelOpen,
  onQuickReplyPanelOpenChange,
  quickReplyPreview,
  quickReplySuggestions,
  onInsertQuickReply,
  onPatchQuickReplyVars,
  isPatchingQuickReply,
  scheduleDialogOpen,
  onScheduleDialogOpenChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledType,
  onScheduledTypeChange,
  scheduledRule,
  onScheduledRuleChange,
  onScheduleMessage,
  isScheduling,
  quickReplies,
  contactId,
}: ChatComposerProps) {
  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t border-[#E4E4E7] bg-white px-4 py-2.5 dark:border-[#24272A] dark:bg-[#121416]">
      {selectedQuickReply && quickReplyPanelOpen ? (
        <div className="mb-2.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[#176B4D]" />
              Quick reply variables
            </div>
            <Button
              className="h-7 border-[#E4E4E7] bg-white text-xs hover:bg-[#F4F4F5]"
              disabled={isPatchingQuickReply}
              onClick={() => onPatchQuickReplyVars(selectedQuickReply._id, selectedQuickReplyVariables)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Sync vars
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {selectedQuickReplyVariables.map((variable) => (
              <div key={variable}>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  {variable}
                </label>
                <Input
                  className="h-8 border-[#E4E4E7] bg-white text-xs"
                  onChange={(event) =>
                    onQuickReplyVariableValuesChange((current) => ({
                      ...current,
                      [variable]: event.target.value,
                    }))
                  }
                  value={quickReplyVariableValues[variable] ?? ""}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md bg-[#F4F4F5] px-2.5 py-1.5 text-xs text-[#52525B]">
            {quickReplyPreview || "Resolved quick reply preview appears here."}
          </div>
        </div>
      ) : null}

      {quickReplySuggestions.length > 0 ? (
        <div className="mb-2.5 rounded-lg border border-[#E4E4E7] bg-white shadow-floating">
          {quickReplySuggestions.slice(0, 6).map((reply) => (
            <button
              className="block w-full border-b border-[#F0F0F2] px-3 py-2 text-left last:border-b-0 hover:bg-[#FAFAFA]"
              key={reply._id}
              onClick={() => onInsertQuickReply(reply._id)}
              type="button"
            >
              <p className="text-xs font-semibold text-foreground">{reply.shortcut}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{reply.title}</p>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
            onClick={() => onComposerMenuOpenChange((current) => !current)}
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
          {composerMenuOpen ? (
            <div className="absolute bottom-10 left-0 z-20 w-48 rounded-md border border-[#E4E4E7] bg-white p-1 shadow-floating">
              <button
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-[#F4F4F5]"
                onClick={() => {
                  onQuickReplyPanelOpenChange(true);
                  onComposerMenuOpenChange(false);
                  if (!selectedQuickReplyId && quickReplies[0]) {
                    onSelectQuickReplyId(quickReplies[0]._id);
                  }
                }}
                type="button"
              >
                Quick reply
              </button>
              <button
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-[#F4F4F5]"
                onClick={() => {
                  onScheduleDialogOpenChange(true);
                  onComposerMenuOpenChange(false);
                }}
                type="button"
              >
                Schedule message
              </button>
            </div>
          ) : null}
        </div>
        <button
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
          type="button"
        >
          <Smile className="h-4 w-4" />
        </button>
        <div className="relative min-w-0 flex-1">
          <Textarea
            className="min-h-[44px] rounded-md border-[#D4D4D8] bg-white px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            disabled={isSending}
            onChange={(event) => onComposerBodyChange(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Type a message..."
            value={composerBody}
          />
        </div>
        <button
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
          onClick={() => {
            onQuickReplyPanelOpenChange((current) => !current);
            if (!selectedQuickReplyId && quickReplies[0]) {
              onSelectQuickReplyId(quickReplies[0]._id);
            }
          }}
          type="button"
        >
          <Command className="h-4 w-4" />
        </button>
        <Button
          className="h-9 rounded-md px-3 font-medium"
          disabled={isSending || !composerBody.trim()}
          onClick={onSendMessage}
          size="sm"
          type="button"
          variant="primary"
        >
          {isSending ? (
            <Clock3 className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {composerFeedback ? (
        <div
          className={cn(
            "mt-3 rounded-md px-3 py-2 text-xs font-medium",
            composerFeedback.tone === "success"
              ? "bg-[#EDF8F3] text-[#16803C] border border-[#C4E8DA]"
              : "bg-[#FEF2F2] text-[#C2413A] border border-[#FEE2E2]",
          )}
        >
          {composerFeedback.message}
        </div>
      ) : null}

      {scheduleDialogOpen ? (
        <div className="mt-3 rounded-2xl border border-[#e2d8ca] bg-[#fffdf9] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#25342f]">Schedule message</h3>
              <p className="mt-1 text-xs text-[#7a8b82]">
                Keep scheduling contextual instead of permanent in the composer.
              </p>
            </div>
            <button
              className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
              onClick={() => onScheduleDialogOpenChange(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_130px_auto]">
            <Input
              className="border-[#ddd2c3] bg-white text-[#25342f]"
              onChange={(event) => onScheduledDateChange(event.target.value)}
              placeholder="Schedule date"
              type="date"
              value={scheduledDate}
            />
            <select
              className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
              onChange={(event) => onScheduledTypeChange(event.target.value as "one_time" | "recurring")}
              value={scheduledType}
            >
              <option value="one_time">One time</option>
              <option value="recurring">Recurring</option>
            </select>
            <select
              className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
              disabled={scheduledType !== "recurring"}
              onChange={(event) => onScheduledRuleChange(event.target.value as "daily" | "monthly" | "weekly")}
              value={scheduledRule}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <Button
              className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
              disabled={!contactId || !composerBody.trim() || !scheduledDate || isScheduling}
              onClick={onScheduleMessage}
              type="button"
              variant="secondary"
            >
              <CalendarClock className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
