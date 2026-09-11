"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  getInventoryLevels,
  getLocations,
  adjustStock,
  transferStock,
  InventoryLevelItem,
  LocationItem,
} from "lib/api/inventory-api";
import { productsApi, ProductItem } from "lib/api/products-api";
import { queryKeys } from "lib/api/query-keys";

export default function InventoryStockPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<{
    productId?: string;
    variantId?: string;
    locationId?: string;
    currentOnHand?: number;
    title?: string;
  } | null>(null);

  const [adjustType, setAdjustType] = useState<"ADD" | "REDUCE" | "SET">("ADD");
  const [adjustQty, setAdjustQty] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLocationId, setAdjustLocationId] = useState("");
  const [adjustVariantId, setAdjustVariantId] = useState("");
  const [adjustError, setAdjustError] = useState("");

  // Transfer Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
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
    });
  };

  const openAdjustModal = (level?: InventoryLevelItem) => {
    setAdjustError("");
    setAdjustQty("");
    setAdjustReason("");

    if (level) {
      setAdjustTarget({
        variantId: level.inventoryItemId?.productVariantId?._id,
        locationId: level.locationId?._id,
        currentOnHand: level.onHand,
        title: `${level.inventoryItemId?.productVariantId?.productId?.name || "Product"} (${level.inventoryItemId?.productVariantId?.name || "Standard"})`,
      });
      setAdjustLocationId(level.locationId?._id);
      setAdjustVariantId(level.inventoryItemId?.productVariantId?._id);
      setAdjustType("ADD");
    } else {
      setAdjustTarget(null);
      setAdjustLocationId(locations[0]?._id || "");
      setAdjustVariantId(products[0]?.defaultVariant?._id || "");
      setAdjustType("ADD");
    }

    setIsAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setAdjustTarget(null);
    setAdjustError("");
    setAdjustQty("");
    setAdjustReason("");
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
    };

    if (adjustType === "ADD") {
      payload.type = "RECEIPT";
      payload.quantity = qty;
    } else if (adjustType === "REDUCE") {
      payload.type = "SALE";
      payload.quantity = -qty;
    } else if (adjustType === "SET") {
      payload.type = "ADJUSTMENT";
      payload.newQuantity = qty;
    }

    adjustMutation.mutate(payload);
  };

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
                          {product?.name || "Unknown Product"}
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
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openTransferModal(level)}
                          className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                          title="Transfer stock to another location"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Transfer
                        </button>
                        <button
                          onClick={() => openAdjustModal(level)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          Adjust
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                Adjust Stock
              </h3>
              <button
                onClick={closeAdjustModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Target Details */}
              {adjustTarget ? (
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <div className="font-semibold text-gray-800">{adjustTarget.title}</div>
                  <div className="text-xs text-gray-500">
                    Current stock on hand:{" "}
                    <span className="font-bold text-gray-900">{adjustTarget.currentOnHand}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Variant *
                    </label>
                    <select
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <select
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("ADD")}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "ADD"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("REDUCE")}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "REDUCE"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    - Reduce Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("SET")}
                    className={`py-2 text-xs font-medium rounded-lg border transition ${
                      adjustType === "SET"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    = Set Quantity
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {adjustType === "SET" ? "New Actual Quantity *" : "Quantity Delta *"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={adjustQty}
                  onChange={(e) =>
                    setAdjustQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={adjustType === "SET" ? "e.g. 50" : "e.g. 10"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason / Note
                </label>
                <input
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                Transfer Stock Between Locations
              </h3>
              <button
                onClick={closeTransferModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Close transfer modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Target Item Details */}
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-sm space-y-1">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Destination Location *
                </label>
                <select
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
                  <label className="text-xs font-medium text-gray-700">
                    Quantity to Transfer *
                  </label>
                  <span className="text-xs text-gray-500">
                    Max: {transferTarget.availableStock}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={transferTarget.availableStock}
                  step="1"
                  value={transferQty}
                  onChange={(e) =>
                    setTransferQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Transfer Reason */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Transfer Reason / Note
                </label>
                <input
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
    </div>
  );
}
