import React from "react";
import { Button } from "../../../components/ui/button";
import { MessageStudioActionsProps } from "../message-studio.types";

export const MessageStudioActions: React.FC<MessageStudioActionsProps> = ({
  destination,
  isSending,
  onSend,
  submitError,
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 pt-3 mt-3 dark:border-[#292C2F] dark:bg-[#17191B]">
        <div>
          <p className="text-xs font-semibold text-foreground">Dispatch Destination</p>
          <p className="font-mono text-xs text-muted-foreground">
            {destination || "No target number set"}
          </p>
        </div>
        <Button
          disabled={isSending}
          onClick={onSend}
          type="button"
          variant="primary"
        >
          {isSending ? "Dispatching..." : "Send Message"}
        </Button>
      </div>
      {submitError ? (
        <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">
          {submitError}
        </p>
      ) : null}
    </>
  );
};
