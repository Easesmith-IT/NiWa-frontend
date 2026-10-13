"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Trash2,
  XCircle,
} from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { productsApi, type ProductItem } from "../../../../lib/api/products-api";
import type { CrmPerson, CrmCompany } from "../../../../lib/api/api-types";
import { listContacts, createPersonFromContact } from "../../../../features/contacts/contact.api";
import { fetchQuotes } from "../../../../features/sales/quotes.api";
import type {
  CurrencyTotal,
  PaginatedQuotesData,
  QuoteItem,
} from "../../../../features/sales/quotes.types";
import {
  formatCurrency,
  getCurrencySymbol,
  DEFAULT_CURRENCY,
} from "../../../../features/sales/utils/currency-formatter";

interface CreateQuotePayload {
  customerType: "PERSON" | "COMPANY";
  customerId: string;
  currency: string;
  validUntil: string | null;
  notes?: string | null;
  terms?: string | null;
  lines: Array<{
    productId?: string;
    productVariantId: string;
    quantity: number;
    customUnitPrice: number;
    taxRatePercent: number;
  }>;
}

export default function QuotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useQuery<PaginatedQuotesData>({
    queryKey: ["sales-quotes", statusFilter, page, debouncedSearch.trim()],
    queryFn: () =>
      fetchQuotes({
        status: statusFilter,
        page,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  const quotes = paginatedData?.quotes ?? [];
  const total = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;

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

  // Quotation Create Form State
  const [customerType, setCustomerType] = useState<"PERSON" | "COMPANY">("PERSON");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [quoteCurrency, setQuoteCurrency] = useState("INR");
  const [quoteValidUntil, setQuoteValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteTerms, setQuoteTerms] = useState("");
  const [quoteLines, setQuoteLines] = useState<
    Array<{
      productVariantId: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
      taxRatePercent: number;
    }>
  >([]);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const { data: contactsData } = useQuery({
    queryKey: ["contacts-for-quote-autofill"],
    queryFn: () => listContacts({ limit: 150 }),
  });

  const unlinkedContacts = useMemo(
    () => (contactsData?.data || []).filter((c) => !c.personId),
    [contactsData]
  );

  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const resetCreateForm = () => {
    setSelectedCustomerId("");
    setCustomerType("PERSON");
    setQuoteCurrency("INR");
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setQuoteValidUntil(d.toISOString().split("T")[0]);
    setQuoteNotes("");
    setQuoteTerms("");
    setQuoteLines([]);
    setCreateError(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
    if (searchParams?.has("action")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      const nextQuery = params.toString();
      const currentPath = pathname || "/sales/quotes";
      router.replace(nextQuery ? `${currentPath}?${nextQuery}` : currentPath, { scroll: false });
    }
  };

  const createQuoteMutation = useMutation({
    mutationFn: async (payload: CreateQuotePayload) => {
      const res = await apiClient.post("/api/sales/quotes", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-quotes"] });
      handleCloseCreateModal();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create quotation";
      setCreateError(message);
    },
  });

  const handleAddQuoteLine = (variant: any, product: ProductItem) => {
    const existingIndex = quoteLines.findIndex((l) => l.productVariantId === variant._id);
    if (existingIndex >= 0) {
      const updated = [...quoteLines];
      updated[existingIndex].quantity += 1;
      setQuoteLines(updated);
    } else {
      setQuoteLines([
        ...quoteLines,
        {
          productVariantId: variant._id,
          variantName: `${product.name} - ${variant.name}`,
          quantity: 1,
          unitPrice: variant.sellingPrice || product.sellingPrice || 0,
          taxRatePercent: 0,
        },
      ]);
    }
  };

  const handleRemoveQuoteLine = (index: number) => {
    setQuoteLines(quoteLines.filter((_, i) => i !== index));
  };

  const handleUpdateQuoteLineQuantity = (index: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...quoteLines];
    updated[index].quantity = qty;
    setQuoteLines(updated);
  };

  const handleUpdateQuoteLinePrice = (index: number, price: number) => {
    if (price < 0) return;
    const updated = [...quoteLines];
    updated[index].unitPrice = price;
    setQuoteLines(updated);
  };

  const previewSubtotal = useMemo(
    () => quoteLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [quoteLines]
  );
  const previewTax = useMemo(
    () =>
      quoteLines.reduce(
        (sum, l) => sum + (l.quantity * l.unitPrice * (l.taxRatePercent || 0)) / 100,
        0
      ),
    [quoteLines]
  );
  const previewGrandTotal = previewSubtotal + previewTax;

  const handleCreateQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setCreateError("Please select a customer.");
      return;
    }
    if (quoteLines.length === 0) {
      setCreateError("Please add at least one line item to the quotation.");
      return;
    }

    let resolvedCustomerId = selectedCustomerId;
    if (customerType === "PERSON" && selectedCustomerId.startsWith("contact:")) {
      const contactId = selectedCustomerId.replace("contact:", "");
      const targetContact = unlinkedContacts.find((c) => c._id === contactId);
      try {
        const promoted = await createPersonFromContact(contactId, {
          displayName: targetContact?.displayName || "Customer",
        });
        const newPersonId = promoted?.data?.person?._id;
        if (!newPersonId) {
          throw new Error("Could not create CRM customer profile from contact.");
        }
        resolvedCustomerId = newPersonId;
        setSelectedCustomerId(newPersonId);
        await queryClient.invalidateQueries({ queryKey: ["crm-people"] });
        await queryClient.invalidateQueries({ queryKey: ["contacts-for-quote-autofill"] });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err instanceof Error ? err.message : "Failed to promote WhatsApp contact to CRM Person.");
        setCreateError(msg);
        return;
      }
    }

    const payload = {
      customerType,
      customerId: resolvedCustomerId,
      currency: quoteCurrency,
      validUntil: quoteValidUntil ? new Date(quoteValidUntil).toISOString() : null,
      notes: quoteNotes.trim() || null,
      terms: quoteTerms.trim() || null,
      lines: quoteLines.map((l) => ({
        productVariantId: l.productVariantId,
        quantity: l.quantity,
        customUnitPrice: l.unitPrice,
        taxRatePercent: l.taxRatePercent || 0,
      })),
    };

    createQuoteMutation.mutate(payload);
  };

  const stats = useMemo(() => {
    if (paginatedData?.summary) {
      return {
        total: paginatedData.summary.total,
        sentCount: paginatedData.summary.sentCount,
        acceptedCount: paginatedData.summary.acceptedCount,
        totalValueByCurrency: paginatedData.summary.totalValueByCurrency || [],
        totalValue: paginatedData.summary.totalValue ?? null,
      };
    }
    const totalCount = paginatedData?.total ?? quotes.length;
    const sentCount = quotes.filter((q) => q.status === "SENT").length;
    const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;

    // Group active quotes by currency for fallback
    const currencyMap = new Map<string, { totalValue: number; count: number }>();
    for (const q of quotes) {
      if (q.status === "DRAFT" || q.status === "SENT" || q.status === "ACCEPTED") {
        const curr = (q.currency || DEFAULT_CURRENCY).toUpperCase();
        const existing = currencyMap.get(curr) || { totalValue: 0, count: 0 };
        existing.totalValue += q.grandTotal || 0;
        existing.count += 1;
        currencyMap.set(curr, existing);
      }
    }
    const totalValueByCurrency: CurrencyTotal[] = Array.from(currencyMap.entries())
      .map(([currency, data]) => ({
        currency,
        totalValue: Math.round(data.totalValue * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    const totalValue =
      totalValueByCurrency.length === 0
        ? 0
        : totalValueByCurrency.length === 1
        ? totalValueByCurrency[0].totalValue
        : null;

    return { total: totalCount, sentCount, acceptedCount, totalValueByCurrency, totalValue };
  }, [paginatedData?.summary, paginatedData?.total, quotes]);

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
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {statusFilter !== "ALL" || debouncedSearch
              ? `${total} matching filter / ${stats.total} workspace total`
              : "Workspace recorded proposals"}
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sent / Awaiting</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.sentCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Workspace review stage</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Accepted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.acceptedCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Workspace ready for order</p>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quoted Value</span>
            <span className="text-xs font-bold text-foreground">
              {stats.totalValueByCurrency.length === 1
                ? getCurrencySymbol(stats.totalValueByCurrency[0].currency)
                : stats.totalValueByCurrency.length > 1
                ? "MULTI"
                : getCurrencySymbol(DEFAULT_CURRENCY)}
            </span>
          </div>
          {stats.totalValueByCurrency.length === 0 ? (
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(0, DEFAULT_CURRENCY)}
            </p>
          ) : stats.totalValueByCurrency.length === 1 ? (
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(
                stats.totalValueByCurrency[0].totalValue,
                stats.totalValueByCurrency[0].currency
              )}
            </p>
          ) : (
            <div className="mt-2 space-y-1">
              {stats.totalValueByCurrency.map((c) => (
                <div key={c.currency} className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{c.currency}</span>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(c.totalValue, c.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Workspace active pipeline
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-white p-4 shadow-xs dark:border-[#282B2E] dark:bg-[#17191B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
        ) : quotes.length === 0 ? (
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
                {quotes.map((q) => (
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#282B2E] dark:bg-[#191B1D]">
            <p className="text-xs text-muted-foreground">
              Showing Page {page} of {totalPages} ({total} total quotes)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quotation Creation Dialog */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCreateModal();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>New Quotation</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateQuoteSubmit} className="space-y-4 pt-2">
            {createError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {createError}
              </div>
            )}

            {/* Customer Selection */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Customer Type
                </label>
                <div className="flex rounded-md border border-[#E4E4E7] dark:border-[#303438] p-0.5 bg-[#FAFAFA] dark:bg-[#17191B]">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("PERSON");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-1 text-xs font-medium rounded ${
                      customerType === "PERSON"
                        ? "bg-white dark:bg-[#202326] shadow-xs text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Individual (Person)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("COMPANY");
                      setSelectedCustomerId("");
                    }}
                    className={`flex-1 py-1 text-xs font-medium rounded ${
                      customerType === "COMPANY"
                        ? "bg-white dark:bg-[#202326] shadow-xs text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Select {customerType === "PERSON" ? "Customer / WhatsApp Contact" : "Company"} *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-[#E4E4E7] dark:border-[#303438] bg-white dark:bg-[#17191B] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select a customer...</option>
                  {customerType === "PERSON" ? (
                    <>
                      {(peopleData || []).length > 0 && (
                        <optgroup label="CRM Customers (People)">
                          {(peopleData || []).map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim()}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {unlinkedContacts.length > 0 && (
                        <optgroup label="WhatsApp Contacts (Auto-creates CRM Profile)">
                          {unlinkedContacts.map((c) => (
                            <option key={`contact:${c._id}`} value={`contact:${c._id}`}>
                              {c.displayName} ({c.phoneNumber}) — WhatsApp Contact
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  ) : (
                    (companiesData || []).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Currency & Valid Until */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Currency
                </label>
                <select
                  value={quoteCurrency}
                  onChange={(e) => setQuoteCurrency(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-[#E4E4E7] dark:border-[#303438] bg-white dark:bg-[#17191B] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Valid Until
                </label>
                <Input
                  type="date"
                  value={quoteValidUntil}
                  onChange={(e) => setQuoteValidUntil(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Product Items Selection */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Add Products & Line Items *
              </label>
              <div className="border border-[#E4E4E7] dark:border-[#303438] rounded-lg p-3 bg-[#FAFAFA] dark:bg-[#17191B] space-y-2">
                <div className="max-h-28 overflow-y-auto space-y-1 niwa-scrollbar">
                  {(productsData?.data || []).flatMap((p) =>
                    (p.variants || []).map((v) => (
                      <div
                        key={v._id}
                        className="flex justify-between items-center text-xs py-1 px-2 hover:bg-white dark:hover:bg-[#202326] rounded transition-colors"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-foreground">{p.name}</span>{" "}
                          <span className="text-muted-foreground">— {v.name}</span>{" "}
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            ₹{v.sellingPrice || p.sellingPrice || 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddQuoteLine(v, p)}
                          className="shrink-0 px-2 py-0.5 rounded bg-[#176B4D]/10 hover:bg-[#176B4D]/20 text-[#176B4D] dark:text-[#63B592] font-medium text-xs"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Selected Lines Table */}
            {quoteLines.length === 0 ? (
              <div className="text-xs text-center py-4 text-muted-foreground border border-dashed border-[#E4E4E7] dark:border-[#303438] rounded-lg">
                No items added yet. Click &quot;+ Add&quot; above to select products.
              </div>
            ) : (
              <div className="border border-[#E4E4E7] dark:border-[#303438] rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAFAFA] dark:bg-[#1F2225] text-muted-foreground uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 w-20">Qty</th>
                      <th className="p-2 w-28">Price</th>
                      <th className="p-2 w-20">Tax %</th>
                      <th className="p-2 w-24 text-right">Total</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#303438]">
                    {quoteLines.map((line, idx) => (
                      <tr key={line.productVariantId + idx}>
                        <td className="p-2 font-medium text-foreground">{line.variantName}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleUpdateQuoteLineQuantity(idx, parseInt(e.target.value) || 1)}
                            className="h-7 text-xs w-16"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => handleUpdateQuoteLinePrice(idx, parseFloat(e.target.value) || 0)}
                            className="h-7 text-xs w-24 font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={line.taxRatePercent}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...quoteLines];
                              updated[idx].taxRatePercent = val;
                              setQuoteLines(updated);
                            }}
                            className="h-7 text-xs w-16 font-mono"
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-foreground">
                          ₹{(line.quantity * line.unitPrice * (1 + (line.taxRatePercent || 0) / 100)).toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteLine(idx)}
                            className="text-muted-foreground hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals Summary */}
            <div className="rounded-lg border border-[#E4E4E7] dark:border-[#303438] p-3 bg-[#FAFAFA] dark:bg-[#17191B] flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Summary</span>
              <div className="flex gap-4 font-mono">
                <span>Subtotal: ₹{previewSubtotal.toFixed(2)}</span>
                <span>Tax: ₹{previewTax.toFixed(2)}</span>
                <span className="font-bold text-foreground">Grand Total: ₹{previewGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Customer Notes
                </label>
                <Textarea
                  placeholder="Special pricing, remarks, or proposal notes..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="text-xs h-16 resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Terms & Conditions
                </label>
                <Textarea
                  placeholder="Payment terms, delivery estimates, validity..."
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  className="text-xs h-16 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#303438]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseCreateModal}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createQuoteMutation.isPending || quoteLines.length === 0 || !selectedCustomerId}
                className="bg-[#176B4D] text-xs text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
              >
                {createQuoteMutation.isPending ? "Creating Quotation..." : "Create Quotation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
