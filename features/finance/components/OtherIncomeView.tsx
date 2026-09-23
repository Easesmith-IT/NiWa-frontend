"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  Search,
  Plus,
  RotateCcw,
  X,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { financeApi, OtherIncome } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

export function OtherIncomeView() {
  const queryClient = useQueryClient();
  const { canManage } = useFinancePermissions();

  // Filter state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<OtherIncome | null>(null);
  const [isReverseOpen, setIsReverseOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState("");

  // Record Form state
  const [formData, setFormData] = useState({
    incomeAccountId: "",
    depositAccountId: "",
    amount: 0,
    incomeDate: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
  });

  // Queries
  const { data: incomeRes, isLoading } = useQuery({
    queryKey: ["finance", "income", { search, page }],
    queryFn: () =>
      financeApi.getOtherIncomes({
        page,
        limit,
        search: search || undefined,
      }),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const accounts = accountsRes?.data || [];
  const incomeAccounts = accounts.filter((a) => a.type === "INCOME");
  const assetAccounts = accounts.filter((a) => a.type === "ASSET" && (a.subtype === "BANK" || a.subtype === "CASH" || a.code.startsWith("10")));

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createOtherIncome(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsRecordOpen(false);
      resetForm();
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.reverseOtherIncome(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsReverseOpen(false);
      setSelectedIncome(null);
      setReversalReason("");
    },
  });

  const resetForm = () => {
    setFormData({
      incomeAccountId: incomeAccounts[0]?._id || "",
      depositAccountId: assetAccounts[0]?._id || "",
      amount: 0,
      incomeDate: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  const items = incomeRes?.items || [];
  const total = incomeRes?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const totalAmount = items.reduce((acc, curr) => acc + (curr.status !== "REVERSED" ? curr.amount : 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Other Income</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record non-sales revenues, interest received, asset sales, and miscellaneous receipts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              resetForm();
              setIsRecordOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Record Income
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Other Income</span>
          <div className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totalAmount, "INR")}</div>
          <span className="text-xs text-slate-400">{total} transactions listed</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-800">Double-Entry Impact</span>
          <div className="mt-2 text-sm font-medium text-emerald-700">Debits Bank / Cash, Credits Income Account</div>
          <span className="text-xs text-emerald-600">Immediate general ledger balance posting</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, reference, income ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <TrendingUp className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No other income entries</h3>
            <p className="mt-1 text-xs text-slate-500">Record non-sales income streams to track miscellaneous earnings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Income ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Income Account</th>
                  <th className="px-4 py-3">Deposit To</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="font-mono text-xs">{inc.incomeId}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(inc.incomeDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {inc.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {inc.incomeAccountId?.name ? `${inc.incomeAccountId.code} - ${inc.incomeAccountId.name}` : "Income"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {inc.depositAccountId?.name ? `${inc.depositAccountId.code} - ${inc.depositAccountId.name}` : "Bank"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {inc.reference || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          inc.status === "POSTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      +{formatCurrency(inc.amount, inc.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedIncome(inc);
                            setIsDetailOpen(true);
                          }}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canManage && inc.status === "POSTED" && (
                          <button
                            onClick={() => {
                              setSelectedIncome(inc);
                              setIsReverseOpen(true);
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Reverse Income"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
              Page {page} of {totalPages} ({total} entries)
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

      {/* Record Income Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Record Other Income</h3>
              <button onClick={() => setIsRecordOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{(createMutation.error as any)?.response?.data?.message || "Failed to record income."}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Income Account *</label>
                  <select
                    required
                    value={formData.incomeAccountId}
                    onChange={(e) => setFormData({ ...formData, incomeAccountId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Income Account</option>
                    {incomeAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Deposit Account (Asset) *</label>
                  <select
                    required
                    value={formData.depositAccountId}
                    onChange={(e) => setFormData({ ...formData, depositAccountId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Asset Account</option>
                    {assetAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Amount (INR) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Income Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.incomeDate}
                    onChange={(e) => setFormData({ ...formData, incomeDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank interest credit, Scrap sale proceeds"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Reference / UTR Number</label>
                <input
                  type="text"
                  placeholder="Optional reference code"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {isReverseOpen && selectedIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5" />
                Reverse Income: {selectedIncome.incomeId}
              </h3>
              <button onClick={() => setIsReverseOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This action will post an exact mirror reversal journal entry to reverse the income and bank deposit.
            </p>

            {reverseMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(reverseMutation.error as any)?.response?.data?.message || "Reversal failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reverseMutation.mutate({ id: selectedIncome._id, reason: reversalReason });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Reason for Reversal *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Bank correction, wrong credit"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReverseOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reverseMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {reverseMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedIncome.incomeId}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Date:</span>{" "}
                  <span className="font-medium text-slate-800">{new Date(selectedIncome.incomeDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedIncome.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Description:</span>
                <p className="mt-0.5 text-slate-800 font-medium">{selectedIncome.description}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                <div className="flex justify-between">
                  <span>Income Account:</span>
                  <span className="font-medium text-slate-800">
                    {selectedIncome.incomeAccountId?.name || "Income"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Account:</span>
                  <span className="font-medium text-slate-800">
                    {selectedIncome.depositAccountId?.name || "Bank"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Amount Credited:</span>
                  <span className="text-emerald-700">+{formatCurrency(selectedIncome.amount, selectedIncome.currency)}</span>
                </div>
              </div>

              {selectedIncome.reversalReason && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <span className="font-semibold">Reversal Reason:</span> {selectedIncome.reversalReason}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
