import { apiClient } from "./api-client";

export type CrmFieldRecordType =
  | "Person"
  | "Company"
  | "Lead"
  | "Deal"
  | "Product"
  | "Supplier";

export type CrmFieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "CURRENCY"
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "OPTION"
  | "MULTI_OPTION"
  | "EMAIL"
  | "PHONE"
  | "URL"
  | "RECORD_RELATIONSHIP";

export interface CrmFieldDefinition {
  _id: string;
  fieldDefinitionId: string;
  workspaceId: string;
  recordType: CrmFieldRecordType;
  key: string;
  label: string;
  type: CrmFieldType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  active: boolean;
  description?: string;
  defaultValue?: any;
  position: number;
  options?: Array<{ id: string; label: string; value: string; color?: string }>;
  relationshipConfig?: {
    targetEntityTypes: string[];
    allowMultiple: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const crmFieldsApi = {
  getFieldDefinitions: async (
    recordType?: CrmFieldRecordType,
    includeInactive: boolean = false
  ): Promise<{ data: CrmFieldDefinition[] }> => {
    const params: Record<string, any> = {};
    if (recordType) params.recordType = recordType;
    if (includeInactive) params.includeInactive = "true";
    const res = await apiClient.get("/api/crm/fields/definitions", { params });
    return res.data;
  },

  createFieldDefinition: async (
    data: {
      recordType: CrmFieldRecordType;
      key: string;
      label: string;
      type: CrmFieldType;
      required?: boolean;
      description?: string;
      defaultValue?: any;
    }
  ): Promise<{ message: string; data: CrmFieldDefinition }> => {
    const res = await apiClient.post("/api/crm/fields/definitions", data);
    return res.data;
  },

  updateFieldDefinition: async (
    id: string,
    data: Partial<CrmFieldDefinition>
  ): Promise<{ message: string; data: CrmFieldDefinition }> => {
    const res = await apiClient.patch(`/api/crm/fields/definitions/${id}`, data);
    return res.data;
  },

  deleteFieldDefinition: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/api/crm/fields/definitions/${id}`);
    return res.data;
  },

  getRecordFieldValues: async (
    recordType: CrmFieldRecordType,
    recordId: string
  ): Promise<{ data: any[] }> => {
    const res = await apiClient.get(`/api/crm/fields/values/record/${recordType}/${recordId}`);
    return res.data;
  },
};
