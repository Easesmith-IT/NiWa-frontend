"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  Package,
  Layers,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  Building2,
  Calendar,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  financeApi,
  InventoryValuationItem,
  InventoryCostLayerItem,
} from "lib/api/finance-api";
import { formatCurrency } from "features/sales/utils/currency-formatter";
import { useFinancePermissions } from "../hooks/use-finance-permissions";

export function InventoryValuationView() {
  const { canManage } = useFinancePermissions();

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const {
    data: reportRes,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["finance", "inventory-valuation", selectedLocationId],
    queryFn: () =>
      financeApi.getInventoryValuationReport({
        locationId: selectedLocationId || undefined,
      }),
  });

  const report = reportRes?.data;
  const items = report?.items || [];

  // Filter items by search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.variantName.toLowerCase().includes(q) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      item.locationName.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const uniqueLocations = Array.from(
    new Map(items.map((i) => [i.locationId, i.locationName])).entries()
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-600" />
            Inventory Valuation Subledger (Perpetual FIFO)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Authoritative cost-layer inventory valuation. Tracks distinct acquisition layers and depletion queues by location.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Location filter */}
          <div className="relative">
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
            title="Refresh valuation report"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Inventory Value</span>
            <Tag className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(report?.totalValuation || 0, report?.currency || "INR")}
          </p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">
            Active FIFO cost layers
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Layered Units</span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {(report?.totalQuantity || 0).toLocaleString()}
          </p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">
            Aggregated across all lots
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Active SKU Locations</span>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {items.length}
          </p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">
            Isolated FIFO queues
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Average Unit Cost</span>
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(
              report?.totalQuantity ? report.totalValuation / report.totalQuantity : 0,
              report?.currency || "INR"
            )}
          </p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">
            Portfolio weighted average
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by product name, SKU, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <Boxes className="h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No Inventory Layers Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            There are currently no active FIFO inventory layers for this workspace or selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="py-3 pl-4 pr-3">Product Variant</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3 text-right">Available Qty</th>
                <th className="px-3 py-3 text-right">Avg Unit Cost</th>
                <th className="px-3 py-3 text-right">Total Valuation</th>
                <th className="px-3 py-3 text-center">FIFO Layers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const itemKey = `${item.productVariantId}__${item.locationId}`;
                const isExpanded = !!expandedItems[itemKey];

                return (
                  <tbody key={itemKey} className="divide-y divide-slate-50">
                    <tr
                      onClick={() => toggleExpand(itemKey)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 pl-4 pr-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(itemKey);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.variantName}
                            </span>
                            {item.sku && (
                              <span className="ml-2 font-mono text-[11px] text-slate-400">
                                ({item.sku})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          {item.locationName}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-medium text-slate-800">
                        {item.totalQuantity.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-slate-600">
                        {formatCurrency(item.averageUnitCost, report?.currency || "INR")}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.totalValuation, report?.currency || "INR")}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {item.layers.length} {item.layers.length === 1 ? "layer" : "layers"}
                        </span>
                      </td>
                    </tr>

                    {/* EXPANDABLE COST LAYERS */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Active FIFO Acquisition Layers (First-In, First-Out)
                            </h4>
                            <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                              <thead>
                                <tr className="text-slate-400 text-left font-medium">
                                  <th className="py-1">Layer ID</th>
                                  <th className="py-1">Source</th>
                                  <th className="py-1">Date</th>
                                  <th className="py-1 text-right">Remaining Qty</th>
                                  <th className="py-1 text-right">Unit Cost</th>
                                  <th className="py-1 text-right">Layer Valuation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {item.layers.map((layer) => (
                                  <tr key={layer.layerId} className="hover:bg-slate-50">
                                    <td className="py-1.5 font-mono text-slate-700">
                                      {layer.layerId}
                                    </td>
                                    <td className="py-1.5">
                                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                        {layer.sourceType}
                                        <span className="text-slate-400">({layer.sourceId})</span>
                                      </span>
                                    </td>
                                    <td className="py-1.5 text-slate-500">
                                      {new Date(layer.transactionDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-1.5 text-right font-medium text-slate-800">
                                      {layer.remainingQuantity.toLocaleString()}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-slate-600">
                                      {formatCurrency(layer.unitCost, report?.currency || "INR")}
                                    </td>
                                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                                      {formatCurrency(layer.layerTotal, report?.currency || "INR")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
