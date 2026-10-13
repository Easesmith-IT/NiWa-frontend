"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
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
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { DealFormModal } from "../../../../features/deals/components/DealFormModal";
import { LeadFormModal } from "../../../../features/leads/components/LeadFormModal";
import { TaskFormModal } from "../../../../features/tasks/components/TaskFormModal";
import { listPeople } from "../../../../features/people/people.api";
import { listCompanies } from "../../../../features/companies/company.api";
import {
  Customer360Data,
  normalizeCustomer360Response,
} from "../../../../features/crm/customer-360.utils";
import { fetchCustomer360 } from "../../../../features/crm/customer-360.api";

function Customer360Content() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recordTypeParam = (searchParams.get("recordType") as "Person" | "Company") || "Person";
  const recordIdParam = searchParams.get("recordId") || searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "leads" | "tasks" | "timeline">("overview");
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [directoryType, setDirectoryType] = useState<"Person" | "Company">(recordTypeParam);
  const [directorySearch, setDirectorySearch] = useState("");

  const { data: peopleDirectory = [], isLoading: isLoadingPeople } = useQuery({
    queryKey: ["crm-people"],
    queryFn: () => listPeople(),
    enabled: !recordIdParam,
  });

  const { data: companiesDirectory = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: () => listCompanies(),
    enabled: !recordIdParam,
  });

  const filteredDirectoryItems = useMemo(() => {
    const term = directorySearch.trim().toLowerCase();
    if (directoryType === "Person") {
      return (Array.isArray(peopleDirectory) ? peopleDirectory : []).filter((p: any) => {
        if (!term) return true;
        const name = (p.displayName || `${p.firstName || ""} ${p.lastName || ""}`).toLowerCase();
        const email = p.emails?.map((e: any) => e.email).join(" ").toLowerCase() || "";
        const phone = p.phones?.map((ph: any) => ph.phone).join(" ").toLowerCase() || "";
        const job = `${p.jobTitle || ""} ${p.department || ""}`.toLowerCase();
        return name.includes(term) || email.includes(term) || phone.includes(term) || job.includes(term) || String(p._id).toLowerCase() === term;
      });
    }
    return (Array.isArray(companiesDirectory) ? companiesDirectory : []).filter((c: any) => {
      if (!term) return true;
      const name = (c.name || "").toLowerCase();
      const industry = (c.industry || "").toLowerCase();
      const domain = (c.domain || "").toLowerCase();
      return name.includes(term) || industry.includes(term) || domain.includes(term) || String(c._id).toLowerCase() === term;
    });
  }, [directoryType, directorySearch, peopleDirectory, companiesDirectory]);

  const { data: customerData, isLoading, isError, error } = useQuery<Customer360Data>({
    queryKey: ["customer-360", recordTypeParam, recordIdParam],
    queryFn: async () => {
      if (!recordIdParam) throw new Error("No record selected");
      return fetchCustomer360(recordTypeParam, recordIdParam);
    },
    enabled: !!recordIdParam,
  });

  const handleOpenProfile = (type: "Person" | "Company", id: string) => {
    router.push(`/crm/customer-360?recordType=${type}&recordId=${encodeURIComponent(id)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = directorySearch.trim();
    if (!trimmed) return;
    if (filteredDirectoryItems.length === 1) {
      handleOpenProfile(directoryType, filteredDirectoryItems[0]._id);
      return;
    }
    if (/^[a-f\d]{24}$/i.test(trimmed)) {
      handleOpenProfile(directoryType, trimmed);
    }
  };

  if (!recordIdParam) {
    const isDirectoryLoading = directoryType === "Person" ? isLoadingPeople : isLoadingCompanies;

    return (
      <div className="space-y-6">
        {/* Directory Header */}
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Customer 360 Directory
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Search any customer person or company to inspect unified conversations, deals, leads, tasks, and activity timeline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/people")}
                className="text-xs"
              >
                <Users className="mr-1.5 h-3.5 w-3.5" /> Manage People
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/contacts")}
                className="text-xs"
              >
                <Phone className="mr-1.5 h-3.5 w-3.5" /> WhatsApp Contacts
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-1 dark:border-[#303438] dark:bg-[#121416]">
              <button
                type="button"
                onClick={() => setDirectoryType("Person")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  directoryType === "Person"
                    ? "bg-[#176B4D] text-white shadow-xs dark:bg-[#208560]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                People ({Array.isArray(peopleDirectory) ? peopleDirectory.length : 0})
              </button>
              <button
                type="button"
                onClick={() => setDirectoryType("Company")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  directoryType === "Company"
                    ? "bg-[#176B4D] text-white shadow-xs dark:bg-[#208560]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Companies ({Array.isArray(companiesDirectory) ? companiesDirectory.length : 0})
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  directoryType === "Person"
                    ? "Search customer by name, phone, email, or role..."
                    : "Search company by name, industry, or domain..."
                }
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="h-9 border-[#E4E4E7] bg-[#FAFAFA] pl-9 text-xs dark:border-[#303438] dark:bg-[#121416]"
              />
            </form>
          </div>
        </div>

        {/* Directory Cards Grid */}
        {isDirectoryLoading ? (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-12 text-center text-xs text-muted-foreground dark:border-[#282B2E] dark:bg-[#17191B]">
            Loading {directoryType === "Person" ? "customer people" : "companies"} directory…
          </div>
        ) : filteredDirectoryItems.length === 0 ? (
          <div className="rounded-xl border border-[#E4E4E7] bg-white p-12 text-center dark:border-[#282B2E] dark:bg-[#17191B]">
            <User className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No {directoryType === "Person" ? "customers" : "companies"} matched your search
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {directorySearch
                ? "Try clearing your search filter or switching tabs."
                : `Add your first ${directoryType.toLowerCase()} record to view their 360 profile.`}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {directorySearch && (
                <Button variant="outline" size="sm" onClick={() => setDirectorySearch("")} className="text-xs">
                  Clear search
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => router.push(directoryType === "Person" ? "/people" : "/companies")}
                className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
              >
                Go to {directoryType === "Person" ? "People" : "Companies"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDirectoryItems.map((item: any) => {
              const title =
                directoryType === "Person"
                  ? item.displayName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unnamed Person"
                  : item.name || "Unnamed Company";
              const primaryEmail = directoryType === "Person" ? item.emails?.[0]?.email : undefined;
              const primaryPhone = directoryType === "Person" ? item.phones?.[0]?.phone : undefined;
              const subtitle =
                directoryType === "Person"
                  ? item.jobTitle || item.department || "Customer"
                  : item.industry || item.domain || "Company Account";

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleOpenProfile(directoryType, item._id)}
                  className="group flex flex-col justify-between rounded-xl border border-[#E4E4E7] bg-white p-4 text-left transition-all hover:border-[#176B4D]/60 hover:shadow-sm dark:border-[#282B2E] dark:bg-[#17191B] dark:hover:border-[#3B9B77]/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF8F3] text-sm font-bold text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground group-hover:text-[#176B4D] dark:group-hover:text-[#63B592]">
                          {title}
                        </p>
                        <span className="shrink-0 rounded bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-[#25282B]">
                          {directoryType}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
                      <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                        {primaryPhone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3 w-3 shrink-0 text-[#176B4D] dark:text-[#63B592]" />
                            <span>{primaryPhone}</span>
                          </div>
                        )}
                        {primaryEmail && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{primaryEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F4F4F5] pt-2.5 text-xs font-semibold text-[#176B4D] dark:border-[#25282B] dark:text-[#63B592]">
                    <span>Open 360 Profile</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
          onClick={() => router.push("/crm/customer-360")}
          variant="outline"
          size="sm"
          className="mt-4 text-xs"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Customer 360 Directory
        </Button>
      </div>
    );
  }

  const normalizedData = normalizeCustomer360Response(customerData, recordTypeParam);
  const { record, deals, leads, tasks, timeline, communication } = normalizedData;

  const displayName =
    record?.name ||
    record?.displayName ||
    `${record?.firstName || ""} ${record?.lastName || ""}`.trim() ||
    "Customer";

  const primaryEmail =
    record?.email ||
    (Array.isArray(record?.emails) ? record.emails[0]?.email : undefined);

  const primaryPhone =
    record?.phone ||
    (Array.isArray(record?.phones) ? record.phones[0]?.phone : undefined);

  const companyName =
    record?.companyName ||
    (Array.isArray(normalizedData.linkedEntities?.companies)
      ? normalizedData.linkedEntities.companies[0]?.name
      : undefined);

  return (
    <div className="space-y-6">
      {/* Header Profile Bar */}
      <div className="rounded-xl border border-[#E4E4E7] bg-white p-5 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/crm/customer-360")}
              className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-[#F4F4F5] dark:hover:bg-[#202326]"
              aria-label="Back to Customer 360 Directory"
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
                  {normalizedData.recordType}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {primaryEmail && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {primaryEmail}
                  </span>
                )}
                {primaryPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {primaryPhone}
                  </span>
                )}
                {companyName && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {companyName}
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
            {communication?.conversations?.[0]?._id && (
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
                (timeline?.activities || []).map((act: any) => (
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
                (deals?.items || []).map((deal: any) => (
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
                (leads?.items || []).map((lead: any) => (
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
                (tasks?.items || []).map((t: any) => (
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
          defaultPrimaryPersonId={normalizedData.recordType === "Person" ? recordIdParam : null}
          defaultCompanyId={normalizedData.recordType === "Company" ? recordIdParam : record?.companyId || null}
          defaultTitle={`Deal for ${displayName}`}
        />
      )}

      {leadModalOpen && (
        <LeadFormModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          defaultPrimaryPersonId={normalizedData.recordType === "Person" ? recordIdParam : null}
          defaultCompanyId={normalizedData.recordType === "Company" ? recordIdParam : record?.companyId || null}
          defaultTitle={`Lead for ${displayName}`}
        />
      )}

      {taskModalOpen && (
        <TaskFormModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          defaultLinkedRecord={{
            recordId: recordIdParam,
            recordType: normalizedData.recordType === "Person" ? "Person" : "Company",
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
