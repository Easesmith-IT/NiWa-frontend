import { useQuery } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { listActivitiesV1 } from "./activity.api";
import { mapActivityRecordV1 } from "./activity.mappers";

export const useContactActivitiesV1Query = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...v1QueryKeys.activities, contactId],
    queryFn: async () => {
      const result = await listActivitiesV1(contactId);
      return {
        ...result,
        data: result.data.map(mapActivityRecordV1),
      };
    },
  });
