"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Target,
  User,
  Users,
} from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { DealFormModal } from "../../../../features/deals/components/DealFormModal";
import { LeadFormModal } from "../../../../features/leads/components/LeadFormModal";
import { TaskFormModal } from "../../../../features/tasks/components/TaskFormModal";

interface Customer360Data {
  recordType: "Person" | "Company";
  record: any;
  linkedEntities: {
    people?: any[];
    companies?: any[];
    contacts: any[];
  };
  deals: {
    items: any[];
    totalOpenValue: number;
    openCount: number;
    wonCount: number;
    lostCount: number;
  };
  leads: {
    items: any[];
    totalCount: number;
    openCount: number;
  };
  tasks: {
    items: any[];
    pendingCount: number;
    overdueCount: number;
  };
  timeline: {
    activities: any[];
    totalCount: number;
  };
  communication: {
    conversations: any[];
    totalUnreadCount: number;
    lastContactedAt: string | null;
    activeChannels: string[];
  };
}

function Customer360Content() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recordTypeParam = (searchParams.get("recordType") as "Person" | "Company") || "Person";
  const recordIdParam = searchParams.get("recordId") || searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "leads" | "tasks" | "timeline">("overview");
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [searchRecordId, setSearchRecordId] = useState(recordIdParam);

  const { data: customerData, isLoading, isError, error } = useQuery<Customer360Data>({
    queryKey: ["customer-360", recordTypeParam, recordIdParam],
    queryFn: async () => {
      if (!recordIdParam) throw new Error("No record selected");
      const res = await apiClient.get<Customer360Data>(
        `/api/crm/customer-360/${recordTypeParam}/${recordIdParam}`
      );
      return res.data;
    },
    enabled: !!recordIdParam,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRecordId.trim()) {
      router.push(`/crm/customer-360?recordType=${recordTypeParam}&recordId=${encodeURIComponent(searchRecordId.trim())}`);
    }
  };

  if (!recordIdParam) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
          <User className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Customer 360 View</h2>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Select a customer record to view unified CRM, communications, deals, leads, tasks, and history.
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex w-full max-w-md items-center gap-2">
          <Input
            placeholder="Enter Person or Company ID (e.g. 64b...)"
            value={searchRecordId}
            onChange={(e) => setSearchRecordId(e.target.value)}
            className="text-xs"
          />
          <Button type="submit" size="sm" className="bg-[#176B4D] text-white hover:bg-[#12583F]">
            Look up
          </Button>
        </form>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/contacts")}
            className="text-xs"
          >
            Browse Contacts Directory
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        Loading Customer 360 profile…
      </div>
    );
  }

  if (isError || !customerData) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load customer profile.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {(error as Error)?.message || "Record not found or access denied."}
        </p>
        <Button
          onClick={() => router.push("/contacts")}
          variant="outline"
          size="sm"
          className="mt-4 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Contacts
        </Button>
      </div>
    );
  }

  const { record, deals, leads, tasks, timeline, communication } = customerData;
  const displayName = record?.name || record?.displayName || `${record?.firstName || ""} ${record?.lastName || ""}`.trim() || "Customer";

  return (
    <div className="space-y-6">
      {/* Header Profile Bar */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/contacts")}
              className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-[#F4F4F5] dark:hover:bg-[#202326]"
              aria-label="Back to contacts"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDF8F3] text-lg font-bold text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
                <span className="rounded bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:bg-[#25282B]">
                  {customerData.recordType}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {record?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {record.email}
                  </span>
                )}
                {record?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {record.phone}
                  </span>
                )}
                {record?.companyName && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {record.companyName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setDealModalOpen(true)}
              size="sm"
              className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> New Deal
            </Button>
            <Button
              onClick={() => setLeadModalOpen(true)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> New Lead
            </Button>
            <Button
              onClick={() => setTaskModalOpen(true)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> New Task
            </Button>
            {communication.conversations?.[0]?._id && (
              <Button
                onClick={() => router.push(`/inbox?conversationId=${encodeURIComponent(communication.conversations[0]._id)}`)}
                size="sm"
                variant="secondary"
                className="text-xs"
              >
                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Open Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Open Deals</span>
            <Briefcase className="h-4 w-4 text-[#176B4D] dark:text-[#63B592]" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">
            ${(deals?.totalOpenValue || 0).toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {deals?.openCount || 0} active ({deals?.wonCount || 0} won)
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Leads</span>
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">
            {leads?.openCount || 0}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {leads?.totalCount || 0} lifetime leads
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tasks</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">
            {tasks?.pendingCount || 0}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {tasks?.overdueCount || 0} overdue
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Communication</span>
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground">
            {communication?.conversations?.length || 0}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
            {communication?.lastContactedAt
              ? `Active ${new Date(communication.lastContactedAt).toLocaleDateString()}`
              : "No recent contact"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E4E4E7] dark:border-[#282B2E]">
        <nav className="flex space-x-6">
          {[
            { id: "overview", label: `Timeline (${timeline?.totalCount || 0})` },
            { id: "deals", label: `Deals (${deals?.items?.length || 0})` },
            { id: "leads", label: `Leads (${leads?.items?.length || 0})` },
            { id: "tasks", label: `Tasks (${tasks?.items?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#176B4D] text-[#176B4D] dark:border-[#63B592] dark:text-[#63B592]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 dark:border-[#282B2E] dark:bg-[#17191B]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Timeline</h3>
            <div className="mt-4 space-y-3">
              {(timeline?.activities || []).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No recorded activities for this customer.</p>
              ) : (
                timeline.activities.map((act: any) => (
                  <div key={act._id || act.createdAt} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{act.description || act.type}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "deals" && (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 dark:border-[#282B2E] dark:bg-[#17191B]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Associated Deals</h3>
              <Button size="sm" onClick={() => setDealModalOpen(true)} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add Deal
              </Button>
            </div>
            <div className="space-y-2">
              {(deals?.items || []).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No deals linked to this customer yet.</p>
              ) : (
                deals.items.map((deal: any) => (
                  <div
                    key={deal._id}
                    className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-3 hover:bg-[#FAFAFA] dark:border-[#282B2E] dark:hover:bg-[#1D2022]"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{deal.title}</p>
                      <p className="text-[11px] text-muted-foreground">Status: {deal.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">
                        ${(deal.value || 0).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/deals?dealId=${deal._id}`)}
                        className="h-6 px-1.5 text-[11px] text-primary"
                      >
                        View <ExternalLink className="ml-1 h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 dark:border-[#282B2E] dark:bg-[#17191B]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Leads</h3>
              <Button size="sm" onClick={() => setLeadModalOpen(true)} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add Lead
              </Button>
            </div>
            <div className="space-y-2">
              {(leads?.items || []).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No leads recorded for this customer.</p>
              ) : (
                leads.items.map((lead: any) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-3 hover:bg-[#FAFAFA] dark:border-[#282B2E] dark:hover:bg-[#1D2022]"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{lead.title}</p>
                      <span className="text-[11px] text-muted-foreground">Source: {lead.leadSource || "Direct"} • Status: {lead.status}</span>
                    </div>
                    {lead.value ? (
                      <span className="text-xs font-bold text-foreground">${lead.value.toLocaleString()}</span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 dark:border-[#282B2E] dark:bg-[#17191B]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer Tasks</h3>
              <Button size="sm" onClick={() => setTaskModalOpen(true)} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add Task
              </Button>
            </div>
            <div className="space-y-2">
              {(tasks?.items || []).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No tasks scheduled for this customer.</p>
              ) : (
                tasks.items.map((t: any) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between rounded-lg border border-[#E4E4E7] p-3 hover:bg-[#FAFAFA] dark:border-[#282B2E] dark:hover:bg-[#1D2022]"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Priority: {t.priority} {t.dueAt ? `• Due: ${new Date(t.dueAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Creation Modals Pre-populated with Customer Context */}
      {dealModalOpen && (
        <DealFormModal
          isOpen={dealModalOpen}
          onClose={() => setDealModalOpen(false)}
          defaultPrimaryPersonId={customerData.recordType === "Person" ? recordIdParam : null}
          defaultCompanyId={customerData.recordType === "Company" ? recordIdParam : record?.companyId || null}
          defaultTitle={`Deal for ${displayName}`}
        />
      )}

      {leadModalOpen && (
        <LeadFormModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          defaultPrimaryPersonId={customerData.recordType === "Person" ? recordIdParam : null}
          defaultCompanyId={customerData.recordType === "Company" ? recordIdParam : record?.companyId || null}
          defaultTitle={`Lead for ${displayName}`}
        />
      )}

      {taskModalOpen && (
        <TaskFormModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          defaultLinkedRecord={{
            recordId: recordIdParam,
            recordType: customerData.recordType === "Person" ? "Person" : "Company",
          }}
        />
      )}
    </div>
  );
}

export default function Customer360Page() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading Customer 360…</div>}>
      <Customer360Content />
    </Suspense>
  );
}
