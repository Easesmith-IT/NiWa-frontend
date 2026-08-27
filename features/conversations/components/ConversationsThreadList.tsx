import React from "react";
import { Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ConversationsThreadListProps } from "../conversations.types";
import { ConversationsThreadItem } from "./ConversationsThreadItem";

export const ConversationsThreadList: React.FC<ConversationsThreadListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  isLoading,
}) => {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Active Threads</h3>
          <span className="rounded bg-[#E4E4E7] px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase">
            {filterMode}
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 text-xs"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search contacts..."
              value={searchQuery}
            />
          </div>
          <Button
            onClick={() => onFilterModeChange("all")}
            size="sm"
            type="button"
            variant={filterMode === "all" ? "primary" : "secondary"}
          >
            All
          </Button>
          <Button
            onClick={() => onFilterModeChange("unread")}
            size="sm"
            type="button"
            variant={filterMode === "unread" ? "primary" : "secondary"}
          >
            Unread
          </Button>
        </div>
      </div>

      <div className="max-h-[72vh] space-y-1 overflow-y-auto p-2 bg-white dark:bg-[#121416]">
        {conversations.map((conversation) => (
          <ConversationsThreadItem
            conversation={conversation}
            isActive={conversation._id === selectedConversationId}
            key={conversation._id}
            onSelect={onSelectConversation}
          />
        ))}
        {!isLoading && conversations.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center">
            No active conversations.
          </div>
        ) : null}
      </div>
    </Card>
  );
};
