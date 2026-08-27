import { apiClient } from "../../lib/api/api-client";
import type { TemplatesResponse, TemplateSyncResponse } from "../../lib/api/types";
import type { GetTemplatesParams, MetaTemplate } from "./templates.types";

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
