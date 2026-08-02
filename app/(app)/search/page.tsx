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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(125deg,rgba(20,49,42,0.96),rgba(215,196,142,0.88))] p-6 text-[#f8f1de] shadow-[0_18px_50px_rgba(44,56,38,0.16)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e8dcc0]">
          Search
        </p>
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px] xl:items-end">
          <div>
            <h1 className="text-3xl font-semibold">Find the thread before the customer waits</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#efe6d2]">
              Search across contacts, inbox threads, messages, and notes from one operator surface.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-[1.6rem] bg-[rgba(255,248,234,0.16)] px-4 py-3 backdrop-blur">
              <Search className="h-4 w-4 text-[#f8f1de]" />
              <Input
                className="border-0 bg-transparent px-0 text-[#f8f1de] placeholder:text-[#f1e6cf] focus-visible:ring-0"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, phone, message text, waId, or note content"
                value={query}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Contacts", value: totals?.contacts ?? 0 },
              { label: "Threads", value: inboxSearchQuery.data?.metadata.total ?? 0 },
              { label: "Messages", value: totals?.messages ?? 0 },
              { label: "Notes", value: totals?.notes ?? 0 },
            ].map((item) => (
              <div className="rounded-[1.5rem] bg-[rgba(255,248,234,0.14)] px-4 py-4" key={item.label}>
                <p className="text-xs uppercase tracking-[0.2em] text-[#eadfca]">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!query.trim() ? (
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            Enter a search term to load cross-module results.
          </p>
        </Card>
      ) : null}
      {query.trim().length === 1 ? (
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            Add one more character to search across the inbox and customer records.
          </p>
        </Card>
      ) : null}
      {hasError ? (
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <p className="text-sm text-red-600">
            Search failed. Check the API connection and try again.
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => void globalSearchQuery.refetch()} type="button" variant="secondary">
              Retry global search
            </Button>
            <Button onClick={() => void inboxSearchQuery.refetch()} type="button" variant="secondary">
              Retry inbox search
            </Button>
          </div>
        </Card>
      ) : null}
      {canSearch && !isLoading && !hasError && !hasResults ? (
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            No contacts, threads, messages, or notes matched this search.
          </p>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Inbox matches
                </p>
                <h2 className="mt-1 text-lg font-semibold">Threads to reopen</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={`thread-loading-${index}`}>
                    <div className="h-4 w-40 animate-pulse rounded bg-[#e8dcc4]" />
                    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-[#efe4cf]" />
                    <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#efe4cf]" />
                  </div>
                ))
              ) : null}
              {(inboxSearchQuery.data?.data ?? []).map((item) => (
                <Link
                  className="block rounded-[1.4rem] border border-transparent bg-[#faf7ef] p-4 transition hover:border-[#d8ccb2] hover:bg-white"
                  href={`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`}
                  key={item.conversation._id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {item.conversation.status} | unread {item.conversation.unreadCount}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(item.conversation.updatedAt)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.conversation.lastMessageText || "No last message text stored"}
                  </p>
                </Link>
              ))}
              {query.trim() && (inboxSearchQuery.data?.data.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No inbox threads matched this query.</p>
              ) : null}
            </div>
          </Card>

          <Card className="border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Messages
                </p>
                <h2 className="mt-1 text-lg font-semibold">Content hits</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={`message-loading-${index}`}>
                    <div className="h-4 w-36 animate-pulse rounded bg-[#e8dcc4]" />
                    <div className="mt-3 h-3 w-32 animate-pulse rounded bg-[#efe4cf]" />
                    <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#efe4cf]" />
                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-[#efe4cf]" />
                  </div>
                ))
              ) : null}
              {(globalSearchQuery.data?.data.messages ?? []).map((item) => (
                <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={item.message._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.contact?.displayName || item.message.from || item.message.to || "Unknown contact"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {item.message.direction} | {item.message.messageType} | {item.message.status}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(item.message.createdAt)}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                    {item.message.previewText || "No preview text"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <ContactRound className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contacts
                </p>
                <h2 className="mt-1 text-lg font-semibold">People and accounts</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="rounded-[1.4rem] bg-[#faf7ef] p-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-[#e8dcc4]" />
                  <div className="mt-3 h-3 w-32 animate-pulse rounded bg-[#efe4cf]" />
                </div>
              ) : null}
              {(globalSearchQuery.data?.data.contacts ?? []).map((item) => (
                <Link
                  className="block rounded-[1.4rem] bg-[#faf7ef] p-4 transition hover:bg-white"
                  href="/contacts"
                  key={item.contact._id}
                >
                  <p className="text-sm font-semibold text-foreground">{item.contact.displayName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.contact.phoneNumber}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.contact.company || "No company"} | {item.contact.waId}
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </p>
                <h2 className="mt-1 text-lg font-semibold">Internal context</h2>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="rounded-[1.4rem] bg-[#faf7ef] p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#e8dcc4]" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#efe4cf]" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-[#efe4cf]" />
                </div>
              ) : null}
              {(globalSearchQuery.data?.data.notes ?? []).map((item) => (
                <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={item.note._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.contact?.displayName || "Unknown contact"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {item.note.pinned ? "Pinned" : "Standard"} | {item.note.authorName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(item.note.updatedAt)}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{item.note.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
