import React from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface ColumnConfiguratorProps {
  availableFields: any[];
  selectedVisibleFields: string[];
  setSelectedVisibleFields: (fields: string[] | ((prev: string[]) => string[])) => void;
}

export const ColumnConfigurator: React.FC<ColumnConfiguratorProps> = ({
  availableFields,
  selectedVisibleFields,
  setSelectedVisibleFields,
}) => {
  const selectableFields = availableFields.filter((f) => f.selectable);
  
  const visibleFields = selectedVisibleFields
    .map(key => selectableFields.find(f => f.key === key))
    .filter(Boolean) as any[];

  const hiddenFields = selectableFields.filter(f => !selectedVisibleFields.includes(f.key));

  const toggleColumnSelection = (fieldKey: string) => {
    setSelectedVisibleFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((f) => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  const moveColumn = (index: number, dir: "up" | "down") => {
    setSelectedVisibleFields((prev) => {
      const newSpecs = [...prev];
      const targetIndex = dir === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSpecs.length) return prev;
      const temp = newSpecs[index];
      newSpecs[index] = newSpecs[targetIndex];
      newSpecs[targetIndex] = temp;
      return newSpecs;
    });
  };

  return (
    <div className="border-t border-slate-200 pt-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Columns</h3>
        <p className="text-xs text-slate-500 mt-0.5">Choose and arrange visible fields</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Visible Columns */}
        <div className="space-y-2 border border-slate-200 rounded-md bg-slate-50 p-2">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Visible Columns</h4>
          {visibleFields.length === 0 && (
            <p className="text-xs text-slate-400 p-2 text-center">No visible columns</p>
          )}
          <div className="space-y-1">
            {visibleFields.map((f, idx) => (
              <div key={f.key} className="flex items-center justify-between bg-white border border-slate-200 p-1.5 rounded shadow-sm text-xs group">
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-medium text-slate-700 truncate">{f.label}</span>
                </div>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(idx, "up")}
                    disabled={idx === 0}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(idx, "down")}
                    disabled={idx === visibleFields.length - 1}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleColumnSelection(f.key)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                    title="Hide Column"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Columns */}
        <div className="space-y-2 border border-slate-200 rounded-md bg-slate-50 p-2">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Hidden Columns</h4>
          {hiddenFields.length === 0 && (
            <p className="text-xs text-slate-400 p-2 text-center">All columns visible</p>
          )}
          <div className="space-y-1 overflow-y-auto max-h-[300px]">
            {hiddenFields.map((f) => (
              <div key={f.key} className="flex items-center justify-between bg-white border border-slate-200 p-1.5 rounded shadow-sm text-xs opacity-70 hover:opacity-100 transition-opacity">
                <span className="font-medium text-slate-600 truncate">{f.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumnSelection(f.key)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-green-600"
                  title="Show Column"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
