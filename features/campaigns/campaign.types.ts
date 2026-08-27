export interface CampaignStats {
  totalRecipients: number;
  pending: number;
  scheduled: number;
  processing: number;
  unknown: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  skipped: number;
}

export interface CampaignAudience {
  importId?: string;
  contactIds?: string[];
  tags?: string[];
}

export interface CampaignSchedule {
  type: "now" | "scheduled";
  scheduledAt?: string;
  timezone: string;
}

export type CampaignStatus = "draft" | "validating" | "scheduled" | "running" | "paused" | "completed" | "cancelled" | "failed";

export interface Campaign {
  _id: string;
  workspaceId: string;
  createdBy: string;
  connectionId: string;
  templateId: string;
  name: string;
  description?: string;
  audience: CampaignAudience;
  variables?: Record<string, string>;
  schedule: CampaignSchedule;
  status: CampaignStatus;
  stats: CampaignStats;
  createdAt: string;
  updatedAt: string;
}

export type CampaignRecipientStatus = "pending" | "scheduled" | "processing" | "unknown" | "sent" | "delivered" | "read" | "failed" | "skipped";

export interface CampaignRecipient {
  _id: string;
  workspaceId: string;
  campaignId: string;
  contactId: string;
  phoneNumberE164: string;
  status: CampaignRecipientStatus;
  metaMessageId?: string | null;
  failureReason?: string | null;
  attemptCount: number;
  bullmqJobId?: string | null;
  scheduledAt?: string | null;
  processingAt?: string | null;
  lastAttemptAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
}

export interface CampaignResponse {
  campaign: Campaign;
}

export interface CampaignRecipientsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CampaignRecipientsResponse {
  data: {
    items: CampaignRecipient[];
    pagination: CampaignRecipientsPagination;
  };
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  connectionId: string;
  templateId: string;
  audience: CampaignAudience;
  schedule: CampaignSchedule;
  variables?: Record<string, string>;
}

export interface UpdateCampaignStatusPayload {
  action: "pause" | "resume" | "cancel";
}
