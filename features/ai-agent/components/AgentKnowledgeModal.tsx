"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { AIAgent, KnowledgeSource } from "../ai-agent.api";
import { KnowledgeAccessSelector } from "./KnowledgeAccessSelector";

export interface AgentKnowledgeModalProps {
  isOpen: boolean;
  editingSource: KnowledgeSource | null;
  sourceType: "text" | "faq";
  title: string;
  content: string;
  question: string;
  answer: string;
  accessMode: "all_agents" | "selected_agents";
  assignedAgentIds: string[];
  agents: AIAgent[];
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onQuestionChange: (val: string) => void;
  onAnswerChange: (val: string) => void;
  onAccessModeChange: (mode: "all_agents" | "selected_agents") => void;
  onAssignedAgentIdsChange: (ids: string[]) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AgentKnowledgeModal: React.FC<AgentKnowledgeModalProps> = ({
  isOpen,
  editingSource,
  sourceType,
  title,
  content,
  question,
  answer,
  accessMode,
  assignedAgentIds,
  agents,
  onTitleChange,
  onContentChange,
  onQuestionChange,
  onAnswerChange,
  onAccessModeChange,
  onAssignedAgentIdsChange,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={onSave} className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold">{editingSource ? "Edit Knowledge Source" : "Add Knowledge Source"}</h3>
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold">Source Title</label>
            <Input value={title} onChange={(e) => onTitleChange(e.target.value)} required />
          </div>
          {sourceType === "text" ? (
            <div className="space-y-1">
              <label className="font-bold">Content</label>
              <Textarea rows={4} value={content} onChange={(e) => onContentChange(e.target.value)} required />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="font-bold">Question</label>
                <Input value={question} onChange={(e) => onQuestionChange(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Answer</label>
                <Textarea rows={3} value={answer} onChange={(e) => onAnswerChange(e.target.value)} required />
              </div>
            </>
          )}

          {/* Agent Access Control Selector */}
          <div className="pt-3 border-t border-border">
            <KnowledgeAccessSelector
              accessMode={accessMode}
              assignedAgentIds={assignedAgentIds}
              agents={agents}
              onChangeAccessMode={onAccessModeChange}
              onChangeAssignedAgents={onAssignedAgentIdsChange}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Source
          </Button>
        </div>
      </form>
    </div>
  );
};

