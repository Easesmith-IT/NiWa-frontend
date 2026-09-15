"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  AlertCircle,
  Eye,
  ArrowRight,
  Receipt,
  DollarSign,
  Trash2,
  CreditCard,
} from "lucide-react";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  createInvoiceFromSalesOrder,
  issueInvoice,
  cancelInvoice,
  recordPayment,
  getInvoicePayments,
  InvoiceItem,
  InvoiceStatus,
  PaymentStatus,
  PaymentItem,
  PaymentMethod,
  getSalesOrders,
} from "lib/api/sales-api";

import { productsApi, ProductItem } from "lib/api/products-api";
import { apiClient } from "lib/api/api-client";
import { queryKeys } from "lib/api/query-keys";

interface VariantOption {
  _id: string;
  variantId?: string;
  name: string;
  sku?: string;
  sellingPrice: number;
}

interface CrmPerson {
  _id: string;
  displayName: string;
  emails?: Array<{ email: string; primary?: boolean }>;
  phones?: Array<{ phone: string; primary?: boolean }>;
  isArchived?: boolean;
}

interface CrmCompany {
  _id: string;
  name: string;
  isArchived?: boolean;
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Active drawer & modal state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Convert Order form state
  const [convertOrderId, setConvertOrderId] = useState<string>("");
  const [convertDueDate, setConvertDueDate] = useState<string>("");
  const [convertNotes, setConvertNotes] = useState<string>("");

  // Create Invoice form state
  const [customerType, setCustomerType] = useState<"PERSON" | "COMPANY">("PERSON");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>("");
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>("USD");
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");
  const [invoiceLines, setInvoiceLines] = useState<
    Array<{
      productVariantId: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
      taxRatePercent: number;
      discountValue: number;
    }>
  >([]);

  // Payment form state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<InvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Queries
  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: [...queryKeys.invoices, { status: statusFilter, paymentStatus: paymentStatusFilter, search, page }],
    queryFn: () =>
      getInvoices({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        paymentStatus: paymentStatusFilter === "ALL" ? undefined : paymentStatusFilter,
        search: search.trim() || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: activeInvoice, isLoading: isLoadingActiveInvoice } = useQuery({
    queryKey: selectedInvoiceId ? queryKeys.invoice(selectedInvoiceId) : ["null-invoice"],
    queryFn: () => (selectedInvoiceId ? getInvoice(selectedInvoiceId) : null),
    enabled: !!selectedInvoiceId,
  });

  const { data: invoicePayments = [], isLoading: isLoadingInvoicePayments } = useQuery({
    queryKey: selectedInvoiceId ? queryKeys.invoicePayments(selectedInvoiceId) : ["null-invoice-payments"],
    queryFn: () => (selectedInvoiceId ? getInvoicePayments(selectedInvoiceId) : []),
    enabled: !!selectedInvoiceId,
  });


  // Query CRM Customers for modal
  const { data: personsData } = useQuery({
    queryKey: ["crm-people"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmPerson[] }>("/api/crm/people", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
    enabled: isCreateModalOpen && customerType === "PERSON",
  });

  const { data: companiesData } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmCompany[] }>("/api/crm/companies", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
    enabled: isCreateModalOpen && customerType === "COMPANY",
  });

