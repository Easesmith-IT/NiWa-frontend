"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  AlertCircle,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Boxes,
  Building2,
} from "lucide-react";
import {
  purchasingApi,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchasePaymentStatus,
} from "lib/api/purchasing-api";
import { queryKeys } from "lib/api/query-keys";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Queries
  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      ...queryKeys.purchaseOrders,
      { page, search, status: statusFilter, paymentStatus: paymentFilter },
    ],
    queryFn: () =>
      purchasingApi.getPurchaseOrders({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "ALL" ? paymentFilter : undefined,
      }),
  });

  const { data: summaryResponse } = useQuery({
    queryKey: queryKeys.purchasingSummary,
    queryFn: () => purchasingApi.getPurchasingSummary(),
  });

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination;
  const summary = summaryResponse?.data;

  // Render Status Badge
  const renderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case "ORDERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Ordered
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Boxes className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Partially Received
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Received
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
            {status}
          </span>
        );
    }
  };

  // Render Payment Badge
  const renderPaymentBadge = (status: PurchasePaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
            Partially Paid
          </span>
        );
      case "UNPAID":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Unpaid
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto bg-[#FBFBFA] dark:bg-[#0D0F11]">
      {/* Top Header */}
      <div className="border-b border-[#E4E4E7] dark:border-[#24272A] bg-white dark:bg-[#101214] px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#176B4D] dark:text-[#63B592] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#176B4D] dark:text-[#63B592]" />
              Purchase Orders
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Replenish inventory stock and manage supplier procurement.
            </p>
          </div>

          {canManage && (
            <Link
              href="/purchasing/orders/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#176B4D] text-white px-4 py-2 text-sm font-medium hover:bg-[#13573E] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#176B4D]/30"
            >
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Link>
          )}
        </div>

        {/* Operational Metrics Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Total Orders Value
              </span>
              <span className="text-lg font-semibold text-foreground mt-0.5 block">
                {formatCurrency(summary.totalPurchaseValue)}
              </span>
            </div>
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Total Paid
              </span>
              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {formatCurrency(summary.totalPaid)}
              </span>
            </div>
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Balance Outstanding
              </span>
              <span className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {formatCurrency(summary.totalOutstanding)}
              </span>
            </div>
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                Open Orders
              </span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {summary.openOrdersCount} open
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-[#101214] p-3 rounded-xl border border-[#E4E4E7] dark:border-[#24272A] shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO number, supplier, or product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ORDERED">Ordered</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Payments</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white dark:bg-[#101214] rounded-xl border border-[#E4E4E7] dark:border-[#24272A] shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#176B4D]" />
              <p className="text-sm">Loading purchase orders...</p>
            </div>
          ) : isError ? (
            <div className="py-16 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">
                Unable to load purchase orders
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {(error as any)?.response?.data?.message ||
                  (error as any)?.message ||
                  "An unexpected network error occurred while fetching orders."}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No purchase orders yet
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Create your first purchase order to replenish inventory from
                suppliers.
              </p>
              {canManage && (
                <Link
                  href="/purchasing/orders/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#176B4D] text-white px-4 py-2 text-xs font-medium hover:bg-[#13573E] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Purchase Order
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">PO Number</th>
                      <th className="px-4 py-3.5">Supplier</th>
                      <th className="px-4 py-3.5">Order Date</th>
                      <th className="px-4 py-3.5 text-right">Items</th>
                      <th className="px-4 py-3.5 text-right">Total Amount</th>
                      <th className="px-4 py-3.5 text-center">Payment</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {orders.map((po) => {
                      const totalUnits = po.items.reduce(
                        (acc, i) => acc + i.orderedQuantity,
                        0
                      );
                      const receivedUnits = po.items.reduce(
                        (acc, i) => acc + (i.receivedQuantity || 0),
                        0
                      );

                      return (
                        <tr
                          key={po._id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group"
                        >
                          <td className="px-5 py-3.5 font-mono font-medium text-foreground">
                            <Link
                              href={`/purchasing/orders/${po._id}`}
                              className="text-[#176B4D] dark:text-[#63B592] hover:underline flex items-center gap-1.5"
                            >
                              {po.orderId}
                            </Link>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-medium text-foreground text-sm">
                              {po.supplier.name}
                            </div>
                            {po.supplier.phone && (
                              <div className="text-[11px] text-muted-foreground">
                                {po.supplier.phone}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(po.orderDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {po.items.length} lines
                            </span>{" "}
                            ({receivedUnits}/{totalUnits} pcs)
                          </td>

                          <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                            {formatCurrency(po.totalAmount, po.currency)}
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {renderPaymentBadge(po.paymentStatus)}
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {renderStatusBadge(po.status)}
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/purchasing/orders/${po._id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </Link>

                              {canManage &&
                                (po.status === "ORDERED" ||
                                  po.status === "PARTIALLY_RECEIVED") && (
                                  <Link
                                    href={`/purchasing/orders/${po._id}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 rounded-md transition-colors"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    Receive
                                  </Link>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {pagination && pagination.pages > 1 && (
                <div className="px-5 py-3 border-t border-[#E4E4E7] dark:border-[#24272A] flex items-center justify-between text-xs text-muted-foreground bg-zinc-50/40 dark:bg-zinc-900/40">
                  <div>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(page * pagination.limit, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {pagination.total}
                    </span>{" "}
                    orders
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-medium text-foreground">
                      {page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page >= pagination.pages}
                      className="p-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
