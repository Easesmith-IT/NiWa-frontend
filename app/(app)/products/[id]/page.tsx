"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Save, Trash2, Plus, Star, Truck, CheckCircle, X, Boxes } from "lucide-react";
import { productsApi, SupplierItem, UnitItem } from "lib/api/products-api";
import { getInventoryLevels, InventoryLevelItem } from "lib/api/inventory-api";
import { queryKeys } from "lib/api/query-keys";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Variant Modal State
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [variantName, setVariantName] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [variantBarcode, setVariantBarcode] = useState("");
  const [variantSellingPrice, setVariantSellingPrice] = useState<number | "">("");
  const [variantCostPrice, setVariantCostPrice] = useState<number | "">("");
  const [variantUnitId, setVariantUnitId] = useState("");

  // Link Supplier Modal State
  const [linkingVariantId, setLinkingVariantId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [supplierSku, setSupplierSku] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(1);
  const [preferred, setPreferred] = useState(false);

  // Queries
  const { data: productData, isLoading, error } = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => productsApi.getProductById(productId),
  });

  const { data: unitsData } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => productsApi.getUnits(),
  });

  const { data: suppliersData } = useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => productsApi.getSuppliers(),
  });

  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: [...queryKeys.inventoryLevels, { productId }],
    queryFn: () => getInventoryLevels({ productId }),
  });

  const product = productData?.data;
  const units: UnitItem[] = unitsData?.data || [];
  const suppliers: SupplierItem[] = suppliersData?.data || [];
  const inventoryLevels: InventoryLevelItem[] = inventoryData?.data || [];

  // Product Mutations
  const updateMutation = useMutation({
    mutationFn: (payload: any) => productsApi.updateProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      setIsEditing(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      router.push("/products");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to archive product");
    },
  });

  // Variant Mutations
  const createVariantMutation = useMutation({
    mutationFn: (payload: any) => productsApi.createVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      setShowAddVariant(false);
      resetVariantForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create variant");
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: any }) =>
      productsApi.updateVariant(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      setEditingVariant(null);
      resetVariantForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update variant");
    },
  });

  const archiveVariantMutation = useMutation({
    mutationFn: (variantId: string) => productsApi.deleteVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to archive variant");
    },
  });

  // ProductSupplier Mutations
  const linkSupplierMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: any }) =>
      productsApi.linkSupplierToVariant(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      setLinkingVariantId(null);
      resetSupplierLinkForm();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to link supplier");
    },
  });

  const unlinkSupplierMutation = useMutation({
    mutationFn: (productSupplierId: string) => productsApi.unlinkSupplierFromVariant(productSupplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to unlink supplier");
    },
  });

  const resetVariantForm = () => {
    setVariantName("");
    setVariantSku("");
    setVariantBarcode("");
    setVariantSellingPrice("");
    setVariantCostPrice("");
    setVariantUnitId("");
  };

  const resetSupplierLinkForm = () => {
    setSupplierId("");
    setSupplierSku("");
    setPurchasePrice("");
    setMinimumOrderQuantity(1);
    setPreferred(false);
  };

  const startEdit = () => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setStatus(product.status);
      setIsEditing(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    updateMutation.mutate({
      name,
      description,
      status,
    });
  };

  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!variantName.trim()) {
      setErrorMsg("Variant name is required");
      return;
    }
    if (variantSellingPrice === "") {
      setErrorMsg("Selling price is required");
      return;
    }

    createVariantMutation.mutate({
      name: variantName.trim(),
      sellingPrice: Number(variantSellingPrice),
      costPrice: variantCostPrice !== "" ? Number(variantCostPrice) : 0,
      sku: variantSku.trim() || undefined,
      barcode: variantBarcode.trim() || undefined,
      unitId: variantUnitId || undefined,
    });
  };

  const handleUpdateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;
    setErrorMsg("");
    updateVariantMutation.mutate({
      variantId: editingVariant._id,
      payload: {
        name: variantName.trim() || undefined,
        sellingPrice: variantSellingPrice !== "" ? Number(variantSellingPrice) : undefined,
        costPrice: variantCostPrice !== "" ? Number(variantCostPrice) : undefined,
        sku: variantSku.trim() || undefined,
        barcode: variantBarcode.trim() || undefined,
        unitId: variantUnitId || undefined,
      },
    });
  };

  const handleLinkSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingVariantId) return;
    setErrorMsg("");
    if (!supplierId) {
      setErrorMsg("Please select a supplier");
      return;
    }

    linkSupplierMutation.mutate({
      variantId: linkingVariantId,
      payload: {
        supplierId,
        supplierSku: supplierSku.trim() || undefined,
        purchasePrice: purchasePrice !== "" ? Number(purchasePrice) : undefined,
        minimumOrderQuantity: Number(minimumOrderQuantity) || 1,
        preferred,
      },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="p-8 text-center text-red-500">Product not found or access denied.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  product.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : product.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.status}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              Business ID: {product.productId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to archive this product?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product Information Form or View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Edit Product Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details & Variants Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
                Product Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-500">Type</span>
                  <span className="font-medium text-gray-800">{product.productType}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Category</span>
                  <span className="font-medium text-gray-800">{product.categoryId?.name || "None"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Brand</span>
                  <span className="font-medium text-gray-800">{product.brandId?.name || "None"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Default Unit</span>
                  <span className="font-medium text-gray-800">
                    {product.defaultUnitId?.name || product.defaultUnitId?.code || "None"}
                  </span>
                </div>
              </div>
              {product.description && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Description</span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
            </div>

            {/* Product Variants Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Product Variants ({product.variants?.length || 0})
                </h2>
                <button
                  onClick={() => {
                    setShowAddVariant(!showAddVariant);
                    setEditingVariant(null);
                    resetVariantForm();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddVariant ? "Cancel" : "Add Variant"}
                </button>
              </div>

              {/* Add Variant Form */}
              {showAddVariant && (
                <form onSubmit={handleCreateVariant} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase">Create New Variant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Variant Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Red / Large"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Selling Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="350"
                        value={variantSellingPrice}
                        onChange={(e) => setVariantSellingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">SKU</label>
                      <input
                        type="text"
                        placeholder="SKU-001"
                        value={variantSku}
                        onChange={(e) => setVariantSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Barcode</label>
                      <input
                        type="text"
                        placeholder="890123..."
                        value={variantBarcode}
                        onChange={(e) => setVariantBarcode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Cost Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="280"
                        value={variantCostPrice}
                        onChange={(e) => setVariantCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Unit</label>
                      <select
                        value={variantUnitId}
                        onChange={(e) => setVariantUnitId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      >
                        <option value="">Default Unit</option>
                        {units.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={createVariantMutation.isPending}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700"
                    >
                      {createVariantMutation.isPending ? "Creating..." : "Save Variant"}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Variant Form */}
              {editingVariant && (
                <form onSubmit={handleUpdateVariant} className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-amber-900 uppercase">Edit Variant: {editingVariant.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Variant Name</label>
                      <input
                        type="text"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Selling Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variantSellingPrice}
                        onChange={(e) => setVariantSellingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">SKU</label>
                      <input
                        type="text"
                        value={variantSku}
                        onChange={(e) => setVariantSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Barcode</label>
                      <input
                        type="text"
                        value={variantBarcode}
                        onChange={(e) => setVariantBarcode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Cost Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variantCostPrice}
                        onChange={(e) => setVariantCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingVariant(null)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateVariantMutation.isPending}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700"
                    >
                      {updateVariantMutation.isPending ? "Updating..." : "Update Variant"}
                    </button>
                  </div>
                </form>
              )}

              {/* Variant List */}
              <div className="divide-y divide-gray-100">
                {product.variants?.map((variant: any) => (
                  <div key={variant._id} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {variant.name}
                          {variant.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-semibold rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-indigo-600" /> Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          ID: {variant.variantId} {variant.sku ? `| SKU: ${variant.sku}` : ""}{" "}
                          {variant.barcode ? `| Barcode: ${variant.barcode}` : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">₹{variant.sellingPrice}</div>
                          {variant.costPrice > 0 && (
                            <div className="text-xs text-gray-400">Cost: ₹{variant.costPrice}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!variant.isDefault && (
                            <button
                              onClick={() =>
                                updateVariantMutation.mutate({
                                  variantId: variant._id,
                                  payload: { isDefault: true },
                                })
                              }
                              className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-gray-100"
                              title="Set as Default Variant"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingVariant(variant);
                              setShowAddVariant(false);
                              setVariantName(variant.name);
                              setVariantSku(variant.sku || "");
                              setVariantBarcode(variant.barcode || "");
                              setVariantSellingPrice(variant.sellingPrice);
                              setVariantCostPrice(variant.costPrice || "");
                              setVariantUnitId(variant.unitId?._id || "");
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-100"
                            title="Edit Variant"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setLinkingVariantId(linkingVariantId === variant._id ? null : variant._id);
                              resetSupplierLinkForm();
                            }}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded hover:bg-gray-100"
                            title="Link Supplier"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          {!variant.isDefault && (
                            <button
                              onClick={() => {
                                if (confirm(`Archive variant '${variant.name}'?`)) {
                                  archiveVariantMutation.mutate(variant._id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                              title="Archive Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Link Supplier Form */}
                    {linkingVariantId === variant._id && (
                      <form onSubmit={handleLinkSupplier} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            Link Supplier to '{variant.name}'
                          </h4>
                          <button
                            type="button"
                            onClick={() => setLinkingVariantId(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-gray-700 mb-0.5">Supplier *</label>
                            <select
                              required
                              value={supplierId}
                              onChange={(e) => setSupplierId(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white"
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.name} ({s.supplierId})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-gray-700 mb-0.5">Supplier SKU</label>
                            <input
                              type="text"
                              placeholder="e.g. SUP-SKU-99"
                              value={supplierSku}
                              onChange={(e) => setSupplierSku(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-gray-700 mb-0.5">Purchase Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="250"
                              value={purchasePrice}
                              onChange={(e) => setPurchasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-gray-700 mb-0.5">Min Order Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={minimumOrderQuantity}
                              onChange={(e) => setMinimumOrderQuantity(Number(e.target.value))}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white"
                            />
                          </div>
                          <div className="md:col-span-2 flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id={`preferred-${variant._id}`}
                              checked={preferred}
                              onChange={(e) => setPreferred(e.target.checked)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor={`preferred-${variant._id}`} className="font-medium text-gray-700">
                              Set as Preferred Supplier for this Variant
                            </label>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={linkSupplierMutation.isPending}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                          >
                            {linkSupplierMutation.isPending ? "Linking..." : "Link Supplier"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Fields & Summary Sidebar */}
          <div className="space-y-6">
            {/* Lightweight Stock & Availability Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-indigo-600" />
                  Stock & Availability
                </h3>
                <Link
                  href="/inventory"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Manage →
                </Link>
              </div>

              {isInventoryLoading ? (
                <p className="text-xs text-gray-400 py-2">Loading stock levels...</p>
              ) : inventoryLevels.length === 0 ? (
                <div className="py-2 text-xs text-gray-500">
                  <p>No stock recorded at any location.</p>
                  <Link
                    href="/inventory"
                    className="inline-block mt-2 text-xs text-indigo-600 font-medium hover:underline"
                  >
                    + Record Opening Stock
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {inventoryLevels.map((lvl) => (
                    <div
                      key={lvl._id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {lvl.locationId?.name || "Location"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {lvl.inventoryItemId?.productVariantId?.name || "Standard"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>
                          <span className="font-semibold text-gray-900">{lvl.onHand}</span>
                          <span className="text-gray-400 ml-1">
                            {lvl.inventoryItemId?.productVariantId?.unitId?.code || "units"}
                          </span>
                        </div>
                        <div>
                          {lvl.onHand <= 0 ? (
                            <span className="text-[10px] text-red-600 font-medium">Out of stock</span>
                          ) : lvl.isLowStock ? (
                            <span className="text-[10px] text-amber-600 font-medium">Low stock</span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium">In stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">
                Pricing Summary
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Selling Price</span>
                <span className="font-bold text-gray-900 text-base">₹{product.sellingPrice}</span>
              </div>
              {product.costPrice > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Cost Price</span>
                  <span className="font-medium text-gray-700">₹{product.costPrice}</span>
                </div>
              )}
            </div>

            {product.customFields && Object.keys(product.customFields).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">
                  Custom Fields
                </h3>
                {Object.entries(product.customFields).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-500 capitalize">{k.replace("_", " ")}</span>
                    <span className="font-medium text-gray-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
