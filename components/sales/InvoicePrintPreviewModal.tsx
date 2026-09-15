"use client";

/**
 * Invoice Print & Preview Modal Component.
 * 
 * Provenance:
 * Adapted from `piratuks/invoice-builder` (`src/renderer/pages/invoices/Preview/PreviewCore.tsx` & `useExportPdf.tsx`).
 * Commit: 6a7a3327343940038e96509cdf0e8b3a64af8fee
 * 
 * Features:
 * - Full-screen interactive invoice document modal.
 * - Browser-native high-fidelity print triggering (`window.print()`).
 * - Contextual lifecycle action buttons (Issue Invoice for DRAFT, Record Payment for unpaid ISSUED).
 * - Automatic stripping of interactive modal UI during print mode (`.no-print` classes and `@media print` rules).
 * 
 * Attribution:
 * Portions adapted from `invoice-builder` under MIT License:
 * Copyright (c) 2025 Evaldas L.
 */

import React, { useEffect } from "react";
import { InvoiceItem } from "lib/api/sales-api";
import { InvoiceDocumentView, BusinessInfo, PaymentInstructions } from "./InvoiceDocumentView";
import { Printer, X, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";

export interface InvoicePrintPreviewModalProps {
  invoice: InvoiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueInvoice?: (invoiceId: string) => void;
  onRecordPayment?: (invoice: InvoiceItem) => void;
  isIssuing?: boolean;
  businessInfo?: BusinessInfo;
  paymentInstructions?: PaymentInstructions;
}

export function InvoicePrintPreviewModal({
  invoice,
  isOpen,
  onClose,
  onIssueInvoice,
  onRecordPayment,
  isIssuing = false,
  businessInfo,
  paymentInstructions,
}: InvoicePrintPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Invoice Preview ${invoice.invoiceId}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none cursor-default"
      >
        {/* Modal Toolbar (Stripped during print) */}
        <div className="no-print flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Invoice Preview</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                {invoice.invoiceId}
              </span>
            </h2>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                invoice.status === "ISSUED"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : invoice.status === "DRAFT"
                  ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Contextual Action: Issue Draft Invoice */}
            {invoice.status === "DRAFT" && onIssueInvoice && (
              <button
                type="button"
                onClick={() => onIssueInvoice(invoice._id)}
                disabled={isIssuing}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isIssuing ? "Issuing..." : "Issue Invoice"}
              </button>
            )}

            {/* Contextual Action: Record Payment */}
            {invoice.status === "ISSUED" && invoice.paymentStatus !== "PAID" && onRecordPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            {/* Print / Save PDF Action */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Print document or Save as PDF via browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-neutral-100/60 dark:bg-neutral-950/50 flex-1 print:p-0 print:bg-white print:overflow-visible">
          <InvoiceDocumentView
            invoice={invoice}
            businessInfo={businessInfo}
            paymentInstructions={paymentInstructions}
          />
        </div>
      </div>
    </div>
  );
}
