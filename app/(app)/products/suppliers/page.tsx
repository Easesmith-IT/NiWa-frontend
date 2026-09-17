"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, Plus, Save, ArrowLeft, Edit3, Trash2, Package, Layers, Tag, Scale } from "lucide-react";
import { productsApi, SupplierItem } from "lib/api/products-api";
import { crmFieldsApi, CrmFieldDefinition } from "lib/api/crm-fields-api";
import { queryKeys } from "lib/api/query-keys";

export default function SuppliersPage() {
  const queryClient = useQueryClient();

  // Create form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Edit form state
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCustomFields, setEditCustomFields] = useState<Record<string, any>>({});

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => productsApi.getSuppliers(),
  });

  // Query custom field definitions for Supplier
  const { data: fieldDefsData } = useQuery({
    queryKey: ["crm-field-definitions", "Supplier"],
    queryFn: () => crmFieldsApi.getFieldDefinitions("Supplier"),
  });

  const suppliers: SupplierItem[] = suppliersData?.data || [];
  const fieldDefinitions: CrmFieldDefinition[] = fieldDefsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");
      setCustomFields({});
      setShowForm(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create supplier");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      setEditingSupplier(null);
      setEditCustomFields({});
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update supplier");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to archive supplier");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Supplier name is required");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    });
  };

  const handleStartEdit = async (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setEditName(sup.name);
    setEditPhone(sup.phone || "");
    setEditEmail(sup.email || "");
    setEditAddress(sup.address || "");
    setEditNotes(sup.notes || "");
    setEditCustomFields({});

    try {
      const res = await productsApi.getSupplierById(sup._id);
      if (res?.data?.customFields) {
        setEditCustomFields(res.data.customFields);
      }
    } catch {
      // Non-blocking if fetch fails
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setErrorMsg("");
    if (!editName.trim()) {
      setErrorMsg("Supplier name is required");
      return;
    }
    updateMutation.mutate({
      id: editingSupplier._id,
      data: {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        address: editAddress.trim() || undefined,
        notes: editNotes.trim() || undefined,
        customFields: Object.keys(editCustomFields).length > 0 ? editCustomFields : undefined,
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Suppliers Directory
            </h1>
            <p className="text-xs text-gray-500">Manage supplier contacts and product variant sourcing links.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSupplier(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Supplier"}
        </button>
      </div>

      {/* Quick Nav Sub-bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-sm pb-2">
        <Link
          href="/products"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <Package className="w-4 h-4" />
          Products
        </Link>
        <Link
          href="/products/categories"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <Layers className="w-4 h-4" />
          Categories
        </Link>
        <Link
          href="/products/brands"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <Tag className="w-4 h-4" />
          Brands
        </Link>
        <Link
          href="/products/suppliers"
          className="px-3 py-1.5 font-medium text-indigo-600 border-b-2 border-indigo-600 flex items-center gap-1.5"
        >
          <Truck className="w-4 h-4" />
          Suppliers
        </Link>
        <Link
          href="/products/units"
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <Scale className="w-4 h-4" />
          Units
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Create Supplier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Logistics, Global Distributors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="supplier@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Optional supplier notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            {fieldDefinitions.length > 0 && (
              <div className="md:col-span-2 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Custom Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fieldDefinitions.map((def) => {
                    const val = customFields[def.key] ?? "";
                    if (def.type === "BOOLEAN") {
                      return (
                        <div key={def.key} className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id={`sup-cf-${def.key}`}
                            checked={!!customFields[def.key]}
                            onChange={(e) =>
                              setCustomFields((prev) => ({ ...prev, [def.key]: e.target.checked }))
                            }
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label htmlFor={`sup-cf-${def.key}`} className="text-xs font-medium text-gray-700 cursor-pointer">
                            {def.label} {def.required && <span className="text-red-500">*</span>}
                          </label>
                        </div>
                      );
                    }
                    return (
                      <div key={def.key}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {def.label} {def.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={def.type === "NUMBER" || def.type === "CURRENCY" ? "number" : "text"}
                          value={val}
                          onChange={(e) =>
                            setCustomFields((prev) => ({
                              ...prev,
                              [def.key]: def.type === "NUMBER" || def.type === "CURRENCY" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                            }))
                          }
                          placeholder={def.description || `Enter ${def.label}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              {createMutation.isPending ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      )}

      {editingSupplier && (
        <form onSubmit={handleUpdate} className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
            Edit Supplier: {editingSupplier.name} ({editingSupplier.supplierId})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            {fieldDefinitions.length > 0 && (
              <div className="md:col-span-2 pt-2 border-t border-indigo-100">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Custom Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fieldDefinitions.map((def) => {
                    const val = editCustomFields[def.key] ?? "";
                    if (def.type === "BOOLEAN") {
                      return (
                        <div key={def.key} className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id={`edit-sup-cf-${def.key}`}
                            checked={!!editCustomFields[def.key]}
                            onChange={(e) =>
                              setEditCustomFields((prev) => ({ ...prev, [def.key]: e.target.checked }))
                            }
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label htmlFor={`edit-sup-cf-${def.key}`} className="text-xs font-medium text-gray-700 cursor-pointer">
                            {def.label} {def.required && <span className="text-red-500">*</span>}
                          </label>
                        </div>
                      );
                    }
                    return (
                      <div key={def.key}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {def.label} {def.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={def.type === "NUMBER" || def.type === "CURRENCY" ? "number" : "text"}
                          value={val}
                          onChange={(e) =>
                            setEditCustomFields((prev) => ({
                              ...prev,
                              [def.key]: def.type === "NUMBER" || def.type === "CURRENCY" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                            }))
                          }
                          placeholder={def.description || `Enter ${def.label}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingSupplier(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Update Supplier"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No suppliers created yet.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Supplier Name</th>
                <th className="px-6 py-3 font-semibold">Business ID</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Phone</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((sup: SupplierItem) => (
                <tr key={sup._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sup.name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{sup.supplierId}</td>
                  <td className="px-6 py-4 text-gray-500">{sup.email || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{sup.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-semibold">
                      {sup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(sup)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100"
                        title="Edit Supplier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to archive supplier '${sup.name}'?`)) {
                            archiveMutation.mutate(sup._id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                        title="Archive Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
