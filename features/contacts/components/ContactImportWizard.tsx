"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";

import { ContactImportUploader } from "./ContactImportUploader";
import { ContactImportMapping } from "./ContactImportMapping";
import { ContactImportPreview } from "./ContactImportPreview";
import { ContactImportSummary } from "./ContactImportSummary";

import {
  uploadContactImport,
  validateContactImport,
  commitContactImport,
  getContactImport,
} from "../contact.api";
import type { ContactImportRecord } from "../contact.types";

type WizardStep = "UPLOAD" | "MAPPING" | "VALIDATING" | "PREVIEW" | "IMPORTING" | "COMPLETED" | "FAILED";

export function ContactImportWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlImportId = searchParams.get("importId");

  const [step, setStep] = useState<WizardStep>("UPLOAD");
  const [importRecord, setImportRecord] = useState<ContactImportRecord | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping state
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const isValidationFailure = importRecord?.failurePhase === "validation";
  const isImportFailure = importRecord?.failurePhase === "commit";

  // Initialize from URL importId
  useEffect(() => {
    if (urlImportId && !importRecord) {
      resumeImport(urlImportId);
    }
  }, [urlImportId]);

  const resumeImport = async (id: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const record = await getContactImport(id);
      setImportRecord(record);
      setFileHeaders(record.headers || []);
      if (record.columnMapping) setColumnMapping(record.columnMapping);
      
      switch (record.status) {
        case "uploaded":
          setStep("MAPPING");
          break;
        case "validating":
          setStep("VALIDATING");
          break;
        case "ready":
          setStep("PREVIEW");
          break;
        case "importing":
          setStep("IMPORTING");
          break;
        case "completed":
          setStep("COMPLETED");
          break;
        case "failed":
          setError(record.errorSummary || "Import failed during processing.");
          setStep("FAILED");
          break;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to resume import. The import may have expired.");
      setStep("UPLOAD");
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (importRecord && (step === "VALIDATING" || step === "IMPORTING")) {
      interval = setInterval(async () => {
        try {
          const record = await getContactImport(importRecord.id);
          setImportRecord(record);
          setFileHeaders(record.headers || []);
          
          if (step === "VALIDATING" && record.status === "ready") {
            setStep("PREVIEW");
          } else if (step === "IMPORTING" && record.status === "completed") {
            setStep("COMPLETED");
          } else if (record.status === "failed") {
            setError(record.errorSummary ?? "An error occurred during background processing.");
            setStep("FAILED");
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [importRecord, step]);

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const record = await uploadContactImport(file);
      setImportRecord(record);
      
      // Update URL with importId for recovery
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("importId", record.id);
      window.history.pushState({}, "", newUrl.toString());

      const headers = record.headers || [];
      setFileHeaders(headers);
      
      const autoMap: Record<string, string> = {};
      headers.forEach((h: string) => {
        const lower = h.toLowerCase();
        if (lower.includes("phone") || lower.includes("mobile") || lower.includes("waid")) autoMap[h] = "phoneNumber";
        else if (lower.includes("name") && !lower.includes("profile")) autoMap[h] = "displayName";
        else if (lower.includes("email")) autoMap[h] = "email";
        else if (lower.includes("company")) autoMap[h] = "company";
      });
      setColumnMapping(autoMap);
      
      setStep("MAPPING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    if (!importRecord) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const record = await validateContactImport(importRecord.id, { columnMapping });
      setImportRecord(record);
      setStep("VALIDATING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start validation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = async () => {
    if (!importRecord) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const record = await commitContactImport(importRecord.id);
      setImportRecord(record);
      setStep("IMPORTING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start import.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryValidation = async () => {
    setStep("VALIDATING");
    setError(null);
    try {
      const record = await validateContactImport(importRecord!.id, { columnMapping });
      setImportRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry validation.");
      setStep("FAILED");
    }
  };

  const handleRetryImport = async () => {
    setStep("IMPORTING");
    setError(null);
    try {
      const record = await commitContactImport(importRecord!.id);
      setImportRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry import.");
      setStep("FAILED");
    }
  };

  const resetWizard = () => {
    setStep("UPLOAD");
    setImportRecord(null);
    setFileHeaders([]);
    setColumnMapping({});
    setError(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("importId");
    window.history.pushState({}, "", newUrl.toString());
  };

  const renderStep = () => {
    if (isProcessing && step === "UPLOAD") {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="h-10 w-10 text-[#2d644d] animate-spin mb-4" />
          <p className="font-medium text-[#25342f]">Uploading File...</p>
        </div>
      );
    }

    if (step === "FAILED") {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div className="rounded-full bg-rose-100 p-4 dark:bg-rose-900/30">
            <svg className="h-10 w-10 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">
              {isValidationFailure ? "Validation failed" : "Import failed"}
            </h2>
            <p className="text-sm text-rose-600 font-medium mt-2 max-w-md mx-auto">
              {error || "An unknown error occurred."}
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={resetWizard}>
              Start Over
            </Button>
            {isImportFailure && (
              <Button variant="outline" onClick={() => setStep("PREVIEW")}>
                View Preview
              </Button>
            )}
            <Button onClick={isValidationFailure ? handleRetryValidation : handleRetryImport} className="bg-[#2d644d] hover:bg-[#204a39]">
              {isValidationFailure ? "Retry Validation" : "Retry Import"}
            </Button>
          </div>
        </div>
      );
    }

    if (step === "VALIDATING") {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-[#2d644d] animate-spin" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">Validating Contacts</h2>
            <p className="text-sm text-[#6f7f75] mt-1">
              Checking for duplicates, validating phone numbers, and formatting data.
            </p>
          </div>
          {importRecord && importRecord.stats.totalRows > 0 && (
            <div className="mt-4 text-[#2d644d] font-semibold">
              Processed: {importRecord.stats.processedRows} / {importRecord.stats.totalRows}
            </div>
          )}
        </div>
      );
    }

    if (step === "IMPORTING") {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-[#2d644d] animate-spin" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">Importing Contacts</h2>
            <p className="text-sm text-[#6f7f75] mt-1">
              Saving valid contacts to your registry. Please wait.
            </p>
          </div>
          {importRecord && importRecord.stats.validRows > 0 && (
            <div className="w-full max-w-sm mt-6">
              <div className="flex justify-between text-xs font-semibold text-[#6f7f75] mb-2">
                <span>Progress</span>
                <span>{importRecord.stats.processedRows} / {importRecord.stats.validRows}</span>
              </div>
              <div className="w-full bg-[#e2d8ca] rounded-full h-2.5">
                <div 
                  className="bg-[#2d644d] h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(5, (importRecord.stats.processedRows / Math.max(1, importRecord.stats.validRows)) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (step) {
      case "UPLOAD":
        return (
          <ContactImportUploader
            isUploading={isProcessing}
            onFileSelected={handleFileSelected}
            error={error}
          />
        );
      case "MAPPING":
        return (
          <ContactImportMapping
            headers={fileHeaders}
            mapping={columnMapping}
            onMappingChange={(h, f) => setColumnMapping(prev => ({ ...prev, [h]: f }))}
            onValidate={handleValidate}
            isValidating={isProcessing}
            error={error}
          />
        );
      case "PREVIEW":
        return importRecord ? (
          <ContactImportPreview
            importRecord={importRecord}
            onConfirm={handleCommit}
            onCancel={resetWizard}
            isCommitting={isProcessing}
            error={error}
          />
        ) : null;
      case "COMPLETED":
        return importRecord ? (
          <ContactImportSummary
            importRecord={importRecord}
            onViewContacts={() => router.push("/contacts")}
            onImportAnother={resetWizard}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-4 py-4 px-6 border-b border-[#e5ddd3] bg-white">
        <Button
          variant="ghost"
          onClick={() => router.push("/contacts")}
          className="text-[#6f7f75] hover:bg-[#fbf7f1] hover:text-[#25342f] p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#25342f]">Bulk Import Contacts</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#faf9f7] p-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5ddd3] p-8 min-h-[500px]">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
