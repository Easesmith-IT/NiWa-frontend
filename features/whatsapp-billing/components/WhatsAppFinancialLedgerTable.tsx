"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle,
  FileText,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppLedgerEntry } from "../whatsapp-billing.types";

interface WhatsAppFinancialLedgerTableProps {
  entries: WhatsAppLedgerEntry[];
  isLoading: boolean;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  onPageChange: (page: number) => void;
  entryTypeFilter: string;
  onEntryTypeFilterChange: (type: string) => void;
}

export const WhatsAppFinancialLedgerTable: React.FC<WhatsAppFinancialLedgerTableProps> = ({
  entries,
  isLoading,
  pagination,
  onPageChange,
  entryTypeFilter,
  onEntryTypeFilterChange,
}) => {
  const getEntryBadge = (type: string) => {
    switch (type) {
      case "DEBIT_USAGE":
        return {
          icon: <ArrowUpRight className="h-3 w-3 text-emerald-600" />,
          label: "Debit Usage",
          classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        };
      case "CREDIT_ADJUSTMENT":
        return {
          icon: <ArrowDownLeft className="h-3 w-3 text-blue-600" />,
          label: "Credit Adjustment",
          classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
        };
      case "REVERSAL":
        return {
          icon: <RotateCcw className="h-3 w-3 text-rose-600" />,
          label: "Reversal",
          classes: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
        };
      case "ALLOWANCE_OFFSET":
        return {
          icon: <CheckCircle className="h-3 w-3 text-purple-600" />,
          label: "Meta Free Tier Offset",
          classes: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
        };
      case "RECONCILIATION_ADJUSTMENT":
        return {
          icon: <ShieldCheck className="h-3 w-3 text-amber-600" />,
          label: "Reconciliation Adj",
          classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
        };
      default:
        return {
          icon: <FileText className="h-3 w-3" />,
          label: type,
          classes: "bg-slate-50 text-slate-700 dark:bg-slate-850 dark:text-slate-300",
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Immutable Financial Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Append-only audit trail. Historical transactions are never overwritten; corrections use linked reversals.
            </p>
          </div>
        </div>

        <div>
          <select
            value={entryTypeFilter}
            onChange={(e) => onEntryTypeFilterChange(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Entry Types</option>
            <option value="DEBIT_USAGE">Debit Usage</option>
            <option value="CREDIT_ADJUSTMENT">Credit Adjustment</option>
            <option value="REVERSAL">Reversal</option>
            <option value="ALLOWANCE_OFFSET">Meta Free Tier Offset</option>
            <option value="RECONCILIATION_ADJUSTMENT">Reconciliation Adjustment</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Entry Type</th>
              <th className="px-4 py-3">Description / Reason</th>
              <th className="px-4 py-3 text-right">Meta Cost</th>
              <th className="px-4 py-3 text-right">Customer Charge</th>
              <th className="px-4 py-3 text-right">Customer GST</th>
              <th className="px-4 py-3 text-right">Supplier Tax</th>
              <th className="px-4 py-3">Idempotency Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading ledger entries...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No ledger entries recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const badge = getEntryBadge(entry.entryType);
                return (
                  <tr key={entry._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold ${badge.classes}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[280px]">
                      <div>{entry.description}</div>
                      {entry.reversalOfLedgerId && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          Reverses entry: {entry.reversalOfLedgerId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      ₹{entry.metaCost.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{entry.customerCharge.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      ₹{((entry.customerTaxAmountMicros || 0) / 1_000_000).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {entry.supplierTaxStatus === "invoice_verified" || entry.supplierTaxStatus === "estimated"
                        ? `₹${((entry.supplierTaxAmountMicros || 0) / 1_000_000).toFixed(4)}`
                        : "Unknown"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-[160px] truncate">
                      {entry.idempotencyKey}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
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
