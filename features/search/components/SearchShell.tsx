import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { useWorkspaceModules } from "../../../lib/workspace/use-workspace-modules";
import type { useSearchOrchestration } from "../hooks/useSearchOrchestration";
import { SearchContactsSection } from "./SearchContactsSection";
import { SearchDealsSection } from "./SearchDealsSection";
import { SearchHeader } from "./SearchHeader";
import { SearchLeadsSection } from "./SearchLeadsSection";
import { SearchMessagesSection } from "./SearchMessagesSection";
import { SearchNotesSection } from "./SearchNotesSection";
import { SearchProductsSection } from "./SearchProductsSection";
import { SearchPurchaseOrdersSection } from "./SearchPurchaseOrdersSection";
import { SearchSalesOrdersSection } from "./SearchSalesOrdersSection";
import { SearchThreadsSection } from "./SearchThreadsSection";

export interface SearchShellProps {
  orchestration: ReturnType<typeof useSearchOrchestration>;
}

export const SearchShell: React.FC<SearchShellProps> = ({ orchestration }) => {
  const {
    query,
    setQuery,
    canSearch,
    globalSearchQuery,
    inboxSearchQuery,
    totals,
    isLoading,
    hasError,
    hasResults,
  } = orchestration;

  const { isModuleEnabled } = useWorkspaceModules();

  const isProductsEnabled = isModuleEnabled("products");
  const isSalesEnabled = isModuleEnabled("sales");
  const isPurchasingEnabled = isModuleEnabled("purchasing");
  const isCrmEnabled = isModuleEnabled("crm");

  const inboxTotal = inboxSearchQuery.data?.metadata.total ?? 0;
  const threads = inboxSearchQuery.data?.data ?? [];
  const messages = globalSearchQuery.data?.data.messages ?? [];
  const contacts = globalSearchQuery.data?.data.contacts ?? [];
  const notes = globalSearchQuery.data?.data.notes ?? [];
  const products = isProductsEnabled ? (globalSearchQuery.data?.data.products ?? []) : [];
  const salesOrders = isSalesEnabled ? (globalSearchQuery.data?.data.salesOrders ?? []) : [];
  const purchaseOrders = isPurchasingEnabled ? (globalSearchQuery.data?.data.purchaseOrders ?? []) : [];
  const deals = isCrmEnabled ? (globalSearchQuery.data?.data.deals ?? []) : [];
  const leads = isCrmEnabled ? (globalSearchQuery.data?.data.leads ?? []) : [];

  return (
    <div className="space-y-4">
      <SearchHeader
        inboxTotal={inboxTotal}
        onQueryChange={setQuery}
        query={query}
        totals={totals}
      />

      {!query.trim() ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Enter a search term above to query all records across the system.
          </p>
        </Card>
      ) : null}

      {query.trim().length === 1 ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Enter at least 2 characters to initiate global search.
          </p>
        </Card>
      ) : null}

      {hasError ? (
        <Card className="p-4 space-y-3">
          <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">
            Search query failed. Please verify API backend connection.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => void globalSearchQuery.refetch()} size="sm" type="button" variant="secondary">
              Retry Global Search
            </Button>
            <Button onClick={() => void inboxSearchQuery.refetch()} size="sm" type="button" variant="secondary">
              Retry Inbox Search
            </Button>
          </div>
        </Card>
      ) : null}

      {canSearch && !isLoading && !hasError && !hasResults ? (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            No contacts, threads, messages, notes, products, orders, deals, or leads matched your search query.
          </p>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SearchThreadsSection isLoading={isLoading} query={query} threads={threads} />
          <SearchMessagesSection isLoading={isLoading} messages={messages} />
          <SearchSalesOrdersSection isLoading={isLoading} orders={salesOrders} />
          <SearchPurchaseOrdersSection isLoading={isLoading} orders={purchaseOrders} />
        </div>

        <div className="space-y-4">
          <SearchContactsSection contacts={contacts} isLoading={isLoading} />
          <SearchNotesSection isLoading={isLoading} notes={notes} />
          <SearchProductsSection isLoading={isLoading} products={products} />
          <SearchDealsSection deals={deals} isLoading={isLoading} />
          <SearchLeadsSection isLoading={isLoading} leads={leads} />
        </div>
      </section>
    </div>
  );
};
