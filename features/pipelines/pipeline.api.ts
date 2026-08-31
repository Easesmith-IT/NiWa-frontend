import { apiClient } from "../../lib/api/api-client";
import type {
  CreatePipelinePayload,
  CreateStagePayload,
  PipelineRecord,
  ReorderStagesPayload,
  StageRecord,
  UpdatePipelinePayload,
  UpdateStagePayload,
} from "./pipeline.types";

export const listPipelines = async (params?: { isActive?: boolean }) => {
  const response = await apiClient.get<PipelineRecord[]>("/crm/pipelines", { params });
  return response.data;
};

export const fetchPipelineById = async (id: string) => {
  const response = await apiClient.get<PipelineRecord>(`/crm/pipelines/${id}`);
  return response.data;
};

export const createPipeline = async (payload: CreatePipelinePayload) => {
  const response = await apiClient.post<PipelineRecord>("/crm/pipelines", payload);
  return response.data;
};

export const updatePipeline = async (id: string, payload: UpdatePipelinePayload) => {
  const response = await apiClient.patch<PipelineRecord>(`/crm/pipelines/${id}`, payload);
  return response.data;
};

export const listStages = async (params?: { pipelineId?: string; isActive?: boolean }) => {
  const response = await apiClient.get<StageRecord[]>("/crm/stages", { params });
  return response.data;
};

export const fetchStageById = async (id: string) => {
  const response = await apiClient.get<StageRecord>(`/crm/stages/${id}`);
  return response.data;
};

export const createStage = async (payload: CreateStagePayload) => {
  const response = await apiClient.post<StageRecord>("/crm/stages", payload);
  return response.data;
};

export const updateStage = async (id: string, payload: UpdateStagePayload) => {
  const response = await apiClient.patch<StageRecord>(`/crm/stages/${id}`, payload);
  return response.data;
};

export const reorderStages = async (pipelineId: string, payload: ReorderStagesPayload) => {
  const response = await apiClient.put<{ success: boolean }>(`/crm/pipelines/${pipelineId}/stages/reorder`, payload);
  return response.data;
};

