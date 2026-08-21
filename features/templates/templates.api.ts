import { v1ApiClient } from "../../lib/api/v1-client";
import type { TemplatesResponse, TemplateSyncResponse } from "../../lib/api/types";
import type { GetTemplatesParams, MetaTemplate } from "./templates.types";

export * from "./templates.types";

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
