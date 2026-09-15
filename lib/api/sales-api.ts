import { apiClient } from "./api-client";

export type OrderStatus = "DRAFT" | "CONFIRMED" | "FULFILLED" | "CANCELLED";

export interface CustomerSnapshot {
  customerType: "PERSON" | "COMPANY";
  customerId: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
}

export interface SalesOrderLineItem {
  _id?: string;
  productId: string;
  productName: string;
  productVariantId: string;
  variantName: string;
  sku?: string;
  unitId?: string | null;
  unitCode?: string;
  quantity: number;
  unitPrice: number;
  discountType?: "PERCENT" | "FIXED" | null;
  discountValue?: number;
  discountAmount?: number;
  taxRatePercent?: number;
  subtotal: number;
  netAmount: number;
  taxAmount: number;
  lineTotal: number;
  isCustomPrice?: boolean;
}

export interface SalesOrderItem {
  _id: string;
  orderId: string;
  quoteId?: string | null;
  locationId?: string | { _id: string; name: string; locationId: string } | null;
  customer: CustomerSnapshot;
  lines: SalesOrderLineItem[];
  currency: string;
  subtotal: number;
  discountAmount: number;
  netAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: OrderStatus;
  notes?: string | null;
  confirmedAt?: string | null;
  fulfilledAt?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderLineInput {
  productVariantId: string;
  quantity: number;
  customUnitPrice?: number | null;
  discount?: { type: "PERCENT" | "FIXED"; value: number } | null;
  taxRatePercent?: number | null;
}

export interface CreateSalesOrderInput {
  customerType: "PERSON" | "COMPANY";
  customerId: string;
  addresses?: {
    billingAddress?: string | null;
    shippingAddress?: string | null;
  };
  lines: CreateOrderLineInput[];
  locationId?: string | null;
  currency?: string;
  notes?: string | null;
}

export interface OrderFilterParams {
  status?: string;
  customerId?: string;
  quoteId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrdersResponse {
  data: SalesOrderItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getSalesOrders(params?: OrderFilterParams): Promise<PaginatedOrdersResponse> {
  const res = await apiClient.get<{ success: boolean; data: PaginatedOrdersResponse }>("/api/sales/orders", {
    params,
  });
  return res.data.data;
}

export async function getSalesOrder(id: string): Promise<SalesOrderItem> {
  const res = await apiClient.get<{ success: boolean; data: SalesOrderItem }>(`/api/sales/orders/${id}`);
  return res.data.data;
}

export async function createSalesOrder(data: CreateSalesOrderInput): Promise<SalesOrderItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesOrderItem }>("/api/sales/orders", data);
  return res.data.data;
}

export async function updateSalesOrder(id: string, data: Partial<CreateSalesOrderInput>): Promise<SalesOrderItem> {
  const res = await apiClient.patch<{ success: boolean; data: SalesOrderItem }>(`/api/sales/orders/${id}`, data);
  return res.data.data;
}

export async function confirmSalesOrder(id: string, locationId?: string): Promise<SalesOrderItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesOrderItem }>(`/api/sales/orders/${id}/confirm`, {
    locationId,
  });
  return res.data.data;
}

export async function fulfillSalesOrder(id: string): Promise<SalesOrderItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesOrderItem }>(`/api/sales/orders/${id}/fulfill`);
  return res.data.data;
}

export async function cancelSalesOrder(id: string, reason?: string): Promise<SalesOrderItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesOrderItem }>(`/api/sales/orders/${id}/cancel`, {
    reason,
  });
  return res.data.data;
}

export async function convertQuoteToSalesOrder(quoteId: string, locationId?: string): Promise<SalesOrderItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesOrderItem }>(
    `/api/sales/orders/convert-quote/${quoteId}`,
    { locationId }
  );
  return res.data.data;
}

// ==========================================
// INVOICE API & TYPES (PHASE E)
// ==========================================

export type InvoiceStatus = "DRAFT" | "ISSUED" | "VOID";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface InvoiceItem {
  _id: string;
  invoiceId: string;
  salesOrderId?: string | { _id: string; orderId: string } | null;
  customer: CustomerSnapshot;
  lines: SalesOrderLineItem[];
  currency: string;
  subtotal: number;
  discountAmount: number;
  netAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  dueDate?: string | null;
  notes?: string | null;
  issuedAt?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  customerType: "PERSON" | "COMPANY";
  customerId: string;
  addresses?: {
    billingAddress?: string | null;
    shippingAddress?: string | null;
  };
  lines: CreateOrderLineInput[];
  salesOrderId?: string | null;
  currency?: string;
  dueDate?: string | null;
  notes?: string | null;
}

export interface InvoiceFilterParams {
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  salesOrderId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedInvoicesResponse {
  data: InvoiceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getInvoices(params?: InvoiceFilterParams): Promise<PaginatedInvoicesResponse> {
  const res = await apiClient.get<{ success: boolean; data: PaginatedInvoicesResponse }>("/api/sales/invoices", {
    params,
  });
  return res.data.data;
}

export async function getInvoice(id: string): Promise<InvoiceItem> {
  const res = await apiClient.get<{ success: boolean; data: InvoiceItem }>(`/api/sales/invoices/${id}`);
  return res.data.data;
}

export async function createInvoice(data: CreateInvoiceInput): Promise<InvoiceItem> {
  const res = await apiClient.post<{ success: boolean; data: InvoiceItem }>("/api/sales/invoices", data);
  return res.data.data;
}

export async function updateInvoice(id: string, data: Partial<CreateInvoiceInput>): Promise<InvoiceItem> {
  const res = await apiClient.patch<{ success: boolean; data: InvoiceItem }>(`/api/sales/invoices/${id}`, data);
  return res.data.data;
}

export async function createInvoiceFromSalesOrder(
  orderId: string,
  options?: { dueDate?: string | null; notes?: string | null }
): Promise<InvoiceItem> {
  const res = await apiClient.post<{ success: boolean; data: InvoiceItem }>(
    `/api/sales/invoices/convert-order/${orderId}`,
    options || {}
  );
  return res.data.data;
}

export async function issueInvoice(id: string): Promise<InvoiceItem> {
  const res = await apiClient.post<{ success: boolean; data: InvoiceItem }>(`/api/sales/invoices/${id}/issue`);
  return res.data.data;
}

export async function voidInvoice(id: string, reason?: string): Promise<InvoiceItem> {
  const res = await apiClient.post<{ success: boolean; data: InvoiceItem }>(`/api/sales/invoices/${id}/void`, {
    reason,
  });
  return res.data.data;
}

export const cancelInvoice = voidInvoice;

