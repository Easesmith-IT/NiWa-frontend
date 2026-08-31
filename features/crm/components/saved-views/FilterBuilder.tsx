import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import type { CrmFieldMetadata } from "../../views.types";

export interface FilterConditionItem {
  id: string;
  field: string;
  comparator: string;
  value: any;
}

interface FilterBuilderProps {
  availableFields: CrmFieldMetadata[];
  logicalOp: "AND" | "OR";
  setLogicalOp: (op: "AND" | "OR") => void;
  filterConditions: FilterConditionItem[];
  setFilterConditions: (val: FilterConditionItem[] | ((prev: FilterConditionItem[]) => FilterConditionItem[])) => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  availableFields,
  logicalOp,
  setLogicalOp,
  filterConditions,
  setFilterConditions,
}) => {
  const handleAddCondition = () => {
    const firstField = availableFields[0]?.key || "title";
    const fieldMeta = availableFields.find(f => f.key === firstField);
    const comparators = fieldMeta?.comparators || ["="];
    setFilterConditions((prev) => [
      ...prev,
      { id: `cond-${Date.now()}`, field: firstField, comparator: comparators[0], value: "" },
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
            const fieldMeta = availableFields.find((f) => f.key === val);
            const allowed = fieldMeta?.comparators || [];
            if (allowed.length > 0 && !allowed.includes(updated.comparator)) {
              updated.comparator = allowed[0];
            }
          }
          return updated;
        }
        return c;
      })
    );
  };

  if (availableFields.length === 0) {
    return (
      <div className="border-t border-slate-200 pt-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <p className="text-xs text-slate-500 mt-1">No filterable fields are available for this object.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <p className="text-xs text-slate-500 mt-0.5">Build the records this view should show</p>
        </div>
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
        const fieldMeta = availableFields.find((f) => f.key === cond.field);
        if (!fieldMeta) {
          return (
             <div key={cond.id} className="flex items-center gap-2 bg-rose-50 p-2 rounded-md border border-rose-200 text-rose-700 text-xs">
                This field is no longer available.
                <div className="flex-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCondition(cond.id)} className="text-slate-400 hover:text-rose-600 p-1"><X className="h-4 w-4" /></Button>
             </div>
          );
        }
        
        const allowedComparators = fieldMeta.comparators || [];
        const isNullComparator = ["IS EMPTY", "IS NOT EMPTY"].includes(cond.comparator);

        return (
          <div key={cond.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
            <select
              value={cond.field}
              onChange={(e) => handleConditionChange(cond.id, "field", e.target.value)}
              className="w-1/3 rounded-md border border-slate-300 bg-white p-1.5 text-xs"
            >
              {availableFields
                .filter((f) => f.filterable)
                .map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
            </select>

            <select
              value={cond.comparator}
              onChange={(e) => handleConditionChange(cond.id, "comparator", e.target.value)}
              className="w-1/4 rounded-md border border-slate-300 bg-white p-1.5 text-xs"
            >
              {allowedComparators.map((comp: string) => (
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
                    className="w-full rounded-md border border-slate-300 bg-white p-1.5 text-xs"
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
                    className="h-8 text-xs"
                  />
                ) : fieldMeta.type === "DATE" ? (
                  <Input
                    type="date"
                    value={cond.value || ""}
                    onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                    className="h-8 text-xs"
                  />
                ) : fieldMeta.type === "DATE_TIME" ? (
                  <Input
                    type="datetime-local"
                    value={cond.value || ""}
                    onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                    className="h-8 text-xs"
                  />
                ) : (
                  <Input
                    value={cond.value || ""}
                    onChange={(e) => handleConditionChange(cond.id, "value", e.target.value)}
                    placeholder="Value"
                    className="h-8 text-xs"
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
  );
};
