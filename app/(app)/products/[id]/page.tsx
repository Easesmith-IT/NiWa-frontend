"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Save, Trash2 } from "lucide-react";
import { productsApi } from "lib/api/products-api";
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

  const { data: productData, isLoading, error } = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => productsApi.getProductById(productId),
  });

  const product = productData?.data;

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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Main Content */}
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
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Variants Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Product Variants ({product.variants?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {product.variants?.map((variant: any) => (
                  <div key={variant._id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {variant.name}
                        {variant.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-semibold rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        ID: {variant.variantId} {variant.sku ? `| SKU: ${variant.sku}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{variant.sellingPrice}</div>
                      {variant.costPrice > 0 && (
                        <div className="text-xs text-gray-400">Cost: ₹{variant.costPrice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Fields & Summary Sidebar */}
          <div className="space-y-6">
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
