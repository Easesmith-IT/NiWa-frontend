import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { LabelRecord } from "./label.types";

export const listLabels = async (params?: { search?: string }) => {
  const response = await apiClient.get<ListResponse<LabelRecord>>("/labels", {
    params,
  });
  return response.data;
};

export const createLabel = async (payload: {
  color: string;
  description?: string;
  name: string;
  slug: string;
}) => {
  const response = await apiClient.post<{ data: LabelRecord }>("/labels", payload);
  return response.data;
};

export const patchLabel = async (
  labelId: string,
  payload: Partial<{
    color: string;
    description: string;
    name: string;
    slug: string;
  }>,
) => {
  const response = await apiClient.patch<{ data: LabelRecord }>(`/labels/${labelId}`, payload);
  return response.data;
};

export const deleteLabel = async (labelId: string) => {
  const response = await apiClient.delete<{ data: LabelRecord }>(`/labels/${labelId}`);
  return response.data;
};
