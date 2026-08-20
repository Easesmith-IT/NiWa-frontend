"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Tag,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Upload,
  Search,
  X,
  CheckSquare,
  Square,
  Trash2,
  FileText,
  Filter,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  useContactImportsV1Query,
  useContactsV1Query,
  useContactImportPipelineV1,
} from "../../contacts/contact.queries";
import { ContactImportRecordV1, ContactRecordV1 } from "../../contacts/contact.types";

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

export interface ContactItem {
  _id: string;
  displayName: string;
  phoneNumber?: string;
  phoneNumberE164?: string | null;
  email?: string | null;
  company?: string | null;
  customFields?: Array<{ key: string; value: string; name?: string }>;
}

export interface ContactsResponse {
  data: ContactItem[];
  items?: ContactItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore?: boolean;
  };
}

interface Step3Props {
  audienceType: "import" | "select" | "tags";
  setAudienceType: (type: "import" | "select" | "tags") => void;
  importId: string;
  setImportId: (id: string) => void;
  selectedContactMap: Record<string, ContactItem>;
  setSelectedContactMap: React.Dispatch<React.SetStateAction<Record<string, ContactItem>>>;
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
  selectedContactMap,
  setSelectedContactMap,
  tagsInput,
  setTagsInput,
  onNext,
  onBack,
}) => {
  const [error, setError] = useState("");
  const [confirmSwitchMode, setConfirmSwitchMode] = useState<"import" | "select" | "tags" | null>(null);

  // Manual Contact Search & Pagination State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // Contact Import Pipeline Hook (Upload, Validate, Commit, Poll)
  const {
    processImport,
    isProcessing: isUploading,
    progressText: uploadProgress,
    pipelineError: uploadError,
  } = useContactImportPipelineV1();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query Contact Imports
  const importsQuery = useContactImportsV1Query();

  const importsList = importsQuery.data?.data || [];
  const completedImports = importsList.filter((i: ContactImportRecordV1) => i.status === "completed" || i.status === "ready");
  const selectedImport = completedImports.find((i: ContactImportRecordV1) => i.id === importId);

  // Query Contacts for Manual Selection Mode
  const contactsQuery = useContactsV1Query({ search: debouncedSearch, page, limit });

  const contactsList = (contactsQuery.data?.data || []) as ContactRecordV1[];
  const pagination = (contactsQuery.data?.pagination || {
    page: 1,
    limit,
    total: contactsList.length,
    totalPages: 1,
  }) as { page: number; limit: number; total: number; totalPages: number };

  // Auto-select first import if import mode active and no import selected
  useEffect(() => {
    if (audienceType === "import" && !importId && completedImports.length > 0) {
      setImportId(completedImports[0].id);
    }
  }, [audienceType, importId, completedImports, setImportId]);

  // Handle Switching Audience Modes
  const handleModeChange = (targetMode: "import" | "select" | "tags") => {
    if (targetMode === audienceType) return;

    // Check if there is an active selection in current mode
    const hasActiveImport = audienceType === "import" && Boolean(importId);
    const hasActiveContacts = audienceType === "select" && Object.keys(selectedContactMap).length > 0;
    const hasActiveTags = audienceType === "tags" && Boolean(tagsInput.trim());

    if (hasActiveImport || hasActiveContacts || hasActiveTags) {
      setConfirmSwitchMode(targetMode);
    } else {
      setAudienceType(targetMode);
    }
  };

  const confirmSwitch = () => {
    if (confirmSwitchMode) {
      setAudienceType(confirmSwitchMode);
      setConfirmSwitchMode(null);
    }
  };

  // File Drag & Drop / File Pick Upload Flow
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setError("");
    processImport(file, {
      onSuccess: (newImportId) => {
        setImportId(newImportId);
      },
    });
  };

  // Toggle Single Contact Selection
  const toggleContactSelection = (contact: ContactItem) => {
    setSelectedContactMap((prev) => {
      const next = { ...prev };
      if (next[contact._id]) {
        delete next[contact._id];
      } else {
        next[contact._id] = contact;
      }
      return next;
    });
  };

  // Select All Visible Page Contacts
  const selectAllVisible = () => {
    setSelectedContactMap((prev) => {
      const next = { ...prev };
      contactsList.forEach((c) => {
        next[c._id] = c;
      });
      return next;
    });
  };

  // Deselect All Visible Page Contacts
  const deselectAllVisible = () => {
    setSelectedContactMap((prev) => {
      const next = { ...prev };
      contactsList.forEach((c) => {
        delete next[c._id];
      });
      return next;
    });
  };

  // Clear Entire Selection
  const clearSelection = () => {
    setSelectedContactMap({});
  };

  const selectedContactList = useMemo(() => Object.values(selectedContactMap), [selectedContactMap]);
  const selectedContactCount = selectedContactList.length;

  const allVisibleSelected =
    contactsList.length > 0 && contactsList.every((c) => Boolean(selectedContactMap[c._id]));

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (audienceType === "import") {
      if (completedImports.length === 0) {
        setError("No completed contact imports available. Please upload a CSV/XLSX file above.");
        return;
      }
      if (!importId || !selectedImport) {
        setError("Please select a completed contact import list.");
        return;
      }
    } else if (audienceType === "select") {
      if (selectedContactCount === 0) {
        setError("Please select at least one contact to receive this campaign.");
        return;
      }
    } else if (audienceType === "tags") {
      if (!tagsInput.trim()) {
        setError("Please enter at least one contact tag.");
        return;
      }
    }

    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Audience Builder</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Choose who should receive this WhatsApp campaign using files, manual selection, or tags.
        </p>
      </div>

      {/* Audience Mode Selector Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleModeChange("import")}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
            audienceType === "import"
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80"
          }`}
        >
          <FileSpreadsheet className={`h-5 w-5 ${audienceType === "import" ? "text-emerald-600" : "text-gray-400"}`} />
          <span className="text-xs font-bold">Import Contacts</span>
          <span className="text-[10px] text-gray-400">Upload CSV / XLSX</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("select")}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
            audienceType === "select"
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80"
          }`}
        >
          <Users className={`h-5 w-5 ${audienceType === "select" ? "text-emerald-600" : "text-gray-400"}`} />
          <span className="text-xs font-bold">Select Contacts</span>
          <span className="text-[10px] text-gray-400">Search & Pick ({selectedContactCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("tags")}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
            audienceType === "tags"
              ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80"
          }`}
        >
          <Tag className={`h-5 w-5 ${audienceType === "tags" ? "text-emerald-600" : "text-gray-400"}`} />
          <span className="text-xs font-bold">Contact Tags</span>
          <span className="text-[10px] text-gray-400">Target by Tags</span>
        </button>
      </div>

      {/* Switch Mode Confirmation Warning */}
      {confirmSwitchMode && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Switch Audience Source?
          </div>
          <p className="mt-1 text-amber-700">
            Switching audience mode will reset your current selection. Are you sure you want to proceed?
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirmSwitchMode(null)}>
              Cancel
            </Button>
            <Button type="button" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmSwitch}>
              Switch Audience
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION A: IMPORT CONTACTS */}
      {/* ========================================================================= */}
      {audienceType === "import" && (
        <div className="space-y-4">
          {/* File Upload Zone */}
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-2xs hover:border-emerald-500 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-emerald-600" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Upload Contacts File</h3>
            <p className="mt-1 text-xs text-gray-500">Drag & drop CSV or XLSX file here, or click to browse</p>

            <div className="mt-4 flex justify-center">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <span className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Files
                </span>
              </label>
            </div>

            {isUploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress}
              </div>
            )}
            {uploadError && <p className="mt-3 text-xs font-medium text-red-500">{uploadError}</p>}
          </div>

          {/* List of Completed Contact Imports */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Workspace Contact Import Lists
            </label>

            {importsQuery.isLoading ? (
              <div className="flex items-center justify-center rounded-xl border bg-gray-50 py-8 text-xs text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Loading contact imports...
              </div>
            ) : importsList.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-gray-500">
                No previous contact imports found. Use the upload box above to import your contacts.
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
                            {item.createdAt
                              ? new Date(item.createdAt as string).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
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

                      <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs text-gray-600">
                        <div>
                          <span className="font-semibold text-gray-900">{valid.toLocaleString()}</span> valid contacts
                        </div>
                        {invalid > 0 && <span className="text-amber-700 text-[11px]">{invalid} invalid</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION B: SELECT CONTACTS (MANUAL SELECTION) */}
      {/* ========================================================================= */}
      {audienceType === "select" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone number, email, or company..."
                className="pl-9 h-9 text-xs bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllVisible} disabled={contactsList.length === 0}>
                <CheckSquare className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Select All Visible
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={deselectAllVisible} disabled={contactsList.length === 0}>
                <Square className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                Deselect All Visible
              </Button>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="rounded-xl border bg-white shadow-xs overflow-hidden max-h-[360px] flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-500 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => {
                          if (e.target.checked) selectAllVisible();
                          else deselectAllVisible();
                        }}
                        className="rounded-xs text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                    </th>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Phone Number</th>
                    <th className="px-4 py-2.5 font-semibold">Company / Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactsQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" /> Searching contacts...
                      </td>
                    </tr>
                  ) : contactsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                        No contacts found matching "{debouncedSearch}".
                      </td>
                    </tr>
                  ) : (
                    contactsList.map((contact) => {
                      const isSelected = Boolean(selectedContactMap[contact._id]);
                      return (
                        <tr
                          key={contact._id}
                          onClick={() => toggleContactSelection(contact)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                            isSelected ? "bg-emerald-50/40" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by row click
                              className="rounded-xs text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900">{contact.displayName}</td>
                          <td className="px-4 py-2.5 font-mono text-gray-700">{contact.phoneNumber || contact.phoneNumberE164}</td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {contact.company || contact.email || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && (
              <div className="border-t px-4 py-2.5 flex items-center justify-between bg-slate-50 text-xs text-gray-600">
                <div>
                  Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total contacts)
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Contacts Drawer / Summary */}
          {selectedContactCount > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {selectedContactCount.toLocaleString()} Contacts Selected
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection} className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear All
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-auto">
                {selectedContactList.slice(0, 15).map((contact) => (
                  <span
                    key={contact._id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white border border-emerald-300 px-2 py-1 text-[11px] font-medium text-emerald-900 shadow-2xs"
                  >
                    {contact.displayName} ({contact.phoneNumber || contact.phoneNumberE164})
                    <X
                      className="h-3 w-3 cursor-pointer text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContactSelection(contact);
                      }}
                    />
                  </span>
                ))}
                {selectedContactCount > 15 && (
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                    + {selectedContactCount - 15} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION C: CONTACT TAGS */}
      {/* ========================================================================= */}
      {audienceType === "tags" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Tags (Comma-separated)</label>
            <Input
              placeholder="e.g. VIP, summer_lead, retail"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Target all workspace contacts containing any of the specified tag labels.
            </p>
          </div>
        </div>
      )}

      {/* Unified Audience Summary Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unified Audience Summary</h4>
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Selected Source</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 capitalize">
              {audienceType === "import" ? "Contact Import" : audienceType === "select" ? "Manual Selection" : "Contact Tags"}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-xs text-emerald-700">Recipients Count</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">
              {audienceType === "import"
                ? (selectedImport?.stats?.validRows || selectedImport?.stats?.totalRows || 0).toLocaleString()
                : audienceType === "select"
                ? selectedContactCount.toLocaleString()
                : "Calculated at launch"}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-2">
            <p className="text-xs text-blue-700">Eligibility Status</p>
            <p className="mt-0.5 text-xs font-semibold text-blue-900">
              Validated on Launch
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      {/* Navigation Buttons */}
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
