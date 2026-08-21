import { RefObject } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { MessageRecordV1 } from "../inbox.types";
import { ChatMessageItem } from "./ChatMessageItem";

export interface ChatMessageListProps {
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  isLoadingNextBatch: boolean;
  paginationError: string | null;
  retryLoadOlder: () => Promise<void>;
  hasMoreOlderMessages: boolean;
  isLoadingDetail: boolean;
  messageGroups: Array<{ day: string; messages: MessageRecordV1[] }>;
  showJumpToBottom: boolean;
  newMessageCount: number;
  onJumpToBottom: () => void;
  onImageClick: (messageId: string) => void;
}

export function ChatMessageList({
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  isLoadingNextBatch,
  paginationError,
  retryLoadOlder,
  hasMoreOlderMessages,
  isLoadingDetail,
  messageGroups,
  showJumpToBottom,
  newMessageCount,
  onJumpToBottom,
  onImageClick,
}: ChatMessageListProps) {
  return (
    <div
      className="niwa-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4 relative bg-repeat bg-center bg-[#F7F8FA] dark:bg-[#101312] dark:bg-blend-multiply"
      onScroll={onScroll}
      ref={messagesContainerRef}
      style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "450px" }}
    >
      {isLoadingNextBatch ? (
        <div className="flex justify-center pb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 backdrop-blur px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-xs">
            <RefreshCw className="h-3 w-3 animate-spin text-primary" />
            <span>Loading earlier messages...</span>
          </div>
        </div>
      ) : paginationError ? (
        <div className="flex justify-center pb-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1 text-xs font-semibold text-destructive shadow-xs">
            <span>{paginationError}</span>
            <button
              type="button"
              onClick={() => void retryLoadOlder()}
              className="font-bold underline underline-offset-2 hover:opacity-80 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !hasMoreOlderMessages && !isLoadingDetail && messageGroups.length > 0 ? (
        <div className="flex justify-center pb-3">
          <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide uppercase">
            Beginning of conversation
          </span>
        </div>
      ) : null}

      {isLoadingDetail ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className={cn(
                "h-16 w-[60%] animate-pulse rounded-lg bg-[#E4E4E7] dark:bg-[#1B1D20]",
                index % 2 === 0 ? "ml-auto" : "",
              )}
              key={index}
            />
          ))}
        </div>
      ) : null}

      {!isLoadingDetail && messageGroups.length === 0 ? (
        <div className="flex h-full min-h-[200px] items-center justify-center">
          <div className="rounded-lg border border-[#E4E4E7] bg-white px-5 py-4 text-center dark:border-[#303438] dark:bg-[#121416]">
            <p className="text-xs font-medium text-foreground">No messages in this thread yet.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Messages will appear here in real-time.
            </p>
          </div>
        </div>
      ) : null}

      {messageGroups.map((group) => (
        <div className="mb-5" key={group.day}>
          <div className="mb-3 flex justify-center">
            <span className="rounded-full border border-[#E4E4E7] bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
              {group.day}
            </span>
          </div>
          <div className="space-y-2">
            {group.messages.map((message) => (
              <ChatMessageItem key={message._id} message={message} onImageClick={onImageClick} />
            ))}
          </div>
        </div>
      ))}

      {(showJumpToBottom || newMessageCount > 0) && (
        <button
          type="button"
          onClick={onJumpToBottom}
          className="absolute bottom-4 right-8 z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          <span>
            {newMessageCount > 0
              ? `${newMessageCount} new message${newMessageCount > 1 ? "s" : ""}`
              : "Jump to bottom"}
          </span>
        </button>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
