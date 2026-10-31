import { apiClient } from "../../lib/api/api-client";
import type { TemplatesResponse, TemplateSyncResponse } from "../../lib/api/types";
import type {
  CreateTemplatePayload,
  CreateTemplateResponse,
  DeleteTemplateResponse,
  GetTemplatesParams,
  MetaTemplate,
} from "./templates.types";

export * from "./templates.types";

export const getTemplatesPaginated = async (params?: GetTemplatesParams) => {
  const { data } = await apiClient.get<TemplatesResponse>("/templates", { params });
  return data;
};

export const getTemplates = async () => {
  const { data } = await apiClient.get<{ templates: MetaTemplate[] }>("/templates");
  return data;
};

export const syncTemplates = async () => {
  const { data } = await apiClient.post<TemplateSyncResponse>("/templates/sync");
  return data;
};

export const createTemplate = async (payload: CreateTemplatePayload) => {
  const { data } = await apiClient.post<CreateTemplateResponse>("/templates", payload);
  return data;
};

export const deleteTemplate = async (templateId: string) => {
  const { data } = await apiClient.delete<DeleteTemplateResponse>(`/templates/${templateId}`);
  return data;
};
