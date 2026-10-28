"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useWhatsAppBillingSummary,
  useWhatsAppUsageEvents,
  useWhatsAppLedger,
  useWhatsAppRateCards,
  useCreateWhatsAppRateCard,
  useTriggerWhatsAppReconciliation,
  useWorkspaceWallet,
  useWalletTransactions,
  useCustomerRateCards,
} from "../whatsapp-billing.queries";
import { downloadUsageReport, downloadUsageReportUrl, adminCorrectWhatsAppSupplierTaxEvidence, adminRecordWhatsAppUsageAdjustment } from "../whatsapp-billing.api";
import { WhatsAppBillingOverview } from "./WhatsAppBillingOverview";
import { WhatsAppUsageEventsTable } from "./WhatsAppUsageEventsTable";
import { WhatsAppFinancialLedgerTable } from "./WhatsAppFinancialLedgerTable";
import { WhatsAppRateCardsCard } from "./WhatsAppRateCardsCard";
import { WhatsAppReconciliationModal } from "./WhatsAppReconciliationModal";
import { CustomerPricingCard } from "./CustomerPricingCard";
import { WalletTransactionsTable } from "./WalletTransactionsTable";
import { DispatchOperationsCard } from "./DispatchOperationsCard";

export const WhatsAppUsageAdminView: React.FC<{ workspaceId?: string }> = ({ workspaceId = "default" }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "customer-pricing" | "ledger" | "rate-cards" | "dispatch-operations" | "corrections">("overview");
  const [supplierTaxForm, setSupplierTaxForm] = useState({
    metaMessageId: "",
    supplierTaxAmountInr: "",
    supplierTaxRatePercent: "",
    supplierInvoiceId: "",
    supplierInvoiceLineId: "",
    sourceRef: "",
    correctionReason: "",
    idempotencyKey: "",
  });
  const [chargeAdjustmentForm, setChargeAdjustmentForm] = useState({
    metaMessageId: "",
    adjustmentInr: "",
    reason: "",
    creditNoteId: "",
    creditNoteSourceRef: "",
    idempotencyKey: "",
  });
  const [supplierTaxSubmitting, setSupplierTaxSubmitting] = useState(false);
  const [chargeAdjustmentSubmitting, setChargeAdjustmentSubmitting] = useState(false);
  const [correctionNotice, setCorrectionNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Events Table State
  const [eventsPage, setEventsPage] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Ledger Table State
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("");

  // Wallet Ledger State
  const [walletTxPage, setWalletTxPage] = useState<number>(1);
  const [walletTypeFilter, setWalletTypeFilter] = useState<string>("");

  // Reconciliation Modal
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState<boolean>(false);

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useWhatsAppBillingSummary({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: wallet, isLoading: isWalletLoading } = useWorkspaceWallet();

  const { data: walletTransactionsData, isLoading: isWalletTransactionsLoading } = useWalletTransactions({
    page: walletTxPage,
    limit: 15,
    transactionType: walletTypeFilter || undefined,
  });

  const { data: customerRateCards, isLoading: isCustomerPricingLoading } = useCustomerRateCards(workspaceId);

  const { data: eventsData, isLoading: isEventsLoading, refetch: refetchEvents } = useWhatsAppUsageEvents({
    page: eventsPage,
    limit: 15,
    category: categoryFilter || undefined,
    billingState: stateFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: ledgerData, isLoading: isLedgerLoading, refetch: refetchLedger } = useWhatsAppLedger({
    page: ledgerPage,
    limit: 15,
    entryType: entryTypeFilter || undefined,
  });

  const { data: rateCards, isLoading: isRateCardsLoading } = useWhatsAppRateCards({
    workspaceId,
    includeInactive: false,
  });

  const createRateCardMutation = useCreateWhatsAppRateCard();
  const triggerReconciliationMutation = useTriggerWhatsAppReconciliation();

  const handleSupplierTaxCorrection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountInr = Number(supplierTaxForm.supplierTaxAmountInr);
    const taxRate = supplierTaxForm.supplierTaxRatePercent.trim() === "" ? null : Number(supplierTaxForm.supplierTaxRatePercent);
    if (!supplierTaxForm.metaMessageId.trim() || !supplierTaxForm.supplierInvoiceId.trim() || !supplierTaxForm.supplierInvoiceLineId.trim() || !supplierTaxForm.sourceRef.trim() || !supplierTaxForm.correctionReason.trim() || !Number.isFinite(amountInr) || amountInr < 0 || !Number.isSafeInteger(Math.round(amountInr * 1_000_000)) || (taxRate !== null && (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100))) {
      setCorrectionNotice({ kind: "error", text: "Enter a valid message ID, non-negative tax amount, invoice/line reference, source evidence and correction reason." });
      return;
    }
    const idempotencyKey = supplierTaxForm.idempotencyKey || `supplier-tax:${workspaceId}:${supplierTaxForm.metaMessageId.trim()}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    setSupplierTaxForm((current) => ({ ...current, idempotencyKey }));
    setSupplierTaxSubmitting(true);
    setCorrectionNotice(null);
    try {
      await adminCorrectWhatsAppSupplierTaxEvidence({
        workspaceId,
        metaMessageId: supplierTaxForm.metaMessageId.trim(),
        supplierTaxAmountMicros: Math.round(amountInr * 1_000_000),
        supplierTaxRatePercent: taxRate,
        supplierInvoiceId: supplierTaxForm.supplierInvoiceId.trim(),
        supplierInvoiceLineId: supplierTaxForm.supplierInvoiceLineId.trim(),
        sourceRef: supplierTaxForm.sourceRef.trim(),
        correctionReason: supplierTaxForm.correctionReason.trim(),
        idempotencyKey,
      });
      await Promise.all([refetchEvents(), refetchLedger()]);
      setSupplierTaxForm({ metaMessageId: "", supplierTaxAmountInr: "", supplierTaxRatePercent: "", supplierInvoiceId: "", supplierInvoiceLineId: "", sourceRef: "", correctionReason: "", idempotencyKey: "" });
      setCorrectionNotice({ kind: "success", text: "Supplier-tax correction recorded. The original evidence remains in the immutable ledger." });
    } catch (error: any) {
      setCorrectionNotice({ kind: "error", text: error?.response?.data?.message || error?.message || "Supplier-tax correction could not be recorded." });
    } finally {
      setSupplierTaxSubmitting(false);
    }
  };

  const handleCustomerChargeAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountInr = Number(chargeAdjustmentForm.adjustmentInr);
    if (!chargeAdjustmentForm.metaMessageId.trim() || !chargeAdjustmentForm.reason.trim() || !Number.isFinite(amountInr) || amountInr <= 0 || !Number.isSafeInteger(Math.round(amountInr * 100))) {
      setCorrectionNotice({ kind: "error", text: "Enter a valid message ID, positive credit amount and reason." });
      return;
    }
    const idempotencyKey = chargeAdjustmentForm.idempotencyKey || `customer-credit:${workspaceId}:${chargeAdjustmentForm.metaMessageId.trim()}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    setChargeAdjustmentForm((current) => ({ ...current, idempotencyKey }));
    setChargeAdjustmentSubmitting(true);
    setCorrectionNotice(null);
    try {
      await adminRecordWhatsAppUsageAdjustment({
        workspaceId,
        metaMessageId: chargeAdjustmentForm.metaMessageId.trim(),
        adjustmentPaise: Math.round(amountInr * 100),
        reason: chargeAdjustmentForm.reason.trim(),
        idempotencyKey,
        creditNoteId: chargeAdjustmentForm.creditNoteId.trim() || undefined,
        creditNoteSourceRef: chargeAdjustmentForm.creditNoteSourceRef.trim() || undefined,
      });
      await Promise.all([refetchEvents(), refetchLedger()]);
      setChargeAdjustmentForm({ metaMessageId: "", adjustmentInr: "", reason: "", creditNoteId: "", creditNoteSourceRef: "", idempotencyKey: "" });
      setCorrectionNotice({ kind: "success", text: "Customer charge adjustment recorded in the wallet and billing ledgers." });
    } catch (error: any) {
      setCorrectionNotice({ kind: "error", text: error?.response?.data?.message || error?.message || "Customer charge adjustment could not be recorded." });
    } finally {
      setChargeAdjustmentSubmitting(false);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      await downloadUsageReport(format, selectedMonth, selectedYear);
    } catch (err) {
      console.error("Export download failed, falling back to URL download", err);
      const url = downloadUsageReportUrl(format, selectedMonth, selectedYear);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard & KPIs */}
      <WhatsAppBillingOverview
        summary={summary}
        wallet={wallet}
        isWalletLoading={isWalletLoading}
        isLoading={isSummaryLoading}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onExport={handleExport}
      />

      {/* Navigation Tabs & Actions Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Outbound Usage Events
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "wallet"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-500" />
            Wallet Ledger
          </button>

          <button
            onClick={() => setActiveTab("customer-pricing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "customer-pricing"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Tag className="h-3.5 w-3.5 text-indigo-500" />
            Customer Selling Prices
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "ledger"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Financial Ledger
          </button>

          <button
            onClick={() => setActiveTab("dispatch-operations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "dispatch-operations"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Dispatch Recovery
          </button>

          <button
            onClick={() => setActiveTab("corrections")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "corrections"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            Financial Corrections
          </button>

          <button
            onClick={() => setActiveTab("rate-cards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "rate-cards"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Meta Wholesale Costs
          </button>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReconcileModalOpen(true)}
            className="text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Meta Reconciliation
          </Button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <WhatsAppUsageEventsTable
          events={eventsData?.data || []}
          isLoading={isEventsLoading}
          pagination={eventsData?.pagination}
          onPageChange={setEventsPage}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {activeTab === "wallet" && (
        <WalletTransactionsTable
          transactions={walletTransactionsData?.data || []}
          isLoading={isWalletTransactionsLoading}
          pagination={walletTransactionsData?.pagination}
          onPageChange={setWalletTxPage}
          typeFilter={walletTypeFilter}
          onTypeFilterChange={setWalletTypeFilter}
        />
      )}

      {activeTab === "customer-pricing" && (
        <CustomerPricingCard
          rateCards={customerRateCards || []}
          isLoading={isCustomerPricingLoading}
          workspaceId={workspaceId}
        />
      )}

      {activeTab === "ledger" && (
        <WhatsAppFinancialLedgerTable
          entries={ledgerData?.data || []}
          isLoading={isLedgerLoading}
          pagination={ledgerData?.pagination}
          onPageChange={setLedgerPage}
          entryTypeFilter={entryTypeFilter}
          onEntryTypeFilterChange={setEntryTypeFilter}
        />
      )}

      {activeTab === "dispatch-operations" && (
        <DispatchOperationsCard workspaceId={workspaceId} />
      )}

      {activeTab === "corrections" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Corrections append new financial-ledger entries; they do not rewrite historical entries. Source references are recorded for audit, but external invoice/credit-note existence is not automatically verified because no external accounting provider is configured.
          </div>
          {correctionNotice && (
            <div role="status" className={`rounded-md border p-3 text-sm ${
              correctionNotice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
            }`}>
              {correctionNotice.text}
            </div>
          )}
          <div className="grid gap-5 xl:grid-cols-2">
            <form onSubmit={handleSupplierTaxCorrection} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Supplier-tax correction</h3>
                <p className="mt-1 text-xs text-slate-500">Correct tax from supplier invoice evidence. Amount is entered in INR and stored in micro-INR.</p>
              </div>
              <label className="block text-xs font-medium">Meta message ID
                <input required value={supplierTaxForm.metaMessageId} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, metaMessageId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Corrected supplier tax (INR)
                  <input required type="number" min="0" step="0.000001" value={supplierTaxForm.supplierTaxAmountInr} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, supplierTaxAmountInr: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="block text-xs font-medium">Supplier tax rate (%)
                  <input type="number" min="0" max="100" step="0.01" value={supplierTaxForm.supplierTaxRatePercent} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, supplierTaxRatePercent: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Supplier invoice ID
                  <input required value={supplierTaxForm.supplierInvoiceId} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, supplierInvoiceId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="block text-xs font-medium">Supplier invoice line ID
                  <input required value={supplierTaxForm.supplierInvoiceLineId} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, supplierInvoiceLineId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
              </div>
              <label className="block text-xs font-medium">Evidence source reference
                <input required value={supplierTaxForm.sourceRef} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, sourceRef: e.target.value }))} placeholder="Invoice file/reference or provider export ID" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block text-xs font-medium">Correction reason
                <textarea required value={supplierTaxForm.correctionReason} onChange={(e) => setSupplierTaxForm((v) => ({ ...v, correctionReason: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" rows={2} />
              </label>
              <Button type="submit" disabled={supplierTaxSubmitting} className="w-full">
                {supplierTaxSubmitting ? "Recording correction..." : "Record supplier-tax correction"}
              </Button>
            </form>
            <form onSubmit={handleCustomerChargeAdjustment} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer charge adjustment</h3>
                <p className="mt-1 text-xs text-slate-500">Credits the customer wallet and records an append-only billing adjustment. For invoiced charges, provide the credit-note ID and source reference.</p>
              </div>
              <label className="block text-xs font-medium">Meta message ID
                <input required value={chargeAdjustmentForm.metaMessageId} onChange={(e) => setChargeAdjustmentForm((v) => ({ ...v, metaMessageId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block text-xs font-medium">Customer credit amount (INR, including tax)
                <input required type="number" min="0.01" step="0.01" value={chargeAdjustmentForm.adjustmentInr} onChange={(e) => setChargeAdjustmentForm((v) => ({ ...v, adjustmentInr: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block text-xs font-medium">Reason
                <textarea required value={chargeAdjustmentForm.reason} onChange={(e) => setChargeAdjustmentForm((v) => ({ ...v, reason: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" rows={2} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium">Credit-note ID (for invoiced charges)
                  <input value={chargeAdjustmentForm.creditNoteId} onChange={(e) => setChargeAdjustmentForm((v) => ({ ...v, creditNoteId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="block text-xs font-medium">Credit-note source reference
                  <input value={chargeAdjustmentForm.creditNoteSourceRef} onChange={(e) => setChargeAdjustmentForm((v) => ({ ...v, creditNoteSourceRef: e.target.value }))} placeholder="External credit note file/reference" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
                </label>
              </div>
              <Button type="submit" disabled={chargeAdjustmentSubmitting} className="w-full">
                {chargeAdjustmentSubmitting ? "Recording adjustment..." : "Record customer charge adjustment"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "rate-cards" && (
        <WhatsAppRateCardsCard
          rateCards={rateCards || []}
          isLoading={isRateCardsLoading}
          workspaceId={workspaceId}
          onCreateRateCard={async (payload) => {
            await createRateCardMutation.mutateAsync({ ...payload, workspaceId });
          }}
        />
      )}

      {/* Meta Billing Reconciliation Modal */}
      <WhatsAppReconciliationModal
        isOpen={isReconcileModalOpen}
        onClose={() => setIsReconcileModalOpen(false)}
        onReconcile={async (payload) => {
          return await triggerReconciliationMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
};
