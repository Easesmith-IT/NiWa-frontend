"use client";

/**
 * Commercial Invoice Document Presentation Component.
 * 
 * Provenance:
 * Adapted from `piratuks/invoice-builder` (`src/renderer/pages/invoices/Preview/`).
 * Commit: 6a7a3327343940038e96509cdf0e8b3a64af8fee
 * 
 * Reused & adapted presentation concepts:
 * - `HeaderInfo.tsx`: Document header with organization details, document title, and invoice metadata.
 * - `ClientInfo.tsx`: Structured customer billing & shipping snapshots.
 * - `ItemsInfo.tsx`: Itemized tabular line layout with line numbers, SKU, quantity, price, discounts, taxes, and totals.
 * - `FinancialInfo.tsx`: Clear totals rollup (Subtotal, Discount, Net, Tax, Grand Total, Paid, Balance Due).
 * - `PaymentInfo.tsx`: Bank instructions & UPI/electronic transfer details block.
 * - `WatermarkPaidInfo.tsx`: Diagonal translucent "PAID" stamp across the document body.
 * - `NotesInfo.tsx` & `SignatureInfo.tsx`: Formal notes, terms, and authorized signatory area.
 * 
 * Rewritten for NIWA:
 * Consumes NIWA's server-authoritative `InvoiceItem` DTO directly.
 * Built with Tailwind CSS and Next.js 15 client components with embedded `@media print` styles.
 * 
 * Attribution:
 * Portions adapted from `invoice-builder` under MIT License:
 * Copyright (c) 2025 Evaldas L.
 */

