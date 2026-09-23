"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Landmark,
  FileCheck2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { financeApi } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

export function ReconciliationView() {
  const { canManage } = useFinancePermissions();

  const today = new Date().toISOString().split("T")[0];
  const [asOfDate, setAsOfDate] = useState(today);

  // Bank recon state
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [statementClosingDate, setStatementClosingDate] = useState(today);
  const [statementClosingBalance, setStatementClosingBalance] = useState<number>(0);
  const [bankReconResult, setBankReconResult] = useState<any>(null);

  // Queries
  const { data: overviewReconRes, isLoading, refetch } = useQuery({
    queryKey: ["finance", "reconciliation-overview", asOfDate],
    queryFn: () => financeApi.getOverviewReconciliations(asOfDate),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const accounts = accountsRes?.data || [];
  const bankAccounts = accounts.filter(
    (a) => a.type === "ASSET" && (a.subtype === "BANK" || a.code === "1020" || a.code.startsWith("102"))
  );

  const bankReconMutation = useMutation({
    mutationFn: (payload: { bankAccountId: string; statementClosingDate: string; statementClosingBalance: number }) =>
      financeApi.reconcileBank(payload),
    onSuccess: (res) => {
      setBankReconResult(res.data);
    },
  });

  const recon = overviewReconRes?.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ledger & Bank Reconciliation</h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify integrity between operational sub-ledgers, general ledger accounts, and external bank statements.
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
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-check
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : recon ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AR RECONCILIATION CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Accounts Receivable (AR)</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  recon.receivables.status === "MATCHED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {recon.receivables.status === "MATCHED" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" /> Mismatch
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Compares General Ledger Account (1030 - Accounts Receivable) with the net unpaid balance of all issued sales invoices.
            </p>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">GL Account Balance (1030):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(recon.receivables.ledgerBalance, recon.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sum of Open Invoices:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(recon.receivables.operationalBalance, recon.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                <span className="text-slate-700">Variance:</span>
                <span
                  className={`font-mono ${
                    recon.receivables.difference === 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(recon.receivables.difference, recon.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* AP RECONCILIATION CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Scale className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Accounts Payable (AP)</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  recon.payables.status === "MATCHED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {recon.payables.status === "MATCHED" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" /> Mismatch
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Compares General Ledger Account (2010 - Accounts Payable) with the net unpaid balance of all recorded supplier bills.
            </p>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">GL Account Balance (2010):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(recon.payables.ledgerBalance, recon.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sum of Open Supplier Bills:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(recon.payables.operationalBalance, recon.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                <span className="text-slate-700">Variance:</span>
                <span
                  className={`font-mono ${
                    recon.payables.difference === 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(recon.payables.difference, recon.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* BANK STATEMENT RECONCILIATION TOOL */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Landmark className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Bank Statement Reconciliation</h3>
            <p className="text-xs text-slate-500">
              Input statement closing balance to verify general ledger bank account accuracy.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            bankReconMutation.mutate({
              bankAccountId: selectedBankAccountId,
              statementClosingDate,
              statementClosingBalance: Number(statementClosingBalance),
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-700">Bank Account *</label>
              <select
                required
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.code} - {a.name} (GL Bal: {formatCurrency(a.currentBalance, a.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Statement Closing Date *</label>
              <input
                type="date"
                required
                value={statementClosingDate}
                onChange={(e) => setStatementClosingDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Statement Closing Balance (INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={statementClosingBalance || ""}
                onChange={(e) => setStatementClosingBalance(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={bankReconMutation.isPending || !selectedBankAccountId}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {bankReconMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Perform Bank Reconciliation
            </button>
          </div>
        </form>

        {/* Bank Recon Result Box */}
        {bankReconResult && (
          <div
            className={`mt-4 rounded-xl border p-4 text-xs ${
              bankReconResult.status === "MATCHED"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {bankReconResult.status === "MATCHED" ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>
                {bankReconResult.status === "MATCHED"
                  ? "Bank Statement Fully Reconciled with General Ledger"
                  : "Bank Reconciliation Variance Detected"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block">General Ledger Balance:</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(bankReconResult.ledgerBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Statement Closing Balance:</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(bankReconResult.statementClosingBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Discrepancy / Variance:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    bankReconResult.difference === 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(bankReconResult.difference, "INR")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
