"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ContactRound, Inbox, MessageSquareText, NotebookPen, Search } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useGlobalSearchV1Query, useInboxSearchV1Query } from "../../../features/search";

const formatTimestamp = (value?: string) =>
  value ? new Date(value).toLocaleString() : "No timestamp";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const canSearch = deferredQuery.length >= 2;
  const globalSearchQuery = useGlobalSearchV1Query({ limit: 8, query: canSearch ? deferredQuery : "" });
  const inboxSearchQuery = useInboxSearchV1Query({ limit: 6, query: canSearch ? deferredQuery : "" });

  const totals = globalSearchQuery.data?.data.totals;
  const isLoading = globalSearchQuery.isFetching || inboxSearchQuery.isFetching;
  const hasError = globalSearchQuery.isError || inboxSearchQuery.isError;
  const hasResults =
    (totals?.contacts ?? 0) +
      (totals?.messages ?? 0) +
      (totals?.notes ?? 0) +
      (inboxSearchQuery.data?.metadata.total ?? 0) >
    0;

  return (
    <div className="space-y-4">
      {/* Header Search Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Omni-Search Hub
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Search across contacts, inbox threads, WhatsApp message content, and internal team notes.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                className="border-0 bg-transparent px-0 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, phone number (+91...), message text, WABA ID, or note..."
                value={query}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 xl:grid-cols-2 gap-2 text-xs">
            {[
              { label: "Contacts", value: totals?.contacts ?? 0 },
              { label: "Threads", value: inboxSearchQuery.data?.metadata.total ?? 0 },
              { label: "Messages", value: totals?.messages ?? 0 },
              { label: "Notes", value: totals?.notes ?? 0 },
            ].map((item) => (
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2.5" key={item.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!query.trim() ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Enter a search term above to query all records across the system.
          </p>
        </Card>
      ) : null}
      {query.trim().length === 1 ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Enter at least 2 characters to initiate global search.
          </p>
        </Card>
      ) : null}
      {hasError ? (
        <Card className="p-4 space-y-3">
          <p className="text-xs font-medium text-[#C2413A]">
            Search query failed. Please verify API backend connection.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => void globalSearchQuery.refetch()} size="sm" type="button" variant="secondary">
              Retry Global Search
            </Button>
            <Button onClick={() => void inboxSearchQuery.refetch()} size="sm" type="button" variant="secondary">
              Retry Inbox Search
            </Button>
          </div>
        </Card>
      ) : null}
      {canSearch && !isLoading && !hasError && !hasResults ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            No contacts, threads, messages, or notes matched your search query.
          </p>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
              <Inbox className="h-4 w-4 text-[#176B4D]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Inbox Threads</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2" key={`thread-loading-${index}`}>
                    <div className="h-3.5 w-36 rounded bg-[#E4E4E7]" />
                    <div className="h-3 w-full rounded bg-[#E4E4E7]" />
                  </div>
                ))
              ) : null}
              {(inboxSearchQuery.data?.data ?? []).map((item) => (
                <Link
                  className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8]"
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
                      {formatTimestamp(item.conversation.updatedAt)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {item.conversation.lastMessageText || "No last message preview"}
                  </p>
                </Link>
              ))}
              {query.trim() && (inboxSearchQuery.data?.data.length ?? 0) === 0 ? (
                <p className="text-xs text-muted-foreground">No inbox threads matched.</p>
              ) : null}
            </div>
          </Card>

          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
              <MessageSquareText className="h-4 w-4 text-[#176B4D]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Message Content Hits</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2" key={`message-loading-${index}`}>
                    <div className="h-3.5 w-32 rounded bg-[#E4E4E7]" />
                    <div className="h-3 w-full rounded bg-[#E4E4E7]" />
                  </div>
                ))
              ) : null}
              {(globalSearchQuery.data?.data.messages ?? []).map((item) => (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3" key={item.message._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {item.contact?.displayName || item.message.from || item.message.to || "Unknown contact"}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.message.direction} • {item.message.messageType} • {item.message.status}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatTimestamp(item.message.createdAt)}</p>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs text-foreground">
                    {item.message.previewText || "No preview text"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
              <ContactRound className="h-4 w-4 text-[#176B4D]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Contacts</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2">
                  <div className="h-3.5 w-36 rounded bg-[#E4E4E7]" />
                  <div className="h-3 w-28 rounded bg-[#E4E4E7]" />
                </div>
              ) : null}
              {(globalSearchQuery.data?.data.contacts ?? []).map((item) => (
                <Link
                  className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8]"
                  href="/contacts"
                  key={item.contact._id}
                >
                  <p className="text-xs font-semibold text-foreground">{item.contact.displayName}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.contact.phoneNumber}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.contact.company || "No company"} • <span className="font-mono">{item.contact.waId}</span>
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-3.5 p-4">
            <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
              <NotebookPen className="h-4 w-4 text-[#176B4D]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Internal Notes</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2">
                  <div className="h-3.5 w-32 rounded bg-[#E4E4E7]" />
                  <div className="h-3 w-full rounded bg-[#E4E4E7]" />
                </div>
              ) : null}
              {(globalSearchQuery.data?.data.notes ?? []).map((item) => (
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3" key={item.note._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {item.contact?.displayName || "Unknown contact"}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.note.pinned ? "Pinned" : "Standard"} • {item.note.authorName}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatTimestamp(item.note.updatedAt)}</p>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs text-foreground">{item.note.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

