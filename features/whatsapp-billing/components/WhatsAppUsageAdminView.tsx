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
import { downloadUsageReport, downloadUsageReportUrl } from "../whatsapp-billing.api";
import { WhatsAppBillingOverview } from "./WhatsAppBillingOverview";
import { WhatsAppUsageEventsTable } from "./WhatsAppUsageEventsTable";
import { WhatsAppFinancialLedgerTable } from "./WhatsAppFinancialLedgerTable";
import { WhatsAppRateCardsCard } from "./WhatsAppRateCardsCard";
import { WhatsAppReconciliationModal } from "./WhatsAppReconciliationModal";
import { CustomerPricingCard } from "./CustomerPricingCard";
import { WalletTransactionsTable } from "./WalletTransactionsTable";

export const WhatsAppUsageAdminView: React.FC<{ workspaceId?: string }> = ({ workspaceId = "default" }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "customer-pricing" | "ledger" | "rate-cards">("overview");

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

  const { data: eventsData, isLoading: isEventsLoading } = useWhatsAppUsageEvents({
    page: eventsPage,
    limit: 15,
    category: categoryFilter || undefined,
    billingState: stateFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: ledgerData, isLoading: isLedgerLoading } = useWhatsAppLedger({
    page: ledgerPage,
    limit: 15,
    entryType: entryTypeFilter || undefined,
  });

  const { data: rateCards, isLoading: isRateCardsLoading } = useWhatsAppRateCards({
    includeInactive: false,
  });

  const createRateCardMutation = useCreateWhatsAppRateCard();
  const triggerReconciliationMutation = useTriggerWhatsAppReconciliation();

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
