import { useQuery } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { listConversationsV1 } from "./conversation.api";
import { mapConversationRecordV1 } from "./conversation.mappers";

export const useConversationsV1Query = () =>
  useQuery({
    queryKey: v1QueryKeys.conversations,
    queryFn: async () => {
      const result = await listConversationsV1();
      return {
        ...result,
        data: result.data.map(mapConversationRecordV1),
      };
    },
  });
