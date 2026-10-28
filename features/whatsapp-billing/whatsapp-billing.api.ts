import { apiClient } from "../../lib/api/api-client";
import type {
  WhatsAppBillingSummary,
  WhatsAppUsageEvent,
  WhatsAppLedgerEntry,
  WhatsAppAllowance,
  WhatsAppRateCard,
  ReconciliationResult,
} from "./whatsapp-billing.types";

export * from "./whatsapp-billing.types";

export interface GetSummaryParams {
  month?: number;
  year?: number;
  phoneNumberId?: string;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  category?: string;
  billingState?: string;
  phoneNumberId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetLedgerParams {
  page?: number;
  limit?: number;
  entryType?: string;
  metaMessageId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetRateCardsParams {
  workspaceId?: string;
  category?: string;
  countryCode?: string;
  includeInactive?: boolean;
}

export const getWhatsAppBillingSummary = async (params?: GetSummaryParams) => {
  const { data } = await apiClient.get<{ success: boolean; data: WhatsAppBillingSummary }>(
    "/billing/whatsapp/summary",
    { params }
  );
  return data.data;
};

export const getWhatsAppUsageEvents = async (params?: GetEventsParams) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: WhatsAppUsageEvent[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>("/billing/whatsapp/events", { params });
  return data;
};

export const getWhatsAppLedger = async (params?: GetLedgerParams) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: WhatsAppLedgerEntry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>("/billing/whatsapp/ledger", { params });
  return data;
};

export const getWhatsAppAllowances = async (params?: { period?: string; phoneNumberId?: string }) => {
  const { data } = await apiClient.get<{ success: boolean; data: WhatsAppAllowance[] }>(
    "/billing/whatsapp/allowance",
    { params }
  );
  return data.data;
};

export const getWhatsAppRateCards = async (params?: GetRateCardsParams) => {
  const { data } = await apiClient.get<{ success: boolean; data: WhatsAppRateCard[] }>(
    "/billing/whatsapp/admin/provider-rates",
    { params: { workspaceId: params?.workspaceId || "default" } }
  );
  return data.data;
};

export const createWhatsAppRateCard = async (payload: Partial<WhatsAppRateCard>) => {
  const { data } = await apiClient.post<{ success: boolean; data: WhatsAppRateCard }>(
    "/billing/whatsapp/admin/provider-rates",
    { ...payload, workspaceId: (payload as any).workspaceId || "default" }
  );
  return data.data;
};

export const verifyWhatsAppRateCard = async (
  rateCardId: string,
  payload: import("./whatsapp-billing.types").VerifyRateCardPayload,
  workspaceId = "default"
) => {
  const { data } = await apiClient.post<{ success: boolean; data: WhatsAppRateCard }>(
    `/billing/whatsapp/admin/provider-rates/${rateCardId}/verify`,
    { ...payload, workspaceId }
  );
  return data.data;
};

export const revokeWhatsAppRateCard = async (
  rateCardId: string,
  payload: import("./whatsapp-billing.types").RevokeRateCardPayload,
  workspaceId = "default"
) => {
  const { data } = await apiClient.post<{ success: boolean; data: WhatsAppRateCard }>(
    `/billing/whatsapp/admin/provider-rates/${rateCardId}/revoke`,
    { ...payload, workspaceId }
  );
  return data.data;
};

export const deactivateWhatsAppRateCard = async (rateCardId: string, workspaceId: string, reason: string) => {
  const { data } = await apiClient.post<{ success: boolean; data: WhatsAppRateCard }>(
    `/billing/whatsapp/admin/provider-rates/${rateCardId}/deactivate`,
    { workspaceId, reason }
  );
  return data.data;
};

export const triggerWhatsAppReconciliation = async (payload: {
  reportItems: Array<{
    metaMessageId: string;
    billedCost: number;
    currency?: string;
    category?: string;
    timestamp?: string;
  }>;
  billingPeriod?: string;
  autoAdjust?: boolean;
  confirmAutoAdjust?: boolean;
  reportIdentifier?: string;
}) => {
  const { data } = await apiClient.post<{ success: boolean; data: ReconciliationResult }>(
    "/billing/whatsapp/reconcile",
    payload
  );
  return data.data;
};

export const resolveWhatsAppDiscrepancy = async (payload: {
  jobId: string;
  metaMessageId?: string;
  discrepancyId?: string;
  action: "create_adjustment" | "waive";
}) => {
  const { data } = await apiClient.post<{ success: boolean; data: any }>(
    "/billing/whatsapp/reconcile/resolve",
    payload
  );
  return data.data;
};

export const downloadUsageReport = async (format: "json" | "csv", month?: number, year?: number): Promise<void> => {
  const params: Record<string, any> = { format };
  if (month) params.month = month;
  if (year) params.year = year;

  const response = await apiClient.get<Blob>("/billing/whatsapp/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: format === "csv" ? "text/csv;charset=utf-8;" : "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const periodStr = month && year ? `${year}-${String(month).padStart(2, "0")}` : "export";
  link.setAttribute("download", `whatsapp-usage-${periodStr}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadUsageReportUrl = (format: "json" | "csv", month?: number, year?: number) => {
  const query = new URLSearchParams();
  query.set("format", format);
  if (month) query.set("month", month.toString());
  if (year) query.set("year", year.toString());
  return `/api/billing/whatsapp/export?${query.toString()}`;
};

// -------------------------------------------------------------
// NIWA WhatsApp Billing v3.3: Wallet & Customer Pricing APIs
// -------------------------------------------------------------

export const getWorkspaceWallet = async () => {
  const { data } = await apiClient.get<{ success: boolean; data: import("./whatsapp-billing.types").WorkspaceWallet }>(
    "/billing/whatsapp/wallet"
  );
  return data.data;
};

export const getWalletTransactions = async (params?: { page?: number; limit?: number; transactionType?: string }) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: import("./whatsapp-billing.types").WalletTransaction[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>("/billing/whatsapp/wallet/transactions", { params });
  return data;
};

export const getCustomerRateCards = async (workspaceId = "default", includeInactive = false) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: import("./whatsapp-billing.types").WhatsAppCustomerRateCard[];
  }>("/billing/whatsapp/admin/customer-pricing", { params: { workspaceId, includeInactive } });
  return data.data;
};

export const adminAdjustWallet = async (payload: import("./whatsapp-billing.types").WalletAdjustmentPayload) => {
  const { data } = await apiClient.post<{
    success: boolean;
    data: import("./whatsapp-billing.types").WalletTransaction;
  }>("/billing/whatsapp/admin/wallet/adjust", payload);
  return data.data;
};

export const adminGetWorkspaceWallet = async (workspaceId: string) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: import("./whatsapp-billing.types").WorkspaceWallet;
  }>(`/billing/whatsapp/admin/wallet/${workspaceId}`);
  return data.data;
};

export const adminListWorkspaceTransactions = async (
  workspaceId: string,
  params?: { page?: number; limit?: number; transactionType?: string }
) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: import("./whatsapp-billing.types").WalletTransaction[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/billing/whatsapp/admin/wallet/${workspaceId}/transactions`, { params });
  return data;
};

export const adminCreateCustomerRateCard = async (
  payload: Partial<import("./whatsapp-billing.types").WhatsAppCustomerRateCard>
) => {
  const { data } = await apiClient.post<{
    success: boolean;
    data: import("./whatsapp-billing.types").WhatsAppCustomerRateCard;
  }>("/billing/whatsapp/admin/customer-pricing", payload);
  return data.data;
};

export const adminDeactivateCustomerRateCard = async (payload: { workspaceId: string; rateCardId: string; reason: string }) => {
  const { data } = await apiClient.post<{
    success: boolean;
    data: import("./whatsapp-billing.types").WhatsAppCustomerRateCard;
  }>(`/billing/whatsapp/admin/customer-pricing/${payload.rateCardId}/deactivate`, {
    workspaceId: payload.workspaceId,
    reason: payload.reason,
  });
  return data.data;
};

export const getProfitabilitySummary = async (params?: { startDate?: string; endDate?: string }) => {
  const { data } = await apiClient.get<{
    success: boolean;
    data: import("./whatsapp-billing.types").ProfitabilitySummary;
  }>("/billing/whatsapp/admin/profitability", { params });
  return data.data;
};

