"use client";

import { CheckCircle2, ListFilter, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ContactImportRecordV1 } from "../contact.types";

interface ContactImportSummaryProps {
  importRecord: ContactImportRecordV1;
  onViewContacts: () => void;
  onImportAnother: () => void;
}

export function ContactImportSummary({
  importRecord,
  onViewContacts,
  onImportAnother,
}: ContactImportSummaryProps) {
  const { stats } = importRecord;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
      <div className="rounded-full bg-[#eef8f0] p-4 shadow-sm border border-[#bfd8c6]">
        <CheckCircle2 className="h-16 w-16 text-[#244b42]" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#25342f]">Import Complete</h2>
        <p className="text-base text-[#6f7f75]">
          Your contacts have been successfully imported.
        </p>
      </div>

      <div className="w-full max-w-md bg-white border border-[#e5ddd3] rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-[#eee4d8]">
          <div className="p-4 bg-[#fbf7f1] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#25342f]">Total Processed</span>
            <span className="text-sm font-bold text-[#2d644d]">{stats.processedRows.toLocaleString()} rows</span>
          </div>
          
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-[#44534d]">New Contacts Created</span>
            <span className="text-sm font-bold text-[#25342f]">{stats.newContacts.toLocaleString()}</span>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-[#faf9f7]">
            <span className="text-sm font-medium text-[#44534d]">Existing Contacts Updated</span>
            <span className="text-sm font-bold text-[#25342f]">{stats.updatedContacts.toLocaleString()}</span>
          </div>
          
          {(stats.invalidRows > 0 || stats.duplicateRows > 0) && (
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-[#9a3d33]">Invalid / Skipped Rows</span>
              <span className="text-sm font-bold text-[#9a3d33]">{(stats.invalidRows + stats.duplicateRows).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          onClick={onViewContacts}
          className="bg-[#2d644d] text-white hover:bg-[#255440] shadow-sm px-8"
        >
          <ListFilter className="w-4 h-4 mr-2" />
          View Contacts
        </Button>
        <Button
          onClick={onImportAnother}
          variant="secondary"
          className="bg-white border-[#ddd2c3] text-[#25342f] hover:bg-[#f6f1e9] px-8"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Import Another File
        </Button>
      </div>
    </div>
  );
}
