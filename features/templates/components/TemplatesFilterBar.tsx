import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "../../../components/ui/input";

export interface TemplatesFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
}

export const TemplatesFilterBar: React.FC<TemplatesFilterBarProps> = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  language,
  onLanguageChange,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4E7] bg-white p-3.5 shadow-subtle md:flex-row md:items-center md:justify-between dark:border-[#292C2F] dark:bg-[#121416]">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          className="h-8.5 rounded-md border-[#D4D4D8] bg-[#FAFAFA] pl-8.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white dark:border-[#303438] dark:bg-[#17191B] dark:focus:bg-[#121416]"
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search templates by name..."
          value={query}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>

        <select
          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(e) => onStatusChange(e.target.value)}
          value={status}
        >
          <option value="">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(e) => onCategoryChange(e.target.value)}
          value={category}
        >
          <option value="">All Categories</option>
          <option value="MARKETING">Marketing</option>
          <option value="UTILITY">Utility</option>
          <option value="AUTHENTICATION">Authentication</option>
        </select>

        <Input
          className="h-8.5 w-24 rounded-md border-[#D4D4D8] bg-[#FAFAFA] text-xs text-foreground dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(e) => onLanguageChange(e.target.value)}
          placeholder="en_US"
          value={language}
        />
      </div>
    </div>
  );
};
