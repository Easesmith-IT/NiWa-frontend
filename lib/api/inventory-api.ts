import { apiClient } from "./api-client";

// ==========================================
// INTERFACES
// ==========================================

export interface LocationItem {
  _id: string;
  locationId: string;
  name: string;
  code?: string | null;
  type: string;
  parentId?: { _id: string; name: string; locationId: string } | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLevelItem {
  _id: string;
  levelId: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  reorderQuantity: number;
  isLowStock: boolean;
  locationId: {
    _id: string;
    locationId: string;
    name: string;
    code?: string;
    status: string;
  };
  inventoryItemId: {
    _id: string;
    inventoryItemId: string;
    trackQuantity: boolean;
    allowNegativeStock: boolean;
    trackingMode: string;
    productVariantId: {
      _id: string;
      variantId: string;
      name: string;
      sku?: string;
      barcode?: string;
      sellingPrice: number;
      productId: {
        _id: string;
        productId: string;
        name: string;
        status: string;
      };
      unitId?: {
        _id: string;
        name: string;
        code: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementItem {
  _id: string;
  movementId: string;
  quantity: number;
  movementType: string;
  referenceType?: string | null;
  referenceId?: string | null;
  reason?: string | null;
  operationId?: string | null;
  occurredAt: string;
  sourceLocationId?: {
    _id: string;
    locationId: string;
    name: string;
  } | null;
  destinationLocationId?: {
    _id: string;
    locationId: string;
    name: string;
  } | null;
  inventoryItemId: {
    _id: string;
    inventoryItemId: string;
    productVariantId: {
      _id: string;
      variantId: string;
      name: string;
      sku?: string;
      productId: {
        _id: string;
        productId: string;
        name: string;
      };
      unitId?: {
        _id: string;
        code: string;
      };
    };
  };
  createdBy?: {
    userId?: string;
    email?: string;
  } | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==========================================
// 1. LOCATION API
// ==========================================

export async function getLocations(params?: {
  q?: string;
  status?: string;
  parentId?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<LocationItem>> {
  const res = await apiClient.get<PaginatedResponse<LocationItem>>("/api/inventory/locations", {
    params,
  });
  return res.data;
}

export async function createLocation(data: {
  name: string;
  code?: string | null;
  type?: string;
  parentId?: string | null;
  address?: string | null;
}): Promise<{ success: boolean; data: LocationItem }> {
  const res = await apiClient.post<{ success: boolean; data: LocationItem }>(
    "/api/inventory/locations",
    data
  );
  return res.data;
}

export async function updateLocation(
  id: string,
  data: {
    name?: string;
    code?: string | null;
    type?: string;
    parentId?: string | null;
    address?: string | null;
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  }
): Promise<{ success: boolean; data: LocationItem }> {
  const res = await apiClient.patch<{ success: boolean; data: LocationItem }>(
    `/api/inventory/locations/${id}`,
    data
  );
  return res.data;
}

export async function deleteLocation(
  id: string
): Promise<{ success: boolean; data: LocationItem }> {
  const res = await apiClient.delete<{ success: boolean; data: LocationItem }>(
    `/api/inventory/locations/${id}`
  );
  return res.data;
}

// ==========================================
// 2. INVENTORY LEVEL API
// ==========================================

export async function getInventoryLevels(params?: {
  locationId?: string;
  inventoryItemId?: string;
  productVariantId?: string;
  productId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<InventoryLevelItem>> {
  const res = await apiClient.get<PaginatedResponse<InventoryLevelItem>>("/api/inventory/levels", {
    params,
  });
  return res.data;
}

export async function getInventoryLevelById(
  id: string
): Promise<{ success: boolean; data: InventoryLevelItem }> {
  const res = await apiClient.get<{ success: boolean; data: InventoryLevelItem }>(
    `/api/inventory/levels/${id}`
  );
  return res.data;
}

export async function updateReorderSettings(
  id: string,
  data: { reorderPoint?: number; reorderQuantity?: number }
): Promise<{ success: boolean; data: InventoryLevelItem }> {
  const res = await apiClient.patch<{ success: boolean; data: InventoryLevelItem }>(
    `/api/inventory/levels/${id}/reorder`,
    data
  );
  return res.data;
}

// ==========================================
// 3. STOCK ADJUSTMENT API
// ==========================================

export interface AdjustStockPayload {
  locationId: string;
  inventoryItemId: string; // can be inventoryItemId or productVariantId
  type?: string;
  quantity?: number;
  newQuantity?: number;
  reason?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  operationId?: string | null;
}

export async function adjustStock(
  data: AdjustStockPayload
): Promise<{ success: boolean; data: { level: InventoryLevelItem; movement: StockMovementItem } }> {
  const res = await apiClient.post<{
    success: boolean;
    data: { level: InventoryLevelItem; movement: StockMovementItem };
  }>("/api/inventory/adjust", data);
  return res.data;
}

// ==========================================
// 4. STOCK MOVEMENTS LEDGER API
// ==========================================

export async function getStockMovements(params?: {
  inventoryItemId?: string;
  locationId?: string;
  movementType?: string;
  operationId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<StockMovementItem>> {
  const res = await apiClient.get<PaginatedResponse<StockMovementItem>>(
    "/api/inventory/movements",
    { params }
  );
  return res.data;
}

export async function getStockMovementById(
  id: string
): Promise<{ success: boolean; data: StockMovementItem }> {
  const res = await apiClient.get<{ success: boolean; data: StockMovementItem }>(
    `/api/inventory/movements/${id}`
  );
  return res.data;
}
