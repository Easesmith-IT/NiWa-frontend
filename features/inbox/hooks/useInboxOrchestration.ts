import { useEffect } from "react";
import { useInboxThreadOrchestration } from "./useInboxThreadOrchestration";
import { useInboxContactSidebarOrchestration } from "./useInboxContactSidebarOrchestration";
import { useInboxComposerOrchestration } from "./useInboxComposerOrchestration";

export function useInboxOrchestration() {
  const composer = useInboxComposerOrchestration({
    detail: null, // Initial pass for composer state
    activeConversationId: null,
  });

  const thread = useInboxThreadOrchestration({
    optimisticMessages: composer.optimisticMessages,
    setComposerFeedback: composer.setComposerFeedback,
  });

  const sidebar = useInboxContactSidebarOrchestration({
    detail: thread.detail,
    activeConversationId: thread.activeConversationId,
    setComposerFeedback: composer.setComposerFeedback,
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
