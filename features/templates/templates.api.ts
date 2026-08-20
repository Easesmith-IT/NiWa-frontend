import { v1ApiClient } from "../../lib/api/v1-client";

// Define a minimal type for the templates response or import if it exists.
export interface MetaTemplate {
  _id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: any[];
}

export const getTemplates = async () => {
  const { data } = await v1ApiClient.get<{ templates: MetaTemplate[] }>("/templates");
  return data;
};
