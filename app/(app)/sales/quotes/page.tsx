"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Plus,
  Search,
  Send,
  XCircle,
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

interface QuoteItem {
  _id?: string;
  quoteId: string;
  customer?: {
    displayName: string;
    email?: string;
    phone?: string;
    customerType: "PERSON" | "COMPANY";
  };
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  currency: string;
  subtotal: number;
  discountAmount: number;
  netAmount: number;
  taxAmount: number;
  grandTotal: number;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
  lines?: any[];
}

export default function QuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const { data: quotes = [], isLoading, isError, error } = useQuery<QuoteItem[]>({
    queryKey: ["sales-quotes", statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await apiClient.get<QuoteItem[] | { data: QuoteItem[] }>("/api/sales/quotes", { params });
      return Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: (quoteId: string) => apiClient.post(`/api/sales/quotes/${quoteId}/send`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales-quotes"] }),
  });

  const acceptMutation = useMutation({
    mutationFn: (quoteId: string) => apiClient.post(`/api/sales/quotes/${quoteId}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales-quotes"] }),
  });

  const declineMutation = useMutation({
    mutationFn: ({ quoteId, reason }: { quoteId: string; reason: string }) =>
      apiClient.post(`/api/sales/quotes/${quoteId}/decline`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales-quotes"] }),
  });

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        q.quoteId.toLowerCase().includes(term) ||
        (q.customer?.displayName && q.customer.displayName.toLowerCase().includes(term)) ||
        (q.notes && q.notes.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [quotes, search]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const sentCount = quotes.filter((q) => q.status === "SENT").length;
    const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;
    const totalValue = quotes
      .filter((q) => q.status !== "DECLINED" && q.status !== "EXPIRED")
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);
    return { total, sentCount, acceptedCount, totalValue };
  }, [quotes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Quotations
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Create pricing estimates, track customer proposals, and convert accepted quotes to orders.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Quote
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Quotes</span>
            <FileText className="h-4 w-4 text-[#176B4D] dark:text-[#63B592]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Recorded proposals</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sent / Awaiting</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.sentCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Customer review stage</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Accepted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.acceptedCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Ready for sales order</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quoted Value</span>
            <span className="text-xs font-bold text-foreground">$</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">${stats.totalValue.toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Active pipeline value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-[#176B4D] text-white dark:bg-[#208560]"
                  : "bg-[#F4F4F5] text-muted-foreground hover:bg-[#E4E4E7] dark:bg-[#25282B] dark:hover:bg-[#303438]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8.5 border-[#E4E4E7] bg-[#FAFAFA] pl-8 text-xs dark:border-[#282B2E] dark:bg-[#191B1D]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes or customers…"
            value={search}
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading quotes…</div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-destructive">
            Failed to load quotes: {(error as Error)?.message || "Unknown error"}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">No quotes found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your filters or search terms."
                : "Create your first quote to send proposals to customers."}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="mt-4 bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Quote
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-[#282B2E] dark:bg-[#191B1D]">
                <tr>
                  <th className="px-4 py-3">Quote ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#282B2E]">
                {filteredQuotes.map((q) => (
                  <tr key={q.quoteId} className="hover:bg-[#FAFAFA] dark:hover:bg-[#1D2022]">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {q.quoteId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{q.customer?.displayName || "—"}</p>
                      {q.customer?.email && (
                        <p className="text-[10px] text-muted-foreground">{q.customer.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      ${q.grandTotal?.toLocaleString() || "0"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          q.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : q.status === "SENT"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : q.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : q.status === "DECLINED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {q.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendMutation.mutate(q.quoteId)}
                          disabled={sendMutation.isPending}
                          className="h-7 text-[11px]"
                        >
                          <Send className="mr-1 h-3 w-3" /> Send
                        </Button>
                      )}
                      {q.status === "SENT" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acceptMutation.mutate(q.quoteId)}
                            disabled={acceptMutation.isPending}
                            className="h-7 text-[11px] text-emerald-600 hover:bg-emerald-50"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => declineMutation.mutate({ quoteId: q.quoteId, reason: "Customer declined" })}
                            disabled={declineMutation.isPending}
                            className="h-7 text-[11px] text-rose-600 hover:bg-rose-50"
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {q.status === "ACCEPTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/sales/orders?quoteId=${q.quoteId}`)}
                          className="h-7 text-[11px] text-[#176B4D] hover:bg-[#EDF8F3] dark:text-[#63B592] dark:hover:bg-[#15271F]"
                        >
                          Create Order <ArrowRight className="ml-1 h-3 w-3" />
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

      {/* Quick Create Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>New Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              To build full line items with products and catalog pricing, you can initiate a quotation or generate directly from an active deal in Deals Pipeline.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  router.push("/deals");
                }}
                variant="outline"
                className="flex-1 text-xs"
              >
                From Deal Pipeline
              </Button>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  router.push("/sales/orders");
                }}
                className="flex-1 bg-[#176B4D] text-xs text-white hover:bg-[#12583F]"
              >
                Go to Sales Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
