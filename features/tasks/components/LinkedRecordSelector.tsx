"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Link as LinkIcon, Building2, User, Target, TrendingUp, MessageSquare, Search } from "lucide-react";
import { LinkedRecord, LinkedRecordType } from "../task.types";
import { listPeople } from "../../people/people.api";
import { listCompanies } from "../../companies/company.api";
import { useLeadsQuery } from "../../leads/lead.queries";
import { useDealsQuery } from "../../deals/deal.queries";
import { listInboxThreads } from "../../inbox/inbox.api";

interface LinkedRecordSelectorProps {
  value: LinkedRecord[];
  onChange: (records: LinkedRecord[]) => void;
}

interface SelectableRecordOption {
  id: string;
  label: string;
  subtitle?: string;
}

const RECORD_TYPES: { type: LinkedRecordType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "Person", label: "Person", icon: User },
  { type: "Company", label: "Company", icon: Building2 },
  { type: "Lead", label: "Lead", icon: Target },
  { type: "Deal", label: "Deal", icon: TrendingUp },
  { type: "Conversation", label: "Conversation", icon: MessageSquare },
];

export const LinkedRecordSelector: React.FC<LinkedRecordSelectorProps> = ({ value, onChange }) => {
  const [selectedType, setSelectedType] = useState<LinkedRecordType>("Person");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: people = [] } = useQuery({
    queryKey: ["crm-people"],
    queryFn: () => listPeople(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: () => listCompanies(),
  });

  const { data: resolvedLeads = [] } = useLeadsQuery();

  const { data: deals = [] } = useDealsQuery();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations-selector"],
    queryFn: async () => {
      const res = await listInboxThreads({ filter: "all" });
      return Array.isArray(res?.data) ? res.data : [];
    },
  });

  const optionsByType = useMemo<Record<LinkedRecordType, SelectableRecordOption[]>>(() => {
    const safeDeals = Array.isArray(deals) ? deals : Array.isArray((deals as any)?.data) ? (deals as any).data : [];
    return {
      Person: (Array.isArray(people) ? people : []).map((p: any) => ({
        id: p._id,
        label: p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || p._id,
        subtitle: p.phones?.[0]?.phone || p.emails?.[0]?.email || p.jobTitle || undefined,
      })),
      Company: (Array.isArray(companies) ? companies : []).map((c: any) => ({
        id: c._id,
        label: c.name || c._id,
        subtitle: c.industry || c.domain || undefined,
      })),
      Lead: (Array.isArray(resolvedLeads) ? resolvedLeads : []).map((l: any) => ({
        id: l._id,
        label: l.title || l._id,
        subtitle: l.status ? `${l.status}${l.leadSource ? ` • ${l.leadSource}` : ""}` : undefined,
      })),
      Deal: safeDeals.map((d: any) => ({
        id: d._id,
        label: d.title || d._id,
        subtitle: d.status ? `${d.status}${d.value != null ? ` • $${Number(d.value).toLocaleString()}` : ""}` : undefined,
      })),
      Conversation: (Array.isArray(conversations) ? conversations : []).map((conv: any) => ({
        id: conv._id,
        label: conv.contact?.displayName || conv.contact?.phoneNumber || conv.waId || conv._id,
        subtitle: conv.lastMessageText ? String(conv.lastMessageText).slice(0, 40) : undefined,
      })),
    };
  }, [people, companies, resolvedLeads, deals, conversations]);

  const currentOptions = useMemo(() => {
    const list = optionsByType[selectedType] || [];
    const term = searchFilter.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(term)) ||
        opt.id.toLowerCase().includes(term),
    );
  }, [optionsByType, selectedType, searchFilter]);

  const resolveRecordLabel = (type: LinkedRecordType, id: string) => {
    const found = (optionsByType[type] || []).find((opt) => opt.id === id);
    if (found) return found.label;
    return id.length > 12 ? `${id.slice(0, 10)}...` : id;
  };

  const handleAdd = (explicitId?: string) => {
    setError(null);
    const candidateId = (explicitId ?? selectedRecordId ?? searchFilter).trim();
    if (!candidateId) {
      setError(`Please select a ${selectedType.toLowerCase()}`);
      return;
    }

    const exists = value.some((r) => r.recordType === selectedType && r.recordId === candidateId);
    if (exists) {
      setError("Record is already linked");
      return;
    }

    onChange([...value, { recordType: selectedType, recordId: candidateId }]);
    setSelectedRecordId("");
    setSearchFilter("");
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Linked Records
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((rec, i) => {
            const config = RECORD_TYPES.find((t) => t.type === rec.recordType);
            const Icon = config?.icon || LinkIcon;
            const friendlyLabel = resolveRecordLabel(rec.recordType, rec.recordId);
            return (
              <span
                key={`${rec.recordType}-${rec.recordId}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-foreground dark:border-[#303438] dark:bg-[#17191B]"
              >
                <Icon className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#63B592]" />
                <span className="font-semibold text-muted-foreground">{rec.recordType}:</span>
                <span className="font-medium text-foreground">{friendlyLabel}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="ml-0.5 text-muted-foreground transition-colors hover:text-red-500"
                  aria-label={`Remove linked ${rec.recordType}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 dark:border-[#303438] dark:bg-[#17191B]">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as LinkedRecordType);
              setSelectedRecordId("");
              setSearchFilter("");
              setError(null);
            }}
            className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs font-medium text-foreground focus:border-[#176B4D] focus:outline-none dark:border-[#303438] dark:bg-[#121416]"
          >
            {RECORD_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${selectedType} by name...`}
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setError(null);
              }}
              className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-white pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#176B4D] focus:outline-none dark:border-[#303438] dark:bg-[#121416]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedRecordId}
            onChange={(e) => {
              setSelectedRecordId(e.target.value);
              setError(null);
            }}
            className="h-8.5 flex-1 rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs text-foreground focus:border-[#176B4D] focus:outline-none dark:border-[#303438] dark:bg-[#121416]"
          >
            <option value="">
              {currentOptions.length === 0
                ? `No matching ${selectedType.toLowerCase()} records found`
                : `Select ${selectedType} (${currentOptions.length})...`}
            </option>
            {currentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
                {opt.subtitle ? ` — ${opt.subtitle}` : ""}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAdd()}
            className="inline-flex h-8.5 items-center gap-1 rounded-md bg-[#176B4D] px-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
          >
            <Plus className="h-3.5 w-3.5" />
            Link
          </button>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

