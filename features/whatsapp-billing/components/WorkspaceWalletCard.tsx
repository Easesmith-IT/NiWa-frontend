"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Lock,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WorkspaceWallet } from "../whatsapp-billing.types";
import { WalletAdjustmentModal } from "./WalletAdjustmentModal";

interface WorkspaceWalletCardProps {
  wallet?: WorkspaceWallet;
  isLoading: boolean;
  isAdmin?: boolean;
}

export const WorkspaceWalletCard: React.FC<WorkspaceWalletCardProps> = ({
  wallet,
  isLoading,
  isAdmin = true,
}) => {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const availableInr = wallet?.availableInr ?? "0.00";
  const postedInr = wallet?.postedBalanceInr ?? "0.00";
  const reservedInr = wallet?.reservedInr ?? "0.00";
  const availablePaise = wallet?.availablePaise ?? 0;

  const isDepleted = availablePaise <= 0;
  const isLowBalance = availablePaise > 0 && availablePaise < 10000; // Under ₹100

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Workspace Messaging Wallet
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {wallet?.currency || "INR"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prepaid balance used for all outbound WhatsApp messages across automations, campaigns, and inbox.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDepleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="h-3.5 w-3.5" />
              Depleted — Outbound Blocked
            </span>
          ) : isLowBalance ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              <Clock className="h-3.5 w-3.5" />
              Low Balance Warning
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active & Funded
            </span>
          )}

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setIsAdjustModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 font-medium"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Top Up / Adjust
            </Button>
          )}
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Available Balance */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Available to Send</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
              Ready
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : `₹${availableInr}`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {wallet ? `${wallet.availablePaise.toLocaleString()} paise` : "0 paise"} usable right now
          </div>
        </div>

        {/* Posted Balance */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Total Posted Balance</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "..." : `₹${postedInr}`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total ledger funds before reservations
          </div>
        </div>

        {/* Reserved Holds */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">In-Flight Holds (Reserved)</span>
            <Lock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : `₹${reservedInr}`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Held pending delivery confirmation
          </div>
        </div>
      </div>

      {/* Policy Footnote */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/30 p-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Authoritative Delivery Billing:
          </span>{" "}
          Holds are reserved when messages are submitted to Meta. Deductions are finalized strictly upon confirmed delivery. If a message fails or is rejected, held funds are automatically released back to your available balance.
        </div>
      </div>

      {/* Admin Adjustment Modal */}
      {isAdmin && wallet && (
        <WalletAdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          workspaceId={wallet.workspaceId}
          currentBalanceInr={wallet.postedBalanceInr}
        />
      )}
    </div>
  );
};
