import { apiClient } from "../../lib/api/api-client";
import type { CrmCompany, CrmPerson, ContactRecord } from "../../lib/api/api-types";

export interface ListCompaniesParams {
  search?: string;
  isArchived?: boolean;
  limit?: number;
}

export const listCompanies = async (params?: ListCompaniesParams) => {
  const response = await apiClient.get<{ success: boolean; data: CrmCompany[] }>("/api/crm/companies", {
    params,
  });
  return response.data.data;
};

export const getCompany = async (id: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: CrmCompany & { people?: CrmPerson[]; contacts?: ContactRecord[] };
  }>(`/api/crm/companies/${id}`);
  return response.data.data;
};

export const createCompany = async (payload: Partial<CrmCompany>) => {
  const response = await apiClient.post<{ success: boolean; data: CrmCompany }>("/api/crm/companies", payload);
  return response.data.data;
};

export const updateCompany = async (id: string, payload: Partial<CrmCompany>) => {
  const response = await apiClient.patch<{ success: boolean; data: CrmCompany }>(`/api/crm/companies/${id}`, payload);
  return response.data.data;
};

export const archiveCompany = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: CrmCompany }>(`/api/crm/companies/${id}`);
  return response.data.data;
};

export const getCompanyPeople = async (companyId: string) => {
  const response = await apiClient.get<{ success: boolean; data: CrmPerson[] }>(
    `/api/crm/companies/${companyId}/people`,
  );
  return response.data.data;
};

export const getCompanyContacts = async (companyId: string) => {
  const response = await apiClient.get<{ success: boolean; data: ContactRecord[] }>(
    `/api/crm/companies/${companyId}/contacts`,
  );
  return response.data.data;
};
