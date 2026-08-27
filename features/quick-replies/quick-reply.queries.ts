import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { createQuickReply, listQuickReplies, patchQuickReply } from "./quick-reply.api";

export const useQuickRepliesQuery = () =>
  useQuery({
    queryKey: queryKeys.quickReplies,
    queryFn: listQuickReplies,
  });

export const useCreateQuickReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuickReply,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies });
    },
  });
};

export const usePatchQuickReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quickReplyId, payload }: { payload: Parameters<typeof patchQuickReply>[1]; quickReplyId: string }) =>
      patchQuickReply(quickReplyId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.quickReplies });
    },
  });
};
