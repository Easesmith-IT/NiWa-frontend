"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCcw,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  AlertCircle,
  Eye,
  ShoppingBag,
  Package,
  Layers,
  FileText,
  Boxes,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  getSalesReturns,
  getSalesReturn,
  createSalesReturn,
  confirmSalesReturn,
  cancelSalesReturn,
  getOrderReturnableQuantities,
  getSalesOrders,
  SalesReturnItem,
  ReturnStatus,
  ReturnItemCondition,
  SalesOrderItem,
  ReturnableLineQuantity,
} from "lib/api/sales-api";
import { queryKeys } from "lib/api/query-keys";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspaceDefaultCurrency } from "lib/workspace/use-workspace-currency";

export default function SalesReturnsPage() {
  const queryClient = useQueryClient();
  const { currency: defaultCurrency } = useWorkspaceDefaultCurrency();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Detail Drawer State
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Create Return Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [returnReason, setReturnReason] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [actionError, setActionError] = useState<string | null>(null);

  // Line selection state inside Create Return modal
  const [selectedLineInputs, setSelectedLineInputs] = useState<
    Record<
      string,
      {
        selected: boolean;
        quantity: number;
        condition: ReturnItemCondition;
      }
    >
  >({});

  // 1. Query Returns List
  const { data: returnsData, isLoading: isLoadingReturns } = useQuery({
    queryKey: [
      ...queryKeys.salesReturns,
      {
        status: statusFilter,
        search,
        page,
      },
    ],
    queryFn: () =>
      getSalesReturns({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
        page,
        limit: 20,
      }),
  });

  // 2. Query Active Return Details
  const { data: activeReturn, isLoading: isLoadingActiveReturn } = useQuery({
    queryKey: selectedReturnId ? queryKeys.salesReturn(selectedReturnId) : ["null-return"],
    queryFn: () => (selectedReturnId ? getSalesReturn(selectedReturnId) : null),
    enabled: !!selectedReturnId,
  });

  // 3. Query Orders for Create Modal (CONFIRMED or FULFILLED)
  const { data: ordersData } = useQuery({
    queryKey: [...queryKeys.salesOrders, { limit: 100 }],
    queryFn: () => getSalesOrders({ limit: 100 }),
    enabled: isCreateModalOpen,
  });

  const eligibleOrders = (ordersData?.data || []).filter(
    (order) => order.status === "CONFIRMED" || order.status === "FULFILLED"
  );

  const selectedOrder = eligibleOrders.find((order) => order._id === selectedOrderId);

  // 4. Query Returnable Quantities for Selected Order
  const {
    data: returnableData,
    isLoading: isLoadingReturnable,
  } = useQuery({
    queryKey: selectedOrderId
      ? queryKeys.orderReturnableQuantities(selectedOrderId)
      : ["null-returnable"],
    queryFn: () =>
      selectedOrderId ? getOrderReturnableQuantities(selectedOrderId) : null,
    enabled: !!selectedOrderId && isCreateModalOpen,
  });

  // Handle Order Selection in Create Modal
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedLineInputs({});
    setActionError(null);
  };

  // Initialize Line Selection when returnableData loads
  const handleToggleLine = (line: ReturnableLineQuantity) => {
    const prev = selectedLineInputs[line.productVariantId];
    if (prev?.selected) {
      setSelectedLineInputs((curr) => ({
        ...curr,
        [line.productVariantId]: {
          ...curr[line.productVariantId],
          selected: false,
        },
      }));
    } else {
      setSelectedLineInputs((curr) => ({
        ...curr,
        [line.productVariantId]: {
          selected: true,
          quantity: Math.min(1, line.remainingReturnableQuantity),
          condition: "RESTOCKABLE",
        },
      }));
    }
  };

  const handleLineQtyChange = (line: ReturnableLineQuantity, val: string) => {
    const parsed = parseFloat(val) || 0;
    const bounded = Math.min(Math.max(0, parsed), line.remainingReturnableQuantity);
    setSelectedLineInputs((curr) => ({
      ...curr,
      [line.productVariantId]: {
        selected: true,
        quantity: bounded,
        condition: curr[line.productVariantId]?.condition || "RESTOCKABLE",
      },
    }));
  };

  const handleLineConditionChange = (
    variantId: string,
    condition: ReturnItemCondition
  ) => {
    setSelectedLineInputs((curr) => ({
      ...curr,
      [variantId]: {
        ...curr[variantId],
        condition,
      },
    }));
  };

  // Calculate estimated refund preview
  const previewRefundAmount = (returnableData?.returnableLines || []).reduce(
    (acc, rLine) => {
      const state = selectedLineInputs[rLine.productVariantId];
      if (state?.selected && state.quantity > 0) {
        return acc + state.quantity * rLine.unitPrice;
      }
      return acc;
    },
    0
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSalesReturn,
    onSuccess: (newReturn) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesReturns });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      setIsCreateModalOpen(false);
      setSelectedOrderId("");
      setSelectedLineInputs({});
      setReturnReason("");
      setSelectedReturnId(newReturn._id);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to create return");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmSalesReturn,
    onSuccess: (confirmedReturn) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesReturns });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesReturn(confirmedReturn._id) });
      const orderIdStr = typeof confirmedReturn.salesOrderId === "object" ? confirmedReturn.salesOrderId._id : confirmedReturn.salesOrderId;
      if (orderIdStr) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orderReturnableQuantities(orderIdStr) });
      }
      setSelectedReturnId(confirmedReturn._id);
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to confirm return");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelSalesReturn(id, reason),
    onSuccess: (cancelledReturn) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesReturns });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesReturn(cancelledReturn._id) });
      const orderIdStr = typeof cancelledReturn.salesOrderId === "object" ? cancelledReturn.salesOrderId._id : cancelledReturn.salesOrderId;
      if (orderIdStr) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orderReturnableQuantities(orderIdStr) });
      }
      setSelectedReturnId(cancelledReturn._id);
      setIsCancelModalOpen(false);
      setCancelReason("");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to cancel return");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!selectedOrderId) {
      setActionError("Please select an eligible Sales Order");
      return;
    }

    const linesToSubmit = Object.entries(selectedLineInputs)
      .filter(([_, state]) => state.selected && state.quantity > 0)
      .map(([variantId, state]) => ({
        productVariantId: variantId,
        quantity: state.quantity,
        condition: state.condition,
      }));

    if (linesToSubmit.length === 0) {
      setActionError("Please select and specify a return quantity for at least one line item");
      return;
    }

    createMutation.mutate({
      salesOrderId: selectedOrderId,
      lines: linesToSubmit,
      reason: returnReason.trim() || undefined,
      returnDate: returnDate || undefined,
      currency: selectedOrder?.currency,
    });
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-blue-600" />
            Sales Returns
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customer returns, inventory restocking, damage inspection, and commercial refunds.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            setActionError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Return
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search return ID, customer, reason..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Sales Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingReturns ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading returns...
                  </td>
                </tr>
              ) : !returnsData?.data || returnsData.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No sales returns found
                  </td>
                </tr>
              ) : (
                returnsData.data.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedReturnId(item._id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {item.returnId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(item.returnDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {typeof item.salesOrderId === "object" && item.salesOrderId !== null
                        ? item.salesOrderId.orderId
                        : item.salesOrderId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5 font-medium">
                        {item.customer.customerType === "COMPANY" ? (
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[160px]">
                          {item.customer.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.refundAmount, item.currency || defaultCurrency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReturnId(item._id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {returnsData && returnsData.pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <div>
              Showing {returnsData.data.length} of {returnsData.pagination.total} returns
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-mono">
                {page} / {returnsData.pagination.pages}
              </span>
              <button
                disabled={page >= returnsData.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {selectedReturnId && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    {activeReturn?.returnId || "Return Details"}
                  </span>
                  {activeReturn && getStatusBadge(activeReturn.status)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Created {activeReturn ? new Date(activeReturn.createdAt).toLocaleString() : ""}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedReturnId(null);
                  setActionError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingActiveReturn || !activeReturn ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading return details...</div>
              ) : (
                <>
                  {actionError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {/* Customer Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Customer Snapshot
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                      {activeReturn.customer.customerType === "COMPANY" ? (
                        <Building2 className="w-4 h-4 text-slate-400" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                      {activeReturn.customer.displayName}
                    </div>
                    {activeReturn.customer.email && (
                      <div className="text-xs text-slate-500">Email: {activeReturn.customer.email}</div>
                    )}
                    {activeReturn.customer.phone && (
                      <div className="text-xs text-slate-500">Phone: {activeReturn.customer.phone}</div>
                    )}
                  </div>

                  {/* Order & Return Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-1">Sales Order</div>
                      <div className="font-mono font-medium text-slate-900 dark:text-white">
                        {typeof activeReturn.salesOrderId === "object" && activeReturn.salesOrderId !== null
                          ? activeReturn.salesOrderId.orderId
                          : activeReturn.salesOrderId}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-1">Return Date</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {new Date(activeReturn.returnDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {activeReturn.reason && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="text-slate-400 mb-1">Return Reason</div>
                      <div className="text-slate-700 dark:text-slate-300">{activeReturn.reason}</div>
                    </div>
                  )}

                  {/* Return Lines */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Returned Line Items ({activeReturn.lines.length})
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {activeReturn.lines.map((line, idx) => (
                        <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 text-xs flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {line.productName} — {line.variantName}
                            </div>
                            <div className="font-mono text-slate-400 flex items-center gap-2">
                              <span>SKU: {line.sku || "N/A"}</span>
                              <span>•</span>
                              <span>
                                {line.quantity} {line.unitCode} @ {formatCurrency(line.unitPrice, activeReturn.currency || defaultCurrency)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                              {formatCurrency(line.lineTotal, activeReturn.currency || defaultCurrency)}
                            </div>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                line.condition === "RESTOCKABLE"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {line.condition}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Total Refund Amount
                    </div>
                    <div className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(activeReturn.refundAmount, activeReturn.currency || defaultCurrency)}
                    </div>
                  </div>

                  {/* Cancellation Metadata */}
                  {activeReturn.status === "CANCELLED" && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs space-y-1 text-rose-700 dark:text-rose-300">
                      <div className="font-semibold">Cancelled</div>
                      <div>
                        Date: {activeReturn.cancelledAt ? new Date(activeReturn.cancelledAt).toLocaleString() : "N/A"}
                      </div>
                      {activeReturn.cancelledReason && <div>Reason: {activeReturn.cancelledReason}</div>}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {activeReturn && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
                {activeReturn.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      disabled={confirmMutation.isPending || cancelMutation.isPending}
                      className="px-4 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800"
                    >
                      Cancel Return
                    </button>
                    <button
                      onClick={() => confirmMutation.mutate(activeReturn._id)}
                      disabled={confirmMutation.isPending || cancelMutation.isPending}
                      className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {confirmMutation.isPending ? "Confirming & Restocking..." : "Confirm & Restock"}
                    </button>
                  </>
                )}

                {activeReturn.status === "CONFIRMED" && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800"
                  >
                    Cancel Return (Reverse Stock)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE RETURN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Create Sales Return
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {actionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Order Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Sales Order *
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                >
                  <option value="">-- Select an eligible order --</option>
                  {eligibleOrders.map((ord) => (
                    <option key={ord._id} value={ord._id}>
                      {ord.orderId} — {ord.customer.displayName} ({formatCurrency(ord.grandTotal, ord.currency)}, {ord.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Lines Breakdown */}
              {selectedOrderId && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                    <span>Eligible Return Lines</span>
                    {isLoadingReturnable && (
                      <span className="text-xs text-slate-400 font-normal">Loading quantities...</span>
                    )}
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                    {(returnableData?.returnableLines || []).map((line) => {
                      const isSelected = !!selectedLineInputs[line.productVariantId]?.selected;
                      const currentQty = selectedLineInputs[line.productVariantId]?.quantity ?? 0;
                      const currentCondition =
                        selectedLineInputs[line.productVariantId]?.condition || "RESTOCKABLE";

                      return (
                        <div
                          key={line.productVariantId}
                          className={`p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            line.remainingReturnableQuantity <= 0 ? "opacity-50 bg-slate-50 dark:bg-slate-900" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={line.remainingReturnableQuantity <= 0}
                              onChange={() => handleToggleLine(line)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {line.productName} — {line.variantName}
                              </div>
                              <div className="text-slate-400 font-mono">
                                Sold: {line.soldQuantity} | Returned: {line.confirmedReturnedQuantity} | Remaining:{" "}
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {line.remainingReturnableQuantity}
                                </span>{" "}
                                @ {formatCurrency(line.unitPrice, selectedOrder?.currency || defaultCurrency)}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Qty:</span>
                                <input
                                  type="number"
                                  min={0.001}
                                  max={line.remainingReturnableQuantity}
                                  step={0.001}
                                  value={currentQty || ""}
                                  onChange={(e) => handleLineQtyChange(line, e.target.value)}
                                  className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right font-mono"
                                />
                              </div>

                              <select
                                value={currentCondition}
                                onChange={(e) =>
                                  handleLineConditionChange(
                                    line.productVariantId,
                                    e.target.value as ReturnItemCondition
                                  )
                                }
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                              >
                                <option value="RESTOCKABLE">Restockable</option>
                                <option value="DAMAGED">Damaged</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date & Reason */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Refund
                  </label>
                  <div className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(previewRefundAmount, selectedOrder?.currency || defaultCurrency)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Return (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Defective unit, customer changed mind, wrong item..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !selectedOrderId}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating Draft..." : "Create Return Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {isCancelModalOpen && activeReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Cancel Sales Return
            </h3>
            <p className="text-xs text-slate-500">
              {activeReturn.status === "CONFIRMED"
                ? "This return has been confirmed and restocked. Cancelling it will execute compensating RETURN_OUT movements to reverse stock back out."
                : "This draft return will be cancelled. No inventory movements will occur."}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cancellation Reason
              </label>
              <textarea
                rows={3}
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() =>
                  cancelMutation.mutate({
                    id: activeReturn._id,
                    reason: cancelReason,
                  })
                }
                disabled={cancelMutation.isPending}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
