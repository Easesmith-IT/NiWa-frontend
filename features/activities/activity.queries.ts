import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { listActivitiesV1 } from "./activity.api";
import { mapActivityRecord } from "./activity.mappers";

export const useContactActivitiesV1Query = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...queryKeys.activities, contactId],
    queryFn: async () => {
      const result = await listActivitiesV1(contactId);
      return {
        ...result,
        data: result.data.map(mapActivityRecord),
      };
    },
  });
