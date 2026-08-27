import React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { InboxSearchResponse } from "../search.types";
import { formatSearchTimestamp } from "../hooks/useSearchOrchestration";

export interface SearchThreadsSectionProps {
  isLoading: boolean;
  query: string;
  threads: InboxSearchResponse["data"];
}

export const SearchThreadsSection: React.FC<SearchThreadsSectionProps> = ({
  isLoading,
  query,
  threads,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <Inbox className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Inbox Threads</h2>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2 dark:border-[#292C2F] dark:bg-[#17191B]" key={`thread-loading-${index}`}>
              <div className="h-3.5 w-36 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
              <div className="h-3 w-full rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
            </div>
          ))
        ) : null}
        {threads.map((item) => (
          <Link
            className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:border-[#3A3E42]"
            href={`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`}
            key={item.conversation._id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.conversation.status} • unread: {item.conversation.unreadCount}
                </p>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                {formatSearchTimestamp(item.conversation.updatedAt)}
              </p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
              {item.conversation.lastMessageText || "No last message preview"}
            </p>
          </Link>
        ))}
        {query.trim() && threads.length === 0 ? (
          <p className="text-xs text-muted-foreground">No inbox threads matched.</p>
        ) : null}
      </div>
    </Card>
  );
};
