import React, { useState } from "react";
import { Bookmark, Star, Trash2, Plus, Edit2, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  useCrmViewsQuery,
  useCreateCrmViewMutation,
  useUpdateCrmViewMutation,
  useDeleteCrmViewMutation,
  useSetDefaultCrmViewMutation,
} from "../views.queries";
import type { CrmViewObjectKey, CrmViewRecord, FilterAstNode, SortSpec } from "../views.types";

interface SavedViewsManagerProps {
  objectKey: CrmViewObjectKey;
  activeViewId?: string;
  onSelectView: (view: CrmViewRecord | null) => void;
}

interface FilterConditionItem {
  id: string;
  field: string;
  comparator: string;
  value: any;
}

interface SortItem {
  id: string;
  field: string;
  direction: "asc" | "desc";
}

const REGISTERED_FIELDS_BY_OBJECT: Record<CrmViewObjectKey, Array<{ name: string; type: string; label: string }>> = {
  Deal: [
    { name: "title", type: "TEXT", label: "Title" },
    { name: "value", type: "NUMBER", label: "Value" },
    { name: "status", type: "OPTION", label: "Status" },
    { name: "pipelineId", type: "TEXT", label: "Pipeline" },
    { name: "stageId", type: "TEXT", label: "Stage" },
    { name: "expectedCloseDate", type: "DATE", label: "Expected Close Date" },
    { name: "createdAt", type: "DATE_TIME", label: "Created At" },
    { name: "isArchived", type: "BOOLEAN", label: "Archived" },
  ],
  Person: [
    { name: "firstName", type: "TEXT", label: "First Name" },
    { name: "lastName", type: "TEXT", label: "Last Name" },
    { name: "displayName", type: "TEXT", label: "Display Name" },
    { name: "source", type: "TEXT", label: "Source" },
    { name: "createdAt", type: "DATE_TIME", label: "Created At" },
    { name: "isArchived", type: "BOOLEAN", label: "Archived" },
  ],
  Company: [
    { name: "name", type: "TEXT", label: "Company Name" },
    { name: "website", type: "URL", label: "Website" },
    { name: "domain", type: "TEXT", label: "Domain" },
    { name: "industry", type: "TEXT", label: "Industry" },
    { name: "createdAt", type: "DATE_TIME", label: "Created At" },
    { name: "isArchived", type: "BOOLEAN", label: "Archived" },
  ],
  Lead: [
    { name: "name", type: "TEXT", label: "Lead Name" },
    { name: "status", type: "OPTION", label: "Status" },
    { name: "leadSource", type: "TEXT", label: "Lead Source" },
    { name: "createdAt", type: "DATE_TIME", label: "Created At" },
    { name: "isArchived", type: "BOOLEAN", label: "Archived" },
  ],
};

