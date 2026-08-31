import React from "react";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import type { CrmFieldMetadata } from "../../views.types";

export interface SortItem {
  id: string;
  field: string;
  direction: "asc" | "desc";
}

interface SortBuilderProps {
  availableFields: CrmFieldMetadata[];
  sortSpecs: SortItem[];
  setSortSpecs: (val: SortItem[] | ((prev: SortItem[]) => SortItem[])) => void;
}

export const SortBuilder: React.FC<SortBuilderProps> = ({
  availableFields,
  sortSpecs,
  setSortSpecs,
}) => {
  const handleAddSort = () => {
    const usedFields = new Set(sortSpecs.map((s) => s.field));
    const availableSortField = availableFields.find((f) => f.sortable && !usedFields.has(f.key))?.key;
    if (availableSortField) {
      setSortSpecs((prev) => [...prev, { id: `sort-${Date.now()}`, field: availableSortField, direction: "asc" }]);
    }
  };

  const handleRemoveSort = (id: string) => {
    setSortSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSortChange = (id: string, key: keyof SortItem, val: any) => {
    setSortSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  const handleMoveSort = (index: number, dir: "up" | "down") => {
    setSortSpecs((prev) => {
      const newSpecs = [...prev];
      const targetIndex = dir === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSpecs.length) return prev;
      const temp = newSpecs[index];
      newSpecs[index] = newSpecs[targetIndex];
      newSpecs[targetIndex] = temp;
      return newSpecs;
    });
  };

  const getAvailableSortFields = (currentFieldId: string) => {
    const usedFields = new Set(sortSpecs.map((s) => s.field).filter((f) => f !== currentFieldId));
    return availableFields.filter((f) => f.sortable && !usedFields.has(f.key));
  };

  const canAddMore = getAvailableSortFields("").length > 0;

  return (
    <div className="border-t border-slate-200 pt-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Sorting</h3>
        <p className="text-xs text-slate-500 mt-0.5">Choose result order and priority</p>
      </div>
      
      {sortSpecs.map((sort, idx) => (
        <div key={sort.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 w-14">Rule {idx + 1}</span>
          
          <select
            value={sort.field}
            onChange={(e) => handleSortChange(sort.id, "field", e.target.value)}
            className="flex-1 rounded-md border border-slate-300 bg-white p-1.5 text-xs"
          >
            {getAvailableSortFields(sort.field).map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={sort.direction}
            onChange={(e) => handleSortChange(sort.id, "direction", e.target.value as any)}
            className="w-28 rounded-md border border-slate-300 bg-white p-1.5 text-xs font-semibold"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <div className="flex items-center space-x-1 border-l border-slate-300 pl-2 ml-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleMoveSort(idx, "up")}
              disabled={idx === 0}
              className="text-slate-400 hover:text-blue-600 p-1 h-7 w-7"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleMoveSort(idx, "down")}
              disabled={idx === sortSpecs.length - 1}
              className="text-slate-400 hover:text-blue-600 p-1 h-7 w-7"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSort(sort.id)}
              className="text-slate-400 hover:text-rose-600 p-1 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSort}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add Sort Rule
        </Button>
      )}
    </div>
  );
};
