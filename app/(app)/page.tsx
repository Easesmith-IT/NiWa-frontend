"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Briefcase,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  ListTodo,
  MessageSquareText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
  UserCheck,
  Wallet,
} from "lucide-react";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboardSummaryQuery } from "../../features/search";
import { useWorkspaceModules } from "../../lib/workspace/use-workspace-modules";

export default function DashboardPage() {
  const dashboardQuery = useDashboardSummaryQuery();
  const { enabledModuleKeys } = useWorkspaceModules();
  const [showTelemetry, setShowTelemetry] = useState(true);

  const data = dashboardQuery.data?.data;
  const isLoading = dashboardQuery.isPending;

  const hasSales = enabledModuleKeys.includes("sales");
  const hasFinance = enabledModuleKeys.includes("finance");

  if (dashboardQuery.isError) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-[hsl(var(--danger))]">
          Dashboard summary failed to load. Please try again.
        </p>
        <Button className="mt-4" onClick={() => void dashboardQuery.refetch()} type="button" variant="secondary">
          Retry dashboard
        </Button>
      </Card>
    );
  }

  const unreadChats = data?.snapshot.unreadConversations ?? 0;
  const awaitingReply = data?.inbox.awaitingBusinessReply ?? 0;
  const expiringWindows = data?.inbox.expiringServiceWindows ?? 0;
  const overdueTasks = data?.tasks.overdue ?? 0;
  const dueTodayTasks = data?.tasks.dueToday ?? 0;
  const failedRunsOrSchedules = (data?.schedules.failed ?? 0) + (data?.automations.failedRunsToday ?? 0);

  const attentionCards = [
    {
      title: "Unread & Awaiting Reply",
      primaryValue: unreadChats,
      secondaryText: `${awaitingReply} waiting on your team`,
      href: "/inbox",
      cta: "Reply in Inbox",
      icon: MessageSquareText,
      urgent: unreadChats > 0 || awaitingReply > 0,
      tone: unreadChats > 0
        ? "border-emerald-300 bg-[#EDF8F3]/60 dark:border-[#24483A] dark:bg-[#13251E]/60"
        : "border-[#E4E4E7] bg-white dark:border-[#292C2F] dark:bg-[#121416]",
    },
    {
      title: "Tasks Due & Overdue",
      primaryValue: overdueTasks + dueTodayTasks,
      secondaryText: overdueTasks > 0 ? `${overdueTasks} overdue • ${dueTodayTasks} due today` : `${dueTodayTasks} due today`,
      href: "/tasks",
      cta: "Open Tasks",
      icon: ListTodo,
      urgent: overdueTasks > 0,
      tone: overdueTasks > 0
        ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/25"
        : "border-[#E4E4E7] bg-white dark:border-[#292C2F] dark:bg-[#121416]",
    },
    {
      title: "Expiring 24h Windows",
      primaryValue: expiringWindows,
      secondaryText: "Reply before free WhatsApp window closes",
      href: "/inbox",
      cta: "Check Windows",
      icon: Clock3,
      urgent: expiringWindows > 0,
      tone: expiringWindows > 0
        ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/25"
        : "border-[#E4E4E7] bg-white dark:border-[#292C2F] dark:bg-[#121416]",
    },
    {
      title: "Delivery & Automation Alerts",
      primaryValue: failedRunsOrSchedules,
      secondaryText: `${data?.schedules.queued ?? 0} scheduled • ${data?.automations.active ?? 0} active flows`,
      href: "/scheduled",
      cta: "Review Queue",
      icon: TriangleAlert,
      urgent: failedRunsOrSchedules > 0,
      tone: failedRunsOrSchedules > 0
        ? "border-red-300 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/25"
        : "border-[#E4E4E7] bg-white dark:border-[#292C2F] dark:bg-[#121416]",
    },
  ];

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
      {/* Top Actionable Section: Needs Your Attention & Quick Actions */}
      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-[#EDF8F3] px-2.5 py-0.5 text-xs font-semibold text-[#176B4D] dark:border-[#24483A] dark:bg-[#13251E] dark:text-[#359B76]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#176B4D] dark:bg-[#359B76]" />
                Workspace Ready
              </span>
              <span className="text-xs text-muted-foreground">
                {data?.metaAnalytics?.accountStatus ?? "Meta Cloud API Connected"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Needs Your Attention Today
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Start with unread customer conversations, due follow-ups, and 1-click daily workflows.
            </p>
          </div>

          {/* 1-Click Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/inbox">
              <Button size="sm" type="button" variant="primary">
                <MessageSquareText className="h-3.5 w-3.5" />
                Open Inbox
              </Button>
            </Link>
            <Link href="/crm/customer-360">
              <Button size="sm" type="button" variant="secondary">
                <UserCheck className="h-3.5 w-3.5" />
                Customer 360
              </Button>
            </Link>
            <Link href="/deals">
              <Button size="sm" type="button" variant="secondary">
                <Briefcase className="h-3.5 w-3.5" />
                Deals
              </Button>
            </Link>
            {hasSales && (
              <>
                <Link href="/sales/quotes">
                  <Button size="sm" type="button" variant="secondary">
                    <FileText className="h-3.5 w-3.5" />
                    Quotes
                  </Button>
                </Link>
                <Link href="/sales/orders">
                  <Button size="sm" type="button" variant="secondary">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Sales Orders
                  </Button>
                </Link>
              </>
            )}
            {hasFinance && (
              <Link href="/finance/receivables">
                <Button size="sm" type="button" variant="secondary">
                  <Wallet className="h-3.5 w-3.5" />
                  Receivables
                </Button>
              </Link>
            )}
            <Link href="/search">
              <Button size="sm" type="button" variant="ghost">
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Actionable Attention Cards */}
        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {attentionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md ${card.tone}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{card.title}</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-[#176B4D] shadow-2xs dark:bg-[#17191B] dark:text-[#359B76]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2.5 text-3xl font-bold tracking-tight text-foreground">
                    {isLoading ? "…" : card.primaryValue}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.secondaryText}</p>
                </div>
                <div className="mt-3.5 flex items-center justify-between border-t border-black/5 pt-2.5 text-xs font-semibold text-[#176B4D] dark:border-white/5 dark:text-[#359B76]">
                  <span>{card.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Priority Customer Threads & Recent Activity */}
      <div className="grid gap-3.5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Priority Customer Threads</h2>
                <p className="text-[11px] text-muted-foreground">Unread conversations that need a response</p>
              </div>
            </div>
            <Link className="text-xs font-medium text-[#176B4D] hover:underline dark:text-[#359B76]" href="/inbox">
              Open inbox &rarr;
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {(data?.hotThreads ?? []).map((item) => (
              <Link
                className="block rounded-md border border-[#F0F0F2] bg-[#FAFAFA] p-3 transition-colors hover:border-[#176B4D]/40 dark:border-[#202326] dark:bg-[#17191B] dark:hover:border-[#359B76]/40"
                href={`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`}
                key={item.conversation._id}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                  </p>
                  <span className="rounded-full border border-emerald-200 bg-[#EDF8F3] px-2 py-0.5 text-[10px] font-semibold text-[#176B4D] dark:border-[#24483A] dark:bg-[#13251E] dark:text-[#359B76]">
                    {item.conversation.unreadCount} unread
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {item.conversation.lastMessageText || "No message preview"}
                </p>
              </Link>
            ))}
            {!isLoading && (data?.hotThreads.length ?? 0) === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E4E4E7] p-6 text-center dark:border-[#292C2F]">
                <p className="text-xs font-medium text-foreground">All caught up!</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">No unread priority threads waiting right now.</p>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Recent Customer Activity</h2>
                <p className="text-[11px] text-muted-foreground">Latest updates across contacts, tasks, and chats</p>
              </div>
            </div>
            <Link className="text-xs text-muted-foreground hover:text-foreground hover:underline" href="/search">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {(data?.recentActivity ?? []).slice(0, 5).map((item) => (
              <div className="rounded-md border border-[#F0F0F2] bg-[#FAFAFA] p-3 dark:border-[#202326] dark:bg-[#17191B]" key={item.activity._id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground">
                    {item.contact?.displayName || item.contact?.phoneNumber || "Workspace activity"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.activity.createdAt ? new Date(item.activity.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.activity.description}</p>
              </div>
            ))}
            {!isLoading && (data?.recentActivity.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Quick Snapshot Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading
          ? Array.from({ length: 8 }).map((_, index) => ({
              href: "/",
              label: `Loading ${index + 1}`,
              value: "…",
            }))
          : stats
        ).map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="h-full p-3.5 transition-colors hover:border-[#A1A1AA] dark:hover:border-[#3A3E42]">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Collapsible Section: WhatsApp Cloud API & Automation Telemetry */}
      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTelemetry((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA] dark:hover:bg-[#17191B]"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDF8F3] text-[#176B4D] dark:bg-[#13251E] dark:text-[#359B76]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                WhatsApp Cloud API & Automation Telemetry
              </h2>
              <p className="text-xs text-muted-foreground">
                Meta messaging tier limits, handset delivery rates, and background automation health.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#EDF8F3] px-2.5 py-0.5 text-xs font-medium text-[#16803C] dark:bg-[#13251E] dark:text-[#3FA66F] sm:inline-flex">
              {data?.metaAnalytics?.qualityRating ?? "GREEN (High Quality)"}
            </span>
            {showTelemetry ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {showTelemetry && (
          <div className="space-y-4 border-t border-[#F0F0F2] p-5 dark:border-[#202326]">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-0.5 font-medium text-foreground dark:border-[#292C2F] dark:bg-[#17191B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                {data?.metaAnalytics?.messagingTier ?? "Tier 1K"} ({data?.metaAnalytics?.messagingTierLimit ?? "1,000 / 24h"})
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                {data?.metaAnalytics?.accountStatus ?? "CONNECTED (Live)"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-3.5 lg:grid-cols-3">
              <div className="rounded-md border border-[#F0F0F2] p-4 dark:border-[#202326]">
                <div className="flex items-center gap-2 pb-2.5">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inbox Pressure</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Awaiting team reply", value: data?.inbox.awaitingBusinessReply ?? 0 },
                    { label: "Awaiting customer reply", value: data?.inbox.awaitingCustomerReply ?? 0 },
                    { label: "Starred conversations", value: data?.inbox.starredConversations ?? 0 },
                    { label: "Archived conversations", value: data?.inbox.archivedConversations ?? 0 },
                  ].map((item) => (
                    <div className="flex items-center justify-between rounded bg-[#FAFAFA] px-2.5 py-1.5 text-xs dark:bg-[#17191B]" key={item.label}>
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[#F0F0F2] p-4 dark:border-[#202326]">
                <div className="flex items-center gap-2 pb-2.5">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule & Tasks</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Due today", value: data?.tasks.dueToday ?? 0 },
                    { label: "Overdue tasks", value: data?.tasks.overdue ?? 0 },
                    { label: "Queued schedules", value: data?.schedules.queued ?? 0 },
                    { label: "Failed schedules", value: data?.schedules.failed ?? 0 },
                  ].map((item) => (
                    <div className="flex items-center justify-between rounded bg-[#FAFAFA] px-2.5 py-1.5 text-xs dark:bg-[#17191B]" key={item.label}>
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[#F0F0F2] p-4 dark:border-[#202326]">
                <div className="flex items-center gap-2 pb-2.5">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Automation Health</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Active automations", value: data?.automations.active ?? 0 },
                    { label: "Waiting runs", value: data?.automations.waitingRuns ?? 0 },
                    { label: "Failed runs today", value: data?.automations.failedRunsToday ?? 0 },
                    { label: "Paused schedules", value: data?.schedules.paused ?? 0 },
                  ].map((item) => (
                    <div className="flex items-center justify-between rounded bg-[#FAFAFA] px-2.5 py-1.5 text-xs dark:bg-[#17191B]" key={item.label}>
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

