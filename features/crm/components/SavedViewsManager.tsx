import React, { useState } from "react";
import { Bookmark, Check, Filter, Plus, Star, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  useCrmViewsQuery,
  useCreateCrmViewMutation,
  useDeleteCrmViewMutation,
  useSetDefaultCrmViewMutation,
} from "../views.queries";
import type { CrmViewObjectKey, CrmViewRecord, FilterAstNode, SortSpec } from "../views.types";

interface SavedViewsManagerProps {
  objectKey: CrmViewObjectKey;
  activeViewId?: string;
  onSelectView: (view: CrmViewRecord | null) => void;
}

export const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  objectKey,
  activeViewId,
  onSelectView,
}) => {
  const { data: views = [], isLoading } = useCrmViewsQuery(objectKey);
  const createMutation = useCreateCrmViewMutation();
  const deleteMutation = useDeleteCrmViewMutation();
  const setDefaultMutation = useSetDefaultCrmViewMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [visibilityScope, setVisibilityScope] = useState<"private" | "team" | "workspace">("private");
  const [isDefault, setIsDefault] = useState(false);
  const [filterField, setFilterField] = useState("status");
  const [comparator, setComparator] = useState("=");
  const [filterValue, setFilterValue] = useState("");

  const activeView = views.find((v) => v._id === activeViewId) || null;

  const handleCreateView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    let filterAst: FilterAstNode | null = null;
    if (filterField && comparator) {
      filterAst = {
        type: "PREDICATE",
        field: filterField,
        comparator: comparator as any,
        value: filterValue,
      };
    }

    const newView = await createMutation.mutateAsync({
      name: viewName.trim(),
      objectKey,
      visibilityScope,
      isDefault,
      filterAst,
    });

    setViewName("");
    setIsModalOpen(false);
    onSelectView(newView);
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Save Current View
        </Button>
      </div>

      {/* Save View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-600" /> Save New View
            </h2>

            <form onSubmit={handleCreateView} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">View Name</label>
                <Input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="e.g. High Value Deals"
                  required
                  className="w-full"
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

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-semibold text-slate-800">Initial Filter Predicate</span>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    placeholder="Field (e.g. status)"
                  />
                  <select
                    value={comparator}
                    onChange={(e) => setComparator(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white p-1"
                  >
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                  <Input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Value (e.g. OPEN)"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save View"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
