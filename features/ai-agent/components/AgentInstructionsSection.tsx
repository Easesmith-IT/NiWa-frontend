"use client";

import React from "react";
import { ChevronDown, ChevronRight, FileText, RotateCcw, Shield } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { AgentInstructionsSectionProps } from "../ai-agent.types";

export const AgentInstructionsSection: React.FC<AgentInstructionsSectionProps> = ({
  currentData,
  showAdvancedInstructions,
  onUpdateField,
  onResetToTemplateDefaults,
  onToggleShowAdvancedInstructions,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            3. Custom Agent Instructions
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add specific instructions for how this agent should converse. Platform safety & grounding directives remain active automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetToTemplateDefaults}
          className="gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Template Defaults
        </Button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-foreground">Agent Instructions</span>
          <span className="text-muted-foreground font-mono">
            {(currentData.agentInstructions || "").length} / 4000
          </span>
        </div>
        <Textarea
          rows={6}
          maxLength={4000}
          value={currentData.agentInstructions || ""}
          onChange={(e) => onUpdateField("agentInstructions", e.target.value)}
          placeholder="Enter workspace-level agent instructions..."
          className="font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Advanced Collapsed Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onToggleShowAdvancedInstructions}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvancedInstructions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Advanced Instructions & System Prompt Override
        </button>

        {showAdvancedInstructions && (
          <div className="mt-3 p-4 rounded-lg border border-border bg-muted/20 space-y-3 text-xs">
            <p className="text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-1.5 text-amber-500" />
              Platform safety directives and grounding rules cannot be modified or overridden.
            </p>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Legacy System Prompt Extra Directive</label>
              <Textarea
                rows={3}
                value={currentData.systemPrompt || ""}
                onChange={(e) => onUpdateField("systemPrompt", e.target.value)}
                placeholder="Additional prompt rules appended into system prompt..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

