"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  AlertCircle,
  Eye,
  Receipt,
  DollarSign,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  getPayments,
  getPayment,
  recordPayment,
  getInvoices,
  PaymentItem,
  PaymentMethod,
  InvoiceItem,
} from "lib/api/sales-api";
import { queryKeys } from "lib/api/query-keys";

export default function PaymentsPage() {
  const queryClient = useQueryClient();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Detail Drawer
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [transactionReference, setTransactionReference] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: [
      ...queryKeys.payments,
      {
        method: methodFilter,
        status: statusFilter,
        startDate,
        endDate,
        search,
        page,
      },
    ],
    queryFn: () =>
      getPayments({
        paymentMethod: methodFilter === "ALL" ? undefined : methodFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search.trim() || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: activePayment, isLoading: isLoadingActivePayment } = useQuery({
    queryKey: selectedPaymentId ? queryKeys.payment(selectedPaymentId) : ["null-payment"],
    queryFn: () => (selectedPaymentId ? getPayment(selectedPaymentId) : null),
    enabled: !!selectedPaymentId,
  });

  // Query eligible invoices (ISSUED, not fully paid) for the Record Payment modal
  const { data: payableInvoicesData } = useQuery({
    queryKey: [...queryKeys.invoices, { status: "ISSUED", payableOnly: true }],
    queryFn: () => getInvoices({ status: "ISSUED", limit: 100 }),
    enabled: isRecordModalOpen,
  });

  const eligibleInvoices = (payableInvoicesData?.data || []).filter(
    (inv) => inv.paymentStatus !== "PAID" && inv.balanceDue > 0
  );

  const activeSelectedInvoice = eligibleInvoices.find(
    (inv) => inv._id === selectedInvoiceId
  );

  // Mutation to record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInvoiceId) throw new Error("Please select an invoice");
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      if (activeSelectedInvoice && numAmount > activeSelectedInvoice.balanceDue) {
        throw new Error(
          `Amount cannot exceed invoice balance due ($${activeSelectedInvoice.balanceDue.toFixed(2)})`
        );
      }

      return recordPayment({
        invoiceId: selectedInvoiceId,
        amount: numAmount,
        paymentMethod,
        paymentDate: paymentDate || undefined,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setIsRecordModalOpen(false);
      setSelectedInvoiceId("");
      setAmount("");
      setTransactionReference("");
      setNotes("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to record payment"
      );
    },
  });

  const renderMethodBadge = (method: PaymentMethod) => {
    const config: Record<PaymentMethod, { label: string; className: string }> = {
      CASH: {
        label: "Cash",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800",
      },
      BANK_TRANSFER: {
        label: "Bank Transfer",
        className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/60 dark:border-blue-800",
      },
      CREDIT_CARD: {
        label: "Credit Card",
        className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/60 dark:border-purple-800",
      },
      UPI: {
        label: "UPI",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60 dark:border-amber-800",
      },
      OTHER: {
        label: "Other",
        className: "bg-neutral-50 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
      },
    };
    const c = config[method] || config.OTHER;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.className}`}>
        {c.label}
      </span>
    );
  };

  // Metrics rollups
  const paymentsList = paymentsData?.data || [];
  const totalSettled = paymentsList.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Payments
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audit collection history, multi-method settlements, and invoice payment records.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setSelectedInvoiceId("");
            setAmount("");
            setTransactionReference("");
            setPaymentDate(new Date().toISOString().split("T")[0]);
            setNotes("");
            setIsRecordModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Total Collected
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            ${totalSettled.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">Recorded across visible settlements</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Payments Count
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {paymentsData?.pagination?.total ?? 0}
          </div>
          <div className="text-[11px] text-neutral-400">Total verified transactions</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Active Workspace
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            100% Isolated
          </div>
          <div className="text-[11px] text-neutral-400">Zero cross-tenant exposure</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ID, Ref, Notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="UPI">UPI</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        {isLoadingPayments ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading payments...</div>
        ) : !paymentsList || paymentsList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              No payments recorded
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Payments recorded against invoices will appear here with complete audit trail and settlement values.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Payment ID</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
                {paymentsList.map((pmt) => {
                  const invoiceObj =
                    typeof pmt.invoiceId === "object" && pmt.invoiceId !== null
                      ? pmt.invoiceId
                      : null;
                  const invoiceLabel = invoiceObj?.invoiceId || String(pmt.invoiceId);

                  return (
                    <tr
                      key={pmt._id}
                      onClick={() => setSelectedPaymentId(pmt._id)}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                        {pmt.paymentId}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 text-xs">
                        {new Date(pmt.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {invoiceLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">{renderMethodBadge(pmt.paymentMethod)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                        {pmt.transactionReference || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +${pmt.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {pmt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaymentId(pmt._id);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Drawer */}
      {selectedPaymentId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {isLoadingActivePayment || !activePayment ? (
              <div className="p-8 text-center text-sm text-neutral-500">Loading payment details...</div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {/* Drawer Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                          {activePayment.paymentId}
                        </h2>
                        {renderMethodBadge(activePayment.paymentMethod)}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {activePayment.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Recorded on {new Date(activePayment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPaymentId(null)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Financial Settlement Card */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Settled Amount
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                      ${activePayment.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                      Payment Date: {new Date(activePayment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Linked Invoice Details */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Linked Invoice
                    </div>
                    {typeof activePayment.invoiceId === "object" && activePayment.invoiceId !== null ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          <span>{activePayment.invoiceId.invoiceId}</span>
                          <span className="text-xs px-2 py-0.5 rounded font-sans bg-neutral-200 dark:bg-neutral-700">
                            {activePayment.invoiceId.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-500 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                          <span>Grand Total:</span>
                          <span>${activePayment.invoiceId.grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-500">
                          <span>Paid So Far:</span>
                          <span>${activePayment.invoiceId.paidAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                          <span>Remaining Balance:</span>
                          <span>${activePayment.invoiceId.balanceDue.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        Invoice ID: {String(activePayment.invoiceId)}
                      </div>
                    )}
                  </div>

                  {/* Transaction Metadata */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 text-xs">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Transaction Audit
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{activePayment.paymentMethod.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Transaction Ref:</span>
                      <span className="font-mono">{activePayment.transactionReference || "None"}</span>
                    </div>
                    {activePayment.idempotencyKey && (
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Idempotency Key:</span>
                        <span className="font-mono">{activePayment.idempotencyKey}</span>
                      </div>
                    )}
                    {activePayment.notes && (
                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="font-semibold block mb-0.5">Notes:</span>
                        <p className="text-neutral-600 dark:text-neutral-400">{activePayment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex justify-end">
                  <button
                    onClick={() => setSelectedPaymentId(null)}
                    className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Record Payment
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select an issued invoice to record customer settlement.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRecordModalOpen(false);
                  setFormError(null);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Select Invoice *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    setSelectedInvoiceId(invId);
                    const inv = eligibleInvoices.find((i) => i._id === invId);
                    if (inv) {
                      setAmount(inv.balanceDue.toString());
                    } else {
                      setAmount("");
                    }
                  }}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose an unpaid issued invoice --</option>
                  {eligibleInvoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceId} — {inv.customer.displayName} (Due: ${inv.balanceDue.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {activeSelectedInvoice && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Customer:</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {activeSelectedInvoice.customer.displayName}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Grand Total:</span>
                    <span>${activeSelectedInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                    <span>Balance Due:</span>
                    <span>${activeSelectedInvoice.balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Payment Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={activeSelectedInvoice?.balanceDue}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="0.00"
                  />
                </div>
                {activeSelectedInvoice && (
                  <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                    <span>Max payable: ${activeSelectedInvoice.balanceDue.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setAmount(activeSelectedInvoice.balanceDue.toString())}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Pay Full Balance
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="UPI">UPI / Instant</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Transaction Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-102938"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Settlement notes or reference"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsRecordModalOpen(false);
                  setFormError(null);
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => recordPaymentMutation.mutate()}
                disabled={
                  !selectedInvoiceId ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  (activeSelectedInvoice && parseFloat(amount) > activeSelectedInvoice.balanceDue) ||
                  recordPaymentMutation.isPending
                }
                className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {recordPaymentMutation.isPending
                  ? "Recording..."
                  : `Record Payment ($${parseFloat(amount || "0").toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
