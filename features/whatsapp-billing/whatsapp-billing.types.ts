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
    releaseFailedCount?: number;
    unexplainedAllocation?: number;
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
  isMetaFreeServiceTier?: boolean;
  supplierTaxAmountMicros?: number;
  supplierTaxRatePercent?: number | null;
  supplierTaxStatus?: "unknown" | "estimated" | "invoice_verified";
  supplierTaxSource?: string | null;
  customerTaxAmountMicros?: number;
  metaCost: number;
  markupAmount: number;
  taxAmount: number;
  customerTaxAmountMicros?: number;
  supplierTaxAmountMicros?: number;
  supplierTaxRatePercent?: number | null;
  supplierTaxSource?: string | null;
  supplierTaxStatus?: "unknown" | "estimated" | "invoice_verified";
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
    | "PROVIDER_COST_ADJUSTMENT"
    | "SUPPLIER_TAX_EVIDENCE";
  currency: string;
  metaCost: number;
  customerCharge: number;
  customerTaxAmountMicros?: number;
  supplierTaxAmountMicros?: number;
  supplierTaxRatePercent?: number | null;
  supplierTaxSource?: string | null;
  supplierTaxStatus?: "unknown" | "estimated" | "invoice_verified";
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

// -------------------------------------------------------------
// NIWA WhatsApp Billing v3.3: Wallet & Independent Customer Pricing
// -------------------------------------------------------------

export interface WorkspaceWallet {
  _id: string;
  workspaceId: string;
  currency: string;
  postedBalancePaise: number;
  reservedPaise: number;
  availablePaise: number;
  postedBalanceInr: string;
  reservedInr: string;
  availableInr: string;
  lastTransactionAt?: string;
  version: number;
}

export type WalletTransactionType = "CREDIT" | "DEBIT" | "HOLD" | "RELEASE" | "ADJUSTMENT";
export type WalletReferenceType = "TOPUP" | "MESSAGE" | "REFUND" | "MANUAL_ADJUSTMENT" | "SYSTEM_RECONCILIATION";

export interface WalletTransaction {
  _id: string;
  workspaceId: string;
  walletId: string;
  transactionType: WalletTransactionType;
  referenceType: WalletReferenceType;
  referenceId?: string;
  idempotencyKey: string;
  amountPaise: number;
  amountInr: string;
  amountMicros?: number;
  balanceBeforePaise: number;
  balanceAfterPaise: number;
  reservedBeforePaise: number;
  reservedAfterPaise: number;
  currency: string;
  description: string;
  actorType: "ADMIN" | "SYSTEM" | "USER";
  actorId: string;
  actorEmail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WhatsAppCustomerRateCard {
  _id: string;
  workspaceId: string;
  category: "marketing" | "utility" | "authentication" | "service";
  countryCode: string;
  pricePaise: number;
  priceInr: string;
  currency: string;
  taxPercent: number;
  taxMode: "exclusive" | "inclusive";
  effectiveFrom: string;
  effectiveTo?: string | null;
  approvalRef?: string;
  approvedBy?: string;
  approvedAt?: string;
  isCustom: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface WalletAdjustmentPayload {
  workspaceId: string;
  adjustmentType: "CREDIT" | "DEBIT";
  amountPaise: number;
  reason: string;
  referenceId?: string;
}

export interface ProfitabilitySummary {
  totalCustomerRevenuePaise: number;
  totalCustomerRevenueInr: string;
  totalMetaCostPaise: number;
  totalMetaCostInr: string;
  grossProfitPaise: number;
  grossProfitInr: string;
  grossMarginPercent: number;
  byCategory: Record<
    string,
    {
      customerChargePaise: number;
      metaCostPaise: number;
      marginPaise: number;
      count: number;
    }
  >;
}

