"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Trash2,
  Eye,
  CreditCard,
  Building2,
  FileText,
} from "lucide-react";
import { financeApi, Expense, Account } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isReverseOpen, setIsReverseOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState("");

  // Record Form state
  const [formData, setFormData] = useState({
    expenseAccountId: "",
    paymentStatus: "PAID" as "PAID" | "UNPAID",
    paidFromAccountId: "",
    payableAccountId: "",
    amount: 0,
    taxRatePercent: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    vendorName: "",
    receiptUrl: "",
    isDraft: false,
  });

  // Pay Form state
  const [payFormData, setPayFormData] = useState({
    paidFromAccountId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    reference: "",
  });

  // Queries
  const { data: expensesRes, isLoading, refetch } = useQuery({
    queryKey: ["finance", "expenses", { search, status: statusFilter, paymentStatus: paymentFilter, page }],
    queryFn: () =>
      financeApi.getExpenses({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "ALL" ? paymentFilter : undefined,
      }),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const accounts = accountsRes?.data || [];
  const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
  const assetAccounts = accounts.filter((a) => a.type === "ASSET" && (a.subtype === "BANK" || a.subtype === "CASH" || a.code.startsWith("10")));
  const liabilityAccounts = accounts.filter((a) => a.type === "LIABILITY");

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsRecordOpen(false);
      resetForm();
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.payExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsPayOpen(false);
      setSelectedExpense(null);
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.reverseExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsReverseOpen(false);
      setSelectedExpense(null);
      setReversalReason("");
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteDraftExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setSelectedExpense(null);
      setIsDetailOpen(false);
    },
  });

  const resetForm = () => {
    setFormData({
      expenseAccountId: expenseAccounts[0]?._id || "",
      paymentStatus: "PAID",
      paidFromAccountId: assetAccounts[0]?._id || "",
      payableAccountId: liabilityAccounts[0]?._id || "",
      amount: 0,
      taxRatePercent: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      description: "",
      vendorName: "",
      receiptUrl: "",
      isDraft: false,
    });
  };

  const calculatedTax = (Number(formData.amount) * Number(formData.taxRatePercent)) / 100;
  const calculatedGrandTotal = Number(formData.amount) + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: Number(formData.amount),
      taxRatePercent: Number(formData.taxRatePercent),
    });
  };

  const items = expensesRes?.items || [];
  const total = expensesRes?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Compute local metrics
  const totalGrand = items.reduce((acc, curr) => acc + (curr.status !== "REVERSED" ? curr.grandTotal : 0), 0);
  const totalPaid = items.reduce((acc, curr) => acc + (curr.paymentStatus === "PAID" && curr.status !== "REVERSED" ? curr.grandTotal : 0), 0);
  const totalUnpaid = items.reduce((acc, curr) => acc + (curr.paymentStatus === "UNPAID" && curr.status !== "REVERSED" ? curr.grandTotal : 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operating Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record direct and accrued business expenses with synchronous double-entry journal postings.
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
            Record Expense
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Listed Expenses</span>
          <div className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totalGrand, "INR")}</div>
          <span className="text-xs text-slate-400">{total} transactions</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-800">Paid Amount</span>
          <div className="mt-2 text-xl font-bold text-emerald-700">{formatCurrency(totalPaid, "INR")}</div>
          <span className="text-xs text-emerald-600">Settled via Cash/Bank</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-xs font-medium text-amber-800">Accrued / Outstanding</span>
          <div className="mt-2 text-xl font-bold text-amber-700">{formatCurrency(totalUnpaid, "INR")}</div>
          <span className="text-xs text-amber-600">Pending settlement</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor, description, expense ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="POSTED">Posted</option>
            <option value="DRAFT">Draft</option>
            <option value="REVERSED">Reversed</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Payment</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No expenses recorded</h3>
            <p className="mt-1 text-xs text-slate-500">Get started by recording your operational expenses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Expense ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Vendor / Payee</th>
                  <th className="px-4 py-3">Expense Account</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Grand Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="font-mono text-xs">{exp.expenseId}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {exp.vendorName || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {exp.expenseAccountId?.name ? `${exp.expenseAccountId.code} - ${exp.expenseAccountId.name}` : "Expense"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          exp.status === "POSTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : exp.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          exp.paymentStatus === "PAID"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {exp.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600">
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(exp.grandTotal, exp.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedExpense(exp);
                            setIsDetailOpen(true);
                          }}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canManage && exp.status === "POSTED" && exp.paymentStatus === "UNPAID" && (
                          <button
                            onClick={() => {
                              setSelectedExpense(exp);
                              setPayFormData({
                                paidFromAccountId: assetAccounts[0]?._id || "",
                                paymentDate: new Date().toISOString().split("T")[0],
                                paymentMethod: "BANK_TRANSFER",
                                reference: "",
                              });
                              setIsPayOpen(true);
                            }}
                            className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            Pay
                          </button>
                        )}

                        {canManage && exp.status === "POSTED" && (
                          <button
                            onClick={() => {
                              setSelectedExpense(exp);
                              setIsReverseOpen(true);
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Reverse Expense"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}

                        {canManage && exp.status === "DRAFT" && (
                          <button
                            onClick={() => deleteDraftMutation.mutate(exp._id)}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete Draft"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Record Expense Modal */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setIsRecordOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{(createMutation.error as any)?.response?.data?.message || "Failed to record expense."}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Expense Account *</label>
                  <select
                    required
                    value={formData.expenseAccountId}
                    onChange={(e) => setFormData({ ...formData, expenseAccountId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Expense Account</option>
                    {expenseAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS, Landlord, Office Supplies"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Payment Status *</label>
                  <div className="mt-1 flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: "PAID" })}
                      className={`flex-1 rounded-md py-1 text-xs font-medium ${
                        formData.paymentStatus === "PAID" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Paid Immediately
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: "UNPAID" })}
                      className={`flex-1 rounded-md py-1 text-xs font-medium ${
                        formData.paymentStatus === "UNPAID" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Accrued / Unpaid
                    </button>
                  </div>
                </div>
              </div>

              {formData.paymentStatus === "PAID" ? (
                <div>
                  <label className="text-xs font-medium text-slate-700">Paid From Account (Cash / Bank) *</label>
                  <select
                    required
                    value={formData.paidFromAccountId}
                    onChange={(e) => setFormData({ ...formData, paidFromAccountId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Asset Account</option>
                    {assetAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name} (Bal: {formatCurrency(acc.currentBalance, "INR")})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Payable Account (Liability)</label>
                    <select
                      value={formData.payableAccountId}
                      onChange={(e) => setFormData({ ...formData, payableAccountId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Default (Expense Payable 2020)</option>
                      {liabilityAccounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Base Amount *</label>
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
                  <label className="text-xs font-medium text-slate-700">Tax Rate (%)</label>
                  <select
                    value={formData.taxRatePercent}
                    onChange={(e) => setFormData({ ...formData, taxRatePercent: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18% (Standard)</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Grand Total</label>
                  <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm font-bold text-slate-900">
                    {formatCurrency(calculatedGrandTotal, "INR")}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Reason for expense, invoice reference, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  type="button"
                  disabled={createMutation.isPending}
                  onClick={() => {
                    createMutation.mutate({
                      ...formData,
                      amount: Number(formData.amount),
                      taxRatePercent: Number(formData.taxRatePercent),
                      isDraft: true,
                    });
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Expense Modal */}
      {isPayOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Settle Expense: {selectedExpense.expenseId}</h3>
              <button onClick={() => setIsPayOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span className="font-semibold text-slate-900">{selectedExpense.vendorName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Due Amount:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(selectedExpense.grandTotal, selectedExpense.currency)}</span>
              </div>
            </div>

            {payMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(payMutation.error as any)?.response?.data?.message || "Payment settlement failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                payMutation.mutate({ id: selectedExpense._id, data: payFormData });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Paid From Account *</label>
                <select
                  required
                  value={payFormData.paidFromAccountId}
                  onChange={(e) => setPayFormData({ ...payFormData, paidFromAccountId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Asset Account</option>
                  {assetAccounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.code} - {acc.name} (Bal: {formatCurrency(acc.currentBalance, "INR")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payFormData.paymentDate}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Payment Method</label>
                <select
                  value={payFormData.paymentMethod}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="UTR / Cheque No / Transaction ID"
                  value={payFormData.reference}
                  onChange={(e) => setPayFormData({ ...payFormData, reference: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPayOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {payMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {isReverseOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5" />
                Reverse Expense: {selectedExpense.expenseId}
              </h3>
              <button onClick={() => setIsReverseOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Double-entry accounting requires an explicit reversal journal. This action will post an exact mirror reversal entry in the general ledger and restore account balances.
            </p>

            {reverseMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(reverseMutation.error as any)?.response?.data?.message || "Reversal failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reverseMutation.mutate({ id: selectedExpense._id, reason: reversalReason });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Reason for Reversal *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Invoiced in error, duplicate entry, refunded"
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

      {/* Expense Detail Modal */}
      {isDetailOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedExpense.expenseId}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Date:</span>{" "}
                  <span className="font-medium text-slate-800">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Vendor:</span>{" "}
                  <span className="font-medium text-slate-800">{selectedExpense.vendorName || "None"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedExpense.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Payment:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedExpense.paymentStatus}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <span className="text-slate-400">Description:</span>
                <p className="mt-0.5 text-slate-800">{selectedExpense.description}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>{formatCurrency(selectedExpense.amount, selectedExpense.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedExpense.taxRatePercent}%):</span>
                  <span>{formatCurrency(selectedExpense.taxAmount, selectedExpense.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedExpense.grandTotal, selectedExpense.currency)}</span>
                </div>
              </div>

              {selectedExpense.journalEntryId && (
                <div className="rounded-lg border border-slate-200 p-2 text-[11px] text-slate-500">
                  <span>Linked General Ledger Journal Entry ID: </span>
                  <span className="font-mono text-slate-700">
                    {typeof selectedExpense.journalEntryId === "object"
                      ? selectedExpense.journalEntryId._id || selectedExpense.journalEntryId.entryNumber
                      : selectedExpense.journalEntryId}
                  </span>
                </div>
              )}

              {selectedExpense.reversalReason && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <span className="font-semibold">Reversal Reason:</span> {selectedExpense.reversalReason}
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
