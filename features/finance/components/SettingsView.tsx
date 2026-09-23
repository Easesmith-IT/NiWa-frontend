"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Scale,
  Plus,
  Trash2,
  Sparkles,
  Percent,
  ArrowRight,
} from "lucide-react";
import { financeApi, FinanceSettings, Account } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

interface OpeningBalanceLine {
  accountId: string;
  debit: number;
  credit: number;
}

export function SettingsView() {
  const queryClient = useQueryClient();
  const { canManage } = useFinancePermissions();

  // State
  const [activationDate, setActivationDate] = useState("");
  const [lockedUntilDate, setLockedUntilDate] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("INR");

  // Opening Balances Builder State
  const [obLines, setObLines] = useState<OpeningBalanceLine[]>([]);

  // Queries
  const { data: settingsRes, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["finance", "settings"],
    queryFn: () => financeApi.getSettings(),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const settings = settingsRes?.data;
  const accounts = accountsRes?.data || [];

  useEffect(() => {
    if (settings) {
      if (settings.activationDate) {
        setActivationDate(new Date(settings.activationDate).toISOString().split("T")[0]);
      }
      if (settings.lockedUntilDate) {
        setLockedUntilDate(new Date(settings.lockedUntilDate).toISOString().split("T")[0]);
      }
      if (settings.baseCurrency) {
        setBaseCurrency(settings.baseCurrency);
      }
    }
  }, [settings]);

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: any) => financeApi.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const openingBalancesMutation = useMutation({
    mutationFn: (payload: { activationDate: string; lines: any[] }) =>
      financeApi.postOpeningBalances(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setObLines([]);
    },
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      activationDate: activationDate || null,
      lockedUntilDate: lockedUntilDate || null,
      baseCurrency,
    });
  };

  const handleAddObLine = () => {
    setObLines([...obLines, { accountId: accounts[0]?._id || "", debit: 0, credit: 0 }]);
  };

  const handleRemoveObLine = (index: number) => {
    setObLines(obLines.filter((_, i) => i !== index));
  };

  const handleObLineChange = (index: number, field: "accountId" | "debit" | "credit", val: any) => {
    const updated = [...obLines];
    if (field === "debit") {
      const num = parseFloat(val) || 0;
      updated[index].debit = num;
      if (num > 0) updated[index].credit = 0;
    } else if (field === "credit") {
      const num = parseFloat(val) || 0;
      updated[index].credit = num;
      if (num > 0) updated[index].debit = 0;
    } else {
      updated[index].accountId = val;
    }
    setObLines(updated);
  };

  const totalObDebits = obLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalObCredits = obLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const obDifference = Math.abs(Math.round((totalObDebits - totalObCredits) * 100) / 100);
  const isObBalanced = obLines.length >= 2 && totalObDebits > 0 && totalObDebits === totalObCredits;

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance & Accounting Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure module activation boundary, period lock enforcement, and initial opening balance journals.
        </p>
      </div>

      {isSettingsLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Activation & Period Locking */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Activation & Period Controls</h3>
                <p className="text-xs text-slate-500">
                  Defines the accounting inception point and locks historical periods against modification.
                </p>
              </div>
            </div>

            {updateSettingsMutation.isSuccess && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Finance settings saved successfully.</span>
              </div>
            )}

            {updateSettingsMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>
                  {(updateSettingsMutation.error as any)?.response?.data?.message || "Failed to save settings."}
                </span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Accounting Activation Date</label>
                  <input
                    type="date"
                    disabled={!canManage}
                    value={activationDate}
                    onChange={(e) => setActivationDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50"
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Historical transactions prior to this date are never backfilled into journals.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Lock Accounting Period Until</label>
                  <input
                    type="date"
                    disabled={!canManage}
                    value={lockedUntilDate}
                    onChange={(e) => setLockedUntilDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50"
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Prohibits posting, editing, or reversing transactions on or prior to this date.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Base Reporting Currency</label>
                  <select
                    disabled={!canManage}
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50"
                  >
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Standard general ledger currency for double-entry reports.
                  </span>
                </div>
              </div>

              {canManage && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updateSettingsMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Configuration
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Section: Tax Configurations */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tax Configurations</h3>
                <p className="text-xs text-slate-500">
                  Manage GST codes (CGST, SGST, IGST, CESS), percentage rates, and default accounts.
                </p>
              </div>
            </div>
            <a
              href="/finance/taxes"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
            >
              Configure Taxes
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Section 2: Opening Balances Journal Setup */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Opening Balances Initialization</h3>
                  <p className="text-xs text-slate-500">
                    Establish initial ledger balances for bank accounts, inventory, payables, and equity.
                  </p>
                </div>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={handleAddObLine}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Account Line
                </button>
              )}
            </div>

            {openingBalancesMutation.isSuccess && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Opening balances journal posted successfully!</span>
              </div>
            )}

            {openingBalancesMutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>
                  {(openingBalancesMutation.error as any)?.response?.data?.message ||
                    "Failed to post opening balances."}
                </span>
              </div>
            )}

            {obLines.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No opening balance lines drafted. Click &quot;Add Account Line&quot; to initialize opening assets, liabilities, and equity balances.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-2.5">Account *</th>
                        <th className="p-2.5 w-36 text-right">Debit Balance (INR)</th>
                        <th className="p-2.5 w-36 text-right">Credit Balance (INR)</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {obLines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              value={line.accountId}
                              onChange={(e) => handleObLineChange(idx, "accountId", e.target.value)}
                              className="w-full rounded-md border border-slate-200 p-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                            >
                              {accounts.map((a) => (
                                <option key={a._id} value={a._id}>
                                  {a.code} - {a.name} ({a.type})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={line.debit || ""}
                              onChange={(e) => handleObLineChange(idx, "debit", e.target.value)}
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
                              onChange={(e) => handleObLineChange(idx, "credit", e.target.value)}
                              className="w-full text-right rounded-md border border-slate-200 p-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveObLine(idx)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                      <tr>
                        <td className="p-2.5 text-right">Totals:</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(totalObDebits, "INR")}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(totalObCredits, "INR")}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg p-3 text-xs ${
                    isObBalanced
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isObBalanced ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {isObBalanced
                        ? "Opening balances are in equilibrium (Debits = Credits)."
                        : `Opening balances out of balance! Difference: ${formatCurrency(
                            obDifference,
                            "INR"
                          )}. Balance against Opening Equity (3030).`}
                    </span>
                  </div>
                  <span className="font-mono font-bold">Diff: {formatCurrency(obDifference, "INR")}</span>
                </div>

                {canManage && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={openingBalancesMutation.isPending || !isObBalanced || !activationDate}
                      onClick={() =>
                        openingBalancesMutation.mutate({
                          activationDate,
                          lines: obLines.map((l) => ({
                            accountId: l.accountId,
                            description: "Opening balance initialization",
                            debit: Number(l.debit) || 0,
                            credit: Number(l.credit) || 0,
                          })),
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {openingBalancesMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Post Opening Balances Journal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
