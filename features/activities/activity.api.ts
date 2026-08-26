import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { ActivityRecord } from "./activity.types";

export const listActivitiesV1 = async (contactId: string) => {
  const response = await apiClient.get<ListResponse<ActivityRecord>>(
    `/contacts/${contactId}/activities`,
  );
  return response.data;
};
