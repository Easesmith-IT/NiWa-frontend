import { apiClient } from "../../lib/api/api-client";
import type { CrmPerson, CrmCompany, ContactRecord } from "../../lib/api/api-types";

export interface ListPeopleParams {
  search?: string;
  companyId?: string;
  isArchived?: boolean;
}

export const listPeople = async (params?: ListPeopleParams) => {
  const response = await apiClient.get<{ success: boolean; data: CrmPerson[] }>("/api/crm/people", {
    params,
  });
  return response.data.data;
};

export const getPerson = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: CrmPerson & { companies?: CrmCompany[]; contacts?: ContactRecord[] } }>(
    `/api/crm/people/${id}`,
  );
  return response.data.data;
};

export const createPerson = async (payload: Partial<CrmPerson>) => {
  const response = await apiClient.post<{ success: boolean; data: CrmPerson }>("/api/crm/people", payload);
  return response.data.data;
};

export const updatePerson = async (id: string, payload: Partial<CrmPerson>) => {
  const response = await apiClient.patch<{ success: boolean; data: CrmPerson }>(`/api/crm/people/${id}`, payload);
  return response.data.data;
};

export const archivePerson = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: CrmPerson }>(`/api/crm/people/${id}`);
  return response.data.data;
};

export const linkPersonCompany = async (personId: string, companyId: string) => {
  const response = await apiClient.post<{ success: boolean; data: CrmPerson }>(
    `/api/crm/people/${personId}/companies`,
    { companyId },
  );
  return response.data.data;
};

export const unlinkPersonCompany = async (personId: string, companyId: string) => {
  const response = await apiClient.delete<{ success: boolean; data: CrmPerson }>(
    `/api/crm/people/${personId}/companies/${companyId}`,
  );
  return response.data.data;
};

export const getPersonContacts = async (personId: string) => {
  const response = await apiClient.get<{ success: boolean; data: ContactRecord[] }>(
    `/api/crm/people/${personId}/contacts`,
  );
  return response.data.data;
};
