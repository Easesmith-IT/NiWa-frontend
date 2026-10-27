"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle, CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAdminAdjustWallet } from "../whatsapp-billing.queries";

interface WalletAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  currentBalanceInr: string;
}

export const WalletAdjustmentModal: React.FC<WalletAdjustmentModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  currentBalanceInr,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amountInr, setAmountInr] = useState<string>("500.00");
  const [reason, setReason] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adjustMutation = useAdminAdjustWallet();

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountInr);
  const amountPaise = !isNaN(parsedAmount) && parsedAmount > 0 ? Math.round(parsedAmount * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amountPaise <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0.00");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Mandatory reason is required for administrative audit trail");
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        workspaceId,
        adjustmentType,
        amountPaise,
        reason: reason.trim(),
        referenceId: referenceId.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || "Failed to adjust wallet balance");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Admin Wallet Adjustment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Posted Balance: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{currentBalanceInr}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Action Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("CREDIT")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  adjustmentType === "CREDIT"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                Credit (+ Top Up)
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("DEBIT")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  adjustmentType === "DEBIT"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
                Debit (- Deduct)
              </button>
            </div>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="500.00"
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Settles in integer paise:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {amountPaise.toLocaleString()} paise
              </span>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Bank transfer payment approved (NEFT/IMPS)"
            />
          </div>

          {/* Optional Reference ID */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              External Reference ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. UTR-20261026998812, INV-0042"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={adjustMutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={adjustMutation.isPending}
              className={`text-xs text-white ${
                adjustmentType === "CREDIT"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {adjustMutation.isPending ? "Processing..." : `Confirm ${adjustmentType === "CREDIT" ? "Credit" : "Debit"}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
