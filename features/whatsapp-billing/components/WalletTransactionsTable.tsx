"use client";

import React from "react";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  RefreshCw,
  User,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WalletTransaction } from "../whatsapp-billing.types";

interface WalletTransactionsTableProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
}

export const WalletTransactionsTable: React.FC<WalletTransactionsTableProps> = ({
  transactions,
  isLoading,
  pagination,
  onPageChange,
  typeFilter,
  onTypeFilterChange,
}) => {
  const getBadgeForType = (type: string) => {
    switch (type) {
      case "CREDIT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            Credit
          </span>
        );
      case "DEBIT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            <ArrowDownRight className="h-3 w-3" />
            Debit
          </span>
        );
      case "HOLD":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Lock className="h-3 w-3" />
            Hold
          </span>
        );
      case "RELEASE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <Unlock className="h-3 w-3" />
            Release
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
            <Sliders className="h-3 w-3" />
            Adjustment
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-3 p-4 border-b border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Wallet Transaction Ledger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Append-only immutable record of all wallet holds, releases, debits, and credits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Transaction Types</option>
            <option value="CREDIT">Credits</option>
            <option value="DEBIT">Debits</option>
            <option value="HOLD">Holds (Reserved)</option>
            <option value="RELEASE">Releases</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Balance (Before → After)</th>
              <th className="px-4 py-3 font-medium">Reserved Hold</th>
              <th className="px-4 py-3 font-medium">Description & Ref</th>
              <th className="px-4 py-3 font-medium">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading wallet ledger entries...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No wallet transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getBadgeForType(tx.transactionType)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {tx.transactionType === "CREDIT" ? "+" : tx.transactionType === "DEBIT" ? "-" : ""}
                    ₹{tx.amountInr}
                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                      ({tx.amountPaise}p)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    ₹{(tx.balanceBeforePaise / 100).toFixed(2)} →{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{(tx.balanceAfterPaise / 100).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    ₹{(tx.reservedAfterPaise / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={tx.description}>
                    <div className="truncate font-medium">{tx.description}</div>
                    {tx.referenceId && (
                      <div className="text-[10px] text-slate-400 truncate">Ref: {tx.referenceId}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <span className="rounded-xs bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {tx.actorType}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-semibold">{pagination.page}</span> of{" "}
            <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} entries)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-7 px-2 text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
