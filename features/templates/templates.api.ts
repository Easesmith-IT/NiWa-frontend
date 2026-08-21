import { v1ApiClient } from "../../lib/api/v1-client";
import type { TemplatesResponse, TemplateSyncResponse } from "../../lib/api/types";

export interface MetaTemplate {
  _id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: any[];
}

export interface GetTemplatesParams {
  category?: string;
  language?: string;
  query?: string;
  status?: string;
}

export const getTemplatesV1 = async (params?: GetTemplatesParams) => {
  const { data } = await v1ApiClient.get<TemplatesResponse>("/templates", { params });
  return data;
};

export const getTemplates = async () => {
  const { data } = await v1ApiClient.get<{ templates: MetaTemplate[] }>("/templates");
  return data;
};

export const syncTemplatesV1 = async () => {
  const { data } = await v1ApiClient.post<TemplateSyncResponse>("/templates/sync");
  return data;
};
