import { useEffect, useState } from "react";
import type { ConversationRecord } from "../../../lib/api/types";

export interface UseConversationSelectionProps {
  conversations: ConversationRecord[];
}

export const useConversationSelection = ({ conversations }: UseConversationSelectionProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  return {
    selectedConversationId,
    setSelectedConversationId,
  };
};
