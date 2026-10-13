"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ReconciliationResult } from "../whatsapp-billing.types";

interface WhatsAppReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconcile: (payload: {
    reportItems: Array<{
      metaMessageId: string;
      billedCost: number;
      currency?: string;
      category?: string;
      timestamp?: string;
    }>;
    billingPeriod?: string;
    autoAdjust?: boolean;
    confirmAutoAdjust?: boolean;
    reportIdentifier?: string;
  }) => Promise<ReconciliationResult>;
}

export const WhatsAppReconciliationModal: React.FC<WhatsAppReconciliationModalProps> = ({
  isOpen,
  onClose,
  onReconcile,
}) => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [billingPeriod, setBillingPeriod] = useState<string>(currentMonth);
  const [reportIdentifier, setReportIdentifier] = useState<string>("");
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      [
        {
          metaMessageId: "wamid_example_001",
          billedCost: 0.8631,
          category: "marketing",
          currency: "INR",
        },
      ],
      null,
      2
    )
  );
  const [autoAdjust, setAutoAdjust] = useState<boolean>(false);
  const [confirmAutoAdjust, setConfirmAutoAdjust] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleRunReconciliation = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setResult(null);
      setValidationWarnings([]);

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (e: any) {
        throw new Error(`JSON Syntax Error: ${e.message}`);
      }

      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array of report items.");
      }

      if (parsed.length === 0) {
        throw new Error("Input report array cannot be empty.");
      }

      // Pre-submission client-side validation
      const warnings: string[] = [];
      const formattedItems = parsed.map((item: any, idx: number) => {
        const id = item?.metaMessageId || item?.id;
        const amt = item?.billedCost !== undefined ? item?.billedCost : item?.metaChargedAmount;

        if (!id || typeof id !== "string") {
          warnings.push(`Row ${idx + 1}: Missing or invalid metaMessageId`);
        }
        if (typeof amt !== "number" || !Number.isFinite(amt) || isNaN(amt) || amt < 0) {
          warnings.push(`Row ${idx + 1}: Amount must be a non-negative finite number`);
        }

        return {
          metaMessageId: id || `invalid_row_${idx + 1}`,
          billedCost: typeof amt === "number" ? amt : 0,
          currency: item?.currency || "INR",
          category: item?.category,
          timestamp: item?.timestamp,
        };
      });

      if (warnings.length > 0) {
        setValidationWarnings(warnings);
      }

      if (autoAdjust && !confirmAutoAdjust) {
        throw new Error(
          "Explicit confirmation required: Please check the box confirming you acknowledge the financial ledger adjustments."
        );
      }

      const res = await onReconcile({
        reportItems: formattedItems,
        billingPeriod: billingPeriod.trim() || undefined,
        autoAdjust,
        confirmAutoAdjust: autoAdjust ? confirmAutoAdjust : undefined,
        reportIdentifier: reportIdentifier.trim() || undefined,
      });

      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to process reconciliation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Meta WhatsApp Billing Reconciliation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Compare Meta's monthly invoice export against recorded internal transactions. All records are validated against date bounds and currency rules before matching.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Billing Period (YYYY-MM)
              </label>
              <input
                type="text"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                placeholder="2026-10"
                className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Report Identifier (Optional)
              </label>
              <input
                type="text"
                value={reportIdentifier}
                onChange={(e) => setReportIdentifier(e.target.value)}
                placeholder="e.g. meta-oct-2026-batch1"
                className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Meta Billing Report Items (JSON format)
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={5}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAdjust"
                checked={autoAdjust}
                onChange={(e) => {
                  setAutoAdjust(e.target.checked);
                  if (!e.target.checked) setConfirmAutoAdjust(false);
                }}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="autoAdjust" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Automatically create compensating ledger adjustments for discrepancies
              </label>
            </div>

            {autoAdjust && (
              <div className="ml-6 space-y-2 border-l-2 border-amber-500 pl-3 pt-1">
                <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    Warning: Automatic adjustments will create append-only financial ledger entries (CREDIT_ADJUSTMENT or RECONCILIATION_ADJUSTMENT) affecting workspace balance.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmAutoAdjust"
                    checked={confirmAutoAdjust}
                    onChange={(e) => setConfirmAutoAdjust(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="confirmAutoAdjust" className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                    I confirm that I understand and authorize these financial ledger adjustments
                  </label>
                </div>
              </div>
            )}
          </div>

          {validationWarnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200">
              <div className="font-semibold">Pre-flight Validation Warnings ({validationWarnings.length}):</div>
              <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                {validationWarnings.slice(0, 5).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
                {validationWarnings.length > 5 && <li>...and {validationWarnings.length - 5} more</li>}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Reconciliation Complete ({result.status})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400">
                <div>Processed: <span className="font-semibold text-slate-900 dark:text-slate-100">{result.totalRows}</span></div>
                <div>Matched: <span className="font-semibold text-emerald-600">{result.matchedRows}</span></div>
                <div>Discrepancies: <span className="font-semibold text-amber-600">{result.discrepancyRows}</span></div>
                <div>Auto-Adjusted: <span className="font-semibold text-blue-600">{result.autoAdjustedRows}</span></div>
                <div>Rejected Records: <span className="font-semibold text-rose-600">{result.rejectedCount || result.rejectedRecords?.length || 0}</span></div>
              </div>

              {result.rejectedRecords && result.rejectedRecords.length > 0 && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 space-y-1">
                  <div className="font-semibold">{result.rejectedRecords.length} record(s) rejected by validation:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.rejectedRecords.slice(0, 4).map((r, i) => (
                      <li key={i}>{r.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.discrepancies.length > 0 && (
                <div className="mt-2 text-amber-600 dark:text-amber-400">
                  <div className="font-semibold">{result.discrepancies.length} discrepancy record(s) flagged:</div>
                  <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                    {result.discrepancies.slice(0, 10).map((d, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-200 pb-1 text-[11px] dark:border-slate-700">
                        <span className="font-mono">{d.metaMessageId}</span>
                        <span>Diff: ₹{d.difference.toFixed(4)} ({d.actionTaken || d.status || "pending"})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting || (autoAdjust && !confirmAutoAdjust)}
            onClick={handleRunReconciliation}
            className="flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5" />
            )}
            Run Reconciliation
          </Button>
        </div>
      </div>
    </div>
  );
};
