"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  ShoppingCart,
  Send,
  FileText,
} from "lucide-react";
import {
  purchasingApi,
  CreatePurchaseOrderInput,
  CreatePurchaseOrderItemInput,
} from "lib/api/purchasing-api";
import { productsApi, ProductItem, SupplierItem } from "lib/api/products-api";
import { getLocations, LocationItem } from "lib/api/inventory-api";
import { queryKeys } from "lib/api/query-keys";
import { formatCurrency, COMMON_CURRENCIES } from "features/sales/utils/currency-formatter";
import { useWorkspace } from "lib/workspace/workspace-context";

interface FormLineItem {
  id: string; // local temporary key
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitCode: string;
  orderedQuantity: number;
  purchasePrice: number;
  taxRatePercent: number;
  discountAmount: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  // Form states
  const [supplierId, setSupplierId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);

  // Product search state
  const [productSearch, setProductSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingAndOrdering, setIsSubmittingAndOrdering] = useState(false);

  // Queries
  const { data: suppliersResponse, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["products-suppliers"],
    queryFn: () => productsApi.getSuppliers({ limit: 100 }),
  });

  const { data: locationsResponse, isLoading: isLoadingLocations } = useQuery({
    queryKey: queryKeys.locations,
    queryFn: () => getLocations({ limit: 100 }),
  });

  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productsApi.getProducts({ limit: 200 }),
  });

  const suppliers: SupplierItem[] = suppliersResponse?.data || [];
  const locations: LocationItem[] = locationsResponse?.data || [];
  const products: ProductItem[] = productsResponse?.data || [];

  // Automatically select first location if available and not yet selected
  useMemo(() => {
    if (!locationId && locations.length > 0) {
      setLocationId(locations[0]._id);
    }
  }, [locations, locationId]);

  // Flattened product variants for search & selection
  const catalogVariants = useMemo(() => {
    const list: Array<{
      productId: string;
      productName: string;
      variantId: string;
      variantName: string;
      sku: string;
      costPrice: number;
    }> = [];

    for (const prod of products) {
      if (prod.status === "ARCHIVED") continue;
      const variants = prod.variants || [];
      if (variants.length > 0) {
        for (const v of variants) {
          if (v.status === "ARCHIVED") continue;
          list.push({
            productId: prod._id,
            productName: prod.name,
            variantId: v._id,
            variantName: v.name || "Default",
            sku: v.sku || "",
            costPrice: typeof v.costPrice === "number" ? v.costPrice : (prod.costPrice || 0),
          });
        }
      } else if (prod.defaultVariant) {
        list.push({
          productId: prod._id,
          productName: prod.name,
          variantId: prod.defaultVariant._id,
          variantName: prod.defaultVariant.name || "Default",
          sku: prod.defaultVariant.sku || "",
          costPrice: prod.costPrice || 0,
        });
      }
    }
    return list;
  }, [products]);

  // Filtered variants for quick-add dropdown
  const filteredVariants = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return catalogVariants
      .filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.variantName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [catalogVariants, productSearch]);

  // Line item actions
  function handleAddVariant(item: typeof catalogVariants[0]) {
    const existingIndex = lineItems.findIndex((l) => l.productVariantId === item.variantId);
    if (existingIndex >= 0) {
      const updated = [...lineItems];
      updated[existingIndex].orderedQuantity += 1;
      setLineItems(updated);
    } else {
      const newLine: FormLineItem = {
        id: `${item.variantId}-${Date.now()}`,
        productVariantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        unitCode: "PCS",
        orderedQuantity: 1,
        purchasePrice: item.costPrice >= 0 ? item.costPrice : 0,
        taxRatePercent: 0,
        discountAmount: 0,
      };
      setLineItems((prev) => [...prev, newLine]);
    }
    setProductSearch("");
  }

  function handleRemoveLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpdateQuantity(index: number, qty: number) {
    if (qty < 1) return;
    const updated = [...lineItems];
    updated[index].orderedQuantity = qty;
    setLineItems(updated);
  }

  function handleUpdatePrice(index: number, price: number) {
    if (price < 0) return;
    const updated = [...lineItems];
    updated[index].purchasePrice = price;
    setLineItems(updated);
  }

  function handleUpdateTax(index: number, tax: number) {
    if (tax < 0) return;
    const updated = [...lineItems];
    updated[index].taxRatePercent = tax;
    setLineItems(updated);
  }

  // Financial calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + item.orderedQuantity * item.purchasePrice, 0);
  }, [lineItems]);

  const taxTotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      const lineGross = item.orderedQuantity * item.purchasePrice;
      const taxAmount = (lineGross * (item.taxRatePercent || 0)) / 100;
      return acc + taxAmount;
    }, 0);
  }, [lineItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxTotal + (Number(otherCharges) || 0));
  }, [subtotal, taxTotal, otherCharges]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseOrderInput) => purchasingApi.createPurchaseOrder(payload),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasingSummary });

      if (isSubmittingAndOrdering) {
        try {
          await purchasingApi.orderPurchaseOrder(res.data._id);
          queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
          queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrder(res.data._id) });
        } catch (err: any) {
          // If ordering fails after creation, still redirect to detail page
          console.error("Failed to transition to ORDERED:", err);
        }
      }

      router.push(`/purchasing/orders/${res.data._id}`);
    },
    onError: (err: any) => {
      setIsSubmittingAndOrdering(false);
      setActionError(
        err.response?.data?.message || err.message || "Failed to create purchase order"
      );
    },
  });

  function handleSubmit(shouldOrderDirectly: boolean) {
    setActionError(null);

    if (!supplierId) {
      setActionError("Please select a supplier.");
      return;
    }

    if (!locationId) {
      setActionError("Please select a destination warehouse location.");
      return;
    }

    if (lineItems.length === 0) {
      setActionError("Please add at least one item to this purchase order.");
      return;
    }

    for (const item of lineItems) {
      if (item.orderedQuantity < 1) {
        setActionError(`Quantity for "${item.productName}" must be at least 1.`);
        return;
      }
      if (item.purchasePrice < 0) {
        setActionError(`Purchase price for "${item.productName}" cannot be negative.`);
        return;
      }
    }

    setIsSubmittingAndOrdering(shouldOrderDirectly);

    const items: CreatePurchaseOrderItemInput[] = lineItems.map((l) => ({
      productVariantId: l.productVariantId,
      orderedQuantity: l.orderedQuantity,
      purchasePrice: l.purchasePrice,
      taxRatePercent: l.taxRatePercent > 0 ? l.taxRatePercent : undefined,
      discountAmount: l.discountAmount > 0 ? l.discountAmount : undefined,
    }));

    const payload: CreatePurchaseOrderInput = {
      supplierId,
      locationId,
      orderDate: orderDate ? new Date(orderDate).toISOString() : undefined,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
      currency,
      otherCharges: Number(otherCharges) || 0,
      notes: notes.trim() || undefined,
      items,
    };

    createMutation.mutate(payload);
  }

  const selectedSupplier = suppliers.find((s) => s._id === supplierId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/purchasing/orders"
            className="p-2 rounded-lg border border-[#E4E4E7] dark:border-[#24272A] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">New Purchase Order</h1>
            <p className="text-xs text-muted-foreground">
              Draft or place a stock purchase order to replenish warehouse inventory
            </p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2">
          <Link
            href="/purchasing/orders"
            className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-[#E4E4E7] dark:border-[#24272A] rounded-lg transition-colors"
          >
            Cancel
          </Link>

          {canManage && (
            <>
              <button
                type="button"
                disabled={createMutation.isPending}
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {createMutation.isPending && !isSubmittingAndOrdering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                Save as Draft
              </button>

              <button
                type="button"
                disabled={createMutation.isPending}
                onClick={() => handleSubmit(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {createMutation.isPending && isSubmittingAndOrdering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Order Now
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Details & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#176B4D]" />
              Supplier & Delivery Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                  disabled={isLoadingSuppliers}
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.phone ? `(${s.phone})` : ""}
                    </option>
                  ))}
                </select>

                {suppliers.length === 0 && !isLoadingSuppliers && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    No suppliers found. Add a supplier in Product Settings first.
                  </p>
                )}

                {selectedSupplier && (
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg text-[11px] space-y-0.5 text-muted-foreground border border-[#E4E4E7] dark:border-[#24272A]">
                    <div className="font-semibold text-foreground">{selectedSupplier.name}</div>
                    {selectedSupplier.email && <div>Email: {selectedSupplier.email}</div>}
                    {selectedSupplier.phone && <div>Phone: {selectedSupplier.phone}</div>}
                    {selectedSupplier.address && <div>Address: {selectedSupplier.address}</div>}
                  </div>
                )}
              </div>

              {/* Destination Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Destination Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                  disabled={isLoadingLocations}
                >
                  <option value="">Select receiving location...</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name} {loc.code ? `[${loc.code}]` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Inventory stock will increase at this location when goods are received.
                </p>
              </div>

              {/* Order Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Order Date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>

              {/* Expected Delivery Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Expected Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-[#176B4D]" />
                Order Line Items
              </h2>
              <span className="text-xs text-muted-foreground">
                {lineItems.length} {lineItems.length === 1 ? "item" : "items"} added
              </span>
            </div>

            {/* Product Quick-Add Search */}
            <div className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU to add to order..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>

              {/* Filtered search dropdown results */}
              {productSearch.trim().length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-lg shadow-lg divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredVariants.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No matching products found.
                    </div>
                  ) : (
                    filteredVariants.map((item) => (
                      <div
                        key={item.variantId}
                        onClick={() => handleAddVariant(item)}
                        className="p-2.5 px-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-foreground">
                            {item.productName}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Variant: {item.variantName} {item.sku ? `• SKU: ${item.sku}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-medium text-foreground">
                            {formatCurrency(item.costPrice, currency)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#176B4D] font-medium bg-[#176B4D]/10 px-2 py-0.5 rounded">
                            <Plus className="w-3 h-3" /> Add
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Line Items Table */}
            {lineItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E4E4E7] dark:border-[#24272A] rounded-xl">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-foreground">No items in this order</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use the product search bar above to select items to purchase.
                </p>
              </div>
            ) : (
              <div className="border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3.5 py-2.5">Item & Variant</th>
                      <th className="px-2.5 py-2.5 w-24 text-center">Qty</th>
                      <th className="px-2.5 py-2.5 w-28 text-right">Cost Price</th>
                      <th className="px-2.5 py-2.5 w-20 text-center">Tax %</th>
                      <th className="px-3.5 py-2.5 w-28 text-right">Line Total</th>
                      <th className="px-2.5 py-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {lineItems.map((line, idx) => {
                      const lineGross = line.orderedQuantity * line.purchasePrice;
                      const lineTax = (lineGross * (line.taxRatePercent || 0)) / 100;
                      const lineNetTotal = lineGross + lineTax;

                      return (
                        <tr key={line.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="px-3.5 py-3">
                            <div className="font-semibold text-foreground">
                              {line.productName}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{line.variantName}</span>
                              {line.sku && <span className="font-mono">({line.sku})</span>}
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="px-2.5 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={line.orderedQuantity}
                              onChange={(e) =>
                                handleUpdateQuantity(idx, Math.max(1, parseInt(e.target.value) || 1))
                              }
                              className="w-16 px-2 py-1 text-xs text-center rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="px-2.5 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.purchasePrice}
                              onChange={(e) =>
                                handleUpdatePrice(idx, Math.max(0, parseFloat(e.target.value) || 0))
                              }
                              className="w-24 px-2 py-1 text-xs text-right rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                            />
                          </td>

                          {/* Tax % */}
                          <td className="px-2.5 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={line.taxRatePercent}
                              onChange={(e) =>
                                handleUpdateTax(idx, Math.max(0, parseFloat(e.target.value) || 0))
                              }
                              className="w-16 px-2 py-1 text-xs text-center rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                            />
                          </td>

                          {/* Line Total */}
                          <td className="px-3.5 py-3 text-right font-mono font-semibold text-foreground">
                            {formatCurrency(lineNetTotal, currency)}
                          </td>

                          {/* Delete */}
                          <td className="px-2.5 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>

        {/* Right 1 Column: Summary & Notes */}
        <div className="space-y-6">
          {/* Financial Summary Card */}
          <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#176B4D]" />
              Order Summary
            </h2>

            {/* Currency Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-muted-foreground">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-[#E4E4E7] dark:border-[#24272A] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">{formatCurrency(subtotal, currency)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span className="font-mono text-foreground">{formatCurrency(taxTotal, currency)}</span>
              </div>

              {/* Other Charges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-[11px]">Freight / Other Charges</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2 py-1 text-xs text-right rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>

              <div className="border-t border-[#E4E4E7] dark:border-[#24272A] pt-2 flex justify-between text-sm font-bold text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-[#176B4D]">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={createMutation.isPending || !canManage}
                onClick={() => handleSubmit(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {createMutation.isPending && isSubmittingAndOrdering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Order Now
              </button>

              <button
                type="button"
                disabled={createMutation.isPending || !canManage}
                onClick={() => handleSubmit(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {createMutation.isPending && !isSubmittingAndOrdering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                Save as Draft
              </button>
            </div>
          </div>

          {/* Notes Card */}
          <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground">
              Notes & Supplier Terms
            </label>
            <textarea
              rows={3}
              placeholder="Instructions for supplier, expected payment terms, transport notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
