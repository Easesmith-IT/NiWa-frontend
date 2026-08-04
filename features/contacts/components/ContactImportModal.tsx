"use client";

import { ChangeEvent, useState } from "react";
import { AlertCircle, FileSpreadsheet, Upload, X } from "lucide-react";

import { Button } from "../../../components/ui/button";

interface ContactImportModalProps {
  isPending: boolean;
  onClose: () => void;
  onImport: (contacts: Array<{
    company?: string;
    displayName: string;
    email?: string;
    phoneNumber: string;
    phoneNumberE164: string;
    profileName?: string;
    waId: string;
  }>) => void;
}

export function ContactImportModal({
  isPending,
  onClose,
  onImport,
}: ContactImportModalProps) {
  const [parsedContacts, setParsedContacts] = useState<Array<{
    company?: string;
    displayName: string;
    email?: string;
    phoneNumber: string;
    phoneNumberE164: string;
    profileName?: string;
    waId: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) throw new Error("File is empty.");

    const headers = lines[0]?.toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, "")) ?? [];
    const rows = lines.slice(1);

    return rows.map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = cols[idx] ?? "";
      });

      const phone = record.phone || record.phonenumber || record.mobile || record.waid || cols[1] || "";
      const name = record.name || record.displayname || record.fullname || cols[0] || phone;

      return {
        company: record.company || undefined,
        displayName: name || phone || "Unnamed Contact",
        email: record.email || undefined,
        phoneNumber: phone,
        phoneNumberE164: phone,
        profileName: record.profilename || record.profile || undefined,
        waId: phone,
      };
    }).filter((item) => Boolean(item.phoneNumber));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = String(event.target?.result ?? "");
        if (file.name.endsWith(".json")) {
          const raw = JSON.parse(content) as Array<Record<string, unknown>>;
          const items = raw.map((item) => ({
            company: typeof item.company === "string" ? item.company : undefined,
            displayName: String(item.displayName ?? item.name ?? item.phoneNumber ?? ""),
            email: typeof item.email === "string" ? item.email : undefined,
            phoneNumber: String(item.phoneNumber ?? item.phone ?? ""),
            phoneNumberE164: String(item.phoneNumberE164 ?? item.phoneNumber ?? item.phone ?? ""),
            profileName: typeof item.profileName === "string" ? item.profileName : undefined,
            waId: String(item.waId ?? item.phoneNumberE164 ?? item.phoneNumber ?? item.phone ?? ""),
          })).filter((item) => Boolean(item.phoneNumber));

          setParsedContacts(items);
        } else {
          const items = parseCsvText(content);
          setParsedContacts(items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file.");
        setParsedContacts([]);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-modal space-y-5 dark:border-[#303438] dark:bg-[#17191B]">
        <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-4 dark:border-[#202326]">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#EDF8F3] p-2 text-[#176B4D] dark:bg-[#15271F] dark:text-[#359B76]">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Bulk import contacts</h3>
              <p className="text-xs text-muted-foreground">Upload CSV or JSON file</p>
            </div>
          </div>
          <button
            className="rounded-full p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#202326]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E4E4E7] bg-[#FAFAFA] p-8 text-center transition hover:border-[#176B4D] dark:border-[#303438] dark:bg-[#121416] dark:hover:border-[#359B76]">
          <FileSpreadsheet className="h-10 w-10 text-[#176B4D] dark:text-[#359B76]" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {fileName ? fileName : "Click to select a file (CSV or JSON)"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Columns supported: Name, Phone, Company, Email
          </p>
          <input
            accept=".csv, .json"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileUpload}
            type="file"
          />
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs text-[#C2413A] border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-[#D7685C]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {parsedContacts.length > 0 ? (
          <div className="rounded-xl bg-[#EDF8F3] p-4 space-y-2 dark:bg-[#13251E]">
            <p className="text-xs font-semibold text-[#16803C] dark:text-[#3FA66F]">
              ✓ Preview: Ready to import {parsedContacts.length} contact(s)
            </p>
            <div className="max-h-32 overflow-y-auto divide-y divide-[#E4E4E7] text-xs text-foreground dark:divide-[#292C2F]">
              {parsedContacts.slice(0, 5).map((c, idx) => (
                <div className="py-1 flex justify-between" key={idx}>
                  <span className="font-medium">{c.displayName}</span>
                  <span>{c.phoneNumber}</span>
                </div>
              ))}
              {parsedContacts.length > 5 ? (
                <p className="pt-1 text-[11px] text-muted-foreground text-center">
                  + {parsedContacts.length - 5} more contact(s)
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            disabled={parsedContacts.length === 0 || isPending}
            onClick={() => onImport(parsedContacts)}
            type="button"
            variant="primary"
          >
            {isPending ? "Importing..." : `Import ${parsedContacts.length} contacts`}
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
