import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { ContactRecord, ContactImportRecord } from "./contact.types";

export const listContacts = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await apiClient.get<ListResponse<ContactRecord>>("/contacts", {
    params,
  });
  return response.data;
};

export const createContact = async (payload: {
  company?: string;
  customFields?: Array<{ key: string; type: "boolean" | "date" | "number" | "text"; value: string }>;
  displayName: string;
  email?: string;
  phoneNumber: string;
  phoneNumberE164: string;
  profileName?: string;
  waId: string;
}) => {
  const response = await apiClient.post<{ data: ContactRecord }>("/contacts", payload);
  return response.data;
};

export const patchContact = async (
  contactId: string,
  payload: Partial<{
    avatarUrl: string | null;
    company: string | null;
    customFields: Array<{ key: string; type: "boolean" | "date" | "number" | "text"; value: string }>;
    displayName: string;
    email: string | null;
    phoneNumber: string;
    phoneNumberE164: string;
    profileName: string | null;
    waId: string;
  }>,
) => {
  const response = await apiClient.patch<{ data: ContactRecord }>(`/contacts/${contactId}`, payload);
  return response.data;
};

export const deleteContact = async (contactId: string) => {
  const response = await apiClient.delete<{ data: ContactRecord }>(`/contacts/${contactId}`);
  return response.data;
};

export const addContactLabel = async (contactId: string, labelId: string) => {
  const response = await apiClient.post<{ data: ContactRecord }>(`/contacts/${contactId}/labels`, {
    labelId,
  });
  return response.data;
};

export const removeContactLabel = async (contactId: string, labelId: string) => {
  const response = await apiClient.delete<{ data: ContactRecord }>(
    `/contacts/${contactId}/labels/${labelId}`,
  );
  return response.data;
};



export const exportContacts = async (params?: { format?: "csv" | "json"; search?: string }) => {
  const response = await apiClient.get("/contacts/export", {
    params,
    responseType: params?.format === "csv" ? "blob" : "json",
  });

  return response.data;
};

export const getContactDuplicates = async (params?: {
  field?: "phoneNumber" | "phoneNumberE164" | "waId";
}) => {
  const response = await apiClient.get<{
    data: Array<{
      contacts: ContactRecord[];
      count: number;
      value: string;
    }>;
    metadata: {
      field: "phoneNumber" | "phoneNumberE164" | "waId";
      totalGroups: number;
    };
  }>("/contacts/duplicates", {
    params,
  });
  return response.data;
};

export const mergeContacts = async (payload: {
  sourceContactId: string;
  targetContactId: string;
}) => {
  const response = await apiClient.post<{ data: ContactRecord | null }>("/contacts/merge", payload);
  return response.data;
};

export const uploadContactImport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{ data: ContactImportRecord }>("/contact-imports/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const validateContactImport = async (importId: string, payload: { columnMapping: Record<string, string> }) => {
  const response = await apiClient.post<{ data: ContactImportRecord }>(`/contact-imports/${importId}/validate`, payload);
  return response.data.data;
};

export const commitContactImport = async (importId: string) => {
  const response = await apiClient.post<{ data: ContactImportRecord }>(`/contact-imports/${importId}/commit`);
  return response.data.data;
};

export const getContactImport = async (importId: string) => {
  const response = await apiClient.get<{ data: ContactImportRecord }>(`/contact-imports/${importId}`);
  return response.data.data;
};

export const listContactImports = async () => {
  const response = await apiClient.get<{ data: ContactImportRecord[] }>("/contact-imports");
  return response.data;
};
