import React, { useState } from "react";
import { Bookmark, Star, Trash2, Plus, Edit2 } from "lucide-react";
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

export const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  objectKey,
  activeViewId,
  onSelectView,
}) => {
  const { data: views = [] } = useCrmViewsQuery(objectKey);
  const createMutation = useCreateCrmViewMutation();
  const updateMutation = useUpdateCrmViewMutation();
  const deleteMutation = useDeleteCrmViewMutation();
  const setDefaultMutation = useSetDefaultCrmViewMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingView, setEditingView] = useState<CrmViewRecord | null>(null);

  const [viewName, setViewName] = useState("");
  const [visibilityScope, setVisibilityScope] = useState<"private" | "team" | "workspace">("private");
  const [isDefault, setIsDefault] = useState(false);
  const [filterField, setFilterField] = useState("title");
  const [comparator, setComparator] = useState("=");
  const [filterValue, setFilterValue] = useState("");

  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [visibleFieldsStr, setVisibleFieldsStr] = useState("title,value,status,createdAt");
  const [columnWidthsStr, setColumnWidthsStr] = useState('{"title":200,"value":120}');

  const activeView = views.find((v) => v._id === activeViewId) || null;

  const handleOpenCreate = () => {
    setEditingView(null);
    setViewName("");
    setVisibilityScope("private");
    setIsDefault(false);
    setFilterField("title");
    setComparator("=");
    setFilterValue("");
    setSortField("createdAt");
    setSortDirection("desc");
    setVisibleFieldsStr("title,value,status,createdAt");
    setColumnWidthsStr('{"title":200,"value":120}');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (view: CrmViewRecord) => {
    setEditingView(view);
    setViewName(view.name);
    setVisibilityScope(view.visibilityScope);
    setIsDefault(view.isDefault);
    if (view.filterAst && view.filterAst.type === "PREDICATE") {
      setFilterField(view.filterAst.field);
      setComparator(view.filterAst.comparator);
      setFilterValue(view.filterAst.value || "");
    } else {
      setFilterField("");
      setComparator("=");
      setFilterValue("");
    }
    if (view.sorting && view.sorting.length > 0) {
      setSortField(view.sorting[0].field);
      setSortDirection(view.sorting[0].direction);
    } else {
      setSortField("");
      setSortDirection("desc");
    }
    setVisibleFieldsStr(view.visibleFields?.join(",") || "");
    setColumnWidthsStr(JSON.stringify(view.columnWidths || {}));
    setIsModalOpen(true);
  };

  const handleSaveView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;

    let filterAst: FilterAstNode | null = null;
    if (filterField.trim() && comparator) {
      filterAst = {
        type: "PREDICATE",
        field: filterField.trim(),
        comparator: comparator as any,
        value: filterValue,
      };
    }

    const sorting: SortSpec[] = [];
    if (sortField.trim()) {
      sorting.push({ field: sortField.trim(), direction: sortDirection });
    }

    const visibleFields = visibleFieldsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let columnWidths: Record<string, number> = {};
    try {
      if (columnWidthsStr.trim()) {
        columnWidths = JSON.parse(columnWidthsStr.trim());
      }
    } catch {
      // fallback
    }

    if (editingView) {
      const updated = await updateMutation.mutateAsync({
        id: editingView._id,
        payload: {
          name: viewName.trim(),
          visibilityScope,
          isDefault,
          filterAst,
          sorting,
          visibleFields,
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
        visibleFields,
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
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
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

              {/* Filter Section */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-semibold text-slate-800 block">Filter AST Condition</span>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    placeholder="Field (e.g. title, value)"
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
                    <option value="IN">IN</option>
                    <option value="NOT IN">NOT IN</option>
                    <option value="IS EMPTY">IS EMPTY</option>
                    <option value="IS NOT EMPTY">IS NOT EMPTY</option>
                  </select>
                  <Input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Value"
                  />
                </div>
              </div>

              {/* Sort Section */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-semibold text-slate-800 block">Sorting Rule</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    placeholder="Sort Field (e.g. createdAt, value)"
                  />
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as any)}
                    className="rounded-md border border-slate-300 bg-white p-1"
                  >
                    <option value="asc">Ascending (ASC)</option>
                    <option value="desc">Descending (DESC)</option>
                  </select>
                </div>
              </div>

              {/* Column Config Section */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-semibold text-slate-800 block">Visible Fields & Widths</span>
                <div>
                  <label className="block text-slate-600 mb-1">Visible Fields (comma-separated)</label>
                  <Input
                    value={visibleFieldsStr}
                    onChange={(e) => setVisibleFieldsStr(e.target.value)}
                    placeholder="title, value, status"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Column Widths JSON</label>
                  <Input
                    value={columnWidthsStr}
                    onChange={(e) => setColumnWidthsStr(e.target.value)}
                    placeholder='{"title":200,"value":120}'
                  />
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
