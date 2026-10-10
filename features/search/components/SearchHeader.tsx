import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";

export interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  totals?: {
    contacts?: number;
    conversations?: number;
    messages?: number;
    notes?: number;
    products?: number;
    salesOrders?: number;
    purchaseOrders?: number;
    deals?: number;
    leads?: number;
  };
  inboxTotal: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  onQueryChange,
  totals,
  inboxTotal,
}) => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Omni-Search Hub
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Search across contacts, inbox threads, messages, internal notes, products, orders, deals, and leads.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-[#303438] dark:bg-[#17191B]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="border-0 bg-transparent px-0 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by name, phone (+91...), message text, SKU, order ID, or title..."
              value={query}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
          {[
            { label: "Contacts", value: totals?.contacts ?? 0 },
            { label: "Threads", value: inboxTotal },
            { label: "Messages", value: totals?.messages ?? 0 },
            { label: "Notes", value: totals?.notes ?? 0 },
            { label: "Products", value: totals?.products ?? 0 },
            { label: "Orders", value: (totals?.salesOrders ?? 0) + (totals?.purchaseOrders ?? 0) },
            { label: "Deals", value: totals?.deals ?? 0 },
            { label: "Leads", value: totals?.leads ?? 0 },
          ].map((item) => (
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-2 dark:border-[#292C2F] dark:bg-[#17191B]" key={item.label}>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-base font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
