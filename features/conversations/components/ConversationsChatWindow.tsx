import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ConversationsChatWindowProps } from "../conversations.types";

const getInitials = (name?: string, fallback?: string) => {
  const source = name?.trim() || fallback?.trim() || "N";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const ConversationsChatWindow: React.FC<ConversationsChatWindowProps> = ({
  workspaceConversation,
  selectedConversationId,
  isClearingUnread,
  onClearUnread,
  messageListNode,
  replyComposerNode,
}) => {
  return (
    <Card className="overflow-hidden p-0 flex flex-col">
      <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] p-3.5 flex flex-wrap items-center justify-between gap-3 dark:border-[#24272A] dark:bg-[#151719]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white dark:bg-[#2D8A67]">
            {getInitials(
              workspaceConversation?.contactName,
              workspaceConversation?.contactPhoneNumber,
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              {workspaceConversation?.contactName || "Select Thread"}
            </h3>
            <p className="font-mono text-[11px] text-muted-foreground">
              {workspaceConversation?.contactPhoneNumber || "No contact selected"}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            disabled={!selectedConversationId || isClearingUnread}
            onClick={onClearUnread}
            size="sm"
            type="button"
            variant="secondary"
          >
            Clear Unread
          </Button>
        </div>
      </div>

      {messageListNode}
      {replyComposerNode}
    </Card>
  );
};
