"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { AgentHandoffSectionProps } from "../ai-agent.types";
import { BusinessAISettings, HumanHandoffTriggers } from "../ai-agent.api";

export const AgentHandoffSection: React.FC<AgentHandoffSectionProps> = ({
  currentData,
  onUpdateField,
  onUpdateHandoffTrigger,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        6. Safety & Human Handoff Triggers
      </h3>

      {/* Unknown Answer Behavior */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">
          When this AI doesn't have enough information:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: "ask_customer",
              label: "Ask customer for missing info",
              desc: "Inquire politely for missing facts",
            },
            {
              value: "explain_unavailable",
              label: "Explain info unavailable",
              desc: "State that information is not available",
            },
            {
              value: "safe_response",
              label: "Send fallback message",
              desc: "Respond with configured fallback message",
            },
            {
              value: "handoff",
              label: "Hand over to human",
              desc: "Transfer conversation to human team",
            },
            {
              value: "no_response",
              label: "Do not respond",
              desc: "Remain silent without auto-reply",
            },
          ].map((opt) => {
            const isSelected = currentData.unknownAnswerBehavior === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onUpdateField(
                    "unknownAnswerBehavior",
                    opt.value as BusinessAISettings["unknownAnswerBehavior"]
                  )
                }
                className={cn(
                  "flex flex-col text-left p-3 rounded-lg border text-xs space-y-1 transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold shadow-sm"
                    : "border-border bg-card hover:bg-accent/40"
                )}
              >
                <span className="font-bold text-foreground">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {currentData.unknownAnswerBehavior === "safe_response" && (
          <div className="pt-2 space-y-1.5">
            <label className="text-xs font-bold text-foreground">Fallback Response Text</label>
            <Textarea
              rows={2}
              value={currentData.fallbackResponse || ""}
              onChange={(e) => onUpdateField("fallbackResponse", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Human Handoff Controls */}
      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground">Human Handoff Master Switch</h4>
            <p className="text-xs text-muted-foreground">
              Automatically transfer conversation to human operator on triggers
            </p>
          </div>
          <button
            onClick={() => onUpdateField("humanHandoffEnabled", !currentData.humanHandoffEnabled)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              currentData.humanHandoffEnabled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                currentData.humanHandoffEnabled ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {currentData.humanHandoffEnabled && (
          <div className="space-y-3 pt-1">
            <label className="text-xs font-bold text-foreground">Configurable Handoff Triggers</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: "explicitHumanRequest",
                  label: "Customer explicitly asks for human",
                  desc: "e.g. 'talk to agent', 'human please'",
                },
                {
                  key: "unableToAnswer",
                  label: "AI cannot confidently answer",
                  desc: "Query falls below RAG match threshold",
                },
                {
                  key: "dissatisfied",
                  label: "Customer appears dissatisfied",
                  desc: "Negative sentiment or frustration detected",
                },
                {
                  key: "sensitiveRequest",
                  label: "Sensitive / high-risk request",
                  desc: "Payment, legal, or account risk query",
                },
              ].map((trig) => {
                const isChecked = Boolean(
                  currentData.handoffTriggers?.[trig.key as keyof typeof currentData.handoffTriggers]
                );
                return (
                  <label
                    key={trig.key}
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
                        onUpdateHandoffTrigger(
                          trig.key as keyof HumanHandoffTriggers,
                          e.target.checked
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-foreground block">{trig.label}</span>
                      <span className="text-muted-foreground text-[11px] leading-tight block">
                        {trig.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">Handoff Message</label>
              <Input
                value={currentData.handoffMessage || ""}
                onChange={(e) => onUpdateField("handoffMessage", e.target.value)}
                placeholder="e.g. I'll connect you with a team member who can help you further."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
