import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  createView,
  deleteView,
  executeView,
  fetchViewById,
  fetchViews,
  fetchCrmViewFields,
  setDefaultView,
  updateView,
} from "./views.api";
import type { CreateCrmViewPayload, CrmViewObjectKey, UpdateCrmViewPayload } from "./views.types";

export const useCrmViewsQuery = (objectKey?: CrmViewObjectKey) =>
  useQuery({
    queryKey: [...queryKeys.views, objectKey || "all"],
    queryFn: () => fetchViews(objectKey),
  });

export const useCrmViewDetailQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.views, "detail", id],
    queryFn: () => fetchViewById(id),
    enabled: enabled && !!id,
  });

export const useCreateCrmViewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCrmViewPayload) => createView(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.views });
    },
  });
};

export const useUpdateCrmViewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCrmViewPayload }) =>
      updateView(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.views });
    },
  });
};

export const useDeleteCrmViewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteView(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.views });
    },
  });
};

export const useSetDefaultCrmViewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setDefaultView(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.views });
    },
  });
};

export const useExecuteCrmViewQuery = (id: string, options?: { page?: number; limit?: number }, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.views, "execute", id, JSON.stringify(options || {})],
    queryFn: () => executeView(id, options),
    enabled: enabled && !!id,
  });

export const useCrmViewFieldsQuery = (objectKey: CrmViewObjectKey) =>
  useQuery({
    queryKey: [...queryKeys.views, "fields", objectKey],
    queryFn: () => fetchCrmViewFields(objectKey),
  });
