export interface PipelineRecord {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageRecord {
  _id: string;
  workspaceId: string;
  pipelineId: string;
  name: string;
  position: number;
  probability?: number | null;
  isWon: boolean;
  isLost: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePipelinePayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdatePipelinePayload extends Partial<CreatePipelinePayload> {}

export interface CreateStagePayload {
  pipelineId: string;
  name: string;
  position?: number;
  probability?: number | null;
  isWon?: boolean;
  isLost?: boolean;
  isActive?: boolean;
}

export interface UpdateStagePayload extends Partial<Omit<CreateStagePayload, "pipelineId">> {}

export interface ReorderStagesPayload {
  stages: Array<{
    id: string;
    position: number;
  }>;
}

