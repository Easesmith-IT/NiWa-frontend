"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Landmark,
  Wallet,
  CreditCard,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Scale,
  Settings,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { financeApi } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function FinanceOverviewPage() {
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  const { data: overviewRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["finance", "overview"],
    queryFn: () => financeApi.getOverview(),
  });

  const { data: recRes } = useQuery({
    queryKey: ["finance", "reconciliation-overview"],
    queryFn: () => financeApi.getOverviewReconciliations(),
  });

  const overview = overviewRes?.data;
  const reconciliations = recRes?.data;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5" />
            Failed to load Finance overview
          </div>
          <p className="mt-1 text-sm text-red-700">Please make sure the Finance module is enabled for this workspace.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance & Accounting</h1>
          <p className="mt-1 text-sm text-slate-500">
            Authoritative double-entry general ledger, receivables, payables, and financial reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <>
              <Link
                href="/finance/expenses"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Record Expense
              </Link>
              <Link
                href="/finance/payables"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                New Bill
              </Link>
              <Link
                href="/finance/journals"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                New Journal
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Activation / Lock Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${overview?.isActivated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {overview?.isActivated ? "Finance Ledger Active" : "Finance Activation Pending"}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${overview?.isActivated ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {overview?.isActivated ? "Active" : "Unactivated"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {overview?.activationDate
                ? `Active since ${new Date(overview.activationDate).toLocaleDateString()} (historical transactions prior to activation remain unposted)`
                : "Set an activation date and opening balances to begin double-entry posting."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {overview?.lockedUntilDate && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Locked up to: {new Date(overview.lockedUntilDate).toLocaleDateString()}
            </div>
          )}
          <Link
            href="/finance/settings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Configure Settings &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Receivables */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Receivables (AR)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(overview?.receivables.totalOutstanding || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Overdue: {formatCurrency(overview?.receivables.overdueAmount || 0)}</span>
            <Link href="/finance/receivables" className="font-medium text-blue-600 hover:underline">
              View AR
            </Link>
          </div>
        </div>

        {/* Payables */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Payables (AP)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(overview?.payables.totalOutstanding || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Overdue: {formatCurrency(overview?.payables.overdueAmount || 0)}</span>
            <Link href="/finance/payables" className="font-medium text-purple-600 hover:underline">
              View AP
            </Link>
          </div>
        </div>

        {/* Cash & Bank */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cash & Bank Balances</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(overview?.cashAndBank.totalBalance || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{overview?.cashAndBank.accounts.length || 0} liquid accounts</span>
            <Link href="/finance/accounts" className="font-medium text-emerald-600 hover:underline">
              Accounts
            </Link>
          </div>
        </div>

        {/* Month to Date Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">MTD Net Income</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(overview?.monthToDate.netProfit || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Rev: {formatCurrency(overview?.monthToDate.revenue || 0)}</span>
            <Link href="/finance/reports" className="font-medium text-amber-600 hover:underline">
              P&L
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Reconciliation Health & Quick Navigation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ledger vs Operational Reconciliation Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Reconciliation Health</h2>
              <p className="text-xs text-slate-500">Integrity check between operational records and general ledger accounts</p>
            </div>
            <Link href="/finance/reconciliation" className="text-xs font-semibold text-indigo-600 hover:underline">
              Details &rarr;
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {/* AR Reconciliation Card */}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">Accounts Receivable (1030)</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${reconciliations?.receivables.status === "MATCHED" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {reconciliations?.receivables.status === "MATCHED" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {reconciliations?.receivables.status === "MATCHED" ? "Matched" : "Mismatch"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Ledger: {formatCurrency(reconciliations?.receivables.ledgerBalance || 0)} &bull; Invoices: {formatCurrency(reconciliations?.receivables.operationalBalance || 0)}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-700">Diff</div>
                <div className={reconciliations?.receivables.difference === 0 ? "text-slate-500" : "font-semibold text-red-600"}>
                  {formatCurrency(reconciliations?.receivables.difference || 0)}
                </div>
              </div>
            </div>

            {/* AP Reconciliation Card */}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">Accounts Payable (2010)</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${reconciliations?.payables.status === "MATCHED" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {reconciliations?.payables.status === "MATCHED" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {reconciliations?.payables.status === "MATCHED" ? "Matched" : "Mismatch"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Ledger: {formatCurrency(reconciliations?.payables.ledgerBalance || 0)} &bull; Bills: {formatCurrency(reconciliations?.payables.operationalBalance || 0)}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-700">Diff</div>
                <div className={reconciliations?.payables.difference === 0 ? "text-slate-500" : "font-semibold text-red-600"}>
                  {formatCurrency(reconciliations?.payables.difference || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav Modules */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900">Finance Workflows</h2>
            <p className="text-xs text-slate-500">Quick access to accounting functions</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/finance/expenses"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Expenses</div>
                <div className="text-xs text-slate-500">Track paid & unpaid costs</div>
              </div>
            </Link>

            <Link
              href="/finance/income"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Other Income</div>
                <div className="text-xs text-slate-500">Non-sales revenue</div>
              </div>
            </Link>

            <Link
              href="/finance/journals"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Landmark className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Journals</div>
                <div className="text-xs text-slate-500">Double-entry manual entries</div>
              </div>
            </Link>

            <Link
              href="/finance/reports"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Reports</div>
                <div className="text-xs text-slate-500">P&L, Balance Sheet, TB</div>
              </div>
            </Link>

            <Link
              href="/finance/accounts"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Chart of Accounts</div>
                <div className="text-xs text-slate-500">Ledger & account tree</div>
              </div>
            </Link>

            <Link
              href="/finance/settings"
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Settings</div>
                <div className="text-xs text-slate-500">Period locks & opening balances</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
