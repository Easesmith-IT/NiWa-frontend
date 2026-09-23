"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Search,
  Plus,
  Filter,
  RotateCcw,
  X,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { financeApi, JournalEntry } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

interface NewJournalLine {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export function JournalsView() {
  const queryClient = useQueryClient();
  const { canManage } = useFinancePermissions();

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReverseOpen, setIsReverseOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState("");
  const [reversalDate, setReversalDate] = useState(new Date().toISOString().split("T")[0]);

  // Form state
  const [accountingDate, setAccountingDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<NewJournalLine[]>([
    { accountId: "", description: "", debit: 0, credit: 0 },
    { accountId: "", description: "", debit: 0, credit: 0 },
  ]);

  // Queries
  const { data: journalsRes, isLoading } = useQuery({
    queryKey: ["finance", "journals", { search, status: statusFilter, page }],
    queryFn: () =>
      financeApi.getJournals({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      }),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ["finance", "settings"],
    queryFn: () => financeApi.getSettings(),
  });

  const accounts = accountsRes?.data || [];
  const baseCurrency = settingsRes?.data?.baseCurrency || accounts[0]?.currency || "INR";

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createJournal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const postDraftMutation = useMutation({
    mutationFn: (id: string) => financeApi.postDraftJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsDetailOpen(false);
    },
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.reverseJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsReverseOpen(false);
      setSelectedJournal(null);
      setReversalReason("");
    },
  });

  const resetForm = () => {
    setAccountingDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setLines([
      { accountId: "", description: "", debit: 0, credit: 0 },
      { accountId: "", description: "", debit: 0, credit: 0 },
    ]);
  };

  const handleAddLine = () => {
    setLines([...lines, { accountId: "", description: "", debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof NewJournalLine, value: any) => {
    const updated = [...lines];
    if (field === "debit") {
      const val = parseFloat(value) || 0;
      updated[index].debit = val;
      if (val > 0) updated[index].credit = 0; // Invariant: cannot have both debit & credit
    } else if (field === "credit") {
      const val = parseFloat(value) || 0;
      updated[index].credit = val;
      if (val > 0) updated[index].debit = 0;
    } else {
      (updated[index] as any)[field] = value;
    }
    setLines(updated);
  };

  const totalDebits = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalDebits - totalCredits) * 100) / 100);
  const isBalanced = totalDebits > 0 && totalDebits === totalCredits;

