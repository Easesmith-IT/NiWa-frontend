import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { FilterBuilder, FilterConditionItem } from "./FilterBuilder";
import { SortBuilder, SortItem } from "./SortBuilder";
import { ColumnConfigurator } from "./ColumnConfigurator";
import type { CrmViewObjectKey, CrmViewRecord, CreateCrmViewPayload, UpdateCrmViewPayload, FilterAstNode, SortSpec, CrmFieldMetadata } from "../../views.types";

interface ViewEditorProps {
  objectKey: CrmViewObjectKey;
  editingView: CrmViewRecord | null;
  availableFields: CrmFieldMetadata[];
  isLoadingFields: boolean;
  isFieldsError: boolean;
  onSave: (payload: CreateCrmViewPayload | UpdateCrmViewPayload) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const ViewEditor: React.FC<ViewEditorProps> = ({
  objectKey,
  editingView,
  availableFields,
  isLoadingFields,
  isFieldsError,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [viewName, setViewName] = useState("");
  const [viewDescription, setViewDescription] = useState("");
  const [visibilityScope, setVisibilityScope] = useState<"private" | "team" | "workspace">("private");
  const [isDefault, setIsDefault] = useState(false);

  const [logicalOp, setLogicalOp] = useState<"AND" | "OR">("AND");
  const [filterConditions, setFilterConditions] = useState<FilterConditionItem[]>([]);
  const [sortSpecs, setSortSpecs] = useState<SortItem[]>([]);
  const [selectedVisibleFields, setSelectedVisibleFields] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (editingView) {
      setViewName(editingView.name);
      setViewDescription(editingView.description || "");
      setVisibilityScope(editingView.visibilityScope);
      setIsDefault(editingView.isDefault);

      // Parse Filter AST
      if (editingView.filterAst) {
        if (editingView.filterAst.type === "PREDICATE") {
          setLogicalOp("AND");
          setFilterConditions([
            {
              id: "cond-1",
              field: editingView.filterAst.field,
              comparator: editingView.filterAst.comparator,
              value: editingView.filterAst.value,
            },
          ]);
        } else if (editingView.filterAst.type === "LOGICAL") {
          setLogicalOp(editingView.filterAst.operator || "AND");
          const items = (editingView.filterAst.conditions || []).map((c: any, idx: number) => ({
            id: `cond-${idx + 1}`,
            field: c.field,
            comparator: c.comparator,
            value: c.value !== undefined ? c.value : "",
          }));
          setFilterConditions(items);
        }
      } else {
        setFilterConditions([]);
      }

      // Parse Multi-Sort
      if (editingView.sorting && editingView.sorting.length > 0) {
        setSortSpecs(editingView.sorting.map((s: any, idx: number) => ({ id: `sort-${idx + 1}`, field: s.field, direction: s.direction })));
      } else {
        setSortSpecs([]);
      }

      setSelectedVisibleFields(editingView.visibleFields || availableFields.slice(0, 5).map((f) => f.key));
      setColumnWidths(editingView.columnWidths || {});
    } else {
      setViewName("");
      setViewDescription("");
      setVisibilityScope("private");
      setIsDefault(false);
      setLogicalOp("AND");
      setFilterConditions([]);
      const defaultSortField = availableFields.find(f => f.key === "createdAt" || f.sortable)?.key;
      setSortSpecs(defaultSortField ? [{ id: "sort-1", field: defaultSortField, direction: "desc" }] : []);
      setSelectedVisibleFields(availableFields.slice(0, 5).map((f) => f.key));
      setColumnWidths({});
    }
  }, [editingView, availableFields]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    await onSave({
      name: viewName.trim(),
      description: viewDescription.trim() || undefined,
      visibilityScope,
      isDefault,
      filterAst,
      sorting,
      visibleFields: selectedVisibleFields,
      columnWidths,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl flex flex-col max-h-[95vh]">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 shrink-0">
          <Bookmark className="h-5 w-5 text-blue-600" />
          {editingView ? `Edit View: ${editingView.name}` : "Create New View"}
        </h2>

        {isLoadingFields ? (
          <div className="flex-1 py-8 flex flex-col items-center justify-center text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500 mb-2"></div>
            <span className="text-xs font-medium">Loading available fields...</span>
          </div>
        ) : isFieldsError ? (
          <div className="flex-1 py-4 px-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            Unable to load available fields. Try again.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">View Details</h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                    <Input
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      placeholder="e.g. High Value Deals"
                      className="text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description (Optional)</label>
                    <Input
                      value={viewDescription}
                      onChange={(e) => setViewDescription(e.target.value)}
                      placeholder="Briefly describe the purpose of this view"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-800">Visibility</h3>
                <div className="mt-2 space-y-3">
                  <select
                    value={visibilityScope}
                    onChange={(e) => setVisibilityScope(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
                  >
                    <option value="private">Private (Only Me)</option>
                    <option value="team">Team (Team Members)</option>
                    <option value="workspace">Workspace (All Members)</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefaultCheck"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="isDefaultCheck" className="text-xs text-slate-700 font-medium">
                      Set as Default View for {objectKey}
                    </label>
                  </div>
                </div>
              </div>

              <FilterBuilder
                availableFields={availableFields}
                logicalOp={logicalOp}
                setLogicalOp={setLogicalOp}
                filterConditions={filterConditions}
                setFilterConditions={setFilterConditions}
              />

              <SortBuilder
                availableFields={availableFields}
                sortSpecs={sortSpecs}
                setSortSpecs={setSortSpecs}
              />

              <ColumnConfigurator
                availableFields={availableFields}
                selectedVisibleFields={selectedVisibleFields}
                setSelectedVisibleFields={setSelectedVisibleFields}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 shrink-0 sticky bottom-0 bg-white">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save View"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
