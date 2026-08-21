import React from "react";
import { ConversationsHeaderProps } from "../conversations.types";

export const ConversationsHeader: React.FC<ConversationsHeaderProps> = ({
  totalThreadsCount,
  unreadCount,
}) => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          WhatsApp Operator Inbox
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          High-concurrency chat workspace for live customer communications, template dispatch, internal notes, and labels.
        </p>
      </div>
      <div className="flex gap-2 text-xs">
        <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Threads</p>
          <p className="font-mono text-base font-semibold text-foreground">{totalThreadsCount}</p>
        </div>
        <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unread</p>
          <p className="font-mono text-base font-semibold text-[#176B4D]">
            {unreadCount}
          </p>
        </div>
      </div>
    </section>
  );
};
