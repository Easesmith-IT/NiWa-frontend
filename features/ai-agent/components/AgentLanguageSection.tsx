"use client";

import React from "react";
import { Bot } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import { AgentLanguageSectionProps } from "../ai-agent.types";
import { BusinessAISettings } from "../ai-agent.api";

export const AgentLanguageSection: React.FC<AgentLanguageSectionProps> = ({
  currentData,
  onUpdateField,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        4. Language Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Language Mode</label>
          <select
            value={currentData.languageMode || "auto"}
            onChange={(e) =>
              onUpdateField("languageMode", e.target.value as BusinessAISettings["languageMode"])
            }
            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="auto">Auto Detect Customer Language</option>
            <option value="english">English Only</option>
            <option value="hindi">Hindi Only</option>
            <option value="hinglish">Hinglish (Hindi + English)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Preferred Language Default</label>
          <Input
            value={currentData.preferredLanguage || "English"}
            onChange={(e) => onUpdateField("preferredLanguage", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {[
          {
            key: "matchCustomerLanguage",
            label: "Match Customer Language",
            desc: "Mirror customer's language automatically",
          },
          {
            key: "allowHinglish",
            label: "Allow Hinglish",
            desc: "Support Hinglish when customer speaks Hindi/Hinglish",
          },
          {
            key: "preserveTechnicalEnglish",
            label: "Preserve Tech Terms",
            desc: "Keep business & technical English terms intact",
          },
        ].map((item) => {
          const isChecked = Boolean(currentData[item.key as keyof BusinessAISettings]);
          return (
            <label
              key={item.key}
              className={cn(
                "flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors text-xs",
                isChecked ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-accent/40"
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  onUpdateField(item.key as keyof BusinessAISettings, e.target.checked)
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
  );
};