  // Query Catalog Products & Variants for modal
  const { data: productsData } = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productsApi.getProducts({ limit: 100 }),
    enabled: isCreateModalOpen,
  });

  // Query Confirmed/Fulfilled Sales Orders for conversion modal
  const { data: convertableOrdersData } = useQuery({
    queryKey: [...queryKeys.salesOrders, "convertable"],
    queryFn: async () => {
      const confirmedRes = await getSalesOrders({ status: "CONFIRMED", limit: 50 });
      const fulfilledRes = await getSalesOrders({ status: "FULFILLED", limit: 50 });
      return [...confirmedRes.data, ...fulfilledRes.data];
    },
    enabled: isConvertModalOpen,
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      setIsCreateModalOpen(false);
      resetCreateForm();
      setSelectedInvoiceId(newInvoice._id);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error?.message || err.message || "Failed to create invoice");
    },
  });

  const convertOrderMutation = useMutation({
    mutationFn: ({ orderId, options }: { orderId: string; options?: { dueDate?: string | null; notes?: string | null } }) =>
      createInvoiceFromSalesOrder(orderId, options),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      setIsConvertModalOpen(false);
      setConvertOrderId("");
      setConvertDueDate("");
      setConvertNotes("");
      setSelectedInvoiceId(newInvoice._id);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error?.message || err.message || "Failed to convert sales order");
    },
  });

  const issueInvoiceMutation = useMutation({
    mutationFn: issueInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      if (selectedInvoiceId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoice(selectedInvoiceId) });
      }
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error?.message || err.message || "Failed to issue invoice");
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelInvoice(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      if (selectedInvoiceId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoice(selectedInvoiceId) });
      }
      setIsCancelModalOpen(false);
      setCancelReason("");
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error?.message || err.message || "Failed to cancel invoice");
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!paymentTargetInvoice) throw new Error("No invoice selected");
      const numAmount = parseFloat(paymentAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }
      if (numAmount > paymentTargetInvoice.balanceDue) {
        throw new Error(`Amount cannot exceed balance due ($${paymentTargetInvoice.balanceDue.toFixed(2)})`);
      }
      return recordPayment({
        invoiceId: paymentTargetInvoice._id,
        amount: numAmount,
        paymentMethod,
        paymentDate: paymentDate || undefined,
        transactionReference: paymentRef.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setIsPaymentModalOpen(false);
      setPaymentTargetInvoice(null);
      setPaymentAmount("");
      setPaymentRef("");
      setPaymentNotes("");
      setPaymentError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      if (selectedInvoiceId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoice(selectedInvoiceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.invoicePayments(selectedInvoiceId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
    onError: (err: any) => {
      setPaymentError(err.response?.data?.error?.message || err.response?.data?.message || err.message || "Failed to record payment");
    },
  });

  const openPaymentModal = (invoice: InvoiceItem) => {
    setPaymentTargetInvoice(invoice);
    setPaymentAmount(invoice.balanceDue.toString());
    setPaymentMethod("CASH");
    setPaymentRef("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNotes("");
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };


  function resetCreateForm() {
    setCustomerType("PERSON");
    setSelectedCustomerId("");
    setInvoiceDueDate("");
    setInvoiceCurrency("USD");
    setInvoiceNotes("");
    setInvoiceLines([]);
    setActionError(null);
  }

  function handleAddLine(variant: VariantOption, product: ProductItem) {
    setInvoiceLines((prev) => [
      ...prev,
      {
        productVariantId: variant._id,
        variantName: `${product.name} — ${variant.name}`,
        quantity: 1,
        unitPrice: variant.sellingPrice,
        taxRatePercent: 0,
        discountValue: 0,
      },
    ]);
  }

  function handleUpdateLineQuantity(index: number, quantity: number) {
    setInvoiceLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, quantity: Math.max(1, quantity) } : line))
    );
  }

  function handleRemoveLine(index: number) {
    setInvoiceLines((prev) => prev.filter((_, idx) => idx !== index));
  }

  // Calculate live preview totals for create modal
  const previewSubtotal = invoiceLines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const previewDiscount = invoiceLines.reduce((acc, l) => acc + (l.quantity * l.unitPrice * (l.discountValue || 0)) / 100, 0);
  const previewNet = previewSubtotal - previewDiscount;
  const previewTax = invoiceLines.reduce((acc, l) => {
    const lineNet = l.quantity * l.unitPrice * (1 - (l.discountValue || 0) / 100);
    return acc + (lineNet * (l.taxRatePercent || 0)) / 100;
  }, 0);
  const previewGrandTotal = previewNet + previewTax;

  // Status badge styling helper
  function renderStatusBadge(status: InvoiceStatus) {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case "ISSUED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Issued
          </span>
        );
      case "VOID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
            <XCircle className="w-3 h-3 text-neutral-500" />
            Void
          </span>
        );
    }
  }

  function renderPaymentStatusBadge(status: PaymentStatus) {
    switch (status) {
      case "UNPAID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Unpaid
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
            Partial
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Paid
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Invoices
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Commercial billing, balance tracking, and financial status management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActionError(null);
              setIsConvertModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            Convert from Order
          </button>
          <button
            onClick={() => {
              setActionError(null);
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Global Error Alert */}
      {actionError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-700 dark:text-red-300">{actionError}</div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="VOID">Void</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Payment:</span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Payments</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Fully Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {isLoadingInvoices ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading invoices...</div>
        ) : !invoicesData?.data || invoicesData.data.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">No invoices found</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Create a direct invoice or convert a confirmed sales order to initiate commercial billing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Grand Total</th>
                  <th className="px-6 py-3.5 text-right">Balance Due</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {invoicesData.data.map((inv) => (
                  <tr
                    key={inv._id}
                    onClick={() => setSelectedInvoiceId(inv._id)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      {inv.invoiceId}
                      {inv.salesOrderId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-sans">
                          Order
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {inv.customer.customerType === "PERSON" ? (
                          <User className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <Building2 className="w-4 h-4 text-neutral-400" />
                        )}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {inv.customer.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{renderStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4">{renderPaymentStatusBadge(inv.paymentStatus)}</td>
                    <td className="px-6 py-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      ${inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600 dark:text-amber-400">
                      ${inv.balanceDue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === "ISSUED" && inv.paymentStatus !== "PAID" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPaymentModal(inv);
                            }}
                            title="Record Payment"
                            className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceId(inv._id);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Drawer */}
      {selectedInvoiceId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {isLoadingActiveInvoice || !activeInvoice ? (
              <div className="p-8 text-center text-sm text-neutral-500">Loading invoice details...</div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {/* Drawer Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                          {activeInvoice.invoiceId}
                        </h2>
                        {renderStatusBadge(activeInvoice.status)}
                        {renderPaymentStatusBadge(activeInvoice.paymentStatus)}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Created on {new Date(activeInvoice.createdAt).toLocaleString()}
                        {activeInvoice.issuedAt && ` • Issued on ${new Date(activeInvoice.issuedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInvoiceId(null)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer Snapshot */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Customer</div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      {activeInvoice.customer.customerType === "PERSON" ? (
                        <User className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <Building2 className="w-4 h-4 text-neutral-400" />
                      )}
                      {activeInvoice.customer.displayName}
                    </div>
                    {activeInvoice.customer.email && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Email: {activeInvoice.customer.email}
                      </div>
                    )}
                    {activeInvoice.customer.phone && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Phone: {activeInvoice.customer.phone}
                      </div>
                    )}
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Line Items ({activeInvoice.lines.length})
                    </div>
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                          <tr>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5 text-right">Qty</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Discount</th>
                            <th className="p-2.5 text-right">Tax</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {activeInvoice.lines.map((line, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-medium text-neutral-800 dark:text-neutral-200">
                                {line.variantName}
                                <div className="text-[10px] text-neutral-400 font-mono">{line.sku}</div>
                              </td>
                              <td className="p-2.5 text-right">{line.quantity}</td>
                              <td className="p-2.5 text-right">${line.unitPrice.toFixed(2)}</td>
                              <td className="p-2.5 text-right">
                                {line.discountValue ? `${line.discountValue}%` : "—"}
                              </td>
                              <td className="p-2.5 text-right">
                                {line.taxRatePercent ? `${line.taxRatePercent}%` : "—"}
                              </td>
                              <td className="p-2.5 text-right font-medium text-neutral-900 dark:text-neutral-100">
                                ${line.lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Financial Breakdown
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Subtotal</span>
                        <span>${activeInvoice.subtotal.toFixed(2)}</span>
                      </div>
                      {activeInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Discount</span>
                          <span>-${activeInvoice.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Net Amount</span>
                        <span>${activeInvoice.netAmount.toFixed(2)}</span>
                      </div>
                      {activeInvoice.taxAmount > 0 && (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Tax</span>
                          <span>+${activeInvoice.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span>Grand Total</span>
                        <span>${activeInvoice.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 pt-1">
                        <span>Paid Amount</span>
                        <span>${activeInvoice.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-amber-600 dark:text-amber-400">
                        <span>Balance Due</span>
                        <span>${activeInvoice.balanceDue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Payment History ({invoicePayments.length})
                      </div>
                      {activeInvoice.status === "ISSUED" && activeInvoice.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => openPaymentModal(activeInvoice)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Record Payment
                        </button>
                      )}
                    </div>

                    {isLoadingInvoicePayments ? (
                      <div className="p-4 text-center text-xs text-neutral-400">Loading payments...</div>
                    ) : invoicePayments.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400">
                        No payments recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {invoicePayments.map((pmt) => (
                          <div
                            key={pmt._id}
                            className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center text-xs"
                          >
                            <div>
                              <div className="font-mono font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <span>{pmt.paymentId}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                                  {pmt.paymentMethod.replace("_", " ")}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {new Date(pmt.paymentDate).toLocaleDateString()}
                                {pmt.transactionReference && ` • Ref: ${pmt.transactionReference}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                +${pmt.amount.toFixed(2)}
                              </div>
                              <span className="text-[10px] text-neutral-400 uppercase font-mono">{pmt.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Void details if applicable */}
                  {activeInvoice.status === "VOID" && (
                    <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                      <div className="font-semibold">
                        Voided on {new Date(activeInvoice.voidedAt || activeInvoice.cancelledAt!).toLocaleString()}
                      </div>
                      {(activeInvoice.voidReason || activeInvoice.cancelledReason) && (
                        <div>Reason: {activeInvoice.voidReason || activeInvoice.cancelledReason}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center gap-3">
                  <div>
                    {activeInvoice.status !== "VOID" && activeInvoice.paidAmount === 0 && (
                      <button
                        onClick={() => {
                          setActionError(null);
                          setIsCancelModalOpen(true);
                        }}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                      >
                        Void Invoice
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeInvoice.status === "DRAFT" && (
                      <button
                        onClick={() => issueInvoiceMutation.mutate(activeInvoice._id)}
                        disabled={issueInvoiceMutation.isPending}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
                      >
                        {issueInvoiceMutation.isPending ? "Issuing..." : "Issue Invoice"}
                      </button>
                    )}
                    {activeInvoice.status === "ISSUED" && activeInvoice.paymentStatus !== "PAID" && (
                      <button
                        onClick={() => openPaymentModal(activeInvoice)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      )}

      {/* Convert from Sales Order Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
              Convert Sales Order to Invoice
            </h3>
            <p className="text-xs text-neutral-500">
              Generate a commercial invoice directly from an existing confirmed or fulfilled sales order.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Select Sales Order *
                </label>
                <select
                  value={convertOrderId}
                  onChange={(e) => setConvertOrderId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose confirmed order --</option>
                  {convertableOrdersData?.map((order) => (
                    <option key={order._id} value={order.orderId}>
                      {order.orderId} — {order.customer.displayName} (${order.grandTotal.toFixed(2)}) [{order.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={convertDueDate}
                  onChange={(e) => setConvertDueDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Invoice Notes
                </label>
                <textarea
                  value={convertNotes}
                  onChange={(e) => setConvertNotes(e.target.value)}
                  rows={2}
                  placeholder="Terms, payment instructions, etc."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!convertOrderId) return;
                  convertOrderMutation.mutate({
                    orderId: convertOrderId,
                    options: {
                      dueDate: convertDueDate || null,
                      notes: convertNotes || null,
                    },
                  });
                }}
                disabled={!convertOrderId || convertOrderMutation.isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {convertOrderMutation.isPending ? "Converting..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Direct Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                New Direct Invoice
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Customer Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("PERSON");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                      customerType === "PERSON"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    Person
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("COMPANY");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                      customerType === "COMPANY"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose customer --</option>
                  {customerType === "PERSON"
                    ? personsData?.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.displayName}
                        </option>
                      ))
                    : companiesData?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={invoiceCurrency}
                  onChange={(e) => setInvoiceCurrency(e.target.value.toUpperCase())}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Catalog Products</h4>

              {/* Quick Add from Catalog */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="text-xs font-medium text-neutral-500 mb-2">Available Products & Variants:</div>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {(productsData?.data || []).flatMap((p: ProductItem) =>
                    (p.variants || []).map((v: VariantOption) => (
                      <div
                        key={v._id}
                        className="flex justify-between items-center text-xs py-1 px-2 hover:bg-white dark:hover:bg-neutral-800 rounded transition"
                      >
                        <div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.name}</span>{" "}
                          <span className="text-neutral-500">— {v.name}</span>{" "}
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            ${v.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddLine(v, p)}
                          className="px-2.5 py-0.5 rounded bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-medium"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Added lines list */}
              {invoiceLines.length === 0 ? (
                <div className="text-xs text-center py-4 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                  No items added yet. Click &quot;+ Add&quot; above to select products.
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 w-20">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Line Total</th>
                        <th className="p-2 text-right w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {invoiceLines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{l.variantName}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={1}
                              value={l.quantity}
                              onChange={(e) => handleUpdateLineQuantity(idx, parseInt(e.target.value) || 1)}
                              className="w-16 px-1.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          </td>
                          <td className="p-2 text-right font-mono">${l.unitPrice.toFixed(2)}</td>
                          <td className="p-2 text-right font-medium font-mono">
                            ${(l.quantity * l.unitPrice).toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Live Financial Rollup */}
            {invoiceLines.length > 0 && (
              <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${previewSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
                  <span>Grand Total:</span>
                  <span>${previewGrandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCustomerId || invoiceLines.length === 0) return;
                  createInvoiceMutation.mutate({
                    customerType,
                    customerId: selectedCustomerId,
                    dueDate: invoiceDueDate || null,
                    notes: invoiceNotes || null,
                    currency: invoiceCurrency,
                    lines: invoiceLines.map((l) => ({
                      productVariantId: l.productVariantId,
                      quantity: l.quantity,
                      customUnitPrice: l.unitPrice,
                      discount: l.discountValue ? { type: "PERCENT", value: l.discountValue } : null,
                      taxRatePercent: l.taxRatePercent,
                    })),
                  });
                }}
                disabled={!selectedCustomerId || invoiceLines.length === 0 || createInvoiceMutation.isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {createInvoiceMutation.isPending ? "Creating..." : "Save Invoice Draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Void Invoice</h3>
            <p className="text-xs text-neutral-500">
              Are you sure you want to void this invoice? This will invalidate the billing document.
            </p>
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Void Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Billing error, customer request"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (activeInvoice) {
                    cancelInvoiceMutation.mutate({ id: activeInvoice._id, reason: cancelReason });
                  }
                }}
                disabled={cancelInvoiceMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {cancelInvoiceMutation.isPending ? "Voiding..." : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && paymentTargetInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Record Payment
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                  Invoice: {paymentTargetInvoice.invoiceId} • Customer: {paymentTargetInvoice.customer.displayName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentError(null);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Grand Total:</span>
                <span>${paymentTargetInvoice.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Paid So Far:</span>
                <span>${paymentTargetInvoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <span>Balance Due:</span>
                <span>${paymentTargetInvoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
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
                    max={paymentTargetInvoice.balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-400">
                  <span>Max payable: ${paymentTargetInvoice.balanceDue.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(paymentTargetInvoice.balanceDue.toString())}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Pay Full Balance
                  </button>
                </div>
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
                    Transaction Ref / Cheque #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-998812"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
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
                  placeholder="Additional payment notes or settlement details"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentError(null);
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => recordPaymentMutation.mutate()}
                disabled={
                  !paymentAmount ||
                  parseFloat(paymentAmount) <= 0 ||
                  parseFloat(paymentAmount) > paymentTargetInvoice.balanceDue ||
                  recordPaymentMutation.isPending
                }
                className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {recordPaymentMutation.isPending
                  ? "Recording..."
                  : `Record Payment ($${parseFloat(paymentAmount || "0").toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
