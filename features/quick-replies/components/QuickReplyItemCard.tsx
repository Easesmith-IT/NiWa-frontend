import React from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { QuickReplyRecordV1 } from "../quick-reply.types";

export interface QuickReplyItemCardProps {
  quickReply: QuickReplyRecordV1;
  onStartEdit: (quickReply: QuickReplyRecordV1) => void;
  onToggleActive: (quickReply: QuickReplyRecordV1) => void;
}

export const QuickReplyItemCard: React.FC<QuickReplyItemCardProps> = ({
  quickReply,
  onStartEdit,
  onToggleActive,
}) => {
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            <span className="font-mono text-[#176B4D] dark:text-[#359B76]">{quickReply.shortcut}</span> • {quickReply.title}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
            {quickReply.body}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Variables: {quickReply.variables.length > 0 ? quickReply.variables.join(", ") : "none"}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            onClick={() => onStartEdit(quickReply)}
            size="sm"
            type="button"
            variant="secondary"
          >
            Edit
          </Button>
          <Button
            onClick={() => onToggleActive(quickReply)}
            size="sm"
            type="button"
            variant="secondary"
          >
            {quickReply.isActive ? (
              <ToggleRight className="h-3.5 w-3.5 text-[#16803C] dark:text-[#3FA66F]" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {quickReply.isActive ? "Active" : "Inactive"}
          </Button>
        </div>
      </div>
    </div>
  );
};
