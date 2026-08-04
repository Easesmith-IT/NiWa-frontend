"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarClock,
  CheckCheck,
  Clock3,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboardSummaryV1Query } from "../../features/search";

export default function DashboardPage() {
  const dashboardQuery = useDashboardSummaryV1Query();
  const data = dashboardQuery.data?.data;
  const isLoading = dashboardQuery.isPending;

  if (dashboardQuery.isError) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-[hsl(var(--danger))]">
          Dashboard summary failed to load. Check the V1 API and retry.
        </p>
        <Button className="mt-4" onClick={() => void dashboardQuery.refetch()} type="button" variant="secondary">
          Retry dashboard
        </Button>
      </Card>
    );
  }

  const stats = [
    { label: "Unread inbox", value: String(data?.snapshot.unreadConversations ?? 0), href: "/inbox" },
    { label: "Open conversations", value: String(data?.snapshot.openConversations ?? 0), href: "/inbox" },
    { label: "Messages today", value: String(data?.snapshot.messagesToday ?? 0), href: "/search" },
    { label: "Upcoming scheduled", value: String(data?.snapshot.upcomingScheduled ?? 0), href: "/scheduled" },
    { label: "Open tasks", value: String(data?.snapshot.openTasks ?? 0), href: "/tasks" },
    { label: "Overdue tasks", value: String(data?.snapshot.overdueTasks ?? 0), href: "/tasks" },
    { label: "Active automations", value: String(data?.snapshot.activeAutomations ?? 0), href: "/automations" },
    { label: "Contacts", value: String(data?.snapshot.contactsTotal ?? 0), href: "/contacts" },
  ];

  return (
    <div className="space-y-5">
      {/* Operational Header Hero */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-6 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_340px] xl:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-xs font-semibold text-[#176B4D] border border-emerald-200 dark:border-[#24483A] dark:bg-[#13251E] dark:text-[#359B76]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#176B4D] animate-pulse dark:bg-[#359B76]" />
                Meta API Live
              </span>
              <span className="text-xs text-muted-foreground">Cloud API v25.0</span>
            </div>
            <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground">
              Operations Desk & Telemetry
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">
              Monitor response pressure, scheduled load, automation queues, and real-time WhatsApp account status.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/search">
                <Button size="sm" type="button" variant="primary">
                  <Search className="h-3.5 w-3.5" />
                  Open search
                </Button>
              </Link>
              <Link href="/inbox">
                <Button size="sm" type="button" variant="secondary">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Open inbox
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-4 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Awaiting team</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{data?.inbox.awaitingBusinessReply ?? 0}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">24h Windows</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{data?.inbox.expiringServiceWindows ?? 0}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Queued sends</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{data?.schedules.queued ?? 0}</p>
              </div>
              <div className="rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Waiting runs</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{data?.automations.waitingRuns ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading ? Array.from({ length: 8 }).map((_, index) => ({
          href: "/",
          label: `Loading ${index + 1}`,
          value: "…",
        })) : stats).map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="h-full p-4 transition-colors hover:border-[#A1A1AA] dark:hover:border-[#3A3E42]">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground tracking-tight">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Meta Telemetry Card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3.5 dark:border-[#202326]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDF8F3] text-[#176B4D] dark:bg-[#13251E] dark:text-[#359B76]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Meta Analytics & Channel Tiers</h2>
              <p className="text-xs text-muted-foreground">
                WhatsApp Business Cloud API health, message telemetry, and tier limits.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] px-2.5 py-0.5 font-medium text-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
              {data?.metaAnalytics?.messagingTier ?? "Tier 1K"} ({data?.metaAnalytics?.messagingTierLimit ?? "1,000 / 24h"})
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-xs font-medium text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F]">
              {data?.metaAnalytics?.qualityRating ?? "GREEN (High Quality)"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              {data?.metaAnalytics?.accountStatus ?? "CONNECTED (Live)"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Outbound Dispatched</p>
            <p className="mt-1.5 text-xl font-bold text-foreground">{data?.metaAnalytics?.totalSent ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Sent to Meta Cloud API</p>
          </div>

          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivered</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#16803C] dark:bg-emerald-950/40 dark:text-[#3FA66F]">
                {data?.metaAnalytics?.deliveryRate ?? 100}%
              </span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-foreground">{data?.metaAnalytics?.totalDelivered ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Confirmed on handsets</p>
          </div>

          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Read / Seen</p>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] dark:bg-sky-950/40 dark:text-[#5794E8]">
                {data?.metaAnalytics?.readRate ?? 0}%
              </span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-[#2563EB] dark:text-[#5794E8]">{data?.metaAnalytics?.totalRead ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Opened by customers</p>
          </div>

          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Failed Delivery</p>
            <p className="mt-1.5 text-xl font-bold text-[#C2413A] dark:text-[#D7685C]">{data?.metaAnalytics?.totalFailed ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Blocked or Meta errors</p>
          </div>
        </div>
      </Card>

      {/* Operational Breakdown */}
      <div className="grid gap-3.5 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Inbox pressure</h2>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { label: "Awaiting team reply", value: data?.inbox.awaitingBusinessReply ?? 0 },
              { label: "Awaiting customer reply", value: data?.inbox.awaitingCustomerReply ?? 0 },
              { label: "Starred conversations", value: data?.inbox.starredConversations ?? 0 },
              { label: "Archived conversations", value: data?.inbox.archivedConversations ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-md border border-[#F0F0F2] bg-[#FAFAFA] px-3 py-2 dark:border-[#202326] dark:bg-[#17191B]" key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Schedule & Tasks</h2>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { label: "Due today", value: data?.tasks.dueToday ?? 0 },
              { label: "Overdue tasks", value: data?.tasks.overdue ?? 0 },
              { label: "Queued schedules", value: data?.schedules.queued ?? 0 },
              { label: "Failed schedules", value: data?.schedules.failed ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-md border border-[#F0F0F2] bg-[#FAFAFA] px-3 py-2 dark:border-[#202326] dark:bg-[#17191B]" key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Automation Health</h2>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { label: "Active automations", value: data?.automations.active ?? 0 },
              { label: "Waiting runs", value: data?.automations.waitingRuns ?? 0 },
              { label: "Failed runs today", value: data?.automations.failedRunsToday ?? 0 },
              { label: "Paused schedules", value: data?.schedules.paused ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-md border border-[#F0F0F2] bg-[#FAFAFA] px-3 py-2 dark:border-[#202326] dark:bg-[#17191B]" key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity & Priority Threads */}
      <div className="grid gap-3.5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            </div>
            <Link className="text-xs text-muted-foreground hover:text-foreground hover:underline" href="/search">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {(data?.recentActivity ?? []).map((item) => (
              <div className="rounded-md border border-[#F0F0F2] bg-[#FAFAFA] p-3 dark:border-[#202326] dark:bg-[#17191B]" key={item.activity._id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground">
                    {item.contact?.displayName || item.contact?.phoneNumber || "Unknown contact"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.activity.createdAt ? new Date(item.activity.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                  </p>
                </div>
                <p className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  {item.activity.entityType} • {item.activity.type}
                </p>
                <p className="mt-0.5 text-xs text-foreground">{item.activity.description}</p>
              </div>
            ))}
            {!isLoading && (data?.recentActivity.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-3.5">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
                <h2 className="text-sm font-semibold text-foreground">Priority Threads</h2>
              </div>
              <Link className="text-xs text-muted-foreground hover:text-foreground hover:underline" href="/inbox">
                Open inbox
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {(data?.hotThreads ?? []).map((item) => (
                <Link className="block rounded-md border border-[#F0F0F2] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8] dark:border-[#202326] dark:bg-[#17191B] dark:hover:border-[#3A3E42]" href={`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`} key={item.conversation._id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                    </p>
                    <span className="rounded-full bg-[#EDF8F3] border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-[#176B4D] dark:border-[#24483A] dark:bg-[#13251E] dark:text-[#359B76]">
                      unread {item.conversation.unreadCount}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.conversation.lastMessageText || "No last message text"}
                  </p>
                </Link>
              ))}
              {!isLoading && (data?.hotThreads.length ?? 0) === 0 ? (
                <p className="text-xs text-muted-foreground">No active priority threads.</p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-[#B7791F] dark:text-[#D59A3A]" />
                <h2 className="text-sm font-semibold text-foreground">Risk Summary</h2>
              </div>
              <Link className="text-xs text-muted-foreground hover:text-foreground hover:underline" href="/tasks">
                View tasks
              </Link>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">Overdue tasks</p>
                <p className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-200">{data?.tasks.overdue ?? 0}</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">Failed schedules</p>
                <p className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-200">{data?.schedules.failed ?? 0}</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">Failed runs</p>
                <p className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-200">{data?.automations.failedRunsToday ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

