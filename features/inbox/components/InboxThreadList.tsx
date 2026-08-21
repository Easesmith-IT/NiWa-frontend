import { ChevronDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import type { InboxThreadRecordV1 } from "../inbox.types";
import type { InboxFilterType } from "../hooks/useInboxState";
import { ThreadListSkeleton } from "./ThreadListSkeleton";
import { ThreadListItem } from "./ThreadListItem";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "awaiting_reply", label: "Awaiting" },
  { key: "starred", label: "Starred" },
] as const;

export interface InboxThreadListProps {
  threads: InboxThreadRecordV1[];
  isLoading: boolean;
  activeConversationId: string | null;
  filter: InboxFilterType;
  search: string;
  onFilterChange: (filter: InboxFilterType) => void;
  onSearchChange: (search: string) => void;
  onSelectConversation: (id: string) => void;
}

export function InboxThreadList({
  threads,
  isLoading,
  activeConversationId,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onSelectConversation,
}: InboxThreadListProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#E4E4E7] bg-white dark:border-[#24272A] dark:bg-[#101214]">
      {/* Header Bar: Search & Filters */}
      <div className="border-b border-[#E4E4E7] px-4 py-3.5 dark:border-[#24272A]">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Inbox</h1>
          <div className="flex items-center gap-1">
            <button
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#191C1E]"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#191C1E]"
              type="button"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 rounded-md border-[#D4D4D8] bg-[#FAFAFA] pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-primary/15 dark:border-[#303438] dark:bg-[#17191B] dark:focus:bg-[#121416]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search conversations..."
            value={search}
          />
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filterOptions.map((item) => (
            <button
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                filter === item.key
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-[#E4E4E7] bg-white text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:border-[#303438] dark:bg-[#17191B] dark:hover:bg-[#202326]",
              )}
              key={item.key}
              onClick={() => onFilterChange(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <button
            className="rounded-md border border-[#E4E4E7] bg-white px-2 py-1 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground dark:border-[#303438] dark:bg-[#17191B] dark:hover:bg-[#202326]"
            type="button"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Thread List Scroll Area */}
      <div className="niwa-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ThreadListSkeleton />
        ) : (
          threads.map((thread) => (
            <ThreadListItem
              key={thread.conversation._id}
              thread={thread}
              isActive={thread.conversation._id === activeConversationId}
              onSelect={onSelectConversation}
            />
          ))
        )}

        {!isLoading && threads.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No conversations match this view.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
