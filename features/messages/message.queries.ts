import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { listMessages, sendTextMessage } from "./message.api";
import { mapMessageRecord } from "./message.mappers";

export const useMessagesQuery = () =>
  useQuery({
    queryKey: queryKeys.messages,
    queryFn: async () => {
      const result = await listMessages();
      return {
        ...result,
        data: result.data.map(mapMessageRecord),
      };
    },
  });

export const useSendTextMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendTextMessage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.messages }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};
