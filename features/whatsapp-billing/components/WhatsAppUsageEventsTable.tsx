"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Gift,
  HelpCircle,
  Search,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppUsageEvent } from "../whatsapp-billing.types";

interface WhatsAppUsageEventsTableProps {
  events: WhatsAppUsageEvent[];
  isLoading: boolean;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  onPageChange: (page: number) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  stateFilter: string;
  onStateFilterChange: (state: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const WhatsAppUsageEventsTable: React.FC<WhatsAppUsageEventsTableProps> = ({
  events,
  isLoading,
  pagination,
  onPageChange,
  categoryFilter,
  onCategoryFilterChange,
  stateFilter,
  onStateFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "marketing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300";
      case "utility":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300";
      case "authentication":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300";
      case "service":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStateBadge = (state: string, isFree: boolean) => {
    if (isFree) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
          <Gift className="h-3 w-3" />
          Free Allowance
        </span>
      );
    }

    switch (state) {
      case "billable":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            Billable
          </span>
        );
      case "provisional":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <Clock className="h-3 w-3" />
            Provisional
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <AlertCircle className="h-3 w-3" />
            Failed / Undelivered
          </span>
        );
      case "reconciled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
            <Shield className="h-3 w-3" />
            Reconciled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Table Header & Search Filter Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Normalized Outbound Usage Events
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit-grade record of every outbound WhatsApp messaging event with rate snapshot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Meta ID / Phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="utility">Utility</option>
            <option value="authentication">Authentication</option>
            <option value="service">Service</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => onStateFilterChange(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All States</option>
            <option value="billable">Billable</option>
            <option value="free_allowance">Free Allowance</option>
            <option value="provisional">Provisional</option>
            <option value="failed">Failed / Undelivered</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Meta Message ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">24h Window</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Meta Cost</th>
              <th className="px-4 py-3 text-right">Customer Charge</th>
              <th className="px-4 py-3 text-right">Sent Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading usage events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No usage events found for current filters.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-900 dark:text-slate-100 max-w-[160px] truncate">
                    {evt.metaMessageId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-xs px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getCategoryBadge(evt.category)}`}>
                      {evt.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]">
                    {evt.recipientPhoneNumber || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {evt.customerServiceWindowOpen ? (
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Open (24h)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Closed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStateBadge(evt.billingState, evt.isFreeAllowance)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                    ₹{evt.metaCost.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₹{evt.customerCharge.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(evt.sentAt || evt.billingTimestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total events)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
