import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { createActivity, listActivities, listActivitiesForRecord } from "./activity.api";
import { mapActivityRecord } from "./activity.mappers";

export const useContactActivitiesQuery = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...queryKeys.activities, "contact", contactId],
    queryFn: async () => {
      const result = await listActivities({ contactId });
      return {
        ...result,
        data: result.data ? result.data.map(mapActivityRecord) : [],
      };
    },
  });

export const useRecordActivitiesQuery = (recordType: string, recordId: string, enabled = true) =>
  useQuery({
    enabled: Boolean(enabled && recordType && recordId),
    queryKey: [...queryKeys.activities, "record", recordType, recordId],
    queryFn: async () => {
      const result = await listActivitiesForRecord(recordType, recordId);
      return {
        ...result,
        data: result.data ? result.data.map(mapActivityRecord) : [],
      };
    },
  });

export const useCreateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.activities }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
      ]);
    },
  });
};
