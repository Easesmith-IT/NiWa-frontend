"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Clock,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

interface PurchaseReturnItem {
  _id: string;
  returnId: string;
  purchaseOrderId: string;
  orderId?: string;
  supplierSnapshot?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
  totalAmount: number;
  totalQuantity?: number;
  reason: string;
  status: string;
  createdAt: string;
  lines?: any[];
}

export default function PurchasingReturnsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: returns = [], isLoading, isError, error } = useQuery<PurchaseReturnItem[]>({
    queryKey: ["purchasing-returns"],
    queryFn: async () => {
      const res = await apiClient.get<PurchaseReturnItem[] | { data: PurchaseReturnItem[] }>("/api/purchasing/returns");
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const term = search.toLowerCase().trim();
      const supplierName = r.supplier?.name || r.supplierSnapshot?.name || "";
      const matchesSearch =
        !term ||
        r.returnId?.toLowerCase().includes(term) ||
        r.purchaseOrderId?.toLowerCase().includes(term) ||
        supplierName.toLowerCase().includes(term) ||
        (r.reason && r.reason.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [returns, search]);

  const stats = useMemo(() => {
    const totalCount = returns.length;
    const totalValue = returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    return { totalCount, totalValue };
  }, [returns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/purchasing/orders")}
              className="h-7 w-7 p-0 text-muted-foreground"
              aria-label="Back to orders"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Purchase Returns
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage goods returned to suppliers, record stock reductions, and track supplier debit adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/purchasing/orders")}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Purchase Orders
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Return
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Returns</span>
            <RotateCcw className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Supplier return documents</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Value Returned</span>
            <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">${stats.totalValue.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Credited or refunded value</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Inventory Integration</span>
            <Boxes className="h-4 w-4 text-[#176B4D] dark:text-[#63B592]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">Automatic</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Reduces warehouse stock atomically</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8.5 border-[#E4E4E7] bg-[#FAFAFA] pl-8 text-xs dark:border-[#282B2E] dark:bg-[#191B1D]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search return ID, PO number, or supplier…"
            value={search}
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading purchase returns…</div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-destructive">
            Failed to load purchase returns: {(error as Error)?.message || "Unknown error"}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">No purchase returns recorded</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? "No returns match your search."
                : "Create a return directly from a received purchase order."}
            </p>
            <Button
              onClick={() => router.push("/purchasing/orders")}
              size="sm"
              className="mt-4 bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
            >
              View Purchase Orders
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-[#282B2E] dark:bg-[#191B1D]">
                <tr>
                  <th className="px-4 py-3">Return ID</th>
                  <th className="px-4 py-3">PO Reference</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#282B2E]">
                {filteredReturns.map((r) => (
                  <tr key={r.returnId} className="hover:bg-[#FAFAFA] dark:hover:bg-[#1D2022]">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {r.returnId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {r.purchaseOrderId || r.orderId || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.supplier?.name || r.supplierSnapshot?.name || "Supplier"}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      ${r.totalAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.reason || "Supplier Return"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.purchaseOrderId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/purchasing/orders/${r.purchaseOrderId}`)}
                          className="h-7 text-[11px]"
                        >
                          View PO <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Create Purchase Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Purchase returns are initiated directly against received or partially received Purchase Orders to ensure verified quantity invariants and warehouse stock deduction.
            </p>
            <Button
              onClick={() => {
                setIsCreateOpen(false);
                router.push("/purchasing/orders");
              }}
              className="w-full bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
            >
              Select Purchase Order to Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
