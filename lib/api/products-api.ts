import { apiClient } from "./api-client";

export interface ProductItem {
  _id: string;
  productId: string;
  name: string;
  description?: string;
  productType: "PHYSICAL" | "SERVICE" | "DIGITAL" | "OTHER";
  categoryId?: any;
  brandId?: any;
  defaultUnitId?: any;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  sellingPrice: number;
  costPrice: number;
  variantsCount: number;
  variants?: any[];
  defaultVariant?: any;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  data: ProductItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CategoryItem {
  _id: string;
  categoryId: string;
  name: string;
  parentId?: any;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  sortOrder: number;
}

export interface BrandItem {
  _id: string;
  brandId: string;
  name: string;
  description?: string;
  logo?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface UnitItem {
  _id: string;
  unitId: string;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface SupplierItem {
  _id: string;
  supplierId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export const productsApi = {
  // Products
  getProducts: async (params?: Record<string, any>): Promise<ProductListResponse> => {
    const res = await apiClient.get("/api/products", { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<{ success: boolean; data: ProductItem }> => {
    const res = await apiClient.get(`/api/products/${id}`);
    return res.data;
  },

  createProduct: async (data: Record<string, any>): Promise<{ success: boolean; data: ProductItem }> => {
    const res = await apiClient.post("/api/products", data);
    return res.data;
  },

  updateProduct: async (id: string, data: Record<string, any>): Promise<{ success: boolean; data: ProductItem }> => {
    const res = await apiClient.patch(`/api/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/api/products/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async (params?: Record<string, any>): Promise<{ success: boolean; data: CategoryItem[] }> => {
    const res = await apiClient.get("/api/products/categories", { params });
    return res.data;
  },

  createCategory: async (data: Record<string, any>): Promise<{ success: boolean; data: CategoryItem }> => {
    const res = await apiClient.post("/api/products/categories", data);
    return res.data;
  },

  updateCategory: async (id: string, data: Record<string, any>): Promise<{ success: boolean; data: CategoryItem }> => {
    const res = await apiClient.patch(`/api/products/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/api/products/categories/${id}`);
    return res.data;
  },

  // Brands
  getBrands: async (params?: Record<string, any>): Promise<{ success: boolean; data: BrandItem[] }> => {
    const res = await apiClient.get("/api/products/brands", { params });
    return res.data;
  },

  createBrand: async (data: Record<string, any>): Promise<{ success: boolean; data: BrandItem }> => {
    const res = await apiClient.post("/api/products/brands", data);
    return res.data;
  },

  deleteBrand: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/api/products/brands/${id}`);
    return res.data;
  },

  // Units
  getUnits: async (params?: Record<string, any>): Promise<{ success: boolean; data: UnitItem[] }> => {
    const res = await apiClient.get("/api/products/units", { params });
    return res.data;
  },

  createUnit: async (data: Record<string, any>): Promise<{ success: boolean; data: UnitItem }> => {
    const res = await apiClient.post("/api/products/units", data);
    return res.data;
  },

  // Suppliers
  getSuppliers: async (params?: Record<string, any>): Promise<{ success: boolean; data: SupplierItem[] }> => {
    const res = await apiClient.get("/api/products/suppliers", { params });
    return res.data;
  },

  createSupplier: async (data: Record<string, any>): Promise<{ success: boolean; data: SupplierItem }> => {
    const res = await apiClient.post("/api/products/suppliers", data);
    return res.data;
  },
};
