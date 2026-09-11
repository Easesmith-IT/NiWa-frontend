"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  MapPin,
  History,
  Search,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  ArrowRightLeft,
  Settings,
} from "lucide-react";
import {
  getInventoryLevels,
  getLocations,
  adjustStock,
  transferStock,
  updateReorderSettings,
  InventoryLevelItem,
  LocationItem,
} from "lib/api/inventory-api";
import { productsApi, ProductItem } from "lib/api/products-api";
import { queryKeys } from "lib/api/query-keys";
import { useDialogA11y } from "lib/hooks/use-dialog-a11y";

function InventoryStockContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || searchParams.get("search") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("locationId") || "");
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get("lowStock") === "true");
  const [page, setPage] = useState(1);

  // Sync state if URL query params change dynamically
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q !== null && q !== undefined) {
      setSearch(q);
    }
    const loc = searchParams.get("locationId");
    if (loc !== null && loc !== undefined) {
      setSelectedLocation(loc);
    }
    const low = searchParams.get("lowStock");
    if (low !== null && low !== undefined) {
      setLowStockOnly(low === "true");
    }
  }, [searchParams]);

  // Row dropdown state
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);

  // Modal state for Adjust Stock
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustOpId, setAdjustOpId] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<{
    productId?: string;
    variantId?: string;
    locationId?: string;
    currentOnHand?: number;
    title?: string;
  } | null>(null);

  const [adjustType, setAdjustType] = useState<"ADD" | "REDUCE" | "SET" | "OPENING">("ADD");
  const [reductionCategory, setReductionCategory] = useState<"SALE" | "DAMAGE" | "WASTAGE" | "ADJUSTMENT">("SALE");
  const [adjustQty, setAdjustQty] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLocationId, setAdjustLocationId] = useState("");
  const [adjustVariantId, setAdjustVariantId] = useState("");
  const [adjustError, setAdjustError] = useState("");

  // Transfer Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferOpId, setTransferOpId] = useState("");
  const [transferTarget, setTransferTarget] = useState<{
    inventoryItemId: string;
    productTitle: string;
    variantName: string;
    sourceLocationId: string;
    sourceLocationName: string;
    sourceLocationCode?: string;
    currentOnHand: number;
    availableStock: number;
  } | null>(null);
  const [transferDestLocationId, setTransferDestLocationId] = useState("");
  const [transferQty, setTransferQty] = useState<number | "">("");
  const [transferReason, setTransferReason] = useState("");
  const [transferError, setTransferError] = useState("");

  // Reorder Settings Modal state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderTarget, setReorderTarget] = useState<InventoryLevelItem | null>(null);
  const [reorderPointInput, setReorderPointInput] = useState<number | "">("");
  const [reorderQtyInput, setReorderQtyInput] = useState<number | "">("");
  const [reorderError, setReorderError] = useState("");

  // Queries
  const { data: levelsData, isLoading: isLevelsLoading } = useQuery({
    queryKey: [
      ...queryKeys.inventoryLevels,
      { locationId: selectedLocation, lowStock: lowStockOnly, page },
    ],
    queryFn: () =>
      getInventoryLevels({
        locationId: selectedLocation || undefined,
        lowStock: lowStockOnly ? true : undefined,
        page,
        limit: 20,
      }),
  });

  const { data: locationsData } = useQuery({
    queryKey: queryKeys.locations,
    queryFn: () => getLocations({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const locations: LocationItem[] = locationsData?.data || [];
  const products: ProductItem[] = productsData?.data || [];
  const rawLevels: InventoryLevelItem[] = levelsData?.data || [];

  // Client-side search filter by product name or SKU
  const filteredLevels = rawLevels.filter((lvl) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const prodName =
      lvl.inventoryItemId?.productVariantId?.productId?.name?.toLowerCase() || "";
    const varName = lvl.inventoryItemId?.productVariantId?.name?.toLowerCase() || "";
    const sku = lvl.inventoryItemId?.productVariantId?.sku?.toLowerCase() || "";
    const locName = lvl.locationId?.name?.toLowerCase() || "";
    return (
      prodName.includes(q) || varName.includes(q) || sku.includes(q) || locName.includes(q)
    );
  });

  // Adjust Stock Mutation
  const adjustMutation = useMutation({
    mutationFn: (payload: any) => adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      closeAdjustModal();
    },
    onError: (err: any) => {
      setAdjustError(
        err.response?.data?.message || err.message || "Failed to adjust stock"
      );
    },
  });

  // Transfer Stock Mutation
  const transferMutation = useMutation({
    mutationFn: (payload: any) => transferStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      closeTransferModal();
    },
    onError: (err: any) => {
      setTransferError(
        err.response?.data?.message || err.message || "Failed to transfer stock"
      );
    },
  });

  const openTransferModal = (level: InventoryLevelItem) => {
    setTransferError("");
    setTransferQty("");
    setTransferReason("");
    setTransferDestLocationId("");
    const opId = "op_" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
    setTransferOpId(opId);

    const available = level.available ?? (level.onHand - level.reserved);
    const itm = level.inventoryItemId;
    const prod = itm?.productVariantId?.productId;
    const variant = itm?.productVariantId;

    setTransferTarget({
      inventoryItemId: itm?._id || "",
      productTitle: prod?.name || "Product",
      variantName: variant?.name || "Standard",
      sourceLocationId: level.locationId?._id || "",
      sourceLocationName: level.locationId?.name || "Unknown Location",
      sourceLocationCode: level.locationId?.code,
      currentOnHand: level.onHand,
      availableStock: available,
    });

    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferTarget(null);
    setTransferError("");
    setTransferQty("");
    setTransferReason("");
    setTransferDestLocationId("");
    setTransferOpId("");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");

    if (!transferTarget) return;

    if (!transferDestLocationId) {
      setTransferError("Please select a destination location");
      return;
    }

    if (transferDestLocationId === transferTarget.sourceLocationId) {
      setTransferError("Destination location cannot be the same as source location");
      return;
    }

    if (transferQty === "" || Number(transferQty) <= 0) {
      setTransferError("Please enter a valid transfer quantity greater than 0");
      return;
    }

    if (Number(transferQty) > transferTarget.availableStock) {
      setTransferError(
        `Cannot transfer more than available stock (${transferTarget.availableStock})`
      );
      return;
    }

    transferMutation.mutate({
      inventoryItemId: transferTarget.inventoryItemId,
      sourceLocationId: transferTarget.sourceLocationId,
      destinationLocationId: transferDestLocationId,
      quantity: Number(transferQty),
      reason: transferReason.trim() || undefined,
      operationId: transferOpId || undefined,
    });
  };

  const openAdjustModal = (
    level?: InventoryLevelItem,
    initialType: "ADD" | "REDUCE" | "SET" | "OPENING" = "ADD"
  ) => {
    setAdjustError("");
    setAdjustQty("");
    setAdjustReason("");
    const opId = "op_" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
    setAdjustOpId(opId);
    setAdjustType(initialType);
    setReductionCategory("SALE");

    if (level) {
      setAdjustTarget({
        variantId: level.inventoryItemId?.productVariantId?._id,
        locationId: level.locationId?._id,
        currentOnHand: level.onHand,
        title: `${level.inventoryItemId?.productVariantId?.productId?.name || "Product"} (${level.inventoryItemId?.productVariantId?.name || "Standard"})`,
      });
      setAdjustLocationId(level.locationId?._id);
      setAdjustVariantId(level.inventoryItemId?.productVariantId?._id);
    } else {
      setAdjustTarget(null);
      setAdjustLocationId(locations[0]?._id || "");
      setAdjustVariantId(products[0]?.defaultVariant?._id || "");
    }

    setIsAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setAdjustTarget(null);
    setAdjustError("");
    setAdjustQty("");
    setAdjustReason("");
    setAdjustOpId("");
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError("");

    if (!adjustLocationId) {
      setAdjustError("Please select a location");
      return;
    }
    if (!adjustVariantId) {
      setAdjustError("Please select a product variant");
      return;
    }
    if (adjustQty === "" || Number(adjustQty) < 0) {
      setAdjustError("Please enter a valid non-negative quantity");
      return;
    }

    const qty = Number(adjustQty);

    let payload: any = {
      locationId: adjustLocationId,
      inventoryItemId: adjustVariantId,
      reason: adjustReason.trim() || undefined,
      operationId: adjustOpId || undefined,
    };

    if (adjustType === "ADD") {
      payload.type = "RECEIPT";
      payload.quantity = qty;
    } else if (adjustType === "REDUCE") {
      payload.type = reductionCategory;
      payload.quantity = qty;
    } else if (adjustType === "SET") {
      payload.type = "ADJUSTMENT";
      payload.newQuantity = qty;
    } else if (adjustType === "OPENING") {
      payload.type = "OPENING";
      payload.quantity = qty;
    }

    adjustMutation.mutate(payload);
  };

  // Reorder Settings Modal handlers
  const openReorderModal = (level: InventoryLevelItem) => {
    setReorderTarget(level);
    setReorderPointInput(level.reorderPoint ?? 0);
    setReorderQtyInput(level.reorderQuantity ?? 0);
    setReorderError("");
    setIsReorderModalOpen(true);
  };

  const closeReorderModal = () => {
    setIsReorderModalOpen(false);
    setReorderTarget(null);
    setReorderError("");
  };

  const reorderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reorderPoint?: number; reorderQuantity?: number } }) =>
      updateReorderSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLevels });
      closeReorderModal();
    },
    onError: (err: any) => {
      setReorderError(err.response?.data?.message || err.message || "Failed to update reorder settings");
    },
  });

  const handleReorderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderTarget) return;

    reorderMutation.mutate({
      id: reorderTarget._id,
      data: {
        reorderPoint: reorderPointInput === "" ? 0 : Number(reorderPointInput),
        reorderQuantity: reorderQtyInput === "" ? 0 : Number(reorderQtyInput),
      },
    });
  };

  // Modal dialog accessibility hooks (focus trapping, initial focus, focus restoration, escape handling)
  const adjustDialogRef = useDialogA11y({
    isOpen: isAdjustModalOpen,
    onClose: closeAdjustModal,
  });

  const transferDialogRef = useDialogA11y({
    isOpen: isTransferModalOpen,
    onClose: closeTransferModal,
  });

  const reorderDialogRef = useDialogA11y({
    isOpen: isReorderModalOpen,
    onClose: closeReorderModal,
  });

  // Global Escape key handler for active dropdown row
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeDropdownRowId) {
        setActiveDropdownRowId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDropdownRowId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Inventory Stock
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time stock on hand, derived available stock, and location-specific levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAdjustModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Quick Nav Sub-bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-sm pb-2">
        <Link
          href="/inventory"
          className="px-3 py-1.5 font-medium text-indigo-600 border-b-2 border-indigo-600 flex items-center gap-1.5"
        >
          <Boxes className="w-4 h-4" />
          Stock Levels
        </Link>
        <Link
          href="/inventory/locations"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4" />
          Locations
        </Link>
        <Link
          href="/inventory/movements"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <History className="w-4 h-4" />
          Movement Ledger
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name} {loc.code ? `(${loc.code})` : ""}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Low Stock Only
          </label>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Product / Variant</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-right">On Hand</th>
                <th className="px-6 py-3 text-right">Available</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLevelsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    Loading inventory stock...
                  </td>
                </tr>
              ) : filteredLevels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Boxes className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-700">No stock levels found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {search || selectedLocation || lowStockOnly
                        ? "No results matching current filters."
                        : "Click 'Adjust Stock' above to record opening stock for a product."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLevels.map((level) => {
                  const variant = level.inventoryItemId?.productVariantId;
                  const product = variant?.productId;
                  const unit = variant?.unitId?.code || "";

                  const isOut = level.onHand <= 0;
                  const isLow = level.isLowStock;

                  return (
                    <tr key={level._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {product?._id ? (
                            <Link
                              href={`/products/${product._id}`}
                              className="hover:text-indigo-600 hover:underline transition"
                              title="View product details & variants"
                            >
                              {product.name}
                            </Link>
                          ) : (
                            product?.name || "Unknown Product"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variant?.name || "Standard"} {product?.productId ? `• ${product.productId}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {variant?.sku || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">
                          {level.locationId?.name || "Unknown"}
                        </span>
                        {level.locationId?.code && (
                          <span className="ml-1.5 text-xs text-gray-400">
                            ({level.locationId.code})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {level.onHand} {unit}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-700">
                        {level.available} {unit}
                      </td>
                      <td className="px-6 py-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            In stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick + Add */}
                        <button
                          onClick={() => openAdjustModal(level, "ADD")}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
                          title="Quick Add Stock (Receipt)"
                          aria-label={`Add stock for ${product?.name || "product"}`}
                        >
                          +
                        </button>
                        {/* Quick − Reduce */}
                        <button
                          onClick={() => openAdjustModal(level, "REDUCE")}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200"
                          title="Quick Reduce Stock (Sale / Damage / Wastage)"
                          aria-label={`Reduce stock for ${product?.name || "product"}`}
                        >
                          −
                        </button>
                        {/* More Actions Dropdown */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdownRowId(
                                activeDropdownRowId === level._id ? null : level._id
                              )
                            }
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200 inline-flex items-center gap-1"
                            aria-haspopup="true"
                            aria-expanded={activeDropdownRowId === level._id}
                          >
                            More ▾
                          </button>
                          {activeDropdownRowId === level._id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-30 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownRowId(null);
                                  openAdjustModal(level, "SET");
                                }}
                                className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition"
                              >
                                <span>✎</span> Physical Count
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownRowId(null);
                                  openTransferModal(level);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition"
                              >
                                <span>⇄</span> Transfer Stock
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownRowId(null);
                                  openReorderModal(level);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2 transition"
                              >
                                <span>⚙</span> Reorder Settings
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-stock-title"
          aria-describedby={adjustTarget ? "adjust-stock-desc" : undefined}
        >
          <div
            ref={adjustDialogRef}
            tabIndex={-1}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4 focus:outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 id="adjust-stock-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                Adjust Stock
              </h3>
              <button
                onClick={closeAdjustModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div role="alert" id="adjust-error-msg" className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Target Details */}
              {adjustTarget ? (
                <div id="adjust-stock-desc" className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <div className="font-semibold text-gray-800">{adjustTarget.title}</div>
                  <div className="text-xs text-gray-500">
                    Current stock on hand:{" "}
                    <span className="font-bold text-gray-900">{adjustTarget.currentOnHand}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="adjust-variant-id" className="block text-xs font-medium text-gray-700 mb-1">
                      Product Variant *
                    </label>
                    <select
                      id="adjust-variant-id"
                      value={adjustVariantId}
                      onChange={(e) => setAdjustVariantId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    >
                      <option value="">Select a product...</option>
                      {products.map((p) => (
                        <option
                          key={p._id}
                          value={p.defaultVariant?._id || p._id}
                        >
                          {p.name} {p.defaultVariant?.sku ? `(${p.defaultVariant.sku})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="adjust-location-id" className="block text-xs font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <select
                      id="adjust-location-id"
                      value={adjustLocationId}
                      onChange={(e) => setAdjustLocationId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    >
                      <option value="">Select location...</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name} {loc.code ? `(${loc.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Action Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Operation *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("ADD")}
                    aria-pressed={adjustType === "ADD"}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "ADD"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("REDUCE")}
                    aria-pressed={adjustType === "REDUCE"}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "REDUCE"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    − Reduce
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("SET")}
                    aria-pressed={adjustType === "SET"}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "SET"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    ✎ Count
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("OPENING")}
                    aria-pressed={adjustType === "OPENING"}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "OPENING"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    ★ Opening
                  </button>
                </div>
              </div>

              {/* Reduction Category if in REDUCE mode */}
              {adjustType === "REDUCE" && (
                <div>
                  <label htmlFor="adjust-reduction-category" className="block text-xs font-medium text-gray-700 mb-1">
                    Reduction Reason Category *
                  </label>
                  <select
                    id="adjust-reduction-category"
                    value={reductionCategory}
                    onChange={(e) => setReductionCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SALE">Offline / Manual Sale (SALE)</option>
                    <option value="DAMAGE">Damaged Goods (DAMAGE)</option>
                    <option value="WASTAGE">Wastage / Spoilage (WASTAGE)</option>
                    <option value="ADJUSTMENT">General Reduction (ADJUSTMENT)</option>
                  </select>
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label htmlFor="adjust-quantity" className="block text-xs font-medium text-gray-700 mb-1">
                  {adjustType === "SET"
                    ? "New Actual Count *"
                    : adjustType === "OPENING"
                    ? "Initial Opening Stock Quantity *"
                    : adjustType === "REDUCE"
                    ? "Quantity to Deduct *"
                    : "Quantity to Add *"}
                </label>
                <input
                  id="adjust-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={adjustQty}
                  onChange={(e) =>
                    setAdjustQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={adjustType === "SET" ? "e.g. 50" : "e.g. 10"}
                  aria-invalid={!!adjustError}
                  aria-describedby={adjustError ? "adjust-error-msg" : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="adjust-reason" className="block text-xs font-medium text-gray-700 mb-1">
                  Reason / Note
                </label>
                <input
                  id="adjust-reason"
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical inventory count, damaged goods, supplier delivery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {adjustMutation.isPending ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {isTransferModalOpen && transferTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-stock-title"
          aria-describedby="transfer-stock-desc"
        >
          <div
            ref={transferDialogRef}
            tabIndex={-1}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4 focus:outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 id="transfer-stock-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                Transfer Stock Between Locations
              </h3>
              <button
                onClick={closeTransferModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferError && (
              <div role="alert" id="transfer-error-msg" className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Target Item Details */}
              <div id="transfer-stock-desc" className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-sm space-y-1">
                <div className="font-semibold text-gray-900">
                  {transferTarget.productTitle} ({transferTarget.variantName})
                </div>
                <div className="text-xs text-gray-600 flex items-center justify-between pt-1">
                  <span>
                    Source Location:{" "}
                    <strong className="text-gray-900">
                      {transferTarget.sourceLocationName}{" "}
                      {transferTarget.sourceLocationCode ? `(${transferTarget.sourceLocationCode})` : ""}
                    </strong>
                  </span>
                  <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Available: {transferTarget.availableStock}
                  </span>
                </div>
              </div>

              {/* Destination Location Selector */}
              <div>
                <label htmlFor="transfer-dest-location-id" className="block text-xs font-medium text-gray-700 mb-1">
                  Destination Location *
                </label>
                <select
                  id="transfer-dest-location-id"
                  value={transferDestLocationId}
                  onChange={(e) => setTransferDestLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  <option value="">Select destination location...</option>
                  {locations
                    .filter(
                      (loc) =>
                        loc._id !== transferTarget.sourceLocationId && loc.status === "ACTIVE"
                    )
                    .map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} {loc.code ? `(${loc.code})` : ""}
                      </option>
                    ))}
                </select>
                {locations.filter(
                  (loc) =>
                    loc._id !== transferTarget.sourceLocationId && loc.status === "ACTIVE"
                ).length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No alternative active locations available in workspace. Create another location first.
                  </p>
                )}
              </div>

              {/* Transfer Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="transfer-quantity" className="text-xs font-medium text-gray-700">
                    Quantity to Transfer *
                  </label>
                  <span className="text-xs text-gray-500">
                    Max: {transferTarget.availableStock}
                  </span>
                </div>
                <input
                  id="transfer-quantity"
                  type="number"
                  min="1"
                  max={transferTarget.availableStock}
                  step="1"
                  value={transferQty}
                  onChange={(e) =>
                    setTransferQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 5"
                  aria-invalid={!!transferError}
                  aria-describedby={transferError ? "transfer-error-msg" : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Transfer Reason */}
              <div>
                <label htmlFor="transfer-reason" className="block text-xs font-medium text-gray-700 mb-1">
                  Transfer Reason / Note
                </label>
                <input
                  id="transfer-reason"
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Store replenishment, customer fulfillment request"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferMutation.isPending || transferTarget.availableStock <= 0}
                  className="px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {transferMutation.isPending ? "Transferring..." : "Execute Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Settings Modal */}
      {isReorderModalOpen && reorderTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reorder-settings-title"
          aria-describedby="reorder-settings-desc"
        >
          <div
            ref={reorderDialogRef}
            tabIndex={-1}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4 focus:outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 id="reorder-settings-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600" />
                Reorder Settings
              </h3>
              <button
                type="button"
                onClick={closeReorderModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reorderError && (
              <div role="alert" id="reorder-error-msg" className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                {reorderError}
              </div>
            )}

            <form onSubmit={handleReorderSubmit} className="space-y-4">
              <div id="reorder-settings-desc" className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-sm space-y-1">
                <div className="font-semibold text-gray-900">
                  {reorderTarget.inventoryItemId?.productVariantId?.productId?.name || "Product"} (
                  {reorderTarget.inventoryItemId?.productVariantId?.name || "Standard"})
                </div>
                <div className="text-xs text-gray-600">
                  Location: <strong className="text-gray-900">{reorderTarget.locationId?.name}</strong> • Current on hand:{" "}
                  <strong className="text-gray-900">{reorderTarget.onHand}</strong>
                </div>
              </div>

              <div>
                <label htmlFor="reorder-point-input" className="block text-xs font-medium text-gray-700 mb-1">
                  Reorder Point (Threshold)
                </label>
                <input
                  id="reorder-point-input"
                  type="number"
                  min="0"
                  step="1"
                  value={reorderPointInput}
                  onChange={(e) =>
                    setReorderPointInput(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 10 (triggers low stock alert)"
                  aria-describedby="reorder-point-hint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
                <p id="reorder-point-hint" className="text-xs text-gray-500 mt-1">
                  When available stock drops to or below this quantity, it will be flagged as Low Stock.
                </p>
              </div>

              <div>
                <label htmlFor="reorder-qty-input" className="block text-xs font-medium text-gray-700 mb-1">
                  Reorder Quantity (Suggested)
                </label>
                <input
                  id="reorder-qty-input"
                  type="number"
                  min="0"
                  step="1"
                  value={reorderQtyInput}
                  onChange={(e) =>
                    setReorderQtyInput(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 50"
                  aria-describedby="reorder-qty-hint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
                <p id="reorder-qty-hint" className="text-xs text-gray-500 mt-1">
                  Suggested replenishment quantity when placing reorders.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeReorderModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reorderMutation.isPending}
                  className="px-4 py-2 bg-amber-600 text-white font-medium text-sm rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {reorderMutation.isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryStockPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-sm text-gray-400">
          Loading inventory console...
        </div>
      }
    >
      <InventoryStockContent />
    </Suspense>
  );
}

