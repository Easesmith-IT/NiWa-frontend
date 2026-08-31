import React, { useState } from "react";
import { Bookmark, Star, Trash2, Plus, Edit2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useCrmViewsQuery,
  useCrmViewFieldsQuery,
  useCreateCrmViewMutation,
  useUpdateCrmViewMutation,
  useDeleteCrmViewMutation,
  useSetDefaultCrmViewMutation,
} from "../views.queries";
import type { CrmViewObjectKey, CrmViewRecord, CreateCrmViewPayload, UpdateCrmViewPayload } from "../views.types";
import { ViewEditor } from "./saved-views/ViewEditor";

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
  const { data: viewsData } = useCrmViewsQuery(objectKey);
  const views: CrmViewRecord[] = Array.isArray(viewsData) ? viewsData : [];
  
  const { data: fieldsData, isLoading: isLoadingFields, isError: isFieldsError } = useCrmViewFieldsQuery(objectKey);
  const availableFields = fieldsData?.fields || [];

  const createMutation = useCreateCrmViewMutation();
  const updateMutation = useUpdateCrmViewMutation();
  const deleteMutation = useDeleteCrmViewMutation();
  const setDefaultMutation = useSetDefaultCrmViewMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingView, setEditingView] = useState<CrmViewRecord | null>(null);

  const activeView = views.find((v) => v && v._id === activeViewId) || null;

  const handleOpenCreate = () => {
    setEditingView(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (view: CrmViewRecord) => {
    setEditingView(view);
    setIsModalOpen(true);
  };

  const handleSaveView = async (payload: CreateCrmViewPayload | UpdateCrmViewPayload) => {
    if (editingView) {
      const updated = await updateMutation.mutateAsync({
        id: editingView._id,
        payload: payload as UpdateCrmViewPayload,
      });
      setIsModalOpen(false);
      onSelectView(updated);
    } else {
      const created = await createMutation.mutateAsync({
        ...(payload as CreateCrmViewPayload),
        objectKey,
      });
      setIsModalOpen(false);
      onSelectView(created);
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
                {v.name} {v.isDefault ? "?" : ""} ({v.visibilityScope})
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
        <ViewEditor
          objectKey={objectKey}
          editingView={editingView}
          availableFields={availableFields}
          isLoadingFields={isLoadingFields}
          isFieldsError={isFieldsError}
          onSave={handleSaveView}
          onCancel={() => setIsModalOpen(false)}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};
