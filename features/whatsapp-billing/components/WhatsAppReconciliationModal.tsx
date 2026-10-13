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
    }>;
    autoAdjust?: boolean;
  }) => Promise<ReconciliationResult>;
}

export const WhatsAppReconciliationModal: React.FC<WhatsAppReconciliationModalProps> = ({
  isOpen,
  onClose,
  onReconcile,
}) => {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      [
        {
          metaMessageId: "wamid_example_001",
          billedCost: 0.8631,
          category: "marketing",
        },
      ],
      null,
      2
    )
  );
  const [autoAdjust, setAutoAdjust] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunReconciliation = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setResult(null);

      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array of report items.");
      }

      const res = await onReconcile({
        reportItems: parsed,
        autoAdjust,
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
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
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
            Compare Meta's authoritative monthly export against recorded local ledger transactions. Discrepancies can be automatically resolved via compensating ledger adjustments.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Meta Billing Report Items (JSON format)
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={6}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAdjust"
              checked={autoAdjust}
              onChange={(e) => setAutoAdjust(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="autoAdjust" className="text-xs text-slate-700 dark:text-slate-300">
              Automatically create compensating ledger adjustments for discrepancies
            </label>
          </div>

          {error && (
            <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Reconciliation Complete ({result.status})
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>Total Processed: {result.totalRows}</div>
                <div>Matched: {result.matchedRows}</div>
                <div>Discrepancies: {result.discrepancyRows}</div>
                <div>Auto-Adjusted: {result.autoAdjustedRows}</div>
              </div>
              {result.discrepancies.length > 0 && (
                <div className="mt-2 text-amber-600 dark:text-amber-400">
                  {result.discrepancies.length} discrepancy record(s) flagged.
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
            disabled={isSubmitting}
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
