"use client";

import { AlertCircle, UserCheck, Users, XCircle, FileWarning } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ContactImportRecord } from "../contact.types";

interface ContactImportPreviewProps {
  importRecord: ContactImportRecord;
  onConfirm: () => void;
  onCancel: () => void;
  isCommitting: boolean;
  error?: string | null;
}

export function ContactImportPreview({
  importRecord,
  onConfirm,
  onCancel,
  isCommitting,
  error,
}: ContactImportPreviewProps) {
  const { stats, preview = [] } = importRecord;
  const totalInvalid = stats.invalidRows + stats.duplicateRows;
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">Import Preview</h2>
        <p className="text-sm text-[#6f7f75]">
          Review the validation results before finalizing the import.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fdeaea] px-4 py-3 text-xs font-medium text-[#9a3d33] border border-[#e6c2bc]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e5ddd3] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#6f7f75] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rows</span>
          </div>
          <span className="text-3xl font-bold text-[#25342f]">{stats.totalRows.toLocaleString()}</span>
        </div>
        
        <div className="bg-[#eef8f0] border border-[#bfd8c6] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#2d644d] mb-2">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Valid Contacts</span>
          </div>
          <span className="text-3xl font-bold text-[#244b42]">{stats.validRows.toLocaleString()}</span>
          <div className="mt-2 text-xs font-medium text-[#2d644d] space-y-1">
            <div>• {stats.newContacts.toLocaleString()} New</div>
            <div>• {stats.existingContacts.toLocaleString()} Existing</div>
          </div>
        </div>

        <div className="bg-[#fdf0ee] border border-[#e6c2bc] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#ba4a3e] mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Invalid Rows</span>
          </div>
          <span className="text-3xl font-bold text-[#9a3d33]">{stats.invalidRows.toLocaleString()}</span>
        </div>

        <div className="bg-[#fbf7f1] border border-[#e2d8ca] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#7a654c] mb-2">
            <FileWarning className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Duplicates</span>
          </div>
          <span className="text-3xl font-bold text-[#5c4935]">{stats.duplicateRows.toLocaleString()}</span>
          <p className="mt-2 text-[10px] text-[#7a654c] leading-tight">
            Rows with duplicate phones within the file.
          </p>
        </div>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="rounded-2xl border border-[#e5ddd3] bg-white overflow-hidden shadow-sm">
          <div className="bg-[#fbf7f1] border-b border-[#e5ddd3] px-5 py-3">
            <h3 className="text-sm font-semibold text-[#25342f]">Sample Data Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#faf9f7] text-[#6f7f75] text-xs uppercase tracking-wider border-b border-[#e5ddd3]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Row</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee4d8]">
                {preview.map((row, idx) => {
                  const data = row.data as Record<string, any>;
                  const name = data.displayName || data.name || data.Name || data.Display_Name || "—";
                  
                  return (
                    <tr key={idx} className="hover:bg-[#fbf7f1] transition-colors">
                      <td className="px-5 py-3 text-[#7a8b82]">{row.rowNumber}</td>
                      <td className="px-5 py-3 font-medium text-[#25342f]">{name}</td>
                      <td className="px-5 py-3 text-[#44534d] font-mono text-xs">{row.normalizedPhone || data.phoneNumber || data.phone || data.Phone || "—"}</td>
                      <td className="px-5 py-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#eef8f0] text-[#244b42] border border-[#bfd8c6]">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#fdf0ee] text-[#9a3d33] border border-[#e6c2bc]">
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#6f7f75]">
                        {row.statusReason === "new_contact" && "New Contact"}
                        {row.statusReason === "existing_contact" && "Update Existing"}
                        {row.statusReason === "duplicate_in_file" && "Duplicate in File"}
                        {row.statusReason === "invalid_length" && "Invalid Phone Number"}
                        {row.statusReason === "missing_phone" && "Missing Phone"}
                        {!row.statusReason && "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Section */}
      <div className="bg-[#fbf7f1] border border-[#e5ddd3] rounded-2xl p-6">
        <h3 className="text-base font-bold text-[#25342f] mb-4">You are about to import:</h3>
        
        <ul className="space-y-3 mb-6 text-sm text-[#44534d]">
          <li className="flex items-start gap-2">
            <span className="text-[#2d644d] font-bold">•</span>
            <span><strong className="text-[#25342f]">{stats.validRows.toLocaleString()} valid contacts</strong> in total.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2d644d] font-bold">•</span>
            <span><strong className="text-[#25342f]">{stats.existingContacts.toLocaleString()} existing contacts</strong> will be updated where mapped fields are provided.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2d644d] font-bold">•</span>
            <span><strong className="text-[#25342f]">{stats.newContacts.toLocaleString()} new contacts</strong> will be created.</span>
          </li>
          {totalInvalid > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-[#9a3d33] font-bold">•</span>
              <span className="text-[#9a3d33]"><strong>{totalInvalid.toLocaleString()} invalid or duplicate records</strong> will be skipped.</span>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-3">
          <Button
            onClick={onConfirm}
            disabled={isCommitting || stats.validRows === 0}
            className="bg-[#2d644d] text-white hover:bg-[#255440] shadow-sm px-8"
          >
            {isCommitting ? "Importing..." : "Confirm & Import"}
          </Button>
          <Button
            onClick={onCancel}
            disabled={isCommitting}
            variant="secondary"
            className="bg-white border-[#ddd2c3] text-[#25342f] hover:bg-[#f6f1e9]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
