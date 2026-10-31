import React from "react";
import { Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { MessageStudioActionsProps } from "../message-studio.types";

export const MessageStudioActions: React.FC<MessageStudioActionsProps> = ({
  destination,
  isSending,
  onSend,
  submitError,
  selectedContact,
}) => {
  const hasDestination = Boolean(destination && destination.trim());

  return (
    <div className="space-y-2 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">Dispatch Destination</p>
          {hasDestination ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              {selectedContact && (
                <span className="text-xs font-medium text-foreground">
                  {selectedContact.displayName} •
                </span>
              )}
              <span className="font-mono text-xs font-semibold text-[#176B4D] dark:text-[#3DB687]">
                {destination}
              </span>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-[#C2413A] dark:text-[#E07A70] flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Select a contact or enter a recipient number
            </p>
          )}
        </div>

        <Button
          className="flex items-center gap-1.5 font-medium shadow-sm"
          disabled={isSending || !hasDestination}
          onClick={onSend}
          type="button"
          variant="primary"
        >
          {isSending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Dispatching...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Send Message
            </>
          )}
        </Button>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-2.5 text-xs text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FCA5A5]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{submitError}</p>
        </div>
      )}
    </div>
  );
};
