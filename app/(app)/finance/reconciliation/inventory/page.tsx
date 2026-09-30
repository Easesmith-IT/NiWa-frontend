"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Building2,
  Package,
} from "lucide-react";
import { financeApi } from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import Link from "next/link";

export default function InventoryReconciliationPage() {
  const {
    data: invReconRes,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["finance", "inventory-reconciliation-standalone"],
    queryFn: () => financeApi.reconcileInventoryValuation(),
  });

  const recon = invReconRes?.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-indigo-600" />
            Inventory Asset & Subledger Reconciliation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Reconciles General Ledger Account 1040 (Inventory Asset) with active FIFO cost layers and warehouse on-hand levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/finance/reports/inventory-valuation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            View Subledger Layers
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Re-check
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : recon ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`rounded-xl border p-5 ${
              recon.status === "MATCHED"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : recon.status === "WARNING"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {recon.status === "MATCHED" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : recon.status === "WARNING" ? (
                <AlertCircle className="h-6 w-6 text-amber-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {recon.status === "MATCHED"
                    ? "Subledger Perfectly Balanced with General Ledger Account 1040"
                    : recon.status === "WARNING"
                    ? "Minor Variance Detected Between Subledger and General Ledger"
                    : "Inventory Subledger & General Ledger Mismatch Detected"}
                </h3>
                <p className="mt-0.5 text-xs opacity-90">
                  {recon.status === "MATCHED"
                    ? "All active perpetual FIFO cost layers strictly match the GL Inventory Asset balance and warehouse quantities."
                    : "There is an active discrepancy between recorded accounting journals and the valuation of active cost layers."}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Metrics Comparison */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">GL Account Balance (1040)</span>
              <p className="mt-2 text-2xl font-bold font-mono text-slate-900">
                {formatCurrency(recon.generalLedgerBalance, "INR")}
              </p>
              <span className="mt-1 block text-[11px] text-slate-400">Inventory Asset Account</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Subledger FIFO Valuation</span>
              <p className="mt-2 text-2xl font-bold font-mono text-slate-900">
                {formatCurrency(recon.subledgerValuation, "INR")}
              </p>
              <span className="mt-1 block text-[11px] text-slate-400">Sum of active cost layers</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Valuation Difference</span>
              <p
                className={`mt-2 text-2xl font-bold font-mono ${
                  recon.valuationDifference === 0
                    ? "text-emerald-600"
                    : recon.status === "WARNING"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(recon.valuationDifference, "INR")}
              </p>
              <span className="mt-1 block text-[11px] text-slate-400">
                {recon.valuationDifference === 0 ? "Zero variance" : "Imbalance"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Quantity Variance</span>
              <p
                className={`mt-2 text-2xl font-bold font-mono ${
                  recon.quantityDifference === 0 ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {recon.quantityDifference.toLocaleString()} units
              </p>
              <span className="mt-1 block text-[11px] text-slate-400">
                Layer Qty ({recon.subledgerQuantity}) vs On-Hand ({recon.operationalQuantity})
              </span>
            </div>
          </div>

          {/* Discrepancy details */}
          {recon.discrepancies && recon.discrepancies.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-amber-100 bg-amber-50/60 px-6 py-4">
                <h3 className="text-sm font-bold text-amber-900">
                  Itemized Stock Count Discrepancies ({recon.discrepancies.length})
                </h3>
                <p className="mt-1 text-xs text-amber-700">
                  Discrepancies indicate that physical warehouse on-hand quantities differ from unconsumed FIFO cost layers.
                </p>
              </div>
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 pl-6 pr-3">Product Variant</th>
                    <th className="px-3 py-3">Location ID</th>
                    <th className="px-3 py-3 text-right">FIFO Subledger Qty</th>
                    <th className="px-3 py-3 text-right">Warehouse On-Hand</th>
                    <th className="px-3 py-3 text-right pr-6">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recon.discrepancies.map((d) => (
                    <tr key={`${d.productVariantId}__${d.locationId}`} className="hover:bg-slate-50">
                      <td className="py-3 pl-6 pr-3 font-semibold text-slate-900">{d.variantName}</td>
                      <td className="px-3 py-3 font-mono text-slate-600">{d.locationId}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-800">{d.subledgerQuantity}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-800">{d.operationalQuantity}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold pr-6 text-amber-700">
                        {d.difference > 0 ? `+${d.difference}` : d.difference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No Discrepancies Detected</h3>
              <p className="mt-1 text-xs text-slate-500">
                All physical warehouse stock levels match unconsumed FIFO cost layer balances across all locations.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
