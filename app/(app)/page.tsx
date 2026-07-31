"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/ui/card";
import { apiClient } from "../../lib/api/client";
import { DashboardResponse } from "../../lib/api/types";

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<DashboardResponse>("/dashboard");
      return response.data;
    },
  });

  const data = dashboardQuery.data;
  const stats = [
    { label: "Connected Number", value: data?.connectedPhoneNumber || "Not connected", href: "/settings" },
    { label: "Webhook Status", value: data?.webhookStatus || "Pending", href: "/webhooks" },
    { label: "Templates", value: String(data?.counters.templates ?? 0), href: "/templates" },
    { label: "Media Assets", value: String(data?.counters.media ?? 0), href: "/media" },
    { label: "Unread Threads", value: String(data?.unreadConversations ?? 0), href: "/conversations" },
    { label: "API Calls Today", value: String(data?.apiCallsToday ?? 0), href: "/logs/api" },
    { label: "Incoming Today", value: String(data?.counters.incomingMessagesToday ?? 0), href: "/conversations" },
    { label: "Outgoing Today", value: String(data?.counters.outgoingMessagesToday ?? 0), href: "/message-studio" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold">System Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.label}>
            <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-4 text-2xl font-semibold">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Account Overview</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f7f1e4] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Business Name</p>
              <p className="mt-2 text-sm text-foreground">{data?.businessName || "Not set"}</p>
            </div>
            <div className="rounded-2xl bg-[#eef4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Business Account ID</p>
              <p className="mt-2 break-all text-sm text-foreground">{data?.businessAccountId || "Not set"}</p>
            </div>
            <div className="rounded-2xl bg-[#eef4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Phone Number ID</p>
              <p className="mt-2 break-all text-sm text-foreground">{data?.phoneNumberId || "Not set"}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f1e4] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Webhook Health</p>
              <p className="mt-2 text-sm text-foreground">URL: {data?.webhookUrlConfigured ? "Configured" : "Missing"}</p>
              <p className="mt-1 text-sm text-foreground">Verify token: {data?.verifyTokenConfigured ? "Configured" : "Missing"}</p>
              <p className="mt-1 text-sm text-foreground">Events today: {data?.webhookEventsToday ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Traffic Summary</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Incoming This Month</p>
              <p className="mt-2 text-2xl font-semibold">{data?.counters.incomingMessagesMonth ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Outgoing This Month</p>
              <p className="mt-2 text-2xl font-semibold">{data?.counters.outgoingMessagesMonth ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total Conversations</p>
              <p className="mt-2 text-2xl font-semibold">{data?.totalConversations ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">API Errors</p>
              <p className="mt-2 text-2xl font-semibold">{data?.recentApiErrors.length ?? 0}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#eef4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">API Calls This Month</p>
              <p className="mt-2 text-2xl font-semibold">{data?.trends?.apiCallsMonth ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-[#fff5f5] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Webhook Failures Today</p>
              <p className="mt-2 text-2xl font-semibold">{data?.trends?.webhookFailuresToday ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Recent Conversation Activity</h3>
            <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/conversations">
              Open inbox
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.recentActivity ?? []).map((conversation) => (
              <div className="rounded-2xl bg-white/70 p-4" key={conversation._id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{conversation.contactName || conversation.contactPhoneNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(conversation.lastActivityAt).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {conversation.lastDirection === "incoming" ? "Incoming" : "Outgoing"} | {conversation.lastMessageStatus}
                </p>
                <p className="mt-1 text-sm text-foreground">{conversation.lastMessageText || `[${conversation.lastMessageType}]`}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Latest API Errors</h3>
              <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/logs/api">
                View logs
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(data?.recentApiErrors ?? []).map((item) => (
                <div className="rounded-2xl bg-[#fff5f5] p-4" key={item._id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.method} {item.endpoint}</p>
                    <span className="rounded-full bg-[#fde8e8] px-2 py-1 text-xs font-medium text-[#9b1c1c]">{item.statusCode}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.durationMs} ms | {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Webhook Status Trends</h3>
              <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/webhooks">
                Open webhooks
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Delivered</p>
                <p className="mt-2 text-2xl font-semibold">{data?.trends?.deliveredStatusesToday ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Read</p>
                <p className="mt-2 text-2xl font-semibold">{data?.trends?.readStatusesToday ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Failed</p>
                <p className="mt-2 text-2xl font-semibold">{data?.trends?.failedStatusesToday ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
