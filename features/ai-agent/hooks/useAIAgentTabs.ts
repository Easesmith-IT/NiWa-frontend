import { useEffect, useMemo, useState } from "react";
import { AIAgent } from "../ai-agent.api";

export type AIAgentTab = "agents" | "settings" | "knowledge" | "playground" | "activity";

export function useAIAgentTabs(agents: AIAgent[]) {
  const [activeTab, setActiveTab] = useState<AIAgentTab>("agents");
  const [activeEditingAgentId, setActiveEditingAgentId] = useState<string>("");

  // Active agent instance resolution for persona editing
  const activeAgent = useMemo(() => {
    if (activeEditingAgentId) {
      const found = agents.find((a) => a._id === activeEditingAgentId);
      if (found) return found;
    }
    return agents.find((a) => a.isDefault) || agents[0];
  }, [agents, activeEditingAgentId]);

  // Keep activeEditingAgentId set to default if uninitialized
  useEffect(() => {
    if (activeAgent && !activeEditingAgentId) {
      setActiveEditingAgentId(activeAgent._id);
    }
  }, [activeAgent, activeEditingAgentId]);

  return {
    activeTab,
    setActiveTab,
    activeEditingAgentId,
    setActiveEditingAgentId,
    activeAgent,
  };
}
