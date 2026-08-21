import { ReactNode } from "react";
import { MessageSquareDot, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import { withDisplayPhoneNumber } from "../../shared/mappers";
import type { InboxThreadDetailV1 } from "../inbox.types";
import { ChatWindowSkeleton } from "./ChatWindowSkeleton";
import { ContactAvatar } from "./ContactAvatar";

const messageActionLabels = [
  { action: "read" as const, label: "Mark as read" },
  { action: "pin" as const, label: "Pin conversation" },
  { action: "star" as const, label: "Star conversation" },
  { action: "archive" as const, label: "Archive conversation" },
];

export interface InboxChatWindowProps {
  detail: InboxThreadDetailV1 | null;
  isLoadingDetail: boolean;
  onOpenContactInfo: () => void;
  onUpdateAIMode: (aiMode: "AI_ACTIVE" | "AI_PAUSED" | "HUMAN_ONLY") => void;
  agents: Array<{ _id: string; isDefault?: boolean; name: string }>;
  onTransferAgent: (agentId: string) => void;
  isTransferringAgent: boolean;
  onSyncHistory: () => void;
  isSyncingHistory: boolean;
  actionsOpen: boolean;
  onActionsOpenChange: (updater: boolean | ((prev: boolean) => boolean)) => void;
  onPerformThreadAction: (
    action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
  ) => void;
  messageList: ReactNode;
  composer: ReactNode;
}

export function InboxChatWindow({
  detail,
  isLoadingDetail,
  onOpenContactInfo,
  onUpdateAIMode,
  agents,
  onTransferAgent,
  isTransferringAgent,
  onSyncHistory,
  isSyncingHistory,
  actionsOpen,
  onActionsOpenChange,
  onPerformThreadAction,
  messageList,
  composer,
}: InboxChatWindowProps) {
  if (isLoadingDetail) {
    return (
      <section className="flex min-h-0 flex-col bg-[#F7F8FA] relative">
        <ChatWindowSkeleton />
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="flex min-h-0 flex-col bg-[#F7F8FA] relative">
        <div className="flex h-full items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF8F3] text-[#176B4D]">
              <MessageSquareDot className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              NiWa Operational Desk
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a conversation to manage communication and customer context.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-col bg-[#F7F8FA] relative">
      {/* Header Bar */}
      <div className="relative flex h-14 items-center justify-between border-b border-[#E4E4E7] bg-white px-4 dark:border-[#24272A] dark:bg-[#121416]">
        <button
          className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#191C1E]"
          onClick={onOpenContactInfo}
          type="button"
        >
          <ContactAvatar
            avatarUrl={detail.contact.avatarUrl}
            className="h-9 w-9 shrink-0 text-xs"
            name={detail.contact.displayName}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {withDisplayPhoneNumber(detail.contact.displayName) ?? detail.contact.displayName}
              </p>
              {(() => {
                const closesAt = detail.conversation.customerServiceWindowClosesAt;
                if (!closesAt) return null;
                const closeDate = new Date(closesAt);
                const now = new Date();
                const diffMs = closeDate.getTime() - now.getTime();

                if (diffMs <= 0) {
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                      24h Expired
                    </span>
                  );
                }

                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                return (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8F3] border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-[#176B4D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#176B4D] animate-pulse" />
                    24h Active ({hours}h {mins}m)
                  </span>
                );
              })()}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {withDisplayPhoneNumber(detail.contact.phoneNumber || detail.conversation.waId)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            {(() => {
              const currentAiMode =
                detail.conversation.aiMode ||
                detail.conversation.metadata?.aiMode ||
                "AI_ACTIVE";
              return (
                <select
                  className={cn(
                    "h-7 rounded-md border px-2 text-xs font-semibold transition-colors focus:ring-2 focus:ring-emerald-500/20",
                    currentAiMode === "AI_ACTIVE"
                      ? "border-emerald-300 bg-[#EDF8F3] text-[#176B4D] dark:border-emerald-800 dark:bg-[#14251E] dark:text-[#2D8A67]"
                      : currentAiMode === "AI_PAUSED"
                        ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                  )}
                  onChange={(e) => {
                    const nextMode = e.target.value as "AI_ACTIVE" | "AI_PAUSED" | "HUMAN_ONLY";
                    onUpdateAIMode(nextMode);
                  }}
                  value={currentAiMode}
                >
                  <option value="AI_ACTIVE">◆ AI Active</option>
                  <option value="AI_PAUSED">⏸ AI Paused</option>
                  <option value="HUMAN_ONLY">👤 Human Only</option>
                </select>
              );
            })()}

            {/* Assigned AI Agent Selector Dropdown */}
            {(() => {
              if (agents.length === 0) return null;

              const defaultAgent = agents.find((a) => a.isDefault) || agents[0];
              const assignedAgentId = detail.conversation.assignedAgentId
                ? typeof detail.conversation.assignedAgentId === "object"
                  ? detail.conversation.assignedAgentId._id
                  : detail.conversation.assignedAgentId
                : defaultAgent?._id || "";

              return (
                <select
                  className="h-7 rounded-md border border-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800/80 px-2.5 py-1 text-xs font-bold text-indigo-950 shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                  value={assignedAgentId}
                  disabled={isTransferringAgent}
                  title="Select assigned AI Agent instance for this conversation"
                  onChange={(e) => {
                    onTransferAgent(e.target.value);
                  }}
                >
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      🤖 {agent.name} {agent.isDefault ? "⭐ (Default)" : ""}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>

          <button
            className="flex items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white px-2.5 py-1 text-xs font-medium text-[#52525B] transition-colors hover:border-[#D4D4D8] hover:bg-[#FAFAFA] disabled:opacity-50"
            disabled={isSyncingHistory}
            onClick={onSyncHistory}
            title="Sync & Reconcile Chat History"
            type="button"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-[#71717A]", isSyncingHistory && "animate-spin")} />
            <span>{isSyncingHistory ? "Syncing..." : "Sync History"}</span>
          </button>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
              onClick={() => onActionsOpenChange((current) => !current)}
              type="button"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {actionsOpen ? (
              <div className="absolute right-0 top-10 z-20 w-48 rounded-md border border-[#E4E4E7] bg-white p-1 shadow-floating">
                {messageActionLabels.map((item) => (
                  <button
                    className="block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-[#F4F4F5]"
                    key={item.action}
                    onClick={() =>
                      onPerformThreadAction(
                        item.action === "pin" && detail.conversation.pinnedAt
                          ? "unpin"
                          : item.action === "star" && detail.conversation.starred
                            ? "unstar"
                            : item.action === "archive" && detail.conversation.status === "archived"
                              ? "unarchive"
                              : item.action,
                      )
                    }
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Message History Container */}
      {messageList}

      {/* Composer Area */}
      {composer}
    </section>
  );
}
