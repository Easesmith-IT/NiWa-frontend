import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { listConversations } from "./conversation.api";
import { mapConversationRecord } from "./conversation.mappers";

export const useConversationsListQuery = () =>
  useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const result = await listConversations();
      return {
        ...result,
        data: result.data.map(mapConversationRecord),
      };
    },
  });
