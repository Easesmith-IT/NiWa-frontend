"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Command, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGlobalSearchV1Query } from "../../features/search";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { navigationGroups } from "./navigation";

interface CommandPaletteProps {
  onClose: () => void;
  open: boolean;
}

const primaryActions = [
  { href: "/inbox", label: "Open Inbox", keywords: ["conversation", "reply", "chat"] },
  { href: "/contacts", label: "Create Contact", keywords: ["customer", "directory"] },
  { href: "/automations", label: "Create Automation", keywords: ["workflow", "automation"] },
  { href: "/scheduled", label: "Schedule Message", keywords: ["queue", "follow-up"] },
  { href: "/templates", label: "Open Templates", keywords: ["whatsapp", "meta"] },
  { href: "/settings", label: "Open Settings", keywords: ["configuration", "account"] },
];

export const CommandPalette = ({ onClose, open }: CommandPaletteProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchQuery = useGlobalSearchV1Query({ limit: 5, query });

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const filteredActions = useMemo(() => {
    const source = [...primaryActions, ...navigationGroups.flatMap((group) => group.items)];
    if (!query.trim()) {
      return source.slice(0, 8);
    }

    const needle = query.toLowerCase();
    return source.filter((item) => {
      const haystack = [item.label, ...(item.keywords ?? []), item.href].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  if (!open) {
    return null;
  }

  const goTo = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pb-6 pt-[10vh] backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-modal">
        <div className="border-b border-[#E4E4E7] px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-10 border-0 bg-transparent pl-10 text-sm shadow-none focus:border-0 focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts, conversations, notes, or jump to a page..."
              value={query}
            />
          </div>
        </div>

        <div className="grid max-h-[65vh] gap-0 overflow-hidden md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#E4E4E7] md:border-b-0 md:border-r">
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions & Navigation
            </div>
            <div className="niwa-scrollbar max-h-[50vh] overflow-y-auto px-2 pb-2">
              {filteredActions.map((action) => (
                <button
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-[#F4F4F5] focus:bg-[#F4F4F5] focus:outline-none"
                  key={`${action.href}-${action.label}`}
                  onClick={() => goTo(action.href)}
                  type="button"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Search Records
            </div>
            <div className="niwa-scrollbar max-h-[50vh] overflow-y-auto px-2 pb-2">
              {!query.trim() ? (
                <div className="px-3 py-6 text-xs text-muted-foreground">
                  Use <kbd className="rounded border border-[#E4E4E7] bg-[#FAFAFA] px-1 py-0.5 font-medium text-foreground">Ctrl + K</kbd> to jump between modules.
                </div>
              ) : null}

              {(searchQuery.data?.data.conversations ?? []).map((item) => (
                <button
                  className="block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5]"
                  key={item.conversation._id}
                  onClick={() => goTo(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-foreground">
                      {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Conversation</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.conversation.lastMessageText || "No recent message"}
                  </p>
                </button>
              ))}

              {(searchQuery.data?.data.contacts ?? []).map((item) => (
                <button
                  className="block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5]"
                  key={item.contact._id}
                  onClick={() => goTo("/contacts")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-foreground">{item.contact.displayName}</p>
                    <span className="text-[11px] text-muted-foreground">Contact</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.contact.phoneNumber}
                    {item.contact.company ? ` • ${item.contact.company}` : ""}
                  </p>
                </button>
              ))}

              {query.trim() && !searchQuery.isPending && searchQuery.data && (
                <div
                  className={cn(
                    "px-3 py-6 text-xs text-muted-foreground",
                    searchQuery.data.data.contacts.length === 0 &&
                      searchQuery.data.data.conversations.length === 0 &&
                      searchQuery.data.data.messages.length === 0 &&
                      searchQuery.data.data.notes.length === 0
                      ? "block"
                      : "hidden",
                  )}
                >
                  No records matched this search.
                </div>
              )}

              {searchQuery.isPending ? (
                <div className="px-3 py-6 text-xs text-muted-foreground">Searching…</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Command className="h-3 w-3" />
            Operational search console
          </span>
          <button className="font-medium text-foreground hover:underline" onClick={onClose} type="button">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

