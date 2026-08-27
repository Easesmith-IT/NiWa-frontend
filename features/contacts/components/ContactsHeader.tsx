"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, GitMerge, Plus, Search, Upload } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export interface ContactsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenCreateModal: () => void;
  onOpenMergeModal: () => void;
  duplicateCount: number;
  onExportCsv: () => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  search,
  onSearchChange,
  onOpenCreateModal,
  onOpenMergeModal,
  duplicateCount,
  onExportCsv,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e5ddd3] bg-[#fbf7f1] p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#25342f]">
          Customer Registry
        </h1>
        <p className="text-xs text-[#6f7f75]">
          Enterprise CRM for WhatsApp business contacts, tags, and notes
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#7a8b82]" />
          <Input
            className="rounded-xl border-[#ddd2c3] bg-white pl-9 text-xs text-[#25342f] placeholder:text-[#7a8b82]"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, company..."
            value={search}
          />
        </div>

        <Button
          className="bg-[#2d644d] text-white hover:bg-[#255440]"
          onClick={onOpenCreateModal}
          size="sm"
          type="button"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Contact
        </Button>

        <Button
          className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
          onClick={() => router.push("/contacts/import")}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5 text-[#2d644d]" />
          Import
        </Button>

        <Button
          className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
          onClick={onOpenMergeModal}
          size="sm"
          type="button"
          variant="secondary"
        >
          <GitMerge className="mr-1.5 h-3.5 w-3.5 text-[#2d644d]" />
          Merge Duplicates ({duplicateCount})
        </Button>

        <Button
          className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
          onClick={onExportCsv}
          size="sm"
          type="button"
          variant="secondary"
        >
          <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
