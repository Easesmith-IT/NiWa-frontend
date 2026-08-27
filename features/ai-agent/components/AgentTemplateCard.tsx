"use client";

import React from "react";
import {
  Briefcase,
  Building,
  Calendar,
  Compass,
  Headphones,
  ShoppingBag,
  Sliders,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { AgentTemplatePreset } from "../ai-agent.api";

interface AgentTemplateCardProps {
  template: AgentTemplatePreset;
  isActive: boolean;
  onSelect: (templateId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Building,
  Compass,
  Stethoscope,
  Headphones,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Sliders,
};

export const AgentTemplateCard: React.FC<AgentTemplateCardProps> = ({
  template,
  isActive,
  onSelect,
}) => {
  const IconComponent = ICON_MAP[template.icon] || Sliders;
  const p = template.preset;

  return (
    <div
      onClick={() => onSelect(template.id)}
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer ${
        isActive
          ? "border-blue-600 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 hover:shadow-sm"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isActive
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-slate-700"
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {template.name}
              </h3>
              <span className="inline-block text-xs text-slate-500 dark:text-slate-400 capitalize">
                {template.category?.replace("_", " ") || "custom"}
              </span>
            </div>
          </div>
          {isActive && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Active
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Compact Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 text-[11px] mb-4">
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium">
            Scope: <span className="capitalize">{p.scopeLevel || "focused"}</span>
          </span>
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium">
            Autonomy: <span className="capitalize">{p.autonomyLevel?.replace("_", " ") || "assist"}</span>
          </span>
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium">
            Knowledge: <span className="capitalize">{p.knowledgePolicy?.replace("_", " ") || "business"}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(template.id);
        }}
        className={`w-full rounded-lg py-2 px-3 text-xs font-semibold transition-colors ${
          isActive
            ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500"
            : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        {isActive ? "Configured" : "Use Template"}
      </button>
    </div>
  );
};

