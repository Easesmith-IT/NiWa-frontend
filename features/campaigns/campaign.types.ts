export interface Campaign {
  _id: string;
  workspaceId: string;
  createdBy: string;
  connectionId: string;
  templateId: string;
  name: string;
  description?: string;
  audience: {
    source: "import" | "filter";
    importId?: string;
    filterQuery?: Record<string, any>;
  };
  schedule: {
    type: "now" | "later";
    scheduledAt?: string;
  };
  status: "draft" | "validating" | "scheduled" | "running" | "paused" | "completed" | "cancelled" | "failed";
  stats: {
    total: number;
    pending: number;
    processing: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    unknown: number;
    skipped: number;
  };
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  _id: string;
  workspaceId: string;
  campaignId: string;
  contactId?: string;
  phoneNumberE164: string;
  name?: string;
  variables: Record<string, string>;
  status: "pending" | "scheduled" | "processing" | "sent" | "delivered" | "read" | "failed" | "unknown" | "skipped";
  metaMessageId?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
}

export interface CampaignResponse {
  campaign: Campaign;
}

export interface CampaignRecipientsResponse {
  data: {
    items: CampaignRecipient[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateCampaignPayload {
  connectionId: string;
  templateId: string;
  name: string;
  description?: string;
  audience: Campaign["audience"];
  schedule: Campaign["schedule"];
}
