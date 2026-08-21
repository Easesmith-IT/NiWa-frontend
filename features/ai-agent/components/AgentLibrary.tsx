"use client";

import React, { useState } from "react";
import { AgentTemplatePreset } from "../ai-agent.api";
import { AgentTemplateCard } from "./AgentTemplateCard";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface AgentLibraryProps {
  templates: AgentTemplatePreset[];
  activeTemplateId: string;
  onApplyTemplate: (templateId: string) => void;
  isApplying: boolean;
}

export const AgentLibrary: React.FC<AgentLibraryProps> = ({
  templates,
  activeTemplateId,
  onApplyTemplate,
  isApplying,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [confirmTemplateId, setConfirmTemplateId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "business", label: "Business" },
    { id: "real_estate", label: "Real Estate" },
    { id: "travel", label: "Travel" },
    { id: "healthcare", label: "Healthcare" },
    { id: "support", label: "Support" },
    { id: "sales", label: "Sales" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "custom", label: "Custom" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const pendingTemplate = templates.find((t) => t.id === confirmTemplateId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Enterprise Agent Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a pre-configured template to configure role, scope boundaries, autonomy level, and knowledge policy.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => (
          <AgentTemplateCard
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            onSelect={(tId) => setConfirmTemplateId(tId)}
          />
        ))}
      </div>

      {/* Template Apply Confirmation Modal */}
      {confirmTemplateId && pendingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Apply &quot;{pendingTemplate.name}&quot; Template?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Applying this template will update the agent identity, role, scope level, autonomy, knowledge policy, capabilities, and primary objective.
            </p>

            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 mb-6">
              <strong>Safe Guarantee:</strong> Your existing Workspace Knowledge Base, message history, conversation memory, and business name will remain completely untouched.
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmTemplateId(null)}
                disabled={isApplying}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onApplyTemplate(confirmTemplateId);
                  setConfirmTemplateId(null);
                }}
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply Template"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

