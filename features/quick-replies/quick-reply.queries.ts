import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { createQuickReplyV1, listQuickRepliesV1, patchQuickReplyV1 } from "./quick-reply.api";

export const useQuickRepliesV1Query = () =>
  useQuery({
    queryKey: v1QueryKeys.quickReplies,
    queryFn: listQuickRepliesV1,
  });

export const useCreateQuickReplyV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuickReplyV1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: v1QueryKeys.quickReplies });
    },
  });
};

export const usePatchQuickReplyV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quickReplyId, payload }: { payload: Parameters<typeof patchQuickReplyV1>[1]; quickReplyId: string }) =>
      patchQuickReplyV1(quickReplyId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: v1QueryKeys.quickReplies });
    },
  });
};
