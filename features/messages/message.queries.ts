import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { listMessagesV1, sendTextMessageV1 } from "./message.api";
import { mapMessageRecordV1 } from "./message.mappers";

export const useMessagesV1Query = () =>
  useQuery({
    queryKey: v1QueryKeys.messages,
    queryFn: async () => {
      const result = await listMessagesV1();
      return {
        ...result,
        data: result.data.map(mapMessageRecordV1),
      };
    },
  });

export const useSendTextMessageV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendTextMessageV1,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.messages }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inbox }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};
