"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scale, Plus, Save, Trash2, ArrowLeft, Edit3, X, Package, Layers, Tag, Truck } from "lucide-react";
import { productsApi, UnitItem } from "lib/api/products-api";
import { queryKeys } from "lib/api/query-keys";

export default function UnitsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Edit unit state
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const { data: unitsData, isLoading } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => productsApi.getUnits(),
  });

  const units: UnitItem[] = unitsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
      setName("");
      setCode("");
      setShowForm(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create unit");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
      setEditingUnit(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update unit");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to archive unit");
    },
  });

  const handleStartEdit = (unit: UnitItem) => {
    setEditingUnit(unit);
    setEditName(unit.name);
    setEditCode(unit.code);
    setShowForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setErrorMsg("");
    if (!editName.trim()) {
      setErrorMsg("Unit name is required");
      return;
    }
    if (!editCode.trim()) {
      setErrorMsg("Unit code is required");
      return;
    }
    updateMutation.mutate({
      id: editingUnit._id,
      data: {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Unit name is required");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Unit code is required");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      code: code.trim().toUpperCase(),
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
              <Scale className="w-5 h-5 text-indigo-600" />
              Units of Measurement
            </h1>
            <p className="text-xs text-gray-500">Manage units for product inventory packaging and pricing.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingUnit(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Unit"}
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
          className="px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <Truck className="w-4 h-4" />
          Suppliers
        </Link>
        <Link
          href="/products/units"
          className="px-3 py-1.5 font-medium text-indigo-600 border-b-2 border-indigo-600 flex items-center gap-1.5"
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

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Create Unit of Measurement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kilogram, Pieces, Liter"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="e.g. KG, PCS, LTR"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              {createMutation.isPending ? "Saving..." : "Save Unit"}
            </button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingUnit && (
        <form onSubmit={handleUpdate} className="bg-amber-50/50 border border-amber-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h2 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Edit Unit: {editingUnit.name} ({editingUnit.code})
            </h2>
            <button
              type="button"
              onClick={() => setEditingUnit(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unit Code / Symbol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingUnit(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium text-sm rounded-lg hover:bg-amber-700"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Updating..." : "Update Unit"}
            </button>
          </div>
        </form>
      )}

      {/* Units Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No units created yet.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Unit Name</th>
                <th className="px-6 py-3 font-semibold">Code / Symbol</th>
                <th className="px-6 py-3 font-semibold">Business ID</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {units.map((unit: UnitItem) => (
                <tr key={unit._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{unit.name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700">{unit.code}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{unit.unitId}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-semibold">
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleStartEdit(unit)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-xs inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Archive unit '${unit.name}' (${unit.code})?`)) {
                          deleteMutation.mutate(unit._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 font-medium text-xs inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Archive
                    </button>
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
