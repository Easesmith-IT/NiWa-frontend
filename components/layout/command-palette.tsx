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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(17,24,21,0.36)] px-4 pb-6 pt-[8vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_24px_90px_rgba(25,34,29,0.18)]">
        <div className="border-b border-border/80 px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-11 border-0 bg-transparent pl-10 text-[15px] shadow-none focus:border-0"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts, conversations, notes, or jump to a page"
              value={query}
            />
          </div>
        </div>

        <div className="grid max-h-[70vh] gap-0 overflow-hidden md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-border/80 md:border-b-0 md:border-r">
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Actions
            </div>
            <div className="niwa-scrollbar max-h-[56vh] overflow-y-auto px-2 pb-3">
              {filteredActions.map((action) => (
                <button
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-accent focus:bg-accent focus:outline-none"
                  key={`${action.href}-${action.label}`}
                  onClick={() => goTo(action.href)}
                  type="button"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Search Results
            </div>
            <div className="niwa-scrollbar max-h-[56vh] overflow-y-auto px-2 pb-3">
              {!query.trim() ? (
                <div className="px-3 py-8 text-sm text-muted-foreground">
                  Use <span className="font-medium text-foreground">Ctrl/Cmd + K</span> to jump
                  between modules or search operational records.
                </div>
              ) : null}

              {(searchQuery.data?.data.conversations ?? []).map((item) => (
                <button
                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-accent"
                  key={item.conversation._id}
                  onClick={() => goTo(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                    </p>
                    <span className="text-xs text-muted-foreground">Conversation</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.conversation.lastMessageText || "No recent message"}
                  </p>
                </button>
              ))}

              {(searchQuery.data?.data.contacts ?? []).map((item) => (
                <button
                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-accent"
                  key={item.contact._id}
                  onClick={() => goTo("/contacts")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{item.contact.displayName}</p>
                    <span className="text-xs text-muted-foreground">Contact</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.contact.phoneNumber}
                    {item.contact.company ? ` • ${item.contact.company}` : ""}
                  </p>
                </button>
              ))}

              {query.trim() && !searchQuery.isPending && searchQuery.data && (
                <div
                  className={cn(
                    "px-3 py-6 text-sm text-muted-foreground",
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
                <div className="px-3 py-6 text-sm text-muted-foreground">Searching…</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/80 px-5 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Command className="h-3.5 w-3.5" />
            Quick navigation and record lookup
          </span>
          <button className="font-medium text-foreground" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
