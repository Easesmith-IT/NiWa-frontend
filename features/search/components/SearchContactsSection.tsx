import React from "react";
import Link from "next/link";
import { ContactRound } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { SearchContactResult } from "../search.types";

export interface SearchContactsSectionProps {
  isLoading: boolean;
  contacts: SearchContactResult[];
}

export const SearchContactsSection: React.FC<SearchContactsSectionProps> = ({
  isLoading,
  contacts,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <ContactRound className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Contacts</h2>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="h-3.5 w-36 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
            <div className="h-3 w-28 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
          </div>
        ) : null}
        {contacts.map((item) => (
          <Link
            className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:border-[#3A3E42]"
            href="/contacts"
            key={item.contact._id}
          >
            <p className="text-xs font-semibold text-foreground">{item.contact.displayName}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.contact.phoneNumber}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.contact.company || "No company"} • <span className="font-mono">{item.contact.waId}</span>
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
};
