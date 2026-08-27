import { useEffect, useState } from "react";
import { useInboxThreadOrchestration } from "./useInboxThreadOrchestration";
import { useInboxContactSidebarOrchestration } from "./useInboxContactSidebarOrchestration";
import { useInboxComposerOrchestration } from "./useInboxComposerOrchestration";
import type { OptimisticInboxMessage } from "./useInboxState";

export function useInboxOrchestration() {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticInboxMessage[]>([]);
  const [composerFeedback, setComposerFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  const thread = useInboxThreadOrchestration({
    optimisticMessages,
    setComposerFeedback,
  });

  const composer = useInboxComposerOrchestration({
    detail: thread.detail,
    activeConversationId: thread.activeConversationId,
    optimisticMessages,
    setOptimisticMessages,
    composerFeedback,
    setComposerFeedback,
  });

  const sidebar = useInboxContactSidebarOrchestration({
    detail: thread.detail,
    activeConversationId: thread.activeConversationId,
    setComposerFeedback,
  });

  // Re-sync composer options with active thread detail
  const activeConversationId = thread.activeConversationId;
  useEffect(() => {
    sidebar.resetSidebarState();
    composer.resetComposerState();
  }, [activeConversationId]);

  return {
    thread,
    sidebar,
    composer,
  };
}

export { useInboxThreadOrchestration } from "./useInboxThreadOrchestration";
export { useInboxContactSidebarOrchestration } from "./useInboxContactSidebarOrchestration";
export { useInboxComposerOrchestration } from "./useInboxComposerOrchestration";
