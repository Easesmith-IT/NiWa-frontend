import { apiClient } from "./api-client";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export type PurchasePaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type PurchaseReturnStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type PurchaseReturnReason =
  | "DAMAGED"
  | "WRONG_PRODUCT"
  | "QUALITY_ISSUE"
  | "EXCESS"
  | "OTHER";

export interface SupplierSnapshot {
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface PurchaseOrderItem {
  _id: string;
  productId: string;
  productName: string;
  productVariantId: string;
  variantName: string;
  sku?: string;
  supplierSku?: string | null;
  unitId?: string | null;
  unitCode?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity?: number;
  purchasePrice: number;
  taxRatePercent?: number;
  taxAmount?: number;
  discountAmount?: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  _id: string;
  workspaceId: string;
  orderId: string;
  supplierId: string;
  supplier: SupplierSnapshot;
  locationId: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  currency: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: PurchasePaymentStatus;
  notes?: string | null;
  orderedAt?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturnItem {
  _id: string;
  purchaseOrderItemId: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  sku?: string;
  quantity: number;
  purchasePrice: number;
  returnReason?: string | null;
  itemTotal: number;
}

export interface PurchaseReturn {
  _id: string;
  workspaceId: string;
  returnId: string;
  purchaseOrderId: string;
  supplierId: string;
  locationId: string;
  returnDate: string;
  status: PurchaseReturnStatus;
  items: PurchaseReturnItem[];
  reason?: string | null;
  refundAmount: number;
  notes?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchasingSummary {
  totalPurchaseValue: number;
  totalPaid: number;
  totalOutstanding: number;
  openOrdersCount: number;
  pendingReceiptsCount: number;
}

export interface CreatePurchaseOrderItemInput {
  productVariantId: string;
  orderedQuantity: number;
  purchasePrice: number;
  taxRatePercent?: number;
  discountAmount?: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  locationId: string;
  orderDate?: string;
  expectedDeliveryDate?: string | null;
  items: CreatePurchaseOrderItemInput[];
  currency?: string;
  notes?: string | null;
  otherCharges?: number;
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  locationId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string | null;
  items?: CreatePurchaseOrderItemInput[];
  currency?: string;
  notes?: string | null;
  otherCharges?: number;
}

export interface ReceivePurchaseOrderItemInput {
  itemId: string;
  quantity: number;
}

export interface ReceivePurchaseOrderInput {
  locationId?: string;
  items: ReceivePurchaseOrderItemInput[];
}

export interface CreatePurchaseReturnItemInput {
  purchaseOrderItemId: string;
  quantity: number;
  reason?: string;
}

export interface CreatePurchaseReturnInput {
  purchaseOrderId: string;
  locationId?: string;
  items: CreatePurchaseReturnItemInput[];
  reason?: string;
  notes?: string | null;
}

export interface PurchaseOrderListResponse {
  success: boolean;
  data: PurchaseOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PurchaseReturnListResponse {
  success: boolean;
  data: PurchaseReturn[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const purchasingApi = {
  getPurchaseOrders: async (
    params?: Record<string, any>
  ): Promise<PurchaseOrderListResponse> => {
    const res = await apiClient.get("/purchasing/orders", { params });
    return res.data;
  },

  getPurchaseOrderById: async (
    id: string
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.get(`/purchasing/orders/${id}`);
    return res.data;
  },

  getPurchasingSummary: async (): Promise<{
    success: boolean;
    data: PurchasingSummary;
  }> => {
    const res = await apiClient.get("/purchasing/orders/summary");
    return res.data;
  },

  createPurchaseOrder: async (
    data: CreatePurchaseOrderInput
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.post("/purchasing/orders", data);
    return res.data;
  },

  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderInput
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.put(`/purchasing/orders/${id}`, data);
    return res.data;
  },

  orderPurchaseOrder: async (
    id: string
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.post(`/purchasing/orders/${id}/order`);
    return res.data;
  },

  cancelPurchaseOrder: async (
    id: string,
    reason?: string
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.post(`/purchasing/orders/${id}/cancel`, {
      reason,
    });
    return res.data;
  },

  receivePurchaseOrder: async (
    id: string,
    data: ReceivePurchaseOrderInput
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.post(`/purchasing/orders/${id}/receive`, data);
    return res.data;
  },

  updatePaymentState: async (
    id: string,
    paidAmount: number
  ): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const res = await apiClient.patch(`/purchasing/orders/${id}/payment-state`, {
      paidAmount,
    });
    return res.data;
  },

  getPurchaseReturns: async (
    params?: Record<string, any>
  ): Promise<PurchaseReturnListResponse> => {
    const res = await apiClient.get("/purchasing/returns", { params });
    return res.data;
  },

  getPurchaseReturnById: async (
    id: string
  ): Promise<{ success: boolean; data: PurchaseReturn }> => {
    const res = await apiClient.get(`/purchasing/returns/${id}`);
    return res.data;
  },

  createPurchaseReturn: async (
    data: CreatePurchaseReturnInput
  ): Promise<{ success: boolean; data: PurchaseReturn }> => {
    const res = await apiClient.post("/purchasing/returns", data);
    return res.data;
  },
};
