export type DealStatus = "OPEN" | "WON" | "LOST";

export interface DealParticipant {
  personId: string;
  role?: string;
  isPrimary?: boolean;
}

export interface DealRecord {
  _id: string;
  workspaceId: string;
  title: string;
  companyId?: string | null;
  primaryPersonId?: string | null;
  participants?: DealParticipant[];
  pipelineId?: string | null;
  stageId?: string | null;
  status: DealStatus;
  value?: number | null;
  currency?: string;
  probability?: number | null;
  expectedCloseDate?: string | null;
  ownerUserId?: string | null;
  ownerTeamId?: string | null;
  description?: string;
  createdBy: string;
  updatedBy: string;
  closedAt?: string | null;
  isArchived?: boolean;
  archivedAt?: string | null;
  archivedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealPayload {
  title: string;
  pipelineId: string;
  stageId: string;
  companyId?: string | null;
  primaryPersonId?: string | null;
  participants?: DealParticipant[];
  status?: DealStatus;
  value?: number | null;
  currency?: string;
  probability?: number | null;
  expectedCloseDate?: string | null;
  ownerUserId?: string | null;
  description?: string;
}

export interface UpdateDealPayload extends Partial<CreateDealPayload> {}

export interface DealFilterInput {
  status?: DealStatus;
  companyId?: string;
  isArchived?: boolean;
  search?: string;
}

