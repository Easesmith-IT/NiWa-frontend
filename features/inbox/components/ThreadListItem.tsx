import { cn } from "../../../lib/utils";
import { withDisplayPhoneNumber } from "../../shared/mappers";
import type { InboxThreadRecordV1 } from "../inbox.types";
import { formatConversationTime } from "../utils/formatters";
import { ContactAvatar } from "./ContactAvatar";

export interface ThreadListItemProps {
  thread: InboxThreadRecordV1;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function ThreadListItem({ thread, isActive, onSelect }: ThreadListItemProps) {
  const effectiveUnreadCount = isActive ? 0 : thread.conversation.unreadCount;
  const rawName =
    thread.contact?.displayName ||
    thread.contact?.profileName ||
    thread.contact?.phoneNumber ||
    thread.conversation.waId;
  const displayName = withDisplayPhoneNumber(rawName) ?? rawName;

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 border-b border-[#F0F0F2] px-4 py-3 text-left transition-colors dark:border-[#202326]",
        isActive
          ? "bg-[#EDF8F3] border-l-2 border-l-[#176B4D] dark:bg-[#14251E] dark:border-l-[#3B9B77]"
          : "hover:bg-[#FAFAFA] dark:hover:bg-[#191C1E]",
      )}
      onClick={() => onSelect(thread.conversation._id)}
      type="button"
    >
      <ContactAvatar
        avatarUrl={thread.contact?.avatarUrl}
        className="h-10 w-10 shrink-0 text-xs"
        name={displayName}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-xs",
                effectiveUnreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground",
              )}
            >
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-[#71717A]">
              {thread.conversation.lastMessageText || "No messages yet."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[11px] text-[#71717A]">
              {formatConversationTime(thread.conversation.lastMessageAt || thread.conversation.updatedAt)}
            </span>
            {effectiveUnreadCount > 0 ? (
              <span className="inline-flex min-w-4.5 items-center justify-center rounded-full bg-[#176B4D] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {effectiveUnreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}
