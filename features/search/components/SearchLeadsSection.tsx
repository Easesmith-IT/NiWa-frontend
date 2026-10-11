import React from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { SearchLeadResult } from "../search.types";

export interface SearchLeadsSectionProps {
  isLoading: boolean;
  leads: SearchLeadResult[];
}

export const SearchLeadsSection: React.FC<SearchLeadsSectionProps> = ({
  isLoading,
  leads,
}) => {
  if (!isLoading && leads.length === 0) return null;

  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <Target className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Leads</h2>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="h-3.5 w-36 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
            <div className="h-3 w-28 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
          </div>
        ) : null}
        {leads.map((item) => (
          <Link
            className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:border-[#3A3E42]"
            href="/leads"
            key={item._id}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{item.title}</p>
              <span className="rounded bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-[#202326]">
                {item.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.leadSource ? `Source: ${item.leadSource}` : "Inbound Lead"}
              {item.value != null ? ` • $${item.value.toLocaleString()}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
};
