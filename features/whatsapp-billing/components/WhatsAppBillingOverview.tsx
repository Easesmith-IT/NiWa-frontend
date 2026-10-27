"use client";

import React from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Gift,
  HelpCircle,
  IndianRupee,
  Layers,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppBillingSummary, WorkspaceWallet } from "../whatsapp-billing.types";
import { WorkspaceWalletCard } from "./WorkspaceWalletCard";

interface WhatsAppBillingOverviewProps {
  summary?: WhatsAppBillingSummary;
  wallet?: WorkspaceWallet;
  isWalletLoading?: boolean;
  isLoading: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onExport: (format: "json" | "csv") => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WhatsAppBillingOverview: React.FC<WhatsAppBillingOverviewProps> = ({
  summary,
  wallet,
  isWalletLoading,
  isLoading,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onExport,
}) => {
  const metrics = summary?.metrics;
  const allowance = summary?.allowance;
  const categories = summary?.byCategory;

  const totalMetaCost = metrics?.totalMetaCost ?? 0;
  const totalCustomerCharge = metrics?.totalCustomerCharge ?? 0;
  const platformMarkup = Math.max(0, totalCustomerCharge - totalMetaCost);

  return (
    <div className="space-y-6">
      {/* Top Header & Period Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            WhatsApp Usage & Billing Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time usage pricing, immutable financial ledger, and atomic allowance accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {[2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("csv")}
            className="h-9 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("json")}
            className="h-9 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </Button>
        </div>
      </div>

      {/* Prepaid Workspace Messaging Wallet */}
      <WorkspaceWalletCard wallet={wallet} isLoading={Boolean(isWalletLoading)} />

      {/* Main KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Usage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Outbound Events</span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isLoading ? "..." : (metrics?.totalEvents ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {metrics?.billableCount ?? 0} billable
              </span>
              <span>•</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {metrics?.freeAllowanceCount ?? 0} free
              </span>
            </div>
          </div>
        </div>

        {/* Meta WhatsApp Cost */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Meta WhatsApp Cost</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{isLoading ? "..." : totalMetaCost.toFixed(4)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Direct Meta WhatsApp Business API charges
            </div>
          </div>
        </div>

        {/* Customer Selling Price / Charges */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Confirmed Charges</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{isLoading ? "..." : totalCustomerCharge.toFixed(4)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Finalized ledger debits</span>
              {metrics?.provisionalCustomerCharge !== undefined && metrics.provisionalCustomerCharge > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-medium" title="Unconfirmed holds pending delivery">
                  +₹{metrics.provisionalCustomerCharge.toFixed(4)} pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Platform Margin / Markup */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Platform Gross Markup</span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{isLoading ? "..." : platformMarkup.toFixed(4)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Customer Charge – Meta Wholesale Cost
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Free Allowance Section */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 dark:border-purple-900/50 dark:bg-purple-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Monthly Free Service Messages Allowance
                </h3>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Period: {summary?.period || `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                First 1,000 eligible service conversation replies per business phone number per calendar month are 100% free (₹0 charge).
              </p>
            </div>
          </div>

          <div className="text-right sm:min-w-[180px]">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isLoading
                ? "..."
                : (allowance?.provisionalReserved ?? 0) > 0
                ? `${allowance?.finalizedConsumed ?? 0} finalized (${allowance?.provisionalReserved} in-flight) / ${allowance?.granted ?? 1000}`
                : `${allowance?.finalizedConsumed ?? allowance?.consumed ?? 0} / ${allowance?.granted ?? 1000}`}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? "..." : `${allowance?.remaining ?? 1000} remaining`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2.5 w-full rounded-full bg-purple-200/60 dark:bg-purple-950">
            <div
              className="h-2.5 rounded-full bg-purple-600 transition-all duration-300 dark:bg-purple-500"
              style={{ width: `${Math.min(100, allowance?.percentUsed ?? 0)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>0 used</span>
            <span>
              {allowance?.percentUsed?.toFixed(1) ?? 0}% allocated
              {(allowance?.provisionalReserved ?? 0) > 0
                ? ` (${allowance?.finalizedConsumed ?? 0} confirmed, ${allowance?.provisionalReserved} provisional)`
                : ""}
            </span>
            <span>1,000 free quota</span>
          </div>
        </div>

        {/* Optional Discrepancy Warning Badge */}
        {(allowance?.unresolvedDiscrepanciesCount ?? 0) > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
            <span>
              <strong>Reconciliation Alert:</strong> {allowance?.unresolvedDiscrepanciesCount} allowance discrepancy
              {allowance?.unresolvedDiscrepanciesCount === 1 ? " requires" : "s require"} operator review in the Reconciliation Hub.
            </span>
          </div>
        )}
      </div>

      {/* Category Cost Breakdown Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marketing */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Marketing</span>
            <span className="rounded-sm bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ₹0.8631 / msg
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            ₹{categories?.marketing?.customerCharge?.toFixed(4) ?? "0.0000"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {categories?.marketing?.count ?? 0} delivered messages
          </div>
        </div>

        {/* Utility */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Utility</span>
            <span className="rounded-sm bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              ₹0.1150 / msg
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            ₹{categories?.utility?.customerCharge?.toFixed(4) ?? "0.0000"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {categories?.utility?.count ?? 0} messages (24h window billable)
          </div>
        </div>

        {/* Authentication */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Authentication</span>
            <span className="rounded-sm bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              ₹0.1150 / msg
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            ₹{categories?.authentication?.customerCharge?.toFixed(4) ?? "0.0000"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {categories?.authentication?.count ?? 0} OTP & security sends
          </div>
        </div>

        {/* Service */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service</span>
            <span className="rounded-sm bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              1k Free + ₹0.1150
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            ₹{categories?.service?.customerCharge?.toFixed(4) ?? "0.0000"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {categories?.service?.freeCount ?? 0} free, {categories?.service?.billableCount ?? 0} paid
          </div>
        </div>
      </div>
    </div>
  );
};
