"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  User,
  AlertCircle,
  Layers,
  MapPin,
  Trash2,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import {
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  confirmSalesOrder,
  fulfillSalesOrder,
  cancelSalesOrder,
  getOrderReturns,
  SalesOrderItem,
  SalesReturnItem,
  OrderStatus,
  CreateOrderLineInput,
} from "lib/api/sales-api";
import { productsApi, ProductItem } from "lib/api/products-api";
import { getLocations, LocationItem } from "lib/api/inventory-api";
import { apiClient } from "lib/api/api-client";
import { queryKeys } from "lib/api/query-keys";

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

export default function SalesOrdersPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Active drawer & modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmOrderTarget, setConfirmOrderTarget] = useState<SalesOrderItem | null>(null);
  const [confirmLocationId, setConfirmLocationId] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Form state for creating order
  const [customerType, setCustomerType] = useState<"PERSON" | "COMPANY">("PERSON");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [orderLocationId, setOrderLocationId] = useState<string>("");
  const [orderCurrency, setOrderCurrency] = useState<string>("USD");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [orderLines, setOrderLines] = useState<
    Array<{
      productVariantId: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
      taxRatePercent: number;
      discountValue: number;
    }>
  >([]);

  // Queries
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: [...queryKeys.salesOrders, { status: statusFilter, search, page }],
    queryFn: () =>
      getSalesOrders({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: activeOrder, isLoading: isLoadingActiveOrder } = useQuery({
    queryKey: selectedOrderId ? queryKeys.salesOrder(selectedOrderId) : ["null-order"],
    queryFn: () => (selectedOrderId ? getSalesOrder(selectedOrderId) : null),
    enabled: !!selectedOrderId,
  });

  const { data: relatedReturnsData } = useQuery({
    queryKey: activeOrder ? queryKeys.orderReturns(activeOrder.orderId) : ["null-order-returns"],
    queryFn: () => (activeOrder ? getOrderReturns(activeOrder.orderId) : null),
    enabled: !!activeOrder,
  });
  const relatedReturns: SalesReturnItem[] = relatedReturnsData?.data || [];

  const { data: locationsData } = useQuery({
    queryKey: queryKeys.locations,
    queryFn: () => getLocations({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const { data: peopleData } = useQuery({
    queryKey: ["crm-people"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmPerson[] }>("/api/crm/people", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
  });

  const { data: companiesData } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmCompany[] }>("/api/crm/companies", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: createSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      setIsCreateModalOpen(false);
      resetCreateForm();
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to create sales order");
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: ({ id, locationId }: { id: string; locationId?: string }) =>
      confirmSalesOrder(id, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      if (selectedOrderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.salesOrder(selectedOrderId) });
      }
      setIsConfirmModalOpen(false);
      setConfirmOrderTarget(null);
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to confirm sales order");
    },
  });

  const fulfillOrderMutation = useMutation({
    mutationFn: fulfillSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      if (selectedOrderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.salesOrder(selectedOrderId) });
      }
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to fulfill sales order");
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelSalesOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders });
      if (selectedOrderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.salesOrder(selectedOrderId) });
      }
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || "Failed to cancel sales order");
    },
  });

  function resetCreateForm() {
    setSelectedCustomerId("");
    setOrderLocationId("");
    setOrderLines([]);
    setOrderNotes("");
    setActionError(null);
  }

  function handleAddLine(variant: any, product: ProductItem) {
    // Check if variant already added
    const existingIndex = orderLines.findIndex((l) => l.productVariantId === variant._id);
    if (existingIndex >= 0) {
      const updated = [...orderLines];
      updated[existingIndex].quantity += 1;
      setOrderLines(updated);
    } else {
      setOrderLines([
        ...orderLines,
        {
          productVariantId: variant._id,
          variantName: `${product.name} - ${variant.name}`,
          quantity: 1,
          unitPrice: variant.sellingPrice,
          taxRatePercent: 0,
          discountValue: 0,
        },
      ]);
    }
  }

  function handleRemoveLine(index: number) {
    setOrderLines(orderLines.filter((_, i) => i !== index));
  }

  function handleUpdateLineQuantity(index: number, qty: number) {
    if (qty < 1) return;
    const updated = [...orderLines];
    updated[index].quantity = qty;
    setOrderLines(updated);
  }

  function handleUpdateLinePrice(index: number, price: number) {
    if (price < 0) return;
    const updated = [...orderLines];
    updated[index].unitPrice = price;
    setOrderLines(updated);
  }

  // Calculate live preview totals
  const previewSubtotal = orderLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const previewGrandTotal = previewSubtotal;

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomerId) {
      setActionError("Please select a customer.");
      return;
    }
    if (orderLines.length === 0) {
      setActionError("Please add at least one line item to the order.");
      return;
    }

    const payloadLines: CreateOrderLineInput[] = orderLines.map((l) => ({
      productVariantId: l.productVariantId,
      quantity: l.quantity,
      customUnitPrice: l.unitPrice,
      taxRatePercent: l.taxRatePercent || 0,
      discount: l.discountValue > 0 ? { type: "FIXED", value: l.discountValue } : null,
    }));

    createOrderMutation.mutate({
      customerType,
      customerId: selectedCustomerId,
      locationId: orderLocationId || null,
      currency: orderCurrency,
      notes: orderNotes || null,
      lines: payloadLines,
    });
  }

  function handleOpenConfirmDialog(order: SalesOrderItem) {
    setConfirmOrderTarget(order);
    const locId = typeof order.locationId === "object" && order.locationId !== null
      ? order.locationId._id
      : (order.locationId as string) || "";
    setConfirmLocationId(locId);
    setActionError(null);
    setIsConfirmModalOpen(true);
  }

  function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmOrderTarget) return;
    if (!confirmLocationId) {
      setActionError("Please select a fulfillment warehouse location.");
      return;
    }
    confirmOrderMutation.mutate({
      id: confirmOrderTarget.orderId,
      locationId: confirmLocationId,
    });
  }

  // Helper badge color
  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            DRAFT
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
            CONFIRMED
          </span>
        );
      case "FULFILLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Truck className="w-3 h-3 mr-1 text-emerald-600" />
            FULFILLED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
            CANCELLED
          </span>
        );
    }
  }

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Sales Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage commercial orders, track lifecycle transitions, and fulfill inventory.
          </p>
        </div>
        <button
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </button>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          {["ALL", "DRAFT", "CONFIRMED", "FULFILLED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === st
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoadingOrders ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading sales orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No sales orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "Try clearing your search query or status filter."
                : "Get started by creating your first sales order."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Lines</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      {order.orderId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        {order.customer.customerType === "COMPANY" ? (
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {order.customer.displayName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {order.customer.email || order.customer.phone || "No direct contact"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      ${order.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.orderId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {order.status === "DRAFT" && (
                          <button
                            onClick={() => handleOpenConfirmDialog(order)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
                          >
                            Confirm
                          </button>
                        )}

                        {order.status === "CONFIRMED" && (
                          <button
                            onClick={() => fulfillOrderMutation.mutate(order.orderId)}
                            disabled={fulfillOrderMutation.isPending}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                          >
                            Fulfill
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

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Sales Order</h2>
                <p className="text-xs text-slate-500">Draft a new commercial order with real CRM customer and product lines.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {actionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Customer Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  1. Customer Information
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("PERSON");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      customerType === "PERSON"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Person
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("COMPANY");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      customerType === "COMPANY"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Company
                  </button>
                </div>

                {customerType === "PERSON" ? (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select a Person...</option>
                    {(peopleData || []).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.displayName} {p.emails?.[0]?.email ? `(${p.emails[0].email})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select a Company...</option>
                    {(companiesData || []).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Warehouse Location Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2. Fulfillment Location
                </label>
                <select
                  value={orderLocationId}
                  onChange={(e) => setOrderLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select warehouse location (can set on confirmation)...</option>
                  {(locationsData?.data || []).map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Picker */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    3. Order Line Items
                  </label>
                </div>

                {/* Catalog Quick Add */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 mb-2">Available Catalog Products:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1.5">
                    {(productsData?.data || []).flatMap((p) =>
                      (p.variants || []).map((v) => (
                        <div
                          key={v._id}
                          className="flex justify-between items-center text-xs py-1 px-2 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>{" "}
                            <span className="text-slate-500">— {v.name}</span>{" "}
                            <span className="text-primary font-mono">${v.sellingPrice.toFixed(2)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddLine(v, p)}
                            className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium"
                          >
                            + Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected Lines Table */}
                {orderLines.length === 0 ? (
                  <div className="text-xs text-center py-4 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No items added yet. Click "+ Add" above to select products.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5 w-20">Qty</th>
                          <th className="p-2.5 w-24">Price</th>
                          <th className="p-2.5 w-24">Total</th>
                          <th className="p-2.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orderLines.map((line, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-medium">{line.variantName}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) => handleUpdateLineQuantity(idx, parseInt(e.target.value) || 1)}
                                className="w-16 px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={line.unitPrice}
                                onChange={(e) => handleUpdateLinePrice(idx, parseFloat(e.target.value) || 0)}
                                className="w-20 px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </td>
                            <td className="p-2.5 font-mono font-semibold">
                              ${(line.quantity * line.unitPrice).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="text-slate-400 hover:text-rose-500"
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

              {/* Totals Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Subtotal:</span>
                  <span className="font-mono">${previewSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-primary text-base">${previewGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  4. Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Optional delivery notes or customer reference..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending || orderLines.length === 0}
                  className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {createOrderMutation.isPending ? "Creating..." : "Save Draft Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ORDER MODAL */}
      {isConfirmModalOpen && confirmOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Confirm Sales Order: {confirmOrderTarget.orderId}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Confirming this order locks the commercial agreement and synchronously deducts stock from inventory for every line item.
            </p>

            {actionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Fulfillment Warehouse:
                </label>
                <select
                  required
                  value={confirmLocationId}
                  onChange={(e) => setConfirmLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select location...</option>
                  {(locationsData?.data || []).map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmOrderMutation.isPending || !confirmLocationId}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {confirmOrderMutation.isPending ? "Deducting Stock..." : "Confirm & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL DRAWER */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    {selectedOrderId}
                  </span>
                  {activeOrder && getStatusBadge(activeOrder.status)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Created {activeOrder ? new Date(activeOrder.createdAt).toLocaleString() : ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingActiveOrder || !activeOrder ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading order details...</div>
              ) : (
                <>
                  {actionError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {/* Customer Snapshot Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Customer Snapshot
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                      {activeOrder.customer.customerType === "COMPANY" ? (
                        <Building2 className="w-4 h-4 text-slate-400" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                      {activeOrder.customer.displayName}
                    </div>
                    {activeOrder.customer.email && (
                      <div className="text-xs text-slate-500">Email: {activeOrder.customer.email}</div>
                    )}
                    {activeOrder.customer.phone && (
                      <div className="text-xs text-slate-500">Phone: {activeOrder.customer.phone}</div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Ordered Line Items ({activeOrder.lines.length})
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                          <tr>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeOrder.lines.map((line, i) => (
                            <tr key={i}>
                              <td className="p-2.5">
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {line.variantName}
                                </div>
                                {line.sku && <div className="text-[10px] text-slate-400">SKU: {line.sku}</div>}
                              </td>
                              <td className="p-2.5 text-center font-mono">{line.quantity}</td>
                              <td className="p-2.5 text-right font-mono">${line.unitPrice.toFixed(2)}</td>
                              <td className="p-2.5 text-right font-mono font-semibold">
                                ${line.lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">${activeOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {activeOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-500">
                        <span>Discount</span>
                        <span className="font-mono">-${activeOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {activeOrder.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Tax</span>
                        <span className="font-mono">+${activeOrder.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Grand Total</span>
                      <span className="font-mono text-primary">${activeOrder.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Metadata */}
                  {activeOrder.notes && (
                    <div className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Notes: </span>
                      {activeOrder.notes}
                    </div>
                  )}

                  {activeOrder.cancelledReason && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                      <span className="font-semibold">Cancellation Reason: </span>
                      {activeOrder.cancelledReason}
                    </div>
                  )}

                  {/* Related Returns */}
                  {relatedReturns && relatedReturns.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Related Returns ({relatedReturns.length})
                      </div>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                        {relatedReturns.map((ret) => (
                          <div key={ret.returnId} className="p-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                {ret.returnId}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(ret.createdAt).toLocaleDateString()} • {ret.lines.length} items • ${ret.refundAmount.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  ret.status === "CONFIRMED"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : ret.status === "DRAFT"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                }`}
                              >
                                {ret.status}
                              </span>
                              <Link
                                href="/sales/returns"
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="View in Returns"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                    {activeOrder.status === "DRAFT" && (
                      <button
                        onClick={() => handleOpenConfirmDialog(activeOrder)}
                        className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Confirm Order (Deduct Stock)
                      </button>
                    )}

                    {activeOrder.status === "CONFIRMED" && (
                      <>
                        <button
                          onClick={() => fulfillOrderMutation.mutate(activeOrder.orderId)}
                          disabled={fulfillOrderMutation.isPending}
                          className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          {fulfillOrderMutation.isPending ? "Fulfilling..." : "Mark as Fulfilled"}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this order? Deducted stock will be restored.")) {
                              cancelOrderMutation.mutate({ id: activeOrder.orderId });
                            }
                          }}
                          disabled={cancelOrderMutation.isPending}
                          className="w-full py-2 px-4 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        >
                          {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order (Restore Stock)"}
                        </button>
                      </>
                    )}

                    {(activeOrder.status === "CONFIRMED" || activeOrder.status === "FULFILLED") && (
                      <Link
                        href={`/sales/returns?orderId=${activeOrder.orderId}`}
                        className="w-full py-2 px-4 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-center gap-2 text-center"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Create Sales Return
                      </Link>
                    )}

                    {activeOrder.status === "FULFILLED" && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs text-center font-medium">
                        Order has been successfully fulfilled. Post-fulfillment item returns require the Sales Return process.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
