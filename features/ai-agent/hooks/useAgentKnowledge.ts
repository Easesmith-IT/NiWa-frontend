import { useState } from "react";
import { KnowledgeSource } from "../ai-agent.api";
import { AccessFilter } from "../../../app/(app)/ai-agent/components/KnowledgeFilters";
import { useCreateKnowledgeSourceMutation, useUpdateKnowledgeSourceMutation } from "../ai-agent.queries";

interface UseAgentKnowledgeProps {
  createKnowledgeMutation: ReturnType<typeof useCreateKnowledgeSourceMutation>;
  updateKnowledgeMutation: ReturnType<typeof useUpdateKnowledgeSourceMutation>;
}

export function useAgentKnowledge({
  createKnowledgeMutation,
  updateKnowledgeMutation,
}: UseAgentKnowledgeProps) {
  const [selectedKnowledgeAgentId, setSelectedKnowledgeAgentId] = useState<string>("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");

  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [sourceType, setSourceType] = useState<"text" | "faq">("text");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceQuestion, setSourceQuestion] = useState("");
  const [sourceAnswer, setSourceAnswer] = useState("");
  const [sourceAccessMode, setSourceAccessMode] = useState<"all_agents" | "selected_agents">("all_agents");
  const [sourceAssignedAgentIds, setSourceAssignedAgentIds] = useState<string[]>([]);

  const handleOpenAddKnowledge = (type: "text" | "faq" = "text") => {
    setEditingSource(null);
    setSourceType(type);
    setSourceTitle("");
    setSourceContent("");
    setSourceQuestion("");
    setSourceAnswer("");
    setSourceAccessMode("all_agents");
    setSourceAssignedAgentIds([]);
    setIsAddKnowledgeOpen(true);
  };

  const handleOpenEditKnowledge = (source: KnowledgeSource) => {
    setEditingSource(source);
    setSourceType(source.type === "faq" ? "faq" : "text");
    setSourceTitle(source.title || "");
    setSourceContent(source.content || "");
    setSourceQuestion(source.question || "");
    setSourceAnswer(source.answer || "");
    setSourceAccessMode(source.accessMode || "all_agents");
    setSourceAssignedAgentIds(source.assignedAgentIds || []);
    setIsAddKnowledgeOpen(true);
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: sourceType === "text" ? sourceTitle : sourceTitle || sourceQuestion,
      content: sourceContent,
      question: sourceQuestion,
      answer: sourceAnswer,
      accessMode: sourceAccessMode,
      assignedAgentIds: sourceAccessMode === "selected_agents" ? sourceAssignedAgentIds : [],
    };

    if (editingSource) {
      updateKnowledgeMutation.mutate(
        { id: editingSource._id, ...payload },
        { onSuccess: () => setIsAddKnowledgeOpen(false) }
      );
    } else {
      createKnowledgeMutation.mutate(
        { type: sourceType, ...payload },
        { onSuccess: () => setIsAddKnowledgeOpen(false) }
      );
    }
  };

  return {
    selectedKnowledgeAgentId,
    setSelectedKnowledgeAgentId,
    accessFilter,
    setAccessFilter,
    isAddKnowledgeOpen,
    setIsAddKnowledgeOpen,
    editingSource,
    setEditingSource,
    sourceType,
    setSourceType,
    sourceTitle,
    setSourceTitle,
    sourceContent,
    setSourceContent,
    sourceQuestion,
    setSourceQuestion,
    sourceAnswer,
    setSourceAnswer,
    sourceAccessMode,
    setSourceAccessMode,
    sourceAssignedAgentIds,
    setSourceAssignedAgentIds,
    handleOpenAddKnowledge,
    handleOpenEditKnowledge,
    handleSaveKnowledge,
  };
}
