"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  RotateCcw,
  X,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  Building2,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  ArrowDownRight,
  HandCoins,
} from "lucide-react";
import {
  financeApi,
  SupplierBill,
  SupplierPayment,
  Account,
  AgingReport,
  ReconciliationResult,
} from "lib/api/finance-api";
import { productsApi } from "lib/api/products-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";
import { useTaxConfigurationsQuery } from "../finance.queries";

interface NewBillLine {
  classification: "INVENTORY" | "EXPENSE" | "ASSET";
  accountId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  taxConfigurationId?: string;
  taxCode?: string;
}

export function PayablesView() {
  const queryClient = useQueryClient();
  const { canManage } = useFinancePermissions();
  const { data: activeTaxConfigs = [] } = useTaxConfigurationsQuery({ isActive: true });

  // Active Tab: "BILLS" | "PAYMENTS" | "AGING"
  const [activeTab, setActiveTab] = useState<"BILLS" | "PAYMENTS" | "AGING">("BILLS");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isApplyAdvanceOpen, setIsApplyAdvanceOpen] = useState(false);
  const [isReverseBillOpen, setIsReverseBillOpen] = useState(false);
  const [isReversePaymentOpen, setIsReversePaymentOpen] = useState(false);
  const [isBillDetailOpen, setIsBillDetailOpen] = useState(false);

  const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SupplierPayment | null>(null);
  const [reversalReason, setReversalReason] = useState("");

  // New Bill Form State
  const [billSupplierId, setBillSupplierId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [billDueDate, setBillDueDate] = useState("");
  const [billNotes, setBillNotes] = useState("");
  const [billLines, setBillLines] = useState<NewBillLine[]>([
    { classification: "EXPENSE", accountId: "", description: "", quantity: 1, unitPrice: 0, taxRatePercent: 0 },
  ]);

  // Record Payment Form State
  const [paySupplierId, setPaySupplierId] = useState("");
  const [payIntent, setPayIntent] = useState<"BILL_SETTLEMENT" | "SUPPLIER_ADVANCE">("BILL_SETTLEMENT");
  const [payAccountId, setPayAccountId] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payRef, setPayRef] = useState("");
  const [payAllocations, setPayAllocations] = useState<{ billId: string; amount: number }[]>([]);

  // Apply Advance Form State
  const [applyAdvanceId, setApplyAdvanceId] = useState("");
  const [applyBillId, setApplyBillId] = useState("");
  const [applyAmount, setApplyAmount] = useState(0);

  // Queries
  const { data: billsRes, isLoading: isBillsLoading } = useQuery({
    queryKey: ["finance", "bills", { search, status: statusFilter, page }],
    queryFn: () =>
      financeApi.getSupplierBills({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      }),
    enabled: activeTab === "BILLS",
  });

  const { data: paymentsRes, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["finance", "supplier-payments", { page }],
    queryFn: () => financeApi.getSupplierPayments({ page, limit }),
    enabled: activeTab === "PAYMENTS",
  });

  const { data: agingRes, isLoading: isAgingLoading, refetch: refetchAging } = useQuery({
    queryKey: ["finance", "payables-aging", asOfDate],
    queryFn: () => financeApi.getPayablesAging(asOfDate),
  });

  const { data: reconRes, refetch: refetchRecon } = useQuery({
    queryKey: ["finance", "payables-reconcile", asOfDate],
    queryFn: () => financeApi.reconcilePayables(asOfDate),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => financeApi.getAccounts({ isActive: true }),
  });

  const { data: suppliersRes } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => productsApi.getSuppliers({ limit: 100 }),
  });

  const accounts = accountsRes?.data || [];
  const suppliers = suppliersRes?.data || [];
  const assetAccounts = accounts.filter((a) => a.type === "ASSET" && (a.subtype === "BANK" || a.subtype === "CASH" || a.code.startsWith("10")));
  const expenseAccounts = accounts.filter((a) => a.type === "EXPENSE");
  const inventoryAccounts = accounts.filter((a) => a.type === "ASSET" && (a.subtype === "INVENTORY" || a.code === "1040"));

  const aging = agingRes?.data;
  const reconciliation = reconRes?.data;
  const bills = billsRes?.items || [];
  const totalBills = billsRes?.total || 0;
  const payments = paymentsRes?.items || [];
  const totalPayments = paymentsRes?.total || 0;

  // Mutations
  const createBillMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createSupplierBill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsNewBillOpen(false);
      resetBillForm();
    },
  });

  const reverseBillMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.reverseSupplierBill(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsReverseBillOpen(false);
      setSelectedBill(null);
      setReversalReason("");
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: any) => financeApi.recordSupplierPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsRecordPaymentOpen(false);
      resetPaymentForm();
    },
  });

  const reversePaymentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.reverseSupplierPayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsReversePaymentOpen(false);
      setSelectedPayment(null);
      setReversalReason("");
    },
  });

  const applyAdvanceMutation = useMutation({
    mutationFn: (payload: any) => financeApi.applySupplierAdvance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      setIsApplyAdvanceOpen(false);
      setApplyAdvanceId("");
      setApplyBillId("");
      setApplyAmount(0);
    },
  });

  // Calculation helpers
  const calculateBillTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    billLines.forEach((l) => {
      const lineSub = Number(l.quantity) * Number(l.unitPrice);
      const lineTax = (lineSub * Number(l.taxRatePercent)) / 100;
      subtotal += lineSub;
      taxAmount += lineTax;
    });
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  };

  const billTotals = calculateBillTotals();

  const resetBillForm = () => {
    setBillSupplierId("");
    setBillNumber("");
    setBillDate(new Date().toISOString().split("T")[0]);
    setBillDueDate("");
    setBillNotes("");
    setBillLines([
      { classification: "EXPENSE", accountId: expenseAccounts[0]?._id || "", description: "", quantity: 1, unitPrice: 0, taxRatePercent: 0 },
    ]);
  };

  const resetPaymentForm = () => {
    setPaySupplierId("");
    setPayIntent("BILL_SETTLEMENT");
    setPayAccountId(assetAccounts[0]?._id || "");
    setPayAmount(0);
    setPayDate(new Date().toISOString().split("T")[0]);
    setPayMethod("BANK_TRANSFER");
    setPayRef("");
    setPayAllocations([]);
  };

  const handleBillSubmit = (isDraft: boolean) => {
    createBillMutation.mutate({
      supplierId: billSupplierId,
      billNumber,
      billDate,
      dueDate: billDueDate || undefined,
      notes: billNotes || undefined,
      lines: billLines.map((l) => ({
        classification: l.classification,
        accountId: l.accountId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        taxRatePercent: Number(l.taxRatePercent),
        taxConfigurationId: l.taxConfigurationId || undefined,
        taxCode: l.taxCode || undefined,
      })),
      isDraft,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Accounts Payable (AP)</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supplier bills, settlements, advance management, and Accounts Payable (2010) reconciliation.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                resetBillForm();
                setIsNewBillOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              New Supplier Bill
            </button>
            <button
              onClick={() => {
                resetPaymentForm();
                setIsRecordPaymentOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <HandCoins className="h-3.5 w-3.5 text-emerald-600" />
              Record Supplier Payment
            </button>
          </div>
        )}
      </div>

      {/* Live AP Ledger Reconciliation Card */}
      {reconciliation && (
        <div
          className={`rounded-xl border p-4 shadow-xs ${
            reconciliation.status === "MATCHED"
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
              : "border-red-200 bg-red-50/60 text-red-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {reconciliation.status === "MATCHED" ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {reconciliation.status === "MATCHED"
                    ? "AP Sub-ledger & General Ledger Synchronized"
                    : "AP Ledger Variance Detected"}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Accounts Payable Account (2010) matches total open supplier bills balance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="block text-slate-500">AP GL Account (2010):</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(reconciliation.ledgerBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Open Supplier Bills:</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(reconciliation.operationalBalance, "INR")}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Variance:</span>
                <span className={`font-mono font-bold text-sm ${reconciliation.difference === 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {formatCurrency(reconciliation.difference, "INR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("BILLS");
              setPage(1);
            }}
            className={`border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === "BILLS"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Supplier Bills
          </button>
          <button
            onClick={() => {
              setActiveTab("PAYMENTS");
              setPage(1);
            }}
            className={`border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === "PAYMENTS"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Supplier Payments & Advances
          </button>
          <button
            onClick={() => {
              setActiveTab("AGING");
            }}
            className={`border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === "AGING"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            AP Aging Breakdown
          </button>
        </nav>
      </div>

      {/* TAB 1: SUPPLIER BILLS */}
      {activeTab === "BILLS" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bill #, supplier name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="POSTED">Posted</option>
                <option value="DRAFT">Draft</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {isBillsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <CreditCard className="h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">No supplier bills found</h3>
                <p className="mt-1 text-xs text-slate-500">Record incoming bills from your suppliers to track liabilities.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Bill #</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Bill Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                      <th className="px-4 py-3 text-right">Balance Due</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <span className="font-mono text-xs">{bill.billNumber}</span>
                          <span className="block text-[11px] font-normal text-slate-400">{bill.billId}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {bill.supplier?.name || "Supplier"}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(bill.billDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              bill.status === "POSTED"
                                ? "bg-emerald-50 text-emerald-700"
                                : bill.status === "DRAFT"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              bill.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : bill.paymentStatus === "PARTIAL"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-600">
                          {formatCurrency(bill.grandTotal, bill.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {formatCurrency(bill.balanceDue, bill.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setIsBillDetailOpen(true);
                              }}
                              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {canManage && bill.status === "POSTED" && bill.balanceDue > 0 && (
                              <button
                                onClick={() => {
                                  resetPaymentForm();
                                  setPaySupplierId(bill.supplierId?._id || bill.supplierId);
                                  setPayAmount(bill.balanceDue);
                                  setPayAllocations([{ billId: bill._id, amount: bill.balanceDue }]);
                                  setIsRecordPaymentOpen(true);
                                }}
                                className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              >
                                Settle
                              </button>
                            )}

                            {canManage && bill.status === "POSTED" && (
                              <button
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setIsReverseBillOpen(true);
                                }}
                                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Reverse Bill"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER PAYMENTS & ADVANCES */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {isPaymentsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <HandCoins className="h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">No supplier payments recorded</h3>
                <p className="mt-1 text-xs text-slate-500">Record settlements against bills or pay advances to vendors.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Payment ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Intent</th>
                      <th className="px-4 py-3">Payment Method</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono text-xs">
                          {p.paymentId}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {p.supplier?.name || "Supplier"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.intent === "SUPPLIER_ADVANCE"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {p.intent === "SUPPLIER_ADVANCE" ? "Supplier Advance" : "Bill Settlement"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {p.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {p.transactionReference || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.status === "POSTED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canManage && p.status === "POSTED" && (
                              <button
                                onClick={() => {
                                  setSelectedPayment(p);
                                  setIsReversePaymentOpen(true);
                                }}
                                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Reverse Payment"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AP AGING */}
      {activeTab === "AGING" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payables Aging Analysis (As of {new Date(asOfDate).toLocaleDateString()})
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => refetchAging()}
                className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500">Total Payable</span>
              <div className="mt-1.5 text-base font-bold text-slate-900">
                {formatCurrency(aging?.totalOutstanding || 0, "INR")}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-700">
                <span>Current</span>
                <span>{aging?.buckets?.current?.count || 0}</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-emerald-600">
                {formatCurrency(aging?.buckets?.current?.amount || 0, "INR")}
              </div>
              <span className="text-[10px] text-slate-400">Within terms</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-amber-700">
                <span>1 - 30 Days</span>
                <span>{aging?.buckets?.days1To30?.count || 0}</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-amber-600">
                {formatCurrency(aging?.buckets?.days1To30?.amount || 0, "INR")}
              </div>
              <span className="text-[10px] text-slate-400">Past due</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-orange-700">
                <span>31 - 60 Days</span>
                <span>{aging?.buckets?.days31To60?.count || 0}</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-orange-600">
                {formatCurrency(aging?.buckets?.days31To60?.amount || 0, "INR")}
              </div>
              <span className="text-[10px] text-slate-400">Overdue</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-rose-700">
                <span>61 - 90 Days</span>
                <span>{aging?.buckets?.days61To90?.count || 0}</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-rose-600">
                {formatCurrency(aging?.buckets?.days61To90?.amount || 0, "INR")}
              </div>
              <span className="text-[10px] text-slate-400">Critical</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-purple-700">
                <span>90+ Days</span>
                <span>{aging?.buckets?.days90Plus?.count || 0}</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-purple-600">
                {formatCurrency(aging?.buckets?.days90Plus?.amount || 0, "INR")}
              </div>
              <span className="text-[10px] text-slate-400">Severely overdue</span>
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Bill Modal */}
      {isNewBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Record Supplier Bill</h3>
              </div>
              <button onClick={() => setIsNewBillOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createBillMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{(createBillMutation.error as any)?.response?.data?.message || "Failed to record bill."}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Supplier *</label>
                  <select
                    required
                    value={billSupplierId}
                    onChange={(e) => setBillSupplierId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Bill / Invoice # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-98234"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Bill Date *</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bill Lines */}
              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Bill Lines</span>
                  <button
                    type="button"
                    onClick={() =>
                      setBillLines([
                        ...billLines,
                        {
                          classification: "EXPENSE",
                          accountId: expenseAccounts[0]?._id || "",
                          description: "",
                          quantity: 1,
                          unitPrice: 0,
                          taxRatePercent: 0,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Line
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-2 w-28">Type</th>
                        <th className="p-2 w-48">Account *</th>
                        <th className="p-2">Description *</th>
                        <th className="p-2 w-16 text-right">Qty</th>
                        <th className="p-2 w-24 text-right">Unit Price</th>
                        <th className="p-2 w-20 text-right">Tax %</th>
                        <th className="p-2 w-24 text-right">Total</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billLines.map((line, idx) => {
                        const lineSub = Number(line.quantity) * Number(line.unitPrice);
                        const lineTax = (lineSub * Number(line.taxRatePercent)) / 100;
                        const lineTotal = lineSub + lineTax;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-1.5">
                              <select
                                value={line.classification}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  const cls = e.target.value as any;
                                  updated[idx].classification = cls;
                                  if (cls === "INVENTORY" && inventoryAccounts[0]) {
                                    updated[idx].accountId = inventoryAccounts[0]._id;
                                  } else if (cls === "EXPENSE" && expenseAccounts[0]) {
                                    updated[idx].accountId = expenseAccounts[0]._id;
                                  }
                                  setBillLines(updated);
                                }}
                                className="w-full rounded border border-slate-200 p-1 text-xs"
                              >
                                <option value="EXPENSE">Expense</option>
                                <option value="INVENTORY">Inventory</option>
                                <option value="ASSET">Asset</option>
                              </select>
                            </td>
                            <td className="p-1.5">
                              <select
                                required
                                value={line.accountId}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  updated[idx].accountId = e.target.value;
                                  setBillLines(updated);
                                }}
                                className="w-full rounded border border-slate-200 p-1 text-xs"
                              >
                                <option value="">Select Account</option>
                                {line.classification === "INVENTORY"
                                  ? inventoryAccounts.map((a) => (
                                      <option key={a._id} value={a._id}>
                                        {a.code} - {a.name}
                                      </option>
                                    ))
                                  : accounts.map((a) => (
                                      <option key={a._id} value={a._id}>
                                        {a.code} - {a.name}
                                      </option>
                                    ))}
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                required
                                placeholder="Item details"
                                value={line.description}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  updated[idx].description = e.target.value;
                                  setBillLines(updated);
                                }}
                                className="w-full rounded border border-slate-200 p-1 text-xs"
                              >
                              </input>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  updated[idx].quantity = parseFloat(e.target.value) || 0;
                                  setBillLines(updated);
                                }}
                                className="w-full text-right rounded border border-slate-200 p-1 text-xs font-mono"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.unitPrice || ""}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  setBillLines(updated);
                                }}
                                className="w-full text-right rounded border border-slate-200 p-1 text-xs font-mono"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={line.taxConfigurationId || (line.taxRatePercent ? `manual-${line.taxRatePercent}` : "none")}
                                onChange={(e) => {
                                  const updated = [...billLines];
                                  const val = e.target.value;
                                  if (val === "none") {
                                    updated[idx].taxConfigurationId = undefined;
                                    updated[idx].taxCode = undefined;
                                    updated[idx].taxRatePercent = 0;
                                  } else {
                                    const matched = activeTaxConfigs.find((c) => c._id === val);
                                    if (matched) {
                                      updated[idx].taxConfigurationId = matched._id;
                                      updated[idx].taxCode = matched.taxCode;
                                      updated[idx].taxRatePercent = matched.rate;
                                    } else if (val.startsWith("manual-")) {
                                      updated[idx].taxConfigurationId = undefined;
                                      updated[idx].taxCode = undefined;
                                      updated[idx].taxRatePercent = parseFloat(val.replace("manual-", "")) || 0;
                                    }
                                  }
                                  setBillLines(updated);
                                }}
                                className="w-full rounded border border-slate-200 p-1 text-xs font-mono"
                              >
                                <option value="none">0%</option>
                                {activeTaxConfigs.length > 0 ? (
                                  activeTaxConfigs.map((tc) => (
                                    <option key={tc._id} value={tc._id}>
                                      {tc.taxCode} ({tc.rate}%)
                                    </option>
                                  ))
                                ) : (
                                  <>
                                    <option value="manual-5">5%</option>
                                    <option value="manual-12">12%</option>
                                    <option value="manual-18">18%</option>
                                    <option value="manual-28">28%</option>
                                  </>
                                )}
                              </select>
                            </td>
                            <td className="p-1.5 text-right font-mono font-medium">
                              {formatCurrency(lineTotal, "INR")}
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                disabled={billLines.length <= 1}
                                onClick={() => setBillLines(billLines.filter((_, i) => i !== idx))}
                                className="rounded p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50/70 font-semibold text-slate-800">
                      <tr>
                        <td colSpan={6} className="p-2 text-right">Subtotal:</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(billTotals.subtotal, "INR")}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="p-2 text-right">Tax Amount:</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(billTotals.taxAmount, "INR")}</td>
                        <td></td>
                      </tr>
                      <tr className="border-t border-slate-200 font-bold text-slate-900">
                        <td colSpan={6} className="p-2 text-right">Grand Total:</td>
                        <td className="p-2 text-right font-mono text-emerald-700">{formatCurrency(billTotals.grandTotal, "INR")}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewBillOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={createBillMutation.isPending || !billSupplierId || !billNumber}
                  onClick={() => handleBillSubmit(true)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={createBillMutation.isPending || !billSupplierId || !billNumber || billTotals.grandTotal <= 0}
                  onClick={() => handleBillSubmit(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createBillMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Supplier Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Supplier Payment</h3>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {recordPaymentMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(recordPaymentMutation.error as any)?.response?.data?.message || "Payment failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                recordPaymentMutation.mutate({
                  supplierId: paySupplierId,
                  intent: payIntent,
                  paymentAccountId: payAccountId,
                  amount: Number(payAmount),
                  paymentDate: payDate,
                  paymentMethod: payMethod,
                  transactionReference: payRef || undefined,
                  allocations: payIntent === "BILL_SETTLEMENT" ? payAllocations : undefined,
                });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Supplier *</label>
                <select
                  required
                  value={paySupplierId}
                  onChange={(e) => setPaySupplierId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Payment Intent *</label>
                <div className="mt-1 flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setPayIntent("BILL_SETTLEMENT")}
                    className={`flex-1 rounded-md py-1 text-xs font-medium ${
                      payIntent === "BILL_SETTLEMENT" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Bill Settlement (AP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayIntent("SUPPLIER_ADVANCE")}
                    className={`flex-1 rounded-md py-1 text-xs font-medium ${
                      payIntent === "SUPPLIER_ADVANCE" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Supplier Advance
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Paid From Account *</label>
                  <select
                    required
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Asset Account</option>
                    {assetAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Amount (INR) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={payAmount || ""}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Reference / UTR</label>
                <input
                  type="text"
                  placeholder="Optional reference code"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordPaymentMutation.isPending || !paySupplierId || payAmount <= 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {recordPaymentMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Bill Modal */}
      {isReverseBillOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5" />
                Reverse Supplier Bill: {selectedBill.billNumber}
              </h3>
              <button onClick={() => setIsReverseBillOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will create a counterpart reversal journal and restore inventory/expense and AP liability balances.
            </p>

            {reverseBillMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(reverseBillMutation.error as any)?.response?.data?.message || "Reversal failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reverseBillMutation.mutate({ id: selectedBill._id, reason: reversalReason });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Reversal Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Audit reason for reversing this bill"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReverseBillOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reverseBillMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {reverseBillMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Payment Modal */}
      {isReversePaymentOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5" />
                Reverse Supplier Payment: {selectedPayment.paymentId}
              </h3>
              <button onClick={() => setIsReversePaymentOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will restore supplier bill balances or supplier advance balances, and reinstate cash/bank funds.
            </p>

            {reversePaymentMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {(reversePaymentMutation.error as any)?.response?.data?.message || "Reversal failed."}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                reversePaymentMutation.mutate({ id: selectedPayment._id, reason: reversalReason });
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-slate-700">Reversal Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Audit reason for reversing this payment"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReversePaymentOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversePaymentMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {reversePaymentMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {isBillDetailOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedBill.billNumber}</h3>
                <span className="text-xs text-slate-400 font-mono">({selectedBill.billId})</span>
              </div>
              <button onClick={() => setIsBillDetailOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Supplier:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedBill.supplier?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Bill Date:</span>{" "}
                  <span className="font-medium text-slate-800">{new Date(selectedBill.billDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedBill.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Payment:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedBill.paymentStatus}</span>
                </div>
              </div>

              {/* Lines table */}
              <div className="overflow-hidden rounded-lg border border-slate-200 mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Classification</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBill.lines?.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-800">{line.description}</td>
                        <td className="p-2.5 text-slate-500">{line.classification}</td>
                        <td className="p-2.5 text-right font-mono">{line.quantity}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(line.unitPrice, selectedBill.currency)}</td>
                        <td className="p-2.5 text-right font-mono font-medium">{formatCurrency(line.lineTotal, selectedBill.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right">Grand Total:</td>
                      <td className="p-2.5 text-right font-mono">{formatCurrency(selectedBill.grandTotal, selectedBill.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right font-medium text-slate-500">Balance Due:</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">{formatCurrency(selectedBill.balanceDue, selectedBill.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsBillDetailOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
