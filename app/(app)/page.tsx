"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarClock,
  Clock3,
  MessageSquareText,
  Search,
  Sparkles,
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
      <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
        <p className="text-sm text-red-600">
          Dashboard summary failed to load. Check the V1 API and retry.
        </p>
        <Button className="mt-4 rounded-full" onClick={() => void dashboardQuery.refetch()} type="button" variant="secondary">
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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(120deg,rgba(21,47,41,0.98),rgba(237,225,193,0.92))] p-6 text-[#f8f1de] shadow-[0_18px_50px_rgba(44,56,38,0.14)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e7ddc7]">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Operations pulse for the WhatsApp desk</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#efe6d2]">
              Watch reply pressure, scheduled load, automation backlog, and recent account motion
              from one V1 control surface.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/search">
                <Button className="rounded-full bg-[#f8f1de] text-[#16302b] hover:bg-[#fff7e8]" type="button">
                  <Search className="mr-2 h-4 w-4" />
                  Open search
                </Button>
              </Link>
              <Link href="/inbox">
                <Button className="rounded-full border border-[#f8f1de]/35 bg-transparent text-[#f8f1de] hover:bg-white/10" type="button" variant="ghost">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Open inbox
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] bg-[rgba(248,241,222,0.14)] p-5 backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.3rem] bg-[rgba(255,255,255,0.12)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#eadfca]">Awaiting team</p>
                <p className="mt-3 text-3xl font-semibold">{data?.inbox.awaitingBusinessReply ?? 0}</p>
              </div>
              <div className="rounded-[1.3rem] bg-[rgba(255,255,255,0.12)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#eadfca]">Service windows</p>
                <p className="mt-3 text-3xl font-semibold">{data?.inbox.expiringServiceWindows ?? 0}</p>
              </div>
              <div className="rounded-[1.3rem] bg-[rgba(255,255,255,0.12)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#eadfca]">Queued sends</p>
                <p className="mt-3 text-3xl font-semibold">{data?.schedules.queued ?? 0}</p>
              </div>
              <div className="rounded-[1.3rem] bg-[rgba(255,255,255,0.12)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#eadfca]">Waiting runs</p>
                <p className="mt-3 text-3xl font-semibold">{data?.automations.waitingRuns ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(isLoading ? Array.from({ length: 8 }).map((_, index) => ({
          href: "/",
          label: `Loading ${index + 1}`,
          value: "…",
        })) : stats).map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="h-full border-white/60 bg-white/78 p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-4 text-2xl font-semibold">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Inbox pressure</h3>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Awaiting team reply", value: data?.inbox.awaitingBusinessReply ?? 0 },
              { label: "Awaiting customer reply", value: data?.inbox.awaitingCustomerReply ?? 0 },
              { label: "Starred conversations", value: data?.inbox.starredConversations ?? 0 },
              { label: "Archived conversations", value: data?.inbox.archivedConversations ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-[#faf7ef] px-4 py-3" key={item.label}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Schedule and tasks</h3>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Due today", value: data?.tasks.dueToday ?? 0 },
              { label: "Overdue tasks", value: data?.tasks.overdue ?? 0 },
              { label: "Queued schedules", value: data?.schedules.queued ?? 0 },
              { label: "Failed schedules", value: data?.schedules.failed ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-[#faf7ef] px-4 py-3" key={item.label}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Automation health</h3>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Active automations", value: data?.automations.active ?? 0 },
              { label: "Waiting runs", value: data?.automations.waitingRuns ?? 0 },
              { label: "Failed runs today", value: data?.automations.failedRunsToday ?? 0 },
              { label: "Paused schedules", value: data?.schedules.paused ?? 0 },
            ].map((item) => (
              <div className="flex items-center justify-between rounded-2xl bg-[#faf7ef] px-4 py-3" key={item.label}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Recent activity</h3>
            </div>
            <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/search">
              Search records
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.recentActivity ?? []).map((item) => (
              <div className="rounded-2xl bg-[#faf7ef] p-4" key={item.activity._id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">
                    {item.contact?.displayName || item.contact?.phoneNumber || "Unknown contact"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.activity.createdAt ? new Date(item.activity.createdAt).toLocaleString() : "No timestamp"}
                  </p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.activity.entityType} | {item.activity.type}
                </p>
                <p className="mt-1 text-sm text-foreground">{item.activity.description}</p>
              </div>
            ))}
            {!isLoading && (data?.recentActivity.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity is stored yet.</p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Priority threads</h3>
              </div>
              <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/inbox">
                Open inbox
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(data?.hotThreads ?? []).map((item) => (
                <Link className="block rounded-2xl bg-[#faf7ef] p-4 transition hover:bg-white" href={`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`} key={item.conversation._id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">
                      {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                    </p>
                    <span className="rounded-full bg-[#ecf3ec] px-2 py-1 text-xs font-medium text-[#1f513e]">
                      unread {item.conversation.unreadCount}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.conversation.status} | {item.conversation.lastMessageStatus || "unknown"}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {item.conversation.lastMessageText || "No last message text"}
                  </p>
                </Link>
              ))}
              {!isLoading && (data?.hotThreads.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No active priority threads right now.</p>
              ) : null}
            </div>
          </Card>

          <Card className="border-white/60 bg-white/78 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Risk summary</h3>
              </div>
              <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/tasks">
                Open tasks
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[#fff4e7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overdue tasks</p>
                <p className="mt-2 text-2xl font-semibold">{data?.tasks.overdue ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-[#fff4e7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Failed schedules</p>
                <p className="mt-2 text-2xl font-semibold">{data?.schedules.failed ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-[#fff4e7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Failed runs</p>
                <p className="mt-2 text-2xl font-semibold">{data?.automations.failedRunsToday ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
