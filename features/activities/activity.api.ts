import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { ActivityRecordV1 } from "./activity.types";

export const listActivitiesV1 = async (contactId: string) => {
  const response = await v1ApiClient.get<V1ListResponse<ActivityRecordV1>>(
    `/contacts/${contactId}/activities`,
  );
  return response.data;
};
