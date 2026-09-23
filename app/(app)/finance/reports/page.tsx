"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  Scale,
  TrendingUp,
  Landmark,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import {
  financeApi,
  TrialBalanceReport,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
} from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function FinancialReportsPage() {
  const { activeMembership } = useWorkspace();

  // Active Report Tab: "TRIAL_BALANCE" | "PROFIT_LOSS" | "BALANCE_SHEET" | "CASH_FLOW" | "TAX"
  const [activeReport, setActiveReport] = useState<
    "TRIAL_BALANCE" | "PROFIT_LOSS" | "BALANCE_SHEET" | "CASH_FLOW" | "TAX"
  >("TRIAL_BALANCE");

  // Date States
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [asOfDate, setAsOfDate] = useState(today);
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  // Queries
  const {
    data: tbRes,
    isLoading: isTbLoading,
    refetch: refetchTb,
  } = useQuery({
    queryKey: ["finance", "reports", "trial-balance", asOfDate],
    queryFn: () => financeApi.getTrialBalance({ asOfDate }),
    enabled: activeReport === "TRIAL_BALANCE",
  });

  const {
    data: pnlRes,
    isLoading: isPnlLoading,
    refetch: refetchPnl,
  } = useQuery({
    queryKey: ["finance", "reports", "profit-loss", startDate, endDate],
    queryFn: () => financeApi.getProfitAndLoss({ startDate, endDate }),
    enabled: activeReport === "PROFIT_LOSS",
  });

  const {
    data: bsRes,
    isLoading: isBsLoading,
    refetch: refetchBs,
  } = useQuery({
    queryKey: ["finance", "reports", "balance-sheet", asOfDate],
    queryFn: () => financeApi.getBalanceSheet({ asOfDate }),
    enabled: activeReport === "BALANCE_SHEET",
  });

  const {
    data: cfRes,
    isLoading: isCfLoading,
    refetch: refetchCf,
  } = useQuery({
    queryKey: ["finance", "reports", "cash-flow", startDate, endDate],
    queryFn: () => financeApi.getCashFlow({ startDate, endDate }),
    enabled: activeReport === "CASH_FLOW",
  });

  const {
    data: taxRes,
    isLoading: isTaxLoading,
    refetch: refetchTax,
  } = useQuery({
    queryKey: ["finance", "reports", "tax-summary", startDate, endDate],
    queryFn: () => financeApi.getTaxSummary({ startDate, endDate }),
    enabled: activeReport === "TAX",
  });

  const trialBalance = tbRes?.data;
  const pnl = pnlRes?.data;
  const balanceSheet = bsRes?.data;
  const cashFlow = cfRes?.data;
  const taxSummary = taxRes?.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Authoritative accounting statements generated directly from immutable double-entry journal postings.
          </p>
        </div>

        {/* Date Selector Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {activeReport === "TRIAL_BALANCE" || activeReport === "BALANCE_SHEET" ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">As Of:</span>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={() => {
              if (activeReport === "TRIAL_BALANCE") refetchTb();
              else if (activeReport === "PROFIT_LOSS") refetchPnl();
              else if (activeReport === "BALANCE_SHEET") refetchBs();
              else if (activeReport === "CASH_FLOW") refetchCf();
              else if (activeReport === "TAX") refetchTax();
            }}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs hover:bg-slate-50"
            title="Refresh Report"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: "TRIAL_BALANCE", label: "Trial Balance", icon: Scale },
            { id: "PROFIT_LOSS", label: "Profit & Loss (P&L)", icon: TrendingUp },
            { id: "BALANCE_SHEET", label: "Balance Sheet", icon: Landmark },
            { id: "CASH_FLOW", label: "Cash Flow Statement", icon: Receipt },
            { id: "TAX", label: "Tax / GST Summary", icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
                  activeReport === tab.id
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* REPORT 1: TRIAL BALANCE */}
      {activeReport === "TRIAL_BALANCE" && (
        <div className="space-y-4">
          {isTbLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : trialBalance ? (
            <>
              {/* Balance Check Banner */}
              <div
                className={`rounded-xl border p-4 shadow-xs ${
                  trialBalance.isBalanced
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                    : "border-red-200 bg-red-50/60 text-red-900"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {trialBalance.isBalanced ? (
                      <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {trialBalance.isBalanced
                          ? "Trial Balance In Equilibrium (Debit = Credit)"
                          : "Trial Balance Imbalance Detected!"}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        Sum of all account debit balances equals sum of credit balances across the general ledger.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="block text-slate-500">Total Debits:</span>
                      <span className="font-mono font-bold text-sm">
                        {formatCurrency(trialBalance.totalDebits, trialBalance.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Total Credits:</span>
                      <span className="font-mono font-bold text-sm">
                        {formatCurrency(trialBalance.totalCredits, trialBalance.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Difference:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          trialBalance.difference === 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {formatCurrency(trialBalance.difference, trialBalance.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trial Balance Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Account Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Debit Total</th>
                        <th className="px-4 py-3 text-right">Credit Total</th>
                        <th className="px-4 py-3 text-right">Net Debit</th>
                        <th className="px-4 py-3 text-right">Net Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trialBalance.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-mono text-xs font-bold text-slate-900">{row.code}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{row.name}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{row.type}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-xs">
                            {row.debitTotal > 0 ? formatCurrency(row.debitTotal, trialBalance.currency) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-xs">
                            {row.creditTotal > 0 ? formatCurrency(row.creditTotal, trialBalance.currency) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900">
                            {row.netDebit > 0 ? formatCurrency(row.netDebit, trialBalance.currency) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-900">
                            {row.netCredit > 0 ? formatCurrency(row.netCredit, trialBalance.currency) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">
                          Grand Totals:
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {formatCurrency(trialBalance.totalDebits, trialBalance.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {formatCurrency(trialBalance.totalCredits, trialBalance.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-emerald-700">
                          {formatCurrency(trialBalance.totalDebits, trialBalance.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-emerald-700">
                          {formatCurrency(trialBalance.totalCredits, trialBalance.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* REPORT 2: PROFIT & LOSS */}
      {activeReport === "PROFIT_LOSS" && (
        <div className="space-y-6">
          {isPnlLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : pnl ? (
            <>
              {/* PnL Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Operating Revenue</span>
                  <div className="mt-2 text-2xl font-bold text-emerald-600">
                    +{formatCurrency(pnl.totalRevenue, pnl.currency)}
                  </div>
                  <span className="text-xs text-slate-400">Total sales and other income</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Total Expenses</span>
                  <div className="mt-2 text-2xl font-bold text-rose-600">
                    -{formatCurrency(pnl.totalExpenses, pnl.currency)}
                  </div>
                  <span className="text-xs text-slate-400">COGS, operational & direct costs</span>
                </div>

                <div
                  className={`rounded-xl border p-4 shadow-xs ${
                    pnl.netProfit >= 0
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      pnl.netProfit >= 0 ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    Net Profit / (Loss)
                  </span>
                  <div
                    className={`mt-2 text-2xl font-bold ${
                      pnl.netProfit >= 0 ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {formatCurrency(pnl.netProfit, pnl.currency)}
                  </div>
                  <span
                    className={`text-xs ${pnl.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    Transfers to Retained Earnings on Balance Sheet
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Tables */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Revenue Breakdown */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                    <span>Revenue Accounts</span>
                    <span className="text-emerald-700">{formatCurrency(pnl.totalRevenue, pnl.currency)}</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {pnl.revenueRows.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No revenue in this period.</div>
                    ) : (
                      pnl.revenueRows.map((r) => (
                        <div key={r.id} className="flex justify-between px-4 py-2.5">
                          <span className="font-medium text-slate-800">
                            {r.code} - {r.name}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            {formatCurrency(r.balance, pnl.currency)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                    <span>Expense Accounts</span>
                    <span className="text-rose-700">{formatCurrency(pnl.totalExpenses, pnl.currency)}</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {pnl.expenseRows.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No expenses in this period.</div>
                    ) : (
                      pnl.expenseRows.map((r) => (
                        <div key={r.id} className="flex justify-between px-4 py-2.5">
                          <span className="font-medium text-slate-800">
                            {r.code} - {r.name}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            {formatCurrency(r.balance, pnl.currency)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* REPORT 3: BALANCE SHEET */}
      {activeReport === "BALANCE_SHEET" && (
        <div className="space-y-6">
          {isBsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : balanceSheet ? (
            <>
              {/* Accounting Equation Verification Banner */}
              <div
                className={`rounded-xl border p-4 shadow-xs ${
                  balanceSheet.isBalanced
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                    : "border-red-200 bg-red-50/60 text-red-900"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {balanceSheet.isBalanced ? (
                      <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {balanceSheet.isBalanced
                          ? "Accounting Equation Satisfied (Assets = Liabilities + Equity)"
                          : "Balance Sheet Imbalance Detected"}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        Net assets equal capital plus current retained earnings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="block text-slate-500">Total Assets:</span>
                      <span className="font-mono font-bold text-sm">
                        {formatCurrency(balanceSheet.totalAssets, balanceSheet.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Liabilities + Equity:</span>
                      <span className="font-mono font-bold text-sm">
                        {formatCurrency(balanceSheet.totalLiabilitiesAndEquity, balanceSheet.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Difference:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          balanceSheet.difference === 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {formatCurrency(balanceSheet.difference, balanceSheet.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Column Sections */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Assets Column */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                    <span>Assets</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(balanceSheet.totalAssets, balanceSheet.currency)}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {balanceSheet.assetRows.map((r) => (
                      <div key={r.id} className="flex justify-between px-4 py-2.5">
                        <span className="font-medium text-slate-800">
                          {r.code} - {r.name}
                        </span>
                        <span className="font-mono font-semibold text-slate-900">
                          {formatCurrency(r.balance, balanceSheet.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-6">
                  {/* Liabilities */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                      <span>Liabilities</span>
                      <span className="font-mono font-bold text-amber-700">
                        {formatCurrency(balanceSheet.totalLiabilities, balanceSheet.currency)}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {balanceSheet.liabilityRows.map((r) => (
                        <div key={r.id} className="flex justify-between px-4 py-2.5">
                          <span className="font-medium text-slate-800">
                            {r.code} - {r.name}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            {formatCurrency(r.balance, balanceSheet.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equity */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                      <span>Equity</span>
                      <span className="font-mono font-bold text-purple-700">
                        {formatCurrency(
                          balanceSheet.totalEquity + balanceSheet.retainedEarnings,
                          balanceSheet.currency
                        )}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {balanceSheet.equityRows.map((r) => (
                        <div key={r.id} className="flex justify-between px-4 py-2.5">
                          <span className="font-medium text-slate-800">
                            {r.code} - {r.name}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            {formatCurrency(r.balance, balanceSheet.currency)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between px-4 py-2.5 bg-purple-50/50">
                        <span className="font-semibold text-purple-900">
                          Current Retained Earnings (From P&L)
                        </span>
                        <span className="font-mono font-bold text-purple-700">
                          {formatCurrency(balanceSheet.retainedEarnings, balanceSheet.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* REPORT 4: CASH FLOW STATEMENT */}
      {activeReport === "CASH_FLOW" && (
        <div className="space-y-4">
          {isCfLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : cashFlow ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Operating Cash Flow</span>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {formatCurrency(cashFlow.operatingCashFlow, cashFlow.currency)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Net Cash Movement</span>
                  <div className="mt-2 text-xl font-bold text-emerald-600">
                    {formatCurrency(cashFlow.netCashFlow, cashFlow.currency)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Ending Cash & Bank</span>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {formatCurrency(cashFlow.endingCash, cashFlow.currency)}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm">
                  Operating Cash Activities
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {cashFlow.operatingItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No cash flow movements recorded in this period.</div>
                  ) : (
                    cashFlow.operatingItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2.5">
                        <div>
                          <span className="font-semibold text-slate-900 font-mono mr-2">{item.entryNumber}</span>
                          <span className="text-slate-600">{item.description}</span>
                          <span className="text-slate-400 ml-2">({new Date(item.date).toLocaleDateString()})</span>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            item.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {item.amount >= 0 ? "+" : ""}
                          {formatCurrency(item.amount, cashFlow.currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* REPORT 5: TAX / GST SUMMARY */}
      {activeReport === "TAX" && (
        <div className="space-y-4">
          {isTaxLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : taxSummary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Output Tax Collected (Sales)</span>
                  <div className="mt-2 text-xl font-bold text-emerald-600">
                    {formatCurrency(taxSummary.outputTaxTotal || 0, "INR")}
                  </div>
                  <span className="text-xs text-slate-400">Output CGST + SGST</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Input Tax Credit (Expenses/Bills)</span>
                  <div className="mt-2 text-xl font-bold text-blue-600">
                    {formatCurrency(taxSummary.inputTaxTotal || 0, "INR")}
                  </div>
                  <span className="text-xs text-slate-400">Input tax eligible for set-off</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-xs font-medium text-slate-500">Net Tax Payable / (Credit)</span>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {formatCurrency(
                      (taxSummary.outputTaxTotal || 0) - (taxSummary.inputTaxTotal || 0),
                      "INR"
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Net remittance liability</span>
                </div>
              </div>

              {/* Tax Details */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">GST Tax Accounts Ledger Balances</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {taxSummary.taxAccounts?.map((acc: any) => (
                    <div key={acc.code} className="flex justify-between py-2">
                      <span className="font-medium text-slate-800">
                        {acc.code} - {acc.name}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(acc.balance, "INR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
