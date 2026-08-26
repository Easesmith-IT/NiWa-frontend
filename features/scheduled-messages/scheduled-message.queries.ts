import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  createScheduledMessage,
  listScheduledMessages,
  patchScheduledMessage,
  setScheduledMessageLifecycle,
} from "./scheduled-message.api";

export const useScheduledMessagesQuery = (params?: {
  contactId?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: [...queryKeys.scheduledMessages, params?.contactId ?? "all", params?.status ?? "all"],
    queryFn: () => listScheduledMessages(params),
  });

const invalidateScheduledSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.scheduledMessages }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
  ]);
};

export const useCreateScheduledMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduledMessage,
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};

export const usePatchScheduledMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      scheduledMessageId,
    }: {
      payload: Parameters<typeof patchScheduledMessage>[1];
      scheduledMessageId: string;
    }) => patchScheduledMessage(scheduledMessageId, payload),
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};

export const useScheduledMessageLifecycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      scheduledMessageId,
    }: {
      action: "cancel" | "pause" | "resume" | "retry";
      scheduledMessageId: string;
    }) => setScheduledMessageLifecycle(scheduledMessageId, action),
    onSuccess: async () => {
      await invalidateScheduledSurfaces(queryClient);
    },
  });
};
