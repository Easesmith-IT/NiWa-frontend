import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { ContactRecordV1 } from "./contact.types";

export const listContactsV1 = async (params?: { search?: string }) => {
  const response = await v1ApiClient.get<V1ListResponse<ContactRecordV1>>("/contacts", {
    params,
  });
  return response.data;
};

export const createContactV1 = async (payload: {
  company?: string;
  customFields?: Array<{ key: string; type: "boolean" | "date" | "number" | "text"; value: string }>;
  displayName: string;
  email?: string;
  phoneNumber: string;
  phoneNumberE164: string;
  profileName?: string;
  waId: string;
}) => {
  const response = await v1ApiClient.post<{ data: ContactRecordV1 }>("/contacts", payload);
  return response.data;
};

export const patchContactV1 = async (
  contactId: string,
  payload: Partial<{
    avatarUrl: string;
    company: string;
    customFields: Array<{ key: string; type: "boolean" | "date" | "number" | "text"; value: string }>;
    displayName: string;
    email: string;
    phoneNumber: string;
    phoneNumberE164: string;
    profileName: string;
    waId: string;
  }>,
) => {
  const response = await v1ApiClient.patch<{ data: ContactRecordV1 }>(`/contacts/${contactId}`, payload);
  return response.data;
};

export const deleteContactV1 = async (contactId: string) => {
  const response = await v1ApiClient.delete<{ data: ContactRecordV1 }>(`/contacts/${contactId}`);
  return response.data;
};

export const addContactLabelV1 = async (contactId: string, labelId: string) => {
  const response = await v1ApiClient.post<{ data: ContactRecordV1 }>(`/contacts/${contactId}/labels`, {
    labelId,
  });
  return response.data;
};

export const removeContactLabelV1 = async (contactId: string, labelId: string) => {
  const response = await v1ApiClient.delete<{ data: ContactRecordV1 }>(
    `/contacts/${contactId}/labels/${labelId}`,
  );
  return response.data;
};

export const importContactsV1 = async (payload: {
  contacts: Array<{
    company?: string;
    customFields?: Array<{ key: string; type: "boolean" | "date" | "number" | "text"; value: string }>;
    displayName: string;
    email?: string;
    phoneNumber: string;
    phoneNumberE164: string;
    profileName?: string;
    waId: string;
  }>;
}) => {
  const response = await v1ApiClient.post<{ data: { created: number; total: number; updated: number } }>(
    "/contacts/import",
    payload,
  );
  return response.data;
};

export const exportContactsV1 = async (params?: { format?: "csv" | "json"; search?: string }) => {
  const response = await v1ApiClient.get("/contacts/export", {
    params,
    responseType: params?.format === "csv" ? "blob" : "json",
  });

  return response.data;
};

export const getContactDuplicatesV1 = async (params?: {
  field?: "phoneNumber" | "phoneNumberE164" | "waId";
}) => {
  const response = await v1ApiClient.get<{
    data: Array<{
      contacts: ContactRecordV1[];
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

export const mergeContactsV1 = async (payload: {
  sourceContactId: string;
  targetContactId: string;
}) => {
  const response = await v1ApiClient.post<{ data: ContactRecordV1 | null }>("/contacts/merge", payload);
  return response.data;
};
