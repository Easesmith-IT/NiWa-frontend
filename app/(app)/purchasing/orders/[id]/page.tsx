"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  DollarSign,
  Package,
  Send,
  Boxes,
  Receipt,
  FileText,
  X,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  purchasingApi,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchasePaymentStatus,
  PurchaseReturn,
  ReceivePurchaseOrderInput,
  CreatePurchaseReturnInput,
} from "lib/api/purchasing-api";
import { queryKeys } from "lib/api/query-keys";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  const orderIdParam = params?.id as string;

  // Modal dialog states
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Form states for Receive Stock modal
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  // Form states for Return Stock modal
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReasons, setReturnReasons] = useState<Record<string, string>>({});
  const [returnGeneralReason, setReturnGeneralReason] = useState("Damaged Goods");
  const [returnNotes, setReturnNotes] = useState("");

  // Form states for Cancel modal
  const [cancelReason, setCancelReason] = useState("");

  // Action / error alerts
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // 1. Fetch Purchase Order
  const {
    data: poResponse,
    isLoading: isLoadingPO,
    isError: isPOError,
    error: poError,
    refetch: refetchPO,
  } = useQuery({
    queryKey: queryKeys.purchaseOrder(orderIdParam),
    queryFn: () => purchasingApi.getPurchaseOrderById(orderIdParam),
    enabled: !!orderIdParam,
  });

  const order: PurchaseOrder | undefined = poResponse?.data;

  // 2. Fetch Purchase Returns associated with this order
  const { data: returnsResponse, isLoading: isLoadingReturns } = useQuery({
    queryKey: [...queryKeys.purchaseReturns, { purchaseOrderId: order?._id || orderIdParam }],
    queryFn: () =>
      purchasingApi.getPurchaseReturns({
        purchaseOrderId: order?._id || orderIdParam,
      }),
    enabled: !!order,
  });

  const returns: PurchaseReturn[] = returnsResponse?.data || [];

  // Mutations
  const orderMutation = useMutation({
    mutationFn: () => purchasingApi.orderPurchaseOrder(order!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrder(orderIdParam) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasingSummary });
      setActionSuccess("Purchase order successfully placed with supplier!");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to order PO");
      setActionSuccess(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => purchasingApi.cancelPurchaseOrder(order!._id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrder(orderIdParam) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasingSummary });
      setIsCancelModalOpen(false);
      setCancelReason("");
      setActionSuccess("Purchase order cancelled.");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to cancel PO");
      setActionSuccess(null);
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (payload: ReceivePurchaseOrderInput) =>
      purchasingApi.receivePurchaseOrder(order!._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrder(orderIdParam) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasingSummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      setIsReceiveModalOpen(false);
      setReceiveQuantities({});
      setActionSuccess("Stock received and warehouse inventory updated successfully!");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to receive stock");
      setActionSuccess(null);
    },
  });

  const returnMutation = useMutation({
    mutationFn: (payload: CreatePurchaseReturnInput) =>
      purchasingApi.createPurchaseReturn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrder(orderIdParam) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasingSummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseReturns });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      setIsReturnModalOpen(false);
      setReturnQuantities({});
      setReturnReasons({});
      setReturnNotes("");
      setActionSuccess("Purchase return recorded and inventory stock deducted.");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to create return");
      setActionSuccess(null);
    },
  });

  // Modal open helpers
  function handleOpenReceiveModal() {
    if (!order) return;
    const initial: Record<string, number> = {};
    for (const item of order.items) {
      const remaining = item.orderedQuantity - (item.receivedQuantity || 0);
      if (remaining > 0) {
        initial[item._id] = remaining;
      }
    }
    setReceiveQuantities(initial);
    setActionError(null);
    setIsReceiveModalOpen(true);
  }

  function handleOpenReturnModal() {
    if (!order) return;
    const initialQty: Record<string, number> = {};
    const initialReason: Record<string, string> = {};
    for (const item of order.items) {
      if ((item.receivedQuantity || 0) > 0) {
        initialQty[item._id] = 1;
        initialReason[item._id] = "Damaged Goods";
      }
    }
    setReturnQuantities(initialQty);
    setReturnReasons(initialReason);
    setActionError(null);
    setIsReturnModalOpen(true);
  }

  function handleSubmitReceive() {
    if (!order) return;
    const itemsToReceive: Array<{ itemId: string; quantity: number }> = [];

    for (const item of order.items) {
      const qty = receiveQuantities[item._id] || 0;
      if (qty > 0) {
        const remaining = item.orderedQuantity - (item.receivedQuantity || 0);
        if (qty > remaining) {
          setActionError(
            `Quantity for ${item.productName} cannot exceed remaining quantity (${remaining}).`
          );
          return;
        }
        itemsToReceive.push({
          itemId: item._id,
          quantity: qty,
        });
      }
    }

    if (itemsToReceive.length === 0) {
      setActionError("Please specify at least 1 item with quantity > 0 to receive.");
      return;
    }

    receiveMutation.mutate({
      items: itemsToReceive,
    });
  }

  function handleSubmitReturn() {
    if (!order) return;
    const itemsToReturn: Array<{
      purchaseOrderItemId: string;
      quantity: number;
      reason?: string;
    }> = [];

    for (const item of order.items) {
      const qty = returnQuantities[item._id] || 0;
      if (qty > 0) {
        if (qty > (item.receivedQuantity || 0)) {
          setActionError(
            `Return quantity for ${item.productName} cannot exceed received quantity (${item.receivedQuantity}).`
          );
          return;
        }
        itemsToReturn.push({
          purchaseOrderItemId: item._id,
          quantity: qty,
          reason: returnReasons[item._id] || returnGeneralReason,
        });
      }
    }

    if (itemsToReturn.length === 0) {
      setActionError("Please specify at least 1 item with quantity > 0 to return.");
      return;
    }

    returnMutation.mutate({
      purchaseOrderId: order._id,
      reason: returnGeneralReason,
      notes: returnNotes.trim() || undefined,
      items: itemsToReturn,
    });
  }

  // Badges
  function getStatusBadge(status: PurchaseOrderStatus) {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5" /> Draft
          </span>
        );
      case "ORDERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <Truck className="w-3.5 h-3.5" /> Ordered
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Boxes className="w-3.5 h-3.5" /> Partially Received
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Received
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  }

  function getPaymentBadge(status: PurchasePaymentStatus) {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Partially Paid
          </span>
        );
      case "UNPAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Unpaid
          </span>
        );
      default:
        return null;
    }
  }

  if (isLoadingPO) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#176B4D] mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Loading purchase order details...</p>
      </div>
    );
  }

  if (isPOError || !order) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-semibold text-foreground">Purchase Order Not Found</h2>
        <p className="text-xs text-muted-foreground">
          {(poError as any)?.response?.data?.message ||
            "The requested purchase order could not be located in this workspace."}
        </p>
        <Link
          href="/purchasing/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#176B4D] text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Purchase Orders
        </Link>
      </div>
    );
  }

  const totalOrderedQty = order.items.reduce((acc, i) => acc + i.orderedQuantity, 0);
  const totalReceivedQty = order.items.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0);
  const totalRemainingQty = totalOrderedQty - totalReceivedQty;
  const canReceive = (order.status === "ORDERED" || order.status === "PARTIALLY_RECEIVED") && totalRemainingQty > 0;
  const canReturn = (order.status === "PARTIALLY_RECEIVED" || order.status === "RECEIVED") && totalReceivedQty > 0;
  const canCancel = (order.status === "DRAFT" || order.status === "ORDERED") && totalReceivedQty === 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/purchasing/orders"
            className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#24272A] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-foreground">{order.orderId}</h1>
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.paymentStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created on {new Date(order.createdAt).toLocaleDateString()} • Order Date:{" "}
              {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              {order.status === "DRAFT" && (
                <button
                  type="button"
                  disabled={orderMutation.isPending}
                  onClick={() => orderMutation.mutate()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {orderMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Place Order
                </button>
              )}

              {canReceive && (
                <button
                  type="button"
                  onClick={handleOpenReceiveModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Receive Stock
                </button>
              )}

              {canReturn && (
                <button
                  type="button"
                  onClick={handleOpenReturnModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  Return Items
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-medium transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center justify-between text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cancelled Warning Banner */}
      {order.status === "CANCELLED" && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-3 text-xs text-red-800 dark:text-red-300">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">This purchase order was cancelled</div>
            <div className="text-[11px] mt-0.5">
              {order.cancelledReason ? `Reason: "${order.cancelledReason}"` : "No cancellation reason was provided."}{" "}
              Cancelled on {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "N/A"}.
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supplier Snapshot Card */}
        <div className="p-4 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-[#176B4D]" />
            Supplier
          </div>
          <div className="font-bold text-sm text-foreground">{order.supplier.name}</div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {order.supplier.phone && <div>Phone: {order.supplier.phone}</div>}
            {order.supplier.email && <div>Email: {order.supplier.email}</div>}
            {order.supplier.address && <div>Address: {order.supplier.address}</div>}
          </div>
        </div>

        {/* Delivery & Dates Card */}
        <div className="p-4 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#176B4D]" />
            Delivery Details
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-medium text-foreground">
                {new Date(order.orderDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expected Delivery:</span>
              <span className="font-medium text-foreground">
                {order.expectedDeliveryDate
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                  : "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-foreground">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Receipt Progress Card */}
        <div className="p-4 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Boxes className="w-3.5 h-3.5 text-[#176B4D]" />
            Receiving Status
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Ordered Units:</span>
              <span className="font-mono font-medium text-foreground">{totalOrderedQty}</span>
            </div>
            <div className="flex justify-between">
              <span>Received Units:</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {totalReceivedQty}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Units:</span>
              <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                {totalRemainingQty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Line Items & Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E4E4E7] dark:border-[#24272A] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-[#176B4D]" />
                Purchased Line Items
              </h2>
              <span className="text-xs text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? "line" : "lines"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Product / Variant</th>
                    <th className="px-3 py-3 text-center">Unit</th>
                    <th className="px-3 py-3 text-center">Ordered</th>
                    <th className="px-3 py-3 text-center">Received</th>
                    <th className="px-3 py-3 text-center">Remaining</th>
                    <th className="px-3 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {order.items.map((item) => {
                    const remaining = item.orderedQuantity - (item.receivedQuantity || 0);
                    const isFullyReceived = remaining <= 0;

                    return (
                      <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{item.productName}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{item.variantName}</span>
                            {item.sku && <span className="font-mono">({item.sku})</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-muted-foreground">
                          {item.unitCode || "PCS"}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium text-foreground">
                          {item.orderedQuantity}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          {item.receivedQuantity || 0}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium">
                          {isFullyReceived ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-mono">
                              {remaining}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                          {formatCurrency(item.purchasePrice, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                          {formatCurrency(item.lineTotal, order.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returns History Card */}
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E4E4E7] dark:border-[#24272A] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                Purchase Returns History
              </h2>
              <span className="text-xs text-muted-foreground">
                {returns.length} {returns.length === 1 ? "return" : "returns"} recorded
              </span>
            </div>

            {returns.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No returns have been issued for this purchase order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Return ID</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Items Returned</th>
                      <th className="px-3 py-2.5 text-right">Refund Value</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {returns.map((ret) => (
                      <tr key={ret._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="px-4 py-3 font-mono font-medium text-foreground">
                          {ret.returnId}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {new Date(ret.returnDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            {ret.items.map((ri) => (
                              <div key={ri._id} className="text-[11px] text-muted-foreground">
                                {ri.productName} ({ri.variantName}) —{" "}
                                <span className="font-mono font-medium text-foreground">
                                  {ri.quantity} returned
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-medium text-foreground">
                          {formatCurrency(ret.refundAmount, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {ret.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Financial Summary & Notes */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#176B4D]" />
              Financial Breakdown
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>

              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Total</span>
                  <span className="font-mono">
                    -{formatCurrency(order.discountTotal, order.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Tax Total</span>
                <span className="font-mono text-foreground">
                  {formatCurrency(order.taxTotal, order.currency)}
                </span>
              </div>

              {order.otherCharges > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Freight / Other Charges</span>
                  <span className="font-mono text-foreground">
                    {formatCurrency(order.otherCharges, order.currency)}
                  </span>
                </div>
              )}

              <div className="border-t border-[#E4E4E7] dark:border-[#24272A] pt-2 flex justify-between text-sm font-bold text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-[#176B4D]">
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>

              <div className="border-t border-[#E4E4E7] dark:border-[#24272A] pt-2 space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Paid Amount</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(order.paidAmount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Balance Due</span>
                  <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(order.balanceDue, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Finance Notice */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg text-[11px] text-muted-foreground border border-[#E4E4E7] dark:border-[#24272A] space-y-1">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Receipt className="w-3.5 h-3.5 text-[#176B4D]" />
                Finance Integration
              </div>
              <p>
                Payments are recorded and processed through the Finance module. Purchasing
                displays live payable and balance due states.
              </p>
            </div>
          </div>

          {/* Notes Card */}
          {order.notes && (
            <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-2">
              <h2 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Notes & Terms
              </h2>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RECEIVE STOCK MODAL                                                    */}
      {/* ========================================================================= */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#24272A] pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#176B4D]" />
                  Receive Goods / Stock
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm the quantity of items received in warehouse from {order.supplier.name}
                </p>
              </div>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error in modal */}
            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Lines to receive */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Items to Receive
              </div>

              <div className="border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3.5 py-2.5">Item</th>
                      <th className="px-2.5 py-2.5 text-center">Ordered</th>
                      <th className="px-2.5 py-2.5 text-center">Recv'd</th>
                      <th className="px-2.5 py-2.5 text-center">Remaining</th>
                      <th className="px-3.5 py-2.5 text-right w-28">Receive Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {order.items
                      .filter((i) => i.orderedQuantity - (i.receivedQuantity || 0) > 0)
                      .map((item) => {
                        const remaining = item.orderedQuantity - (item.receivedQuantity || 0);

                        return (
                          <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                            <td className="px-3.5 py-3">
                              <div className="font-semibold text-foreground">{item.productName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {item.variantName} {item.sku ? `(${item.sku})` : ""}
                              </div>
                            </td>
                            <td className="px-2.5 py-3 text-center font-mono">{item.orderedQuantity}</td>
                            <td className="px-2.5 py-3 text-center font-mono text-muted-foreground">
                              {item.receivedQuantity || 0}
                            </td>
                            <td className="px-2.5 py-3 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">
                              {remaining}
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                step="1"
                                value={receiveQuantities[item._id] ?? remaining}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setReceiveQuantities((prev) => ({
                                    ...prev,
                                    [item._id]: Math.min(remaining, Math.max(0, val)),
                                  }));
                                }}
                                className="w-20 px-2 py-1 text-xs text-center rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#E4E4E7] dark:border-[#24272A] pt-4">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-[#E4E4E7] dark:border-[#24272A] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={receiveMutation.isPending}
                onClick={handleSubmitReceive}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {receiveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                Confirm Stock Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PURCHASE RETURN MODAL                                                  */}
      {/* ========================================================================= */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#24272A] pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Return Stock to Supplier
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record items returned to {order.supplier.name} and reduce inventory stock
                </p>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error in modal */}
            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Return Reason Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Return Reason</label>
              <select
                value={returnGeneralReason}
                onChange={(e) => setReturnGeneralReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
              >
                <option value="Damaged Goods">Damaged Goods</option>
                <option value="Defective / Quality Issue">Defective / Quality Issue</option>
                <option value="Wrong Items Delivered">Wrong Items Delivered</option>
                <option value="Over-shipped by Supplier">Over-shipped by Supplier</option>
                <option value="Expired Product">Expired Product</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            {/* Items to return table */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Items and Return Quantities
              </div>

              <div className="border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3.5 py-2.5">Item</th>
                      <th className="px-2.5 py-2.5 text-center">Received Qty</th>
                      <th className="px-3.5 py-2.5 text-right w-28">Return Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {order.items
                      .filter((i) => (i.receivedQuantity || 0) > 0)
                      .map((item) => {
                        const received = item.receivedQuantity || 0;

                        return (
                          <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                            <td className="px-3.5 py-3">
                              <div className="font-semibold text-foreground">{item.productName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {item.variantName} {item.sku ? `(${item.sku})` : ""}
                              </div>
                            </td>
                            <td className="px-2.5 py-3 text-center font-mono font-medium text-foreground">
                              {received}
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                max={received}
                                step="1"
                                value={returnQuantities[item._id] ?? 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setReturnQuantities((prev) => ({
                                    ...prev,
                                    [item._id]: Math.min(received, Math.max(0, val)),
                                  }));
                                }}
                                className="w-20 px-2 py-1 text-xs text-center rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Return Notes / Supplier Claim Reference
              </label>
              <textarea
                rows={2}
                placeholder="RMA number, credit note expectation, courier tracking..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#E4E4E7] dark:border-[#24272A] pt-4">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-[#E4E4E7] dark:border-[#24272A] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={returnMutation.isPending}
                onClick={handleSubmitReturn}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {returnMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                Process Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CANCEL ORDER MODAL                                                     */}
      {/* ========================================================================= */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#24272A] pb-3">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancel Purchase Order
              </h3>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel purchase order{" "}
              <span className="font-mono font-bold text-foreground">{order.orderId}</span>? This
              action cannot be undone.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Cancellation Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Reason for cancelling this purchase order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#E4E4E7] dark:border-[#24272A] pt-4">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-[#E4E4E7] dark:border-[#24272A] rounded-lg transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancelReason.trim() || undefined)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
