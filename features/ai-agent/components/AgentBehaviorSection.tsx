"use client";

import React from "react";
import { Sliders } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AgentBehaviorSectionProps } from "../ai-agent.types";
import { BusinessAISettings } from "../ai-agent.api";

export const AgentBehaviorSection: React.FC<AgentBehaviorSectionProps> = ({
  currentData,
  onUpdateField,
  onUpdateBehavior,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
        <Sliders className="h-5 w-5 text-primary" />
        2. Conversation Style & Diagnostic Behavior
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Conversation Style</label>
          <select
            value={currentData.conversationStyle || "consultative"}
            onChange={(e) =>
              onUpdateField("conversationStyle", e.target.value as BusinessAISettings["conversationStyle"])
            }
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="direct">Direct</option>
            <option value="consultative">Consultative</option>
            <option value="supportive">Supportive</option>
            <option value="sales_oriented">Sales-oriented</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Response Tone</label>
          <select
            value={currentData.responseStyle || "professional"}
            onChange={(e) =>
              onUpdateField("responseStyle", e.target.value as BusinessAISettings["responseStyle"])
            }
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Response Length</label>
          <select
            value={currentData.responseLength || "short"}
            onChange={(e) =>
              onUpdateField("responseLength", e.target.value as BusinessAISettings["responseLength"])
            }
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="short">Short (1-2 sentences)</option>
            <option value="balanced">Balanced (2-4 sentences)</option>
            <option value="detailed">Detailed (Comprehensive)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Questions Per Reply</label>
          <select
            value={currentData.questionsPerReply || 1}
            onChange={(e) => onUpdateField("questionsPerReply", Number(e.target.value))}
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={1}>1 Question Max</option>
            <option value={2}>2 Questions Max</option>
            <option value={3}>3 Questions Max</option>
          </select>
        </div>
      </div>

      {/* Behavior Toggles Grid */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-bold text-foreground">Diagnostic Behavior Controls</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              key: "diagnoseBeforeRecommending",
              label: "Diagnose before recommending",
              desc: "Ask diagnostic questions before prescribing solutions",
            },
            {
              key: "challengeAssumptions",
              label: "Challenge assumptions",
              desc: "Respectfully question unsupported customer assumptions",
            },
            {
              key: "explainReasoning",
              label: "Explain reasoning",
              desc: "Briefly explain why recommendations make sense",
            },
            {
              key: "preferActionableAdvice",
              label: "Prefer actionable advice",
              desc: "Prioritize direct, high-impact next steps",
            },
            {
              key: "useNumbersWhenUseful",
              label: "Use numbers when useful",
              desc: "Incorporate metrics & data points into diagnosis",
            },
            {
              key: "avoidGenericRecommendations",
              label: "Avoid generic recommendations",
              desc: "Refuse cliché advice like 'do paid ads' prematurely",
            },
          ].map((item) => {
            const isChecked = Boolean(
              currentData.behavior?.[item.key as keyof typeof currentData.behavior]
            );
            return (
              <label
                key={item.key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs",
                  isChecked
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:bg-accent/40"
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    onUpdateBehavior(
                      item.key as keyof BusinessAISettings["behavior"],
                      e.target.checked
                    )
                  }
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-bold text-foreground block">{item.label}</span>
                  <span className="text-muted-foreground text-[11px] leading-tight block">
                    {item.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

