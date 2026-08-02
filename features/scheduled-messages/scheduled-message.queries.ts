import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  createScheduledMessageV1,
  listScheduledMessagesV1,
  patchScheduledMessageV1,
  setScheduledMessageLifecycleV1,
} from "./scheduled-message.api";

export const useScheduledMessagesV1Query = (params?: {
  contactId?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: [...v1QueryKeys.scheduledMessages, params?.contactId ?? "all", params?.status ?? "all"],
    queryFn: () => listScheduledMessagesV1(params),
  });

const invalidateScheduledSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.scheduledMessages }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
  ]);
};

export const useCreateScheduledMessageV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduledMessageV1,
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};

export const usePatchScheduledMessageV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      scheduledMessageId,
    }: {
      payload: Parameters<typeof patchScheduledMessageV1>[1];
      scheduledMessageId: string;
    }) => patchScheduledMessageV1(scheduledMessageId, payload),
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};

export const useScheduledMessageLifecycleV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      scheduledMessageId,
    }: {
      action: "cancel" | "pause" | "resume" | "retry";
      scheduledMessageId: string;
    }) => setScheduledMessageLifecycleV1(scheduledMessageId, action),
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};
