import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { createLabel, deleteLabel, listLabels, patchLabel } from "./label.api";
import { mapLabelRecord } from "./label.mappers";

const invalidateLabelSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.labels }),
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
  ]);
};

export const useLabelsQuery = (params?: { search?: string }) =>
  useQuery({
    queryKey: [...queryKeys.labels, params?.search ?? ""],
    queryFn: async () => {
      const result = await listLabels(params);
      return {
        ...result,
        data: result.data.map(mapLabelRecord),
      };
    },
  });

export const useCreateLabelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLabel,
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};

export const usePatchLabelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId, payload }: { labelId: string; payload: Parameters<typeof patchLabel>[1] }) =>
      patchLabel(labelId, payload),
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};

export const useDeleteLabelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};
