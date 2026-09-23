"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Loader2,
  FolderTree,
  Sparkles,
  X,
  BookOpen,
} from "lucide-react";
import { financeApi, Account, AccountType, NormalBalance } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

export function AccountsView() {
  const queryClient = useQueryClient();
  const { canManage } = useFinancePermissions();

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modals
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "EXPENSE" as AccountType,
    subtype: "OPERATING_EXPENSE",
    normalBalance: "DEBIT" as NormalBalance,
    description: "",
    allowPosting: true,
  });

  // Queries
  const { data: accountsRes, isLoading } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts(),
  });

  const { data: ledgerRes, isLoading: isLedgerLoading } = useQuery({
    queryKey: ["finance", "general-ledger", selectedAccount?._id],
    queryFn: () => financeApi.getGeneralLedger(selectedAccount!._id),
    enabled: isLedgerOpen && !!selectedAccount,
  });

  const accounts = accountsRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "accounts"] });
      setIsNewAccountOpen(false);
      resetForm();
    },
  });

  const provisionMutation = useMutation({
    mutationFn: () => financeApi.provisionDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      type: "EXPENSE",
      subtype: "OPERATING_EXPENSE",
      normalBalance: "DEBIT",
      description: "",
      allowPosting: true,
    });
  };

  const handleTypeChange = (type: AccountType) => {
    const normalBalance: NormalBalance = type === "ASSET" || type === "EXPENSE" ? "DEBIT" : "CREDIT";
    let subtype = "OTHER";
    if (type === "ASSET") subtype = "CURRENT_ASSET";
    else if (type === "LIABILITY") subtype = "CURRENT_LIABILITY";
    else if (type === "EQUITY") subtype = "EQUITY";
    else if (type === "INCOME") subtype = "OPERATING_REVENUE";
    else if (type === "EXPENSE") subtype = "OPERATING_EXPENSE";

    setFormData({ ...formData, type, normalBalance, subtype });
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.code.toLowerCase().includes(search.toLowerCase()) ||
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.subtype.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeColorMap: Record<AccountType, string> = {
    ASSET: "bg-blue-50 text-blue-700 border-blue-200",
    LIABILITY: "bg-amber-50 text-amber-700 border-amber-200",
    EQUITY: "bg-purple-50 text-purple-700 border-purple-200",
    INCOME: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPENSE: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const ledgerData = ledgerRes?.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chart of Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Categorized general ledger accounts structure powering double-entry journal postings.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => provisionMutation.mutate()}
              disabled={provisionMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
              title="Ensure standard system accounts are present"
            >
              {provisionMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              )}
              Provision Defaults
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsNewAccountOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              New Account
            </button>
          </div>
        )}
      </div>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {(["ALL", "ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === t
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t === "ALL" ? "All Accounts" : t}
            <span className="ml-1.5 text-[11px] opacity-70">
              ({t === "ALL" ? accounts.length : accounts.filter((a) => a.type === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by code or account name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FolderTree className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No accounts found</h3>
            <p className="mt-1 text-xs text-slate-500">Click &quot;Provision Defaults&quot; to initialize the standard chart of accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subtype</th>
                  <th className="px-4 py-3">Normal Balance</th>
                  <th className="px-4 py-3 text-right">Current Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                      {acc.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{acc.name}</div>
                      {acc.description && <div className="text-[11px] text-slate-400">{acc.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeColorMap[acc.type]}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {acc.subtype}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {acc.normalBalance}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(acc.currentBalance, acc.currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          acc.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {acc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setIsLedgerOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                        Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Custom Account Modal */}
      {isNewAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Account</h3>
              <button onClick={() => setIsNewAccountOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(createMutation.error as any)?.response?.data?.message || "Failed to create account."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="mt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Account Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5020"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Account Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Subscriptions"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Subtype</label>
                  <input
                    type="text"
                    value={formData.subtype}
                    onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Normal Balance</label>
                  <select
                    value={formData.normalBalance}
                    onChange={(e) => setFormData({ ...formData, normalBalance: e.target.value as NormalBalance })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Optional usage details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAccountOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.code || !formData.name}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Ledger View Modal */}
      {isLedgerOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ledger: {selectedAccount.code} - {selectedAccount.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Normal Balance: {selectedAccount.normalBalance} | Current Balance:{" "}
                    <strong className="text-slate-700">{formatCurrency(selectedAccount.currentBalance, selectedAccount.currency)}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {isLedgerLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : !ledgerData?.lines || ledgerData.lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <BookOpen className="h-8 w-8 mb-2" />
                  <p className="text-xs">No transactions recorded in this account yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Entry #</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-right">Debit</th>
                        <th className="p-2.5 text-right">Credit</th>
                        <th className="p-2.5 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledgerData.lines.map((line: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 whitespace-nowrap">{new Date(line.date).toLocaleDateString()}</td>
                          <td className="p-2.5 font-mono text-slate-800">{line.entryNumber}</td>
                          <td className="p-2.5 max-w-xs truncate">{line.description}</td>
                          <td className="p-2.5 text-right font-mono">
                            {line.debit > 0 ? formatCurrency(line.debit, selectedAccount.currency) : "-"}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {line.credit > 0 ? formatCurrency(line.credit, selectedAccount.currency) : "-"}
                          </td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                            {formatCurrency(line.runningBalance, selectedAccount.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsLedgerOpen(false)}
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
