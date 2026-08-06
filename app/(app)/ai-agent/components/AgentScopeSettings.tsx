"use client";

import React from "react";
import { ScopeLevel } from "../../../../features/ai-agent";
import { Shield, Target, Compass, Globe } from "lucide-react";

interface AgentScopeSettingsProps {
  value: ScopeLevel;
  onChange: (val: ScopeLevel) => void;
}

const SCOPE_OPTIONS: Array<{
  id: ScopeLevel;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: "strict",
    title: "Strict",
    description: "Agent handles only tasks directly related to its role and assigned workflows. Unrelated requests are politely redirected.",
    icon: Shield,
  },
  {
    id: "focused",
    title: "Focused",
    description: "Stays primarily within the assigned role while allowing closely related questions that help complete the customer's objective.",
    icon: Target,
  },
  {
    id: "flexible",
    title: "Flexible",
    description: "Role-first assistant that answers broader questions when doing so helps the customer conversation (e.g. Business/Travel consultant).",
    icon: Compass,
  },
  {
    id: "general",
    title: "General",
    description: "Behaves as a general-purpose assistant while retaining organization identity and configured restrictions.",
    icon: Globe,
  },
];

export const AgentScopeSettings: React.FC<AgentScopeSettingsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        How Focused Should This Agent Be? (Scope Level)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCOPE_OPTIONS.map((opt) => {
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
