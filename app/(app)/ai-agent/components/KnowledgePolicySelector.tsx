"use client";

import React from "react";
import { KnowledgePolicy } from "../../../../features/ai-agent";
import { Database, Lock, BookOpen, Sparkles } from "lucide-react";

interface KnowledgePolicySelectorProps {
  value: KnowledgePolicy;
  onChange: (val: KnowledgePolicy) => void;
}

const POLICY_OPTIONS: Array<{
  id: KnowledgePolicy;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: "grounded_only",
    title: "Grounded Only",
    description: "Strict requirement. Factual answers must come exclusively from approved workspace knowledge, memory, or tool execution.",
    icon: Lock,
  },
  {
    id: "grounded_business",
    title: "Business Grounded (Default)",
    description: "Organization-specific facts (prices, inventory, policies) MUST be grounded. General domain concepts are permitted.",
    icon: Database,
  },
  {
    id: "assisted",
    title: "Assisted",
    description: "Workspace knowledge is preferred. General model knowledge supplements reasoning. Recommended for Business Consultants.",
    icon: BookOpen,
  },
  {
    id: "open",
    title: "Open",
    description: "General model knowledge is allowed unless prohibited by restrictions. Still never invents business-specific facts.",
    icon: Sparkles,
  },
];

export const KnowledgePolicySelector: React.FC<KnowledgePolicySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Knowledge Freedom (Knowledge Policy)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {POLICY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex items-start gap-3 rounded-lg border p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-600 dark:ring-blue-500"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  isSelected
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    {opt.title}
                  </h4>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {opt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
