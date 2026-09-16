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

// ==========================================
// PAYMENT API & TYPES (PHASE F)
// ==========================================

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "UPI" | "OTHER";
export type PaymentRecordStatus = "COMPLETED" | "VOIDED";

export interface PaymentItem {
  _id: string;
  paymentId: string;
  invoiceId:
    | string
    | {
        _id: string;
        invoiceId: string;
        grandTotal: number;
        paidAmount: number;
        balanceDue: number;
        currency: string;
        status: InvoiceStatus;
        paymentStatus: PaymentStatus;
      };
  orderId?: string | null;
  customerId: string;
  customerType: "PERSON" | "COMPANY";
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  idempotencyKey?: string | null;
  paymentDate: string;
  status: PaymentRecordStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  paymentDate?: string | null;
  transactionReference?: string | null;
  idempotencyKey?: string | null;
  notes?: string | null;
}

export interface PaymentFilterParams {
  invoiceId?: string;
  customerId?: string;
  orderId?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPaymentsResponse {
  data: PaymentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getPayments(params?: PaymentFilterParams): Promise<PaginatedPaymentsResponse> {
  const res = await apiClient.get<{ success: boolean; data: PaginatedPaymentsResponse }>("/api/sales/payments", {
    params,
  });
  return res.data.data;
}

export async function getPayment(id: string): Promise<PaymentItem> {
  const res = await apiClient.get<{ success: boolean; data: PaymentItem }>(`/api/sales/payments/${id}`);
  return res.data.data;
}

export async function recordPayment(data: RecordPaymentInput): Promise<PaymentItem> {
  const res = await apiClient.post<{ success: boolean; data: PaymentItem }>("/api/sales/payments", data);
  return res.data.data;
}

export async function recordInvoicePayment(
  invoiceId: string,
  data: Omit<RecordPaymentInput, "invoiceId">
): Promise<PaymentItem> {
  const res = await apiClient.post<{ success: boolean; data: PaymentItem }>(
    `/api/sales/invoices/${invoiceId}/payments`,
    data
  );
  return res.data.data;
}

export async function getInvoicePayments(invoiceId: string): Promise<PaymentItem[]> {
  const res = await apiClient.get<{ success: boolean; data: PaymentItem[] }>(
    `/api/sales/invoices/${invoiceId}/payments`
  );
  return res.data.data;
}

// ==========================================
// 4. SALES RETURNS
// ==========================================

export type ReturnStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type ReturnItemCondition = "RESTOCKABLE" | "DAMAGED";

export interface SalesReturnLineItem {
  _id?: string;
  productVariantId: string;
  productId: string;
  sku: string;
  productName: string;
  variantName: string;
  unitId?: string | null;
  unitCode?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
  condition: ReturnItemCondition;
}

export interface SalesReturnItem {
  _id: string;
  returnId: string;
  salesOrderId: string | { _id: string; orderId: string };
  invoiceId?: string | { _id: string; invoiceId: string } | null;
  customer: CustomerSnapshot;
  lines: SalesReturnLineItem[];
  reason?: string | null;
  status: ReturnStatus;
  returnDate: string;
  refundAmount: number;
  currency: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnLineInput {
  productVariantId: string;
  quantity: number;
  condition?: ReturnItemCondition;
}

export interface CreateSalesReturnInput {
  salesOrderId: string;
  invoiceId?: string | null;
  lines: CreateReturnLineInput[];
  reason?: string | null;
  returnDate?: string | null;
  currency?: string;
}

export interface ReturnFilterParams {
  status?: string;
  salesOrderId?: string;
  invoiceId?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedReturnsResponse {
  data: SalesReturnItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReturnableLineQuantity {
  productVariantId: string;
  sku: string;
  productName: string;
  variantName: string;
  unitCode: string;
  unitPrice: number;
  soldQuantity: number;
  confirmedReturnedQuantity: number;
  remainingReturnableQuantity: number;
}

export interface ReturnableQuantitiesResponse {
  order: SalesOrderItem;
  returnableLines: ReturnableLineQuantity[];
}

export async function getSalesReturns(params?: ReturnFilterParams): Promise<PaginatedReturnsResponse> {
  const res = await apiClient.get<{ success: boolean; data: PaginatedReturnsResponse }>("/api/sales/returns", {
    params,
  });
  return res.data.data;
}

export async function getSalesReturn(id: string): Promise<SalesReturnItem> {
  const res = await apiClient.get<{ success: boolean; data: SalesReturnItem }>(`/api/sales/returns/${id}`);
  return res.data.data;
}

export async function createSalesReturn(data: CreateSalesReturnInput): Promise<SalesReturnItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesReturnItem }>("/api/sales/returns", data);
  return res.data.data;
}

export async function confirmSalesReturn(id: string): Promise<SalesReturnItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesReturnItem }>(`/api/sales/returns/${id}/confirm`);
  return res.data.data;
}

export async function cancelSalesReturn(id: string, reason?: string): Promise<SalesReturnItem> {
  const res = await apiClient.post<{ success: boolean; data: SalesReturnItem }>(`/api/sales/returns/${id}/cancel`, {
    reason,
  });
  return res.data.data;
}

export async function getOrderReturnableQuantities(orderId: string): Promise<ReturnableQuantitiesResponse> {
  const res = await apiClient.get<{ success: boolean; data: ReturnableQuantitiesResponse }>(
    `/api/sales/returns/order/${orderId}/returnable-quantities`
  );
  return res.data.data;
}

export async function getOrderReturns(orderId: string): Promise<PaginatedReturnsResponse> {
  const res = await apiClient.get<{ success: boolean; data: PaginatedReturnsResponse }>(
    `/api/sales/orders/${orderId}/returns`
  );
  return res.data.data;
}

// ==========================================
// WORKSPACE INVOICE SETTINGS
// ==========================================

export interface WorkspaceInvoiceSettings {
  workspaceId?: string;
  defaultCurrency?: string | null;
  businessName?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  website?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  ifscOrRoutingCode?: string | null;
  swiftCode?: string | null;
  upiId?: string | null;
  paymentTerms?: string | null;
  paymentNotes?: string | null;
}

export type UpdateInvoiceSettingsInput = Partial<WorkspaceInvoiceSettings>;

export async function getInvoiceSettings(): Promise<WorkspaceInvoiceSettings | null> {
  const res = await apiClient.get<{ success: boolean; data: WorkspaceInvoiceSettings | null }>(
    "/api/sales/invoices/settings"
  );
  return res.data?.data || null;
}

export async function updateInvoiceSettings(
  data: UpdateInvoiceSettingsInput
): Promise<WorkspaceInvoiceSettings> {
  const res = await apiClient.put<{ success: boolean; data: WorkspaceInvoiceSettings }>(
    "/api/sales/invoices/settings",
    data
  );
  return res.data.data;
}
