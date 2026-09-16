"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, Package, Save, Plus, Sparkles, X, Loader2 } from "lucide-react";
import { productsApi, UnitItem, CategoryItem, BrandItem, ProductItem, STANDARD_UNITS } from "lib/api/products-api";
import { queryKeys } from "lib/api/query-keys";
import { useWorkspaceDefaultCurrency } from "lib/workspace/use-workspace-currency";

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currency, symbol } = useWorkspaceDefaultCurrency();

  // Simple form defaults
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");

  // Quick Add Unit state
  const [showQuickAddUnit, setShowQuickAddUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitCode, setNewUnitCode] = useState("");
  const [quickAddError, setQuickAddError] = useState("");
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [isSeedingUnits, setIsSeedingUnits] = useState(false);

  // Progressive disclosure state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<"PHYSICAL" | "SERVICE" | "DIGITAL" | "OTHER">("PHYSICAL");
  const [brandId, setBrandId] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT" | "INACTIVE">("ACTIVE");

  const [errorMsg, setErrorMsg] = useState("");

  // Queries for categories, brands, units
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => productsApi.getCategories(),
  });

  const { data: brandsData } = useQuery({
    queryKey: queryKeys.brands,
    queryFn: () => productsApi.getBrands(),
  });

  const { data: unitsData } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => productsApi.getUnits(),
  });

  const categories: CategoryItem[] = categoriesData?.data || [];
  const brands: BrandItem[] = brandsData?.data || [];
  const units: UnitItem[] = unitsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => productsApi.createProduct(payload),
    onSuccess: (res: { success: boolean; data: ProductItem }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      router.push(`/products/${res.data._id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create product";
      setErrorMsg(msg);
    },
  });

  const handleQuickAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickAddError("");
    if (!newUnitName.trim()) {
      setQuickAddError("Unit name is required");
      return;
    }
    if (!newUnitCode.trim()) {
      setQuickAddError("Unit code is required");
      return;
    }

    setIsCreatingUnit(true);
    try {
      const res = await productsApi.createUnit({
        name: newUnitName.trim(),
        code: newUnitCode.trim().toUpperCase(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.units });
      if (res?.data?._id) {
        setUnitId(res.data._id);
      }
      setShowQuickAddUnit(false);
      setNewUnitName("");
      setNewUnitCode("");
    } catch (err: any) {
      setQuickAddError(err.response?.data?.message || err.message || "Failed to create unit");
    } finally {
      setIsCreatingUnit(false);
    }
  };

  const handleSeedStandardUnits = async () => {
    setErrorMsg("");
    setIsSeedingUnits(true);
    try {
      let firstUnitId = "";
      for (const std of STANDARD_UNITS) {
        const alreadyExists = units.some((u) => u.code.toUpperCase() === std.code.toUpperCase());
        if (!alreadyExists) {
          try {
            const res = await productsApi.createUnit({
              name: std.name,
              code: std.code,
            });
            if (!firstUnitId && res?.data?._id) {
              firstUnitId = res.data._id;
            }
          } catch {
            // Ignore duplicate/conflict if already created
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.units });
      if (firstUnitId) {
        setUnitId(firstUnitId);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to add standard units");
    } finally {
      setIsSeedingUnits(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Product Name is required");
      return;
    }

    if (sellingPrice === "") {
      setErrorMsg("Selling Price is required");
      return;
    }

    if (!unitId) {
      setErrorMsg("Unit of Measurement is required");
      return;
    }

    const payload: any = {
      name: name.trim(),
      sellingPrice: Number(sellingPrice),
      defaultUnitId: unitId,
      productType,
      status,
    };

    if (categoryId) payload.categoryId = categoryId;
    if (unitId) payload.defaultUnitId = unitId;
    if (description.trim()) payload.description = description.trim();
    if (brandId) payload.brandId = brandId;
    if (costPrice !== "") payload.costPrice = Number(costPrice);
    if (sku.trim()) payload.sku = sku.trim();
    if (barcode.trim()) payload.barcode = barcode.trim();

    createMutation.mutate(payload);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Add New Product
          </h1>
          <p className="text-xs text-gray-500">
            Fill in essential details to create a product. Advanced options can be expanded.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Simple Default Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Essential Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Basmati Rice 5kg, Wireless Mouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Selling Price ({symbol}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="350"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Unit of Measurement <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddError("");
                      setNewUnitName("");
                      setNewUnitCode("");
                      setShowQuickAddUnit(true);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Quick Add
                  </button>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/products/units"
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Manage
                  </Link>
                </div>
              </div>
              <select
                required
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Unit</option>
                {units.map((u: UnitItem) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
              {units.length === 0 && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-amber-800">
                    No units configured for this workspace yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedStandardUnits}
                    disabled={isSeedingUnits}
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-md transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    {isSeedingUnits ? "Adding Units..." : "Add Standard Units (PCS, BOX, KG...)"}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((c: CategoryItem) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? "Hide Advanced Fields" : "Show Advanced / Optional Fields"}
          </button>
        </div>

        {/* Advanced Section */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Advanced Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  placeholder="e.g., RICE-5KG-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  placeholder="e.g., 8901234567890"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Price ({symbol})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="280"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b: BrandItem) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PHYSICAL">Physical Good</option>
                  <option value="SERVICE">Service</option>
                  <option value="DIGITAL">Digital</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/products"
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>

      {/* Quick Add Unit Modal */}
      {showQuickAddUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                <Plus className="w-4 h-4 text-indigo-600" />
                Quick Add Unit of Measurement
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAddUnit(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickAddError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {quickAddError}
              </div>
            )}

            {/* Presets Chips */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Common Presets (Click to choose)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STANDARD_UNITS.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => {
                      setNewUnitName(preset.name);
                      setNewUnitCode(preset.code);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      newUnitCode.toUpperCase() === preset.code
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {preset.name} ({preset.code})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleQuickAddUnit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Piece, Kilogram, Box"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit Code / Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., PCS, KG, BOX"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  A short, unique abbreviation for invoices and inventory reports.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddUnit(false)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUnit}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isCreatingUnit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Save & Select"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