const COMPARATORS_BY_TYPE: Record<string, string[]> = {
  TEXT: ["=", "!=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  NUMBER: ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  CURRENCY: ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  DATE: ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  DATE_TIME: ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  BOOLEAN: ["=", "!=", "IS EMPTY", "IS NOT EMPTY"],
  OPTION: ["=", "!=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  MULTI_OPTION: ["IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
  URL: ["=", "!=", "IN", "NOT IN", "IS EMPTY", "IS NOT EMPTY"],
};

export const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  objectKey,
  activeViewId,
  onSelectView,
}) => {
  const { data: viewsData } = useCrmViewsQuery(objectKey);
  const rawViews = (viewsData as any)?.views || (viewsData as any)?.data || viewsData;
  const views: CrmViewRecord[] = Array.isArray(rawViews) ? rawViews : [];
  const createMutation = useCreateCrmViewMutation();
  const updateMutation = useUpdateCrmViewMutation();
  const deleteMutation = useDeleteCrmViewMutation();
  const setDefaultMutation = useSetDefaultCrmViewMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingView, setEditingView] = useState<CrmViewRecord | null>(null);

  const [viewName, setViewName] = useState("");
  const [visibilityScope, setVisibilityScope] = useState<"private" | "team" | "workspace">("private");
  const [isDefault, setIsDefault] = useState(false);

  // Slice F & G: Filter AST Builder state
  const [logicalOp, setLogicalOp] = useState<"AND" | "OR">("AND");
  const [filterConditions, setFilterConditions] = useState<FilterConditionItem[]>([]);

  // Slice H: Multi-Sort Builder state
  const [sortSpecs, setSortSpecs] = useState<SortItem[]>([]);

  // Slice I: Column Configurator state
  const availableFields = REGISTERED_FIELDS_BY_OBJECT[objectKey] || REGISTERED_FIELDS_BY_OBJECT.Deal;
  const [selectedVisibleFields, setSelectedVisibleFields] = useState<string[]>([
    "title",
    "value",
    "status",
    "createdAt",
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({ title: 200, value: 120 });

  const activeView = views.find((v) => v && v._id === activeViewId) || null;

  const handleOpenCreate = () => {
    setEditingView(null);
    setViewName("");
    setVisibilityScope("private");
    setIsDefault(false);
    setLogicalOp("AND");
    setFilterConditions([]);
    setSortSpecs([{ id: "sort-1", field: "createdAt", direction: "desc" }]);
    setSelectedVisibleFields(availableFields.slice(0, 4).map((f) => f.name));
    setColumnWidths({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (view: CrmViewRecord) => {
    setEditingView(view);
    setViewName(view.name);
    setVisibilityScope(view.visibilityScope);
    setIsDefault(view.isDefault);

    // Parse Filter AST
    if (view.filterAst) {
      if (view.filterAst.type === "PREDICATE") {
        setLogicalOp("AND");
        setFilterConditions([
          {
            id: "cond-1",
            field: view.filterAst.field,
            comparator: view.filterAst.comparator,
            value: view.filterAst.value,
          },
        ]);
      } else if (view.filterAst.type === "LOGICAL") {
        setLogicalOp(view.filterAst.operator || "AND");
        const items = (view.filterAst.conditions || []).map((c: any, idx: number) => ({
          id: `cond-${idx + 1}`,
          field: c.field || availableFields[0].name,
          comparator: c.comparator || "=",
          value: c.value !== undefined ? c.value : "",
        }));
        setFilterConditions(items);
      }
    } else {
      setFilterConditions([]);
    }

    // Parse Multi-Sort
    if (view.sorting && view.sorting.length > 0) {
      setSortSpecs(view.sorting.map((s: any, idx: number) => ({ id: `sort-${idx + 1}`, field: s.field, direction: s.direction })));
    } else {
      setSortSpecs([{ id: "sort-1", field: "createdAt", direction: "desc" }]);
    }

    setSelectedVisibleFields(view.visibleFields || availableFields.slice(0, 4).map((f) => f.name));
    setColumnWidths(view.columnWidths || {});
    setIsModalOpen(true);
  };

  const handleAddCondition = () => {
    const firstField = availableFields[0].name;
    setFilterConditions((prev) => [
      ...prev,
      { id: `cond-${Date.now()}`, field: firstField, comparator: "=", value: "" },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setFilterConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleConditionChange = (id: string, key: keyof FilterConditionItem, val: any) => {
    setFilterConditions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [key]: val };
          if (key === "field") {
            const fieldMeta = availableFields.find((f) => f.name === val);
            const allowed = COMPARATORS_BY_TYPE[fieldMeta?.type || "TEXT"] || COMPARATORS_BY_TYPE.TEXT;
            if (!allowed.includes(updated.comparator)) {
              updated.comparator = allowed[0];
            }
          }
          return updated;
        }
        return c;
      })
    );
  };

  const handleAddSort = () => {
    const usedFields = new Set(sortSpecs.map((s) => s.field));
    const availableSortField = availableFields.find((f) => !usedFields.has(f.name))?.name || availableFields[0].name;
    setSortSpecs((prev) => [...prev, { id: `sort-${Date.now()}`, field: availableSortField, direction: "asc" }]);
  };

  const handleRemoveSort = (id: string) => {
    setSortSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSortChange = (id: string, key: keyof SortItem, val: any) => {
    setSortSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  const toggleColumnSelection = (fieldName: string) => {
    setSelectedVisibleFields((prev) =>
      prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]
    );
  };

  const handleSaveView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    // Build Filter AST
    let filterAst: FilterAstNode | null = null;
    const validConditions = filterConditions.filter((c) => c.field && c.comparator);
    if (validConditions.length === 1) {
      const cond = validConditions[0];
      filterAst = {
        type: "PREDICATE",
        field: cond.field,
        comparator: cond.comparator as any,
        value: ["IS EMPTY", "IS NOT EMPTY"].includes(cond.comparator) ? undefined : cond.value,
      };
    } else if (validConditions.length > 1) {
      filterAst = {
        type: "LOGICAL",
        operator: logicalOp,
        conditions: validConditions.map((cond) => ({
          type: "PREDICATE",
          field: cond.field,
          comparator: cond.comparator as any,
          value: ["IS EMPTY", "IS NOT EMPTY"].includes(cond.comparator) ? undefined : cond.value,
        })),
      };
    }

    // Build Multi-Sort Specs
    const sorting: SortSpec[] = sortSpecs.map((s) => ({ field: s.field, direction: s.direction }));

    if (editingView) {
      const updated = await updateMutation.mutateAsync({
        id: editingView._id,
        payload: {
          name: viewName.trim(),
          visibilityScope,
          isDefault,
          filterAst,
          sorting,
          visibleFields: selectedVisibleFields,
          columnWidths,
        },
      });
      setIsModalOpen(false);
      onSelectView(updated as any);
    } else {
      const created = await createMutation.mutateAsync({
        name: viewName.trim(),
        objectKey,
        visibilityScope,
        isDefault,
        filterAst,
        sorting,
        visibleFields: selectedVisibleFields,
        columnWidths,
      });
      setIsModalOpen(false);
      onSelectView(created as any);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    await setDefaultMutation.mutateAsync(viewId);
  };

  const handleDeleteView = async (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved view?")) {
      await deleteMutation.mutateAsync(viewId);
      if (activeViewId === viewId) {
        onSelectView(null);
      }
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 rounded-md border border-slate-300 bg-white px-2 py-1">
          <Bookmark className="h-4 w-4 text-slate-500" />
          <select
            value={activeViewId || ""}
            onChange={(e) => {
              const selected = views.find((v) => v._id === e.target.value) || null;
              onSelectView(selected);
            }}
            className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="">All {objectKey}s (Default View)</option>
            {views.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} {v.isDefault ? "★" : ""} ({v.visibilityScope})
              </option>
            ))}
          </select>
        </div>

        {activeView && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(activeView)}
            title="Edit Active View"
            className="px-2 py-1 text-slate-500 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}

        {activeView && !activeView.isDefault && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => handleSetDefault(e, activeView._id)}
            title="Set as Default View"
            className="px-2 py-1 text-slate-500 hover:text-amber-500"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}

        {activeView && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteView(e, activeView._id)}
            title="Delete View"
            className="px-2 py-1 text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1 px-2.5 py-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Save View
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-600" />
              {editingView ? `Edit View: ${editingView.name}` : "Create New View"}
            </h2>

            <form onSubmit={handleSaveView} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">View Name</label>
                <Input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="e.g. High Value Deals"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Visibility Scope</label>
                <select
                  value={visibilityScope}
                  onChange={(e) => setVisibilityScope(e.target.value as any)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2"
                >
                  <option value="private">Private (Only Me)</option>
                  <option value="team">Team (Team Members)</option>
                  <option value="workspace">Workspace (All Members)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isDefaultCheck" className="text-slate-700 font-medium">
                  Set as Default View for {objectKey}
                </label>
              </div>

              {/* Slice F & G: Filter AST Builder */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Filter Conditions (AST)</span>
                  {filterConditions.length > 1 && (
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md">
                      <span className="text-[11px] font-medium text-slate-600">Match:</span>
                      <button
                        type="button"
                        onClick={() => setLogicalOp("AND")}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          logicalOp === "AND" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        AND
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogicalOp("OR")}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          logicalOp === "OR" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        OR
                      </button>
                    </div>
                  )}
                </div>

                {filterConditions.map((cond) => {
                  const fieldMeta = availableFields.find((f) => f.name === cond.field) || availableFields[0];
                  const allowedComparators = COMPARATORS_BY_TYPE[fieldMeta.type] || COMPARATORS_BY_TYPE.TEXT;
                  const isNullComparator = ["IS EMPTY", "IS NOT EMPTY"].includes(cond.comparator);

                  return (
                    <div key={cond.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
                      <select
                        value={cond.field}
                        onChange={(e) => handleConditionChange(cond.id, "field", e.target.value)}
                        className="w-1/3 rounded-md border border-slate-300 bg-white p-1 text-xs"
                      >
                        {availableFields.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.label} ({f.type})
                          </option>
                        ))}
                      </select>

                      <select
                        value={cond.comparator}
                        onChange={(e) => handleConditionChange(cond.id, "comparator", e.target.value)}
                        className="w-1/4 rounded-md border border-slate-300 bg-white p-1 text-xs"
                      >
                        {allowedComparators.map((comp) => (
                          <option key={comp} value={comp}>
                            {comp}
                          </option>
                        ))}
                      </select>

                      {!isNullComparator && (
                        <div className="flex-1">
                          {fieldMeta.type === "BOOLEAN" ? (
                            <select
                              value={String(cond.value)}
                              onChange={(e) => handleConditionChange(cond.id, "value", e.target.value === "true")}
                              className="w-full rounded-md border border-slate-300 bg-white p-1 text-xs"
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : fieldMeta.type === "NUMBER" || fieldMeta.type === "CURRENCY" ? (
                            <Input
                              type="number"
                              value={cond.value !== undefined ? cond.value : ""}
                              onChange={(e) => handleConditionChange(cond.id, "value", e.target.value ? Number(e.target.value) : "")}
                              placeholder="Numeric value"
                            />
                          ) : fieldMeta.type === "DATE" ? (
                            <Input
                              type="date"
                              value={cond.value || ""}
                              onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                            />
                          ) : fieldMeta.type === "DATE_TIME" ? (
                            <Input
                              type="datetime-local"
                              value={cond.value || ""}
                              onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                            />
                          ) : (
                            <Input
                              value={cond.value || ""}
                              onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                              placeholder="Value"
                            />
                          )}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCondition(cond.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Condition
                </Button>
              </div>

              {/* Slice H: Multi-Sort Builder */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <span className="font-semibold text-slate-800 block">Multi-Field Sorting Rules</span>
                {sortSpecs.map((sort, idx) => (
                  <div key={sort.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 w-12">Rule #{idx + 1}</span>
                    <select
                      value={sort.field}
                      onChange={(e) => handleSortChange(sort.id, "field", e.target.value)}
                      className="flex-1 rounded-md border border-slate-300 bg-white p-1 text-xs"
                    >
                      {availableFields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sort.direction}
                      onChange={(e) => handleSortChange(sort.id, "direction", e.target.value as any)}
                      className="w-28 rounded-md border border-slate-300 bg-white p-1 text-xs font-semibold"
                    >
                      <option value="asc">ASC (A-Z, 0-9)</option>
                      <option value="desc">DESC (Z-A, 9-0)</option>
                    </select>

                    {sortSpecs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSort(sort.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSort}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Sort Rule
                </Button>
              </div>

              {/* Slice I: Column Configurator */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <span className="font-semibold text-slate-800 block">Visible Column Configuration</span>
                <div className="flex flex-wrap gap-2">
                  {availableFields.map((f) => {
                    const isSelected = selectedVisibleFields.includes(f.name);
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => toggleColumnSelection(f.name)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                            : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {f.label} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save View"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
