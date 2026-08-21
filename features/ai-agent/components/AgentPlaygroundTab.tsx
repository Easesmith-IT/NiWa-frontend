"use client";

import React from "react";
import { Play, RefreshCw, Terminal } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { AgentPlaygroundTabProps } from "../ai-agent.types";
import { AgentDecisionTrace } from "../../../app/(app)/ai-agent/components/AgentDecisionTrace";

export const AgentPlaygroundTab: React.FC<AgentPlaygroundTabProps> = ({
  testQuery,
  isTesting,
  testResult,
  onQueryChange,
  onRunTest,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Testing Playground
        </h3>
        <form onSubmit={onRunTest} className="space-y-3">
          <Textarea
            rows={3}
            value={testQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type a test customer message (e.g. 'Business ka apko kya knowledge hai')..."
          />
          <Button type="submit" disabled={isTesting} className="gap-2">
            {isTesting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Test AI Response
          </Button>
        </form>

        {testResult && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
              <div className="font-bold text-primary flex items-center justify-between">
                <span>AI Output Response:</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {testResult.model}
                </span>
              </div>
              <p className="text-sm font-medium whitespace-pre-wrap text-foreground leading-relaxed">
                {testResult.response}
              </p>
            </div>

            {/* System Decision Trace */}
            <AgentDecisionTrace trace={testResult.decisionTrace} />
          </div>
        )}
      </div>
    </div>
  );
};
