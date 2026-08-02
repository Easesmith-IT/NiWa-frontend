import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { createLabelV1, deleteLabelV1, listLabelsV1, patchLabelV1 } from "./label.api";
import { mapLabelRecordV1 } from "./label.mappers";

const invalidateLabelSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.labels }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.contacts }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
  ]);
};

export const useLabelsV1Query = (params?: { search?: string }) =>
  useQuery({
    queryKey: [...v1QueryKeys.labels, params?.search ?? ""],
    queryFn: async () => {
      const result = await listLabelsV1(params);
      return {
        ...result,
        data: result.data.map(mapLabelRecordV1),
      };
    },
  });

export const useCreateLabelV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLabelV1,
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};

export const usePatchLabelV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labelId, payload }: { labelId: string; payload: Parameters<typeof patchLabelV1>[1] }) =>
      patchLabelV1(labelId, payload),
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};

export const useDeleteLabelV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLabelV1,
    onSuccess: async () => {
      await invalidateLabelSurfaces(queryClient);
    },
  });
};