  const handleSubmit = (isDraft: boolean) => {
    createMutation.mutate({
      accountingDate,
      description,
      lines: lines.map((l) => ({
        accountId: l.accountId,
        description: l.description || description,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
      isDraft,
    });
  };

  const items = journalsRes?.items || [];
  const total = journalsRes?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">General Ledger Journals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Authoritative double-entry transaction journals with immutable posting and audited reversal history.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Journal Entry
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search entry #, description..."
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
        </div>
      </div>

      {/* Journals Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileSpreadsheet className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No journal entries found</h3>
            <p className="mt-1 text-xs text-slate-500">Record a manual journal entry or post operational transactions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Entry #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Lines</th>
                  <th className="px-4 py-3 text-right">Debit / Credit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((jrn) => (
                  <tr key={jrn._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="font-mono text-xs">{jrn.entryNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(jrn.accountingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">
                      {jrn.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {jrn.sourceType || "MANUAL"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          jrn.status === "POSTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : jrn.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {jrn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">
                      {jrn.lines?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(jrn.totalAmount, jrn.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedJournal(jrn);
                            setIsDetailOpen(true);
                          }}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View Lines"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canManage && jrn.status === "DRAFT" && (
                          <button
                            onClick={() => postDraftMutation.mutate(jrn._id)}
                            className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            Post
                          </button>
                        )}

                        {canManage && jrn.status === "POSTED" && (
                          <button
                            onClick={() => {
                              setSelectedJournal(jrn);
                              setIsReverseOpen(true);
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Reverse Journal"
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

      {/* New Journal Entry Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Create Double-Entry Journal</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{(createMutation.error as any)?.response?.data?.message || "Failed to create journal."}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-700">Accounting Date *</label>
                  <input
                    type="date"
                    required
                    value={accountingDate}
                    onChange={(e) => setAccountingDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Journal Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-end depreciation, Capital introduction"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Lines Table */}
              <div className="mt-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Journal Lines (Debits & Credits)</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Line
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-2.5 w-1/3">Account *</th>
                        <th className="p-2.5">Line Description</th>
                        <th className="p-2.5 w-28 text-right">Debit ({baseCurrency})</th>
                        <th className="p-2.5 w-28 text-right">Credit ({baseCurrency})</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              required
                              value={line.accountId}
                              onChange={(e) => handleLineChange(idx, "accountId", e.target.value)}
                              className="w-full rounded-md border border-slate-200 p-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="">Select Account</option>
                              {accounts.map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                  {acc.code} - {acc.name} ({acc.type})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Memo"
                              value={line.description}
                              onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                              className="w-full rounded-md border border-slate-200 p-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={line.debit || ""}
                              onChange={(e) => handleLineChange(idx, "debit", e.target.value)}
                              className="w-full text-right rounded-md border border-slate-200 p-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={line.credit || ""}
                              onChange={(e) => handleLineChange(idx, "credit", e.target.value)}
                              className="w-full text-right rounded-md border border-slate-200 p-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              disabled={lines.length <= 2}
                              onClick={() => handleRemoveLine(idx)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-right">
                          Totals & Balance:
                        </td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(totalDebits, baseCurrency)}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(totalCredits, baseCurrency)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Double-Entry Balance Verification Banner */}
                <div
                  className={`mt-3 flex items-center justify-between rounded-lg p-3 text-xs ${
                    isBalanced
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {isBalanced
                        ? "Journal is perfectly balanced (Total Debits = Total Credits)."
                        : `Journal is out of balance! Difference: ${formatCurrency(difference, baseCurrency)}. Debits must equal Credits.`}
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    Diff: {formatCurrency(difference, baseCurrency)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={createMutation.isPending || !description}
                  onClick={() => handleSubmit(true)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={createMutation.isPending || !isBalanced || !description}
                  onClick={() => handleSubmit(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Journal Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Details Modal */}
      {isDetailOpen && selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedJournal.entryNumber}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    selectedJournal.status === "POSTED"
                      ? "bg-emerald-50 text-emerald-700"
                      : selectedJournal.status === "DRAFT"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {selectedJournal.status}
                </span>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Date:</span>{" "}
                  <span className="font-medium text-slate-800">{new Date(selectedJournal.accountingDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Source:</span>{" "}
                  <span className="font-medium text-slate-800">{selectedJournal.sourceType || "MANUAL"}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Description:</span>
                <p className="mt-0.5 font-medium text-slate-800">{selectedJournal.description}</p>
              </div>

              {/* Lines Table */}
              <div className="overflow-hidden rounded-lg border border-slate-200 mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Account</th>
                      <th className="p-2.5">Memo</th>
                      <th className="p-2.5 text-right">Debit</th>
                      <th className="p-2.5 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedJournal.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-800">
                          {line.accountId?.code ? `${line.accountId.code} - ${line.accountId.name}` : line.accountId}
                        </td>
                        <td className="p-2.5 text-slate-500">{line.description}</td>
                        <td className="p-2.5 text-right font-mono">
                          {line.debit > 0 ? formatCurrency(line.debit, selectedJournal.currency) : "-"}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {line.credit > 0 ? formatCurrency(line.credit, selectedJournal.currency) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right">
                        Total:
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {formatCurrency(selectedJournal.totalAmount, selectedJournal.currency)}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {formatCurrency(selectedJournal.totalAmount, selectedJournal.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedJournal.reversalReason && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <span className="font-semibold">Reversal Reason:</span> {selectedJournal.reversalReason}
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

      {/* Reverse Journal Modal */}
      {isReverseOpen && selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5" />
                Reverse Journal: {selectedJournal.entryNumber}
              </h3>
              <button onClick={() => setIsReverseOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Accounting entries are immutable. This will post a counterpart reversal journal with inverted debits and credits.
            </p>

            {reverseMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(reverseMutation.error as any)?.response?.data?.message || "Journal reversal failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reverseMutation.mutate({
                  id: selectedJournal._id,
                  data: { reversalReason, accountingDate: reversalDate },
                });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Reversal Accounting Date *</label>
                <input
                  type="date"
                  required
                  value={reversalDate}
                  onChange={(e) => setReversalDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Reason for Reversal *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Audit justification for reversing this journal"
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
                  Post Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
