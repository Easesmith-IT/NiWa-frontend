export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED" | "CONVERTED" | "LOST";

export interface LeadRecord {
  _id: string;
  workspaceId: string;
  title: string;
  status: LeadStatus;
  leadSource?: string;
  value?: number | null;
  currency?: string;
  personId?: string | null;
  companyId?: string | null;
  ownerUserId?: string | null;
  notes?: string;
  convertedDealId?: string | null;
  convertedAt?: string | null;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  title: string;
  leadSource?: string;
  value?: number | null;
  currency?: string;
  personId?: string | null;
  companyId?: string | null;
  ownerUserId?: string | null;
  notes?: string;
}

export interface ConvertLeadPayload {
  pipelineId: string;
  stageId: string;
  title?: string;
  value?: number | null;
  currency?: string;
  ownerUserId?: string | null;
  expectedCloseDate?: string | null;
}