import React from "react";
import { InvoiceItem } from "lib/api/sales-api";
import { Building2, User, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

export interface BusinessInfo {
  name?: string;
  shortName?: string;
  address?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  website?: string;
}

export interface PaymentInstructions {
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  routingOrIfsc?: string;
  swiftBic?: string;
  upiId?: string;
  notes?: string;
}

export interface InvoiceDocumentViewProps {
  invoice: InvoiceItem;
  businessInfo?: BusinessInfo;
  paymentInstructions?: PaymentInstructions;
  showWatermark?: boolean;
  className?: string;
}

export function InvoiceDocumentView({
  invoice,
  businessInfo,
  paymentInstructions,
  showWatermark = true,
  className = "",
}: InvoiceDocumentViewProps) {
  const isPaid = invoice.paymentStatus === "PAID";
  const isVoid = invoice.status === "VOID";
  const isDraft = invoice.status === "DRAFT";

  const hasPaymentDetails = Boolean(
    paymentInstructions?.bankName ||
      paymentInstructions?.accountHolder ||
      paymentInstructions?.accountNumber ||
      paymentInstructions?.routingOrIfsc ||
      paymentInstructions?.swiftBic ||
      paymentInstructions?.upiId ||
      paymentInstructions?.notes
  );

  return (
    <div
      id="invoice-printable-document"
      className={`relative bg-white text-neutral-900 font-sans p-8 sm:p-12 max-w-4xl mx-auto shadow-lg border border-neutral-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black ${className}`}
    >
      {/* Dynamic Watermark Stamp (Adapted from WatermarkPaidInfo.tsx) */}
      {showWatermark && (isPaid || isVoid) && (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-10 print:z-10"
        >
          {isPaid && (
            <div className="transform -rotate-25 border-8 border-emerald-600/30 text-emerald-600/30 font-black text-7xl sm:text-8xl tracking-widest px-12 py-4 rounded-3xl uppercase font-mono print:border-emerald-700/40 print:text-emerald-700/40">
              PAID
            </div>
          )}
          {isVoid && (
            <div className="transform -rotate-25 border-8 border-rose-600/30 text-rose-600/30 font-black text-7xl sm:text-8xl tracking-widest px-12 py-4 rounded-3xl uppercase font-mono print:border-rose-700/40 print:text-rose-700/40">
              VOID
            </div>
          )}
        </div>
      )}

      {/* Header Row: Business Details & Document Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 pb-8">
        <div className="space-y-1.5 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm print:bg-neutral-900">
              {businessInfo?.shortName ||
                (businessInfo?.name
                  ? businessInfo.name.substring(0, 2).toUpperCase()
                  : "NW")}
            </div>
            {businessInfo?.name ? (
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                {businessInfo.name}
              </h1>
            ) : (
              <h1 className="text-sm font-medium tracking-tight text-neutral-400 italic">
                Business details not configured
              </h1>
            )}
          </div>
          {businessInfo?.address && (
            <p className="text-xs text-neutral-500 leading-relaxed">
              {businessInfo.address}
            </p>
          )}
          {(businessInfo?.email || businessInfo?.phone) && (
            <p className="text-xs text-neutral-500">
              {businessInfo.email} {businessInfo.phone && `• ${businessInfo.phone}`}
            </p>
          )}
          {businessInfo?.taxId && (
            <p className="text-[11px] text-neutral-400 font-mono">
              Tax ID / VAT: {businessInfo.taxId}
            </p>
          )}
        </div>

        <div className="text-left sm:text-right space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">
            Commercial Invoice
          </div>
          <div className="font-mono text-base font-bold text-emerald-700">
            {invoice.invoiceId}
          </div>

          <div className="pt-2 flex flex-wrap sm:justify-end gap-1.5">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                invoice.status === "ISSUED"
                  ? "bg-emerald-100 text-emerald-800"
                  : invoice.status === "DRAFT"
                  ? "bg-neutral-100 text-neutral-700"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {invoice.status}
            </span>

            {/* Payment Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                invoice.paymentStatus === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : invoice.paymentStatus === "PARTIAL"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Document Dates & Customer Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-neutral-200 text-xs">
        {/* Bill To / Customer Snapshot */}
        <div className="space-y-1.5">
          <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
            Bill To / Client
          </span>
          <div className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
            {invoice.customer.customerType === "PERSON" ? (
              <User className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
            )}
            {invoice.customer.displayName}
          </div>
          {invoice.customer.email && (
            <p className="text-neutral-600">Email: {invoice.customer.email}</p>
          )}
          {invoice.customer.phone && (
            <p className="text-neutral-600">Phone: {invoice.customer.phone}</p>
          )}
          {invoice.customer.billingAddress && (
            <p className="text-neutral-600 whitespace-pre-line">
              Billing Address: {invoice.customer.billingAddress}
            </p>
          )}
          {invoice.customer.shippingAddress &&
            invoice.customer.shippingAddress !== invoice.customer.billingAddress && (
              <p className="text-neutral-500 whitespace-pre-line pt-1">
                Ship To: {invoice.customer.shippingAddress}
              </p>
            )}
        </div>

        {/* Dates & Reference Details */}
        <div className="space-y-2 sm:text-right">
          <div>
            <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
              Issue Date
            </span>
            <p className="font-medium text-neutral-800 text-sm">
              {invoice.issuedAt
                ? new Date(invoice.issuedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : new Date(invoice.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </p>
          </div>

          <div>
            <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
              Due Date
            </span>
            <p className="font-medium text-neutral-800 text-sm">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Upon Receipt"}
            </p>
          </div>

          {invoice.salesOrderId && (
            <div>
              <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
                Originating Sales Order
              </span>
              <p className="font-mono text-neutral-700">
                {typeof invoice.salesOrderId === "object" && invoice.salesOrderId !== null
                  ? (invoice.salesOrderId as any).orderId || "Order Reference"
                  : "Sales Order"}
              </p>
            </div>
          )}

          <div>
            <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
              Currency
            </span>
            <p className="font-mono font-bold text-neutral-800">{invoice.currency}</p>
          </div>
        </div>
      </div>

      {/* Itemized Table (Adapted from ItemsInfo.tsx) */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-300 text-neutral-500 uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-2 w-8 text-center">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-2 text-right w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
              <th className="py-2.5 px-2 text-right w-20">Discount</th>
              <th className="py-2.5 px-2 text-right w-16">Tax</th>
              <th className="py-2.5 px-3 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {invoice.lines.map((line, index) => (
              <tr key={line._id || index} className="break-inside-avoid">
                <td className="py-3 px-2 text-center text-neutral-400">{index + 1}</td>
                <td className="py-3 px-3">
                  <div className="font-semibold text-neutral-900 text-xs">
                    {line.variantName}
                  </div>
                  {line.productName && line.productName !== line.variantName && (
                    <div className="text-[11px] text-neutral-500">{line.productName}</div>
                  )}
                  {line.sku && (
                    <div className="text-[10px] font-mono text-neutral-400">SKU: {line.sku}</div>
                  )}
                </td>
                <td className="py-3 px-2 text-right font-medium text-neutral-800">
                  {line.quantity} {line.unitCode || ""}
                </td>
                <td className="py-3 px-3 text-right font-mono text-neutral-700">
                  ${line.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right text-neutral-600">
                  {line.discountAmount && line.discountAmount > 0
                    ? `-$${line.discountAmount.toFixed(2)}`
                    : line.discountValue
                    ? `${line.discountValue}%`
                    : "—"}
                </td>
                <td className="py-3 px-2 text-right text-neutral-600">
                  {line.taxRatePercent ? `${line.taxRatePercent}%` : "—"}
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-900">
                  ${line.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Breakdown & Summary (Adapted from FinancialInfo.tsx) */}
      <div className="border-t-2 border-neutral-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6 break-inside-avoid">
        {/* Payment instructions & Bank Details (Left Column) */}
        <div className="w-full sm:w-1/2 space-y-3 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 print:bg-white print:border-neutral-300">
          <div className="font-semibold uppercase tracking-wider text-neutral-500 text-[11px]">
            Payment Instructions
          </div>
          {hasPaymentDetails ? (
            <div className="space-y-1 text-neutral-700">
              {paymentInstructions?.bankName && (
                <div>
                  <span className="text-neutral-500">Bank:</span>{" "}
                  <span className="font-medium">{paymentInstructions.bankName}</span>
                </div>
              )}
              {paymentInstructions?.accountHolder && (
                <div>
                  <span className="text-neutral-500">Account Name:</span>{" "}
                  <span className="font-medium">{paymentInstructions.accountHolder}</span>
                </div>
              )}
              {paymentInstructions?.accountNumber && (
                <div>
                  <span className="text-neutral-500">Account #:</span>{" "}
                  <span className="font-mono font-medium">{paymentInstructions.accountNumber}</span>
                </div>
              )}
              {paymentInstructions?.routingOrIfsc && (
                <div>
                  <span className="text-neutral-500">IFSC / Routing:</span>{" "}
                  <span className="font-mono">{paymentInstructions.routingOrIfsc}</span>
                </div>
              )}
              {paymentInstructions?.swiftBic && (
                <div>
                  <span className="text-neutral-500">SWIFT / BIC:</span>{" "}
                  <span className="font-mono">{paymentInstructions.swiftBic}</span>
                </div>
              )}
              {paymentInstructions?.upiId && (
                <div>
                  <span className="text-neutral-500">UPI ID:</span>{" "}
                  <span className="font-mono font-medium text-emerald-700">
                    {paymentInstructions.upiId}
                  </span>
                </div>
              )}
              {paymentInstructions?.notes && (
                <p className="text-[11px] text-neutral-500 italic pt-1 border-t border-neutral-200">
                  {paymentInstructions.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="text-neutral-400 italic py-2 text-xs">
              Payment details not configured
            </div>
          )}
        </div>

        {/* Financial Rollup (Right Column) */}
        <div className="w-full sm:w-5/12 space-y-2 text-xs">
          <div className="flex justify-between py-1 text-neutral-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">${invoice.subtotal.toFixed(2)}</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600">
              <span>Total Discount:</span>
              <span className="font-mono font-medium">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 text-neutral-600">
            <span>Net Taxable:</span>
            <span className="font-mono font-medium">${invoice.netAmount.toFixed(2)}</span>
          </div>

          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-1 text-neutral-600">
              <span>Tax Total:</span>
              <span className="font-mono font-medium">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-t-2 border-neutral-300 text-sm font-bold text-neutral-900">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-neutral-900">
              ${invoice.grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between py-1 text-neutral-500 text-[11px]">
            <span>Amount Paid:</span>
            <span className="font-mono">${invoice.paidAmount.toFixed(2)}</span>
          </div>

          <div
            className={`flex justify-between py-2 px-3 rounded-lg border font-bold text-sm ${
              invoice.balanceDue > 0
                ? "bg-amber-50 text-amber-900 border-amber-200 print:bg-white print:border-neutral-300 print:text-black"
                : "bg-emerald-50 text-emerald-900 border-emerald-200 print:bg-white print:border-neutral-300 print:text-black"
            }`}
          >
            <span>Balance Due:</span>
            <span className="font-mono text-base">${invoice.balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Commercial Terms & Authorized Signatory */}
      <div className="pt-8 border-t border-neutral-200 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs break-inside-avoid">
        <div>
          {invoice.notes ? (
            <div className="space-y-1">
              <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[11px]">
                Notes & Terms
              </span>
              <p className="text-neutral-600 whitespace-pre-line leading-relaxed">
                {invoice.notes}
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-neutral-400 text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-neutral-400">Terms</span>
              <p>Standard commercial invoice terms apply. Thank you for your business.</p>
            </div>
          )}
        </div>

        <div className="sm:text-right flex flex-col justify-end items-start sm:items-end">
          <div className="w-48 border-b border-neutral-400 pb-1 mb-1 text-center">
            {/* Signature space */}
          </div>
          <p className="font-semibold text-neutral-800 text-[11px]">Authorized Signatory</p>
          <p className="text-neutral-400 text-[10px]">{businessInfo?.name || ""}</p>
        </div>
      </div>

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-printable elements */
          header,
          nav,
          aside,
          button,
          .no-print {
            display: none !important;
          }
          /* Document container styles for print */
          #invoice-printable-document {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
