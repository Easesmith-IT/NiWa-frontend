import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  getInboxThreadDetailV1,
  listInboxThreadsV1,
  syncInboxThreadHistoryV1,
  updateInboxThreadStateV1,
} from "./inbox.api";
import { mapInboxThreadDetailV1, mapInboxThreadRecordV1 } from "./inbox.mappers";

export const useInboxThreadsV1Query = (params: {
  filter: "all" | "archived" | "awaiting_reply" | "starred" | "unread";
  search: string;
}) =>
  useQuery({
    refetchInterval: 30000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryKey: [...v1QueryKeys.inbox, params.filter, params.search],
    queryFn: async () => {
      const result = await listInboxThreadsV1(params);
      return {
        ...result,
        data: result.data.map(mapInboxThreadRecordV1),
      };
    },
  });

export const useInboxThreadDetailV1Query = (
  conversationId: string | null,
  params?: { cursor?: string | null; messageLimit?: number },
) =>
  useQuery({
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 30000 : false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryKey: [...v1QueryKeys.inboxThread, conversationId, params?.cursor ?? null, params?.messageLimit ?? null],
    queryFn: async () => {
      const result = await getInboxThreadDetailV1(conversationId as string, params);
      return {
        ...result,
        data: mapInboxThreadDetailV1(result.data),
      };
    },
  });

export const useInboxThreadStateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      conversationId,
    }: {
      action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar";
      conversationId: string;
    }) => updateInboxThreadStateV1(conversationId, action),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inbox }),
        queryClient.invalidateQueries({
          queryKey: [...v1QueryKeys.inboxThread, variables.conversationId],
        }),
      ]);
    },
  });
};

export const useSyncInboxThreadHistoryV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => syncInboxThreadHistoryV1(conversationId),
    onSuccess: async (_result, conversationId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inbox }),
        queryClient.invalidateQueries({
          queryKey: [...v1QueryKeys.inboxThread, conversationId],
        }),
      ]);
    },
  });
};

