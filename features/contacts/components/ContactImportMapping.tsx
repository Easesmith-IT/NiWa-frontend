"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface ContactImportMappingProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (header: string, field: string) => void;
  onValidate: () => void;
  isValidating: boolean;
  error?: string | null;
}

export function ContactImportMapping({
  headers,
  mapping,
  onMappingChange,
  onValidate,
  isValidating,
  error,
}: ContactImportMappingProps) {
  const REQUIRED_FIELDS = [
    { key: "phoneNumber", label: "Phone Number" }
  ];
  
  const OPTIONAL_FIELDS = [
    { key: "displayName", label: "Display Name" },
    { key: "email", label: "Email Address" },
    { key: "company", label: "Company" },
    { key: "profileName", label: "Profile Name" },
  ];

  const hasPhoneMapped = Object.values(mapping).includes("phoneNumber");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">Map Columns</h2>
        <p className="text-sm text-[#6f7f75]">
          Match the columns from your file to the contact fields in your registry.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fdeaea] px-4 py-3 text-xs font-medium text-[#9a3d33] border border-[#e6c2bc]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-[#e5ddd3] bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 bg-[#fbf7f1] border-b border-[#e5ddd3] p-4">
          <div className="text-xs font-semibold text-[#6f7f75] uppercase tracking-wider">File Column</div>
          <div className="text-xs font-semibold text-[#6f7f75] uppercase tracking-wider pl-8">NIWA Field</div>
        </div>
        
        <div className="divide-y divide-[#eee4d8]">
          {headers.map((header) => (
            <div key={header} className="grid grid-cols-2 p-4 items-center hover:bg-[#faf9f7] transition-colors">
              <div className="flex items-center gap-3 pr-4">
                <div className="truncate font-medium text-[#25342f] text-sm" title={header}>
                  {header}
                </div>
              </div>
              
              <div className="relative pl-8 flex items-center">
                <ArrowRight className="absolute left-2 w-4 h-4 text-[#a0aca4]" />
                <select
                  className="w-full bg-white text-sm p-2.5 border border-[#ddd2c3] rounded-lg text-[#25342f] focus:border-[#2d644d] focus:ring-1 focus:ring-[#2d644d] outline-none transition-all shadow-sm"
                  value={mapping[header] || ""}
                  onChange={(e) => onMappingChange(header, e.target.value)}
                >
                  <option value="">-- Ignore Column --</option>
                  
                  <optgroup label="Required Fields">
                    {REQUIRED_FIELDS.map(f => (
                      <option key={f.key} value={f.key}>{f.label} *</option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Optional Fields">
                    {OPTIONAL_FIELDS.map(f => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Custom Fields">
                    <option value={`custom_${header.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}>
                      Custom Field: {header}
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#eee4d8]">
        {!hasPhoneMapped ? (
          <p className="text-xs font-medium text-[#9a3d33]">
            * You must map at least one column to Phone Number.
          </p>
        ) : (
          <p className="text-xs font-medium text-[#2d644d]">
            ✓ Phone Number is mapped.
          </p>
        )}
        
        <Button
          onClick={onValidate}
          disabled={!hasPhoneMapped || isValidating}
          className="bg-[#2d644d] text-white hover:bg-[#255440] shadow-sm px-6"
        >
          {isValidating ? "Validating Contacts..." : "Validate Contacts"}
        </Button>
      </div>
    </div>
  );
}
