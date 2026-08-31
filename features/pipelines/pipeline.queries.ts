import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  createPipeline,
  createStage,
  fetchPipelineById,
  fetchStageById,
  listPipelines,
  listStages,
  reorderStages,
  updatePipeline,
  updateStage,
} from "./pipeline.api";
import type {
  CreatePipelinePayload,
  CreateStagePayload,
  ReorderStagesPayload,
  UpdatePipelinePayload,
  UpdateStagePayload,
} from "./pipeline.types";

export const usePipelinesQuery = (params?: { isActive?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.pipelines, JSON.stringify(params || {})],
    queryFn: () => listPipelines(params),
  });

export const usePipelineDetailQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.pipelines, "detail", id],
    queryFn: () => fetchPipelineById(id),
    enabled: enabled && !!id,
  });

export const useStagesQuery = (params?: { pipelineId?: string; isActive?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.stages, JSON.stringify(params || {})],
    queryFn: () => listStages(params),
  });

export const useStageDetailQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.stages, "detail", id],
    queryFn: () => fetchStageById(id),
    enabled: enabled && !!id,
  });

export const useCreatePipelineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePipelinePayload) => createPipeline(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.pipelines }),
      ]);
    },
  });
};

export const useUpdatePipelineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePipelinePayload }) =>
      updatePipeline(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.pipelines }),
      ]);
    },
  });
};

export const useCreateStageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStagePayload) => createStage(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stages }),
      ]);
    },
  });
};

export const useUpdateStageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStagePayload }) =>
      updateStage(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stages }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      ]);
    },
  });
};

export const useReorderStagesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, payload }: { pipelineId: string; payload: ReorderStagesPayload }) =>
      reorderStages(pipelineId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stages }),
      ]);
    },
  });
};

