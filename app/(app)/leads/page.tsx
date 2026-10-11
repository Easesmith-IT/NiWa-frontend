"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Flame,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useLeadsQuery } from "../../../features/leads/lead.queries";
import { LeadFormModal } from "../../../features/leads/components/LeadFormModal";
import type { LeadRecord, LeadStatus } from "../../../features/leads/lead.types";

const STATUS_TABS: Array<{ id: "ALL" | LeadStatus; label: string }> = [
  { id: "ALL", label: "All Leads" },
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "CONVERTED", label: "Converted" },
  { id: "LOST", label: "Lost" },
];

export default function LeadsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | LeadStatus>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: leads = [], isLoading, isError, error } = useLeadsQuery();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead: LeadRecord) => {
      const matchesStatus =
        selectedStatus === "ALL" || lead.status === selectedStatus;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        lead.title.toLowerCase().includes(term) ||
        (lead.leadSource && lead.leadSource.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [leads, selectedStatus, search]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l: LeadRecord) => l.status === "NEW").length;
    const qualified = leads.filter((l: LeadRecord) => l.status === "QUALIFIED").length;
    const converted = leads.filter((l: LeadRecord) => l.status === "CONVERTED").length;
    const totalPipelineValue = leads
      .filter((l: LeadRecord) => l.status !== "LOST" && l.value)
      .reduce((sum: number, l: LeadRecord) => sum + (l.value || 0), 0);
    return { total, newCount, qualified, converted, totalPipelineValue };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Leads Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Capture, qualify, and convert prospective leads into pipeline deals.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          size="sm"
          className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Lead
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Inbound</span>
            <Target className="h-4 w-4 text-[#176B4D] dark:text-[#63B592]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{stats.newCount} new awaiting contact</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Qualified</span>
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.qualified}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">High propensity prospects</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Converted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.converted}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Moved to active deals</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Est. Pipeline</span>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">${stats.totalPipelineValue.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Unweighted lead value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedStatus === tab.id
                  ? "bg-[#176B4D] text-white dark:bg-[#208560]"
                  : "bg-[#F4F4F5] text-muted-foreground hover:bg-[#E4E4E7] dark:bg-[#25282B] dark:hover:bg-[#303438]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8.5 border-[#E4E4E7] bg-[#FAFAFA] pl-8 text-xs dark:border-[#282B2E] dark:bg-[#191B1D]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads or sources…"
            value={search}
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading leads…</div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-destructive">
            Failed to load leads: {(error as Error)?.message || "Unknown error"}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">No leads found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || selectedStatus !== "ALL"
                ? "Try clearing your filters or search term."
                : "Create your first lead to start capturing prospects."}
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              size="sm"
              className="mt-4 bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-[#282B2E] dark:bg-[#191B1D]">
                <tr>
                  <th className="px-4 py-3">Lead Title</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#282B2E]">
                {filteredLeads.map((lead: LeadRecord) => (
                  <tr key={lead._id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#1D2022]">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {lead.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-[#F4F4F5] px-2 py-0.5 font-medium text-[10px] text-muted-foreground dark:bg-[#25282B]">
                        {lead.leadSource || "DIRECT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {lead.value ? `$${lead.value.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          lead.status === "NEW"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : lead.status === "QUALIFIED"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : lead.status === "CONVERTED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : lead.status === "LOST"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {lead.personId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/crm/customer-360?recordType=Person&recordId=${lead.personId}`)}
                          className="h-7 text-[11px]"
                        >
                          Customer 360
                        </Button>
                      ) : null}
                      {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/deals?leadId=${lead._id}`)}
                          className="h-7 text-[11px] text-[#176B4D] hover:bg-[#EDF8F3] dark:text-[#63B592] dark:hover:bg-[#15271F]"
                        >
                          Convert <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createModalOpen && (
        <LeadFormModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}
    </div>
  );
}
