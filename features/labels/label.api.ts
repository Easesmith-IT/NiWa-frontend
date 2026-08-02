import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { LabelRecordV1 } from "./label.types";

export const listLabelsV1 = async (params?: { search?: string }) => {
  const response = await v1ApiClient.get<V1ListResponse<LabelRecordV1>>("/labels", {
    params,
  });
  return response.data;
};

export const createLabelV1 = async (payload: {
  color: string;
  description?: string;
  name: string;
  slug: string;
}) => {
  const response = await v1ApiClient.post<{ data: LabelRecordV1 }>("/labels", payload);
  return response.data;
};

export const patchLabelV1 = async (
  labelId: string,
  payload: Partial<{
    color: string;
    description: string;
    name: string;
    slug: string;
  }>,
) => {
  const response = await v1ApiClient.patch<{ data: LabelRecordV1 }>(`/labels/${labelId}`, payload);
  return response.data;
};

export const deleteLabelV1 = async (labelId: string) => {
  const response = await v1ApiClient.delete<{ data: LabelRecordV1 }>(`/labels/${labelId}`);
  return response.data;
};
