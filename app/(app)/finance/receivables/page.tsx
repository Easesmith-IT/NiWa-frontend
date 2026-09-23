"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import { financeApi, AgingReport, ReconciliationResult } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function ReceivablesPage() {
  const { activeMembership } = useWorkspace();
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("ALL");
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Queries
  const { data: agingRes, isLoading: isAgingLoading, refetch: refetchAging } = useQuery({
    queryKey: ["finance", "receivables-aging", asOfDate],
    queryFn: () => financeApi.getReceivablesAging(asOfDate),
  });

  const { data: reconRes, isLoading: isReconLoading, refetch: refetchRecon } = useQuery({
    queryKey: ["finance", "receivables-reconcile", asOfDate],
    queryFn: () => financeApi.reconcileReceivables(asOfDate),
  });

  const { data: invoicesRes, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["finance", "receivables-invoices", { search, paymentStatus, page }],
    queryFn: () =>
      financeApi.getReceivablesInvoices({
        page,
        limit,
        search: search || undefined,
        paymentStatus: paymentStatus !== "ALL" ? paymentStatus : undefined,
      }),
  });

  const aging = agingRes?.data;
  const reconciliation = reconRes?.data;
  const invoices = invoicesRes?.items || [];
  const totalInvoices = invoicesRes?.total || 0;
  const totalPages = Math.ceil(totalInvoices / limit);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Accounts Receivable (AR)</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer receivables tracking, overdue aging breakdown, and general ledger reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => {
              refetchAging();
              refetchRecon();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Live Ledger Reconciliation Banner */}
      {reconciliation && (
        <div
          className={`rounded-xl border p-4 shadow-xs ${
            reconciliation.status === "MATCHED"
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
              : "border-red-200 bg-red-50/60 text-red-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {reconciliation.status === "MATCHED" ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {reconciliation.status === "MATCHED"
                    ? "Sub-ledger & General Ledger Reconciled"
                    : "Ledger Discrepancy Detected"}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Accounts Receivable Account (1030) matches total open sales invoices balance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="block text-slate-500">GL Account (1030):</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(reconciliation.ledgerBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Open Invoices:</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(reconciliation.operationalBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Variance:</span>
                <span className={`font-mono font-bold text-sm ${reconciliation.difference === 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {formatCurrency(reconciliation.difference, "INR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aging Breakdown Cards */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Receivables Aging (As of {new Date(asOfDate).toLocaleDateString()})</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500">Total Outstanding</span>
            <div className="mt-1.5 text-base font-bold text-slate-900">
              {formatCurrency(aging?.totalOutstanding || 0, "INR")}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-emerald-700">
              <span>Current</span>
              <span>{aging?.buckets?.current?.count || 0}</span>
            </div>
            <div className="mt-1.5 text-base font-bold text-emerald-600">
              {formatCurrency(aging?.buckets?.current?.amount || 0, "INR")}
            </div>
            <span className="text-[10px] text-slate-400">Not yet due</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-amber-700">
              <span>1 - 30 Days</span>
              <span>{aging?.buckets?.days1To30?.count || 0}</span>
            </div>
            <div className="mt-1.5 text-base font-bold text-amber-600">
              {formatCurrency(aging?.buckets?.days1To30?.amount || 0, "INR")}
            </div>
            <span className="text-[10px] text-slate-400">Past due</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-orange-700">
              <span>31 - 60 Days</span>
              <span>{aging?.buckets?.days31To60?.count || 0}</span>
            </div>
            <div className="mt-1.5 text-base font-bold text-orange-600">
              {formatCurrency(aging?.buckets?.days31To60?.amount || 0, "INR")}
            </div>
            <span className="text-[10px] text-slate-400">Overdue</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-rose-700">
              <span>61 - 90 Days</span>
              <span>{aging?.buckets?.days61To90?.count || 0}</span>
            </div>
            <div className="mt-1.5 text-base font-bold text-rose-600">
              {formatCurrency(aging?.buckets?.days61To90?.amount || 0, "INR")}
            </div>
            <span className="text-[10px] text-slate-400">Critical</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-purple-700">
              <span>90+ Days</span>
              <span>{aging?.buckets?.days90Plus?.count || 0}</span>
            </div>
            <div className="mt-1.5 text-base font-bold text-purple-600">
              {formatCurrency(aging?.buckets?.days90Plus?.amount || 0, "INR")}
            </div>
            <span className="text-[10px] text-slate-400">Severely overdue</span>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, invoice ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {isInvoicesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Clock className="h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No invoices match your filter</h3>
              <p className="mt-1 text-xs text-slate-500">All customer invoices are fully settled or none exist.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-right">Paid Amount</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <span className="font-mono text-xs">{inv.invoiceId}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {inv.customer?.name || "Customer"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(inv.issueDate || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : inv.paymentStatus === "PARTIAL"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {formatCurrency(inv.grandTotal, inv.currency || "INR")}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-emerald-700 font-medium">
                        {formatCurrency(inv.paidAmount || 0, inv.currency || "INR")}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(inv.balanceDue, inv.currency || "INR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/sales/invoices`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages} ({totalInvoices} invoices)
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
