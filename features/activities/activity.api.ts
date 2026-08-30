import { apiClient } from "../../lib/api/api-client";
import type { ListResponse, OffsetListResponse } from "../../lib/api/api-types";
import type { ActivityRecord, CreateActivityPayload } from "./activity.types";

export const createActivity = async (payload: CreateActivityPayload) => {
  const response = await apiClient.post<{ success?: boolean; data: ActivityRecord }>("/activities", payload);
  return response.data;
};

export const listActivities = async (params?: {
  type?: string;
  relatedRecordType?: string;
  relatedRecordId?: string;
  contactId?: string;
  limit?: number;
  page?: number;
}) => {
  if (params?.contactId && !params.relatedRecordId) {
    const response = await apiClient.get<OffsetListResponse<ActivityRecord>>(`/contacts/${params.contactId}/activities`);
    return response.data;
  }

  const response = await apiClient.get<OffsetListResponse<ActivityRecord> & { success?: boolean }>("/activities", {
    params,
  });
  return response.data;
};

export const listActivitiesForRecord = async (recordType: string, recordId: string) => {
  const response = await apiClient.get<OffsetListResponse<ActivityRecord> & { success?: boolean }>(
    `/activities/record/${recordType}/${recordId}`,
  );
  return response.data;
};
