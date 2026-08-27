import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  getInboxThreadDetail,
  listInboxThreads,
  syncInboxThreadHistory,
  updateInboxThreadState,
} from "./inbox.api";
import { mapInboxThreadDetail, mapInboxThreadRecord } from "./inbox.mappers";

export const useInboxThreadsQuery = (params: {
  filter: "all" | "archived" | "awaiting_reply" | "starred" | "unread";
  search: string;
}) =>
  useQuery({
    refetchInterval: 5000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryKey: [...queryKeys.inbox, params.filter, params.search],
    queryFn: async () => {
      const result = await listInboxThreads(params);
      return {
        ...result,
        data: result.data.map(mapInboxThreadRecord),
      };
    },
  });

export const useInboxThreadDetailQuery = (
  conversationId: string | null,
  params?: { cursor?: string | null; messageLimit?: number },
) =>
  useQuery({
    enabled: Boolean(conversationId),
    refetchInterval: 5000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryKey: [...queryKeys.inboxThread, conversationId, params?.cursor ?? null, params?.messageLimit ?? null],
    queryFn: async () => {
      const result = await getInboxThreadDetail(conversationId as string, params);
      return {
        ...result,
        data: mapInboxThreadDetail(result.data),
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
    }) => updateInboxThreadState(conversationId, action),
    onMutate: async (variables) => {
      if (variables.action === "read") {
        queryClient.setQueriesData<{ data?: Array<{ conversation?: { _id: string; unreadCount: number } }> }>(
          { queryKey: queryKeys.inbox },
          (oldData) => {
            if (!oldData || !Array.isArray(oldData.data)) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((item) =>
                item?.conversation?._id === variables.conversationId
                  ? { ...item, conversation: { ...item.conversation, unreadCount: 0 } }
                  : item,
              ),
            };
          },
        );
      }
    },
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inbox });
      if (variables.action !== "read") {
        await queryClient.invalidateQueries({
          queryKey: [...queryKeys.inboxThread, variables.conversationId],
        });
      }
    },
  });
};

export const useSyncInboxThreadHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => syncInboxThreadHistory(conversationId),
    onSuccess: async (_result, conversationId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.inboxThread, conversationId],
        }),
      ]);
    },
  });
};

