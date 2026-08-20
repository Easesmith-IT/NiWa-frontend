"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, FileSpreadsheet, Tag, Users, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";

export interface ContactImportItem {
  id: string;
  fileName: string;
  status: string;
  stats: {
    totalRows: number;
    processedRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    existingContacts: number;
    newContacts: number;
    updatedContacts: number;
  };
  createdAt: string;
}

interface Step3Props {
  audienceType: "import" | "tags";
  setAudienceType: (type: "import" | "tags") => void;
  importId: string;
  setImportId: (id: string) => void;
  tagsInput: string;
  setTagsInput: (tags: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Audience: React.FC<Step3Props> = ({
  audienceType,
  setAudienceType,
  importId,
  setImportId,
  tagsInput,
  setTagsInput,
  onNext,
  onBack,
}) => {
  const [error, setError] = React.useState("");

  const importsQuery = useQuery({
    queryKey: ["contact-imports-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ContactImportItem[] }>("/contact-imports");
      return data;
    },
  });

  const importsList = importsQuery.data?.data || [];
  const selectedImport = importsList.find((i) => i.id === importId);

  // Auto-select first completed import if none selected
  React.useEffect(() => {
    if (audienceType === "import" && !importId && importsList.length > 0) {
      const firstReady = importsList.find((i) => i.status === "completed" || i.status === "ready") || importsList[0];
      if (firstReady) setImportId(firstReady.id);
    }
  }, [audienceType, importId, importsList, setImportId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audienceType === "import" && !importId) {
      setError("Please select a contact import file.");
      return;
    }
    if (audienceType === "tags" && !tagsInput.trim()) {
      setError("Please enter at least one contact tag.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Audience Selection</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Choose who should receive this WhatsApp campaign from your contact imports or contact tags.
        </p>
      </div>

      {/* Audience Source Toggle Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAudienceType("import")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
            audienceType === "import"
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          From Contact Import
        </button>

        <button
          type="button"
          onClick={() => setAudienceType("tags")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
            audienceType === "tags"
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Tag className="h-4 w-4" />
          From Contact Tags
        </button>
      </div>

      {/* Audience Content */}
      {audienceType === "import" ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Select a Contact Import List</label>

          {importsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-xl border bg-gray-50 py-8 text-xs text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
              Loading contact imports...
            </div>
          ) : importsList.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-gray-500">
              No contact imports found in this workspace. Upload a CSV/XLSX file under Contacts → Import.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {importsList.map((item) => {
                const isSelected = item.id === importId;
                const total = item.stats?.totalRows || 0;
                const valid = item.stats?.validRows || total;
                const invalid = item.stats?.invalidRows || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setImportId(item.id)}
                    className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.fileName}</p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 border-t pt-2.5 text-xs text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">{valid.toLocaleString()}</span> valid
                      </div>
                      {invalid > 0 && (
                        <div className="text-amber-700">
                          <span className="font-semibold">{invalid.toLocaleString()}</span> excluded
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Tags (Comma-separated)</label>
            <Input
              placeholder="e.g. VIP, summer_lead, retail"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Matches contacts possessing any of the specified tags.
            </p>
          </div>
        </div>
      )}

      {/* Audience Summary Card */}
      {selectedImport && audienceType === "import" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Audience Summary
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-gray-700">
            <div className="rounded-lg bg-white p-2 shadow-xs">
              <p className="text-base font-bold text-gray-900">
                {(selectedImport.stats?.totalRows || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Total Contacts</p>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-xs">
              <p className="text-base font-bold text-emerald-700">
                {(selectedImport.stats?.validRows || selectedImport.stats?.totalRows || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Eligible</p>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-xs">
              <p className="text-base font-bold text-amber-700">
                {(selectedImport.stats?.invalidRows || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Excluded</p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue to Message Variables
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
