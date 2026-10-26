export interface CategorySummary {
  count: number;
  billableCount: number;
  freeCount: number;
  metaCost: number;
  customerCharge: number;
}

export interface WhatsAppBillingSummary {
  period: string;
  startDate: string;
  endDate: string;
  metrics: {
    totalEvents: number;
    billableCount: number;
    freeAllowanceCount: number;
    failedCount: number;
    pendingCount: number;
    totalMetaCost: number;
    totalCustomerCharge: number;
    provisionalCustomerCharge?: number;
    provisionalMetaCost?: number;
    ledgerSummary?: {
      debitUsageCount: number;
      debitUsageAmount: number;
      reversalCount: number;
      reversalAmount: number;
      adjustmentCount: number;
      adjustmentAmount: number;
      netCustomerCharge: number;
    };
    currency: string;
  };
  byCategory: {
    marketing: CategorySummary;
    utility: CategorySummary;
    authentication: CategorySummary;
    service: CategorySummary;
    unknown: CategorySummary;
  };
  allowance: {
    granted: number;
    consumed: number;
    allocated?: number;
    finalizedConsumed?: number;
    provisionalReserved?: number;
    released?: number;
    remaining: number;
    percentUsed: number;
    unresolvedDiscrepanciesCount?: number;
  };
}

export interface WhatsAppUsageEvent {
  _id: string;
  workspaceId: string;
  connectionId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  metaMessageId: string;
  direction: "outgoing" | "incoming";
  messageType: string;
  category: "marketing" | "utility" | "authentication" | "service" | "unknown";
  templateName?: string;
  recipientPhoneNumber: string;
  recipientMarket: string;
  customerServiceWindowOpen: boolean;
  currency: string;
  sentAt: string;
  deliveredAt?: string;
  billingTimestamp: string;
  billingState:
    | "pending"
    | "provisional"
    | "billable"
    | "free_allowance"
    | "ineligible"
    | "failed"
    | "reconciled"
    | "adjusted";
  isFreeAllowance: boolean;
  metaCost: number;
  markupAmount: number;
  taxAmount: number;
  customerCharge: number;
  reconciliationStatus: "unreconciled" | "matched" | "discrepancy" | "reconciled";
  source: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WhatsAppLedgerEntry {
  _id: string;
  workspaceId: string;
  phoneNumberId?: string;
  entryType:
    | "DEBIT_USAGE"
    | "CREDIT_ADJUSTMENT"
    | "REVERSAL"
    | "ALLOWANCE_OFFSET"
    | "RECONCILIATION_ADJUSTMENT"
    | "PROVIDER_COST_ADJUSTMENT";
  currency: string;
  metaCost: number;
  customerCharge: number;
  metaMessageId?: string;
  idempotencyKey: string;
  description: string;
  sourceReference?: string;
  reversalOfLedgerId?: string;
  createdAt: string;
}

export interface WhatsAppAllowance {
  _id: string;
  workspaceId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  granted: number;
  consumed: number;
  remaining: number;
  currency: string;
}

export interface WhatsAppRateCardTier {
  minVolume: number;
  maxVolume?: number | null;
  metaRate: number;
  sellingRate: number;
}

export type RateVerificationStatus =
  | "verified_official"
  | "evidence_validated"
  | "provisional_secondary"
  | "unverified"
  | "revoked"
  | "admin_attested";

export interface RateVerificationEvidence {
  verifiedBy: string;
  verifiedAt: string;
  sourceUrl: string;
  finalSourceUrl?: string;
  sourceHost?: string;
  sourceType?: string;
  evidenceRef: string;
  revision?: string;
  retrievedAt?: string;
  contentHashAlgorithm?: string;
  evidenceHash: string;
  contentType?: string;
  verificationMethod?: string;
  sourceAuthenticationMethod?: string;
  isSourceAuthenticated?: boolean;
  verifiedRate?: number;
  verifiedCurrency?: string;
  verifiedCategory?: string;
  verifiedCountry?: string;
  verifiedPricingBasis?: string;
  verifiedEffectiveFrom?: string;
  verifiedEffectiveTo?: string | null;
  reason: string;
  snapshotFingerprint?: string;
}

export interface VerifyRateCardPayload {
  sourceUrl: string;
  trustedRetrieval?: boolean;
  approvalReason: string;
  evidenceRef?: string;
  evidenceHash?: string;
  metaRate: number;
  category: string;
  countryCode: string;
  currency: string;
  pricingBasis?: "on_delivery" | "on_submission" | "on_chargeable_reply";
  effectiveFrom: string;
  effectiveTo?: string | null;
  revision?: string;
}

export interface RevokeRateCardPayload {
  reason: string;
}

export interface WhatsAppRateCard {
  _id: string;
  workspaceId: string;
  name: string;
  category: "marketing" | "utility" | "authentication" | "service";
  countryCode: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  metaRate: number;
  sellingRate: number;
  markupPercent: number;
  freeAllowanceEligible: boolean;
  verificationStatus: RateVerificationStatus;
  verificationEvidence?: RateVerificationEvidence | null;
  pricingBasis: "on_delivery" | "on_submission" | "on_chargeable_reply";
  tiers?: WhatsAppRateCardTier[];
  source: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface ReconciliationResult {
  jobId: string;
  status: "completed" | "completed_with_discrepancies" | "failed";
  totalRows: number;
  matchedRows: number;
  discrepancyRows: number;
  autoAdjustedRows: number;
  failedAdjustedRows?: number;
  totalMetaCostReported: number;
  totalMetaCostReportedMicros?: number;
  totalMetaCostRecorded: number;
  totalMetaCostRecordedMicros?: number;
  discrepancies: Array<{
    discrepancyId?: string;
    metaMessageId: string;
    reportedCost: number;
    recordedCost: number;
    difference: number;
    reason: string;
    actionTaken: string;
    errorMessage?: string | null;
    status?: string;
    type?: string;
  }>;
  rejectedRecords?: Array<{
    record: unknown;
    reason: string;
  }>;
  rejectedCount?: number;
}
