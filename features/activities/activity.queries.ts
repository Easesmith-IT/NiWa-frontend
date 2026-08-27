import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { listActivities } from "./activity.api";
import { mapActivityRecord } from "./activity.mappers";

export const useContactActivitiesQuery = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...queryKeys.activities, contactId],
    queryFn: async () => {
      const result = await listActivities(contactId);
      return {
        ...result,
        data: result.data.map(mapActivityRecord),
      };
    },
  });
