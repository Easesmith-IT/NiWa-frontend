import React from "react";
import { ConversationsThreadItemProps } from "../conversations.types";

const formatShortDate = (value?: string) => {
  if (!value) {
    return "No activity";
  }

  return new Date(value).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const getInitials = (name?: string, fallback?: string) => {
  const source = name?.trim() || fallback?.trim() || "N";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const messageTypeLabel = (type: string) =>
  type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const ConversationsThreadItem: React.FC<ConversationsThreadItemProps> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const title = conversation.contactName || conversation.contactPhoneNumber;

  return (
    <button
      className={`w-full rounded-md p-3 text-left transition-colors ${
        isActive
          ? "border border-[#C4E8DA] bg-[#EDF8F3] dark:border-[#203D31] dark:bg-[#14251E]"
          : "border border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#191C1E]"
      }`}
      onClick={() => onSelect(conversation._id)}
      type="button"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#176B4D] text-xs font-semibold text-white dark:bg-[#2D8A67]">
          {getInitials(conversation.contactName, conversation.contactPhoneNumber)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{title}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {conversation.contactPhoneNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">
                {formatShortDate(conversation.lastActivityAt)}
              </p>
              {conversation.unreadCount > 0 ? (
                <span className="mt-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#176B4D] px-1 text-[10px] font-bold text-white dark:bg-[#2D8A67]">
                  {conversation.unreadCount}
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {conversation.lastMessageText || `[${messageTypeLabel(conversation.lastMessageType)}]`}
          </p>
        </div>
      </div>
    </button>
  );
};
