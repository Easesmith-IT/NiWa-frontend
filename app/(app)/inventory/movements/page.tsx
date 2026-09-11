"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Boxes,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  ArrowRightLeft,
  Filter,
} from "lucide-react";
import {
  getStockMovements,
  getLocations,
  StockMovementItem,
  LocationItem,
} from "lib/api/inventory-api";
import { queryKeys } from "lib/api/query-keys";

function StockMovementsContent() {
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("locationId") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("movementType") || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loc = searchParams.get("locationId");
    if (loc !== null && loc !== undefined) {
      setSelectedLocation(loc);
    }
    const mType = searchParams.get("movementType");
    if (mType !== null && mType !== undefined) {
      setSelectedType(mType);
    }
  }, [searchParams]);

  const { data: movementsData, isLoading } = useQuery({
    queryKey: [
      ...queryKeys.stockMovements,
      { locationId: selectedLocation, movementType: selectedType, page },
    ],
    queryFn: () =>
      getStockMovements({
        locationId: selectedLocation || undefined,
        movementType: selectedType || undefined,
        page,
        limit: 25,
      }),
  });

  const { data: locationsData } = useQuery({
    queryKey: queryKeys.locations,
    queryFn: () => getLocations({ limit: 100 }),
  });

  const movements: StockMovementItem[] = movementsData?.data || [];
  const pagination = movementsData?.pagination;
  const locations: LocationItem[] = locationsData?.data || [];

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "RECEIPT":
      case "OPENING":
      case "RETURN_IN":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SALE":
      case "RETURN_OUT":
      case "DAMAGE":
      case "WASTAGE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ADJUSTMENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "TRANSFER":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Stock Movement Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Immutable audit history of all receipts, sales, physical count adjustments, and stock changes.
          </p>
        </div>
      </div>

      {/* Quick Nav Sub-bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-sm pb-2">
        <Link
          href="/inventory"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
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
          className="px-3 py-1.5 font-medium text-indigo-600 border-b-2 border-indigo-600 flex items-center gap-1.5"
        >
          <History className="w-4 h-4" />
          Movement Ledger
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name} {l.code ? `(${l.code})` : ""}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Movement Types</option>
          <option value="OPENING">Opening Stock</option>
          <option value="RECEIPT">Receipt (+)</option>
          <option value="SALE">Sale (-)</option>
          <option value="ADJUSTMENT">Adjustment (±)</option>
          <option value="TRANSFER">Transfer</option>
          <option value="RETURN_IN">Return In (+)</option>
          <option value="RETURN_OUT">Return Out (-)</option>
          <option value="DAMAGE">Damage (-)</option>
          <option value="WASTAGE">Wastage (-)</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Movement ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Product / Variant</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Delta Quantity</th>
                <th className="px-6 py-3">Reason / Reference</th>
                <th className="px-6 py-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    Loading movement history...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-700">No stock movements found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Every stock change and adjustment will be recorded in this immutable ledger.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const variant = mov.inventoryItemId?.productVariantId;
                  const product = variant?.productId;
                  const unit = variant?.unitId?.code || "";
                  const isPositive = mov.quantity > 0;
                  const location = mov.destinationLocationId || mov.sourceLocationId;

                  return (
                    <tr key={mov._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900">
                        {mov.movementId}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(mov.occurredAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {product?.name || "Product"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variant?.name || "Standard"} {variant?.sku ? `• ${variant.sku}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 font-medium">
                        {mov.movementType === "TRANSFER" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600">
                              From: <strong className="text-gray-900">{mov.sourceLocationId?.name || "—"}</strong>
                            </span>
                            <span className="text-indigo-600">
                              To: <strong className="text-indigo-700">{mov.destinationLocationId?.name || "—"}</strong>
                            </span>
                          </div>
                        ) : (
                          location?.name || "—"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMovementBadge(
                            mov.movementType
                          )}`}
                        >
                          {mov.movementType}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold text-sm ${
                          mov.movementType === "TRANSFER"
                            ? "text-purple-700"
                            : isPositive
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          {mov.movementType === "TRANSFER" ? (
                            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                          ) : isPositive ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {mov.movementType === "TRANSFER"
                              ? `${mov.quantity}`
                              : isPositive
                              ? `+${mov.quantity}`
                              : mov.quantity}{" "}
                            {unit}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                        {mov.reason || mov.referenceType || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {mov.createdBy?.email || "System"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div>
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total movements)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StockMovementsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-sm text-gray-400">
          Loading stock movements...
        </div>
      }
    >
      <StockMovementsContent />
    </Suspense>
  );
}

