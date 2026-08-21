"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AgentActivityTabProps } from "../ai-agent.types";
import { AIActivityLog } from "../ai-agent.api";

export const AgentActivityTab: React.FC<AgentActivityTabProps> = ({ logs }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent AI Activity Logs
        </h3>
        <div className="divide-y divide-border">
          {logs.map((log: AIActivityLog) => (
            <div key={log._id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-foreground">
                  {log.customerPhoneNumber || "Customer"}
                </span>
                <span className="text-muted-foreground ml-2">Reason: {log.reason}</span>
              </div>
              <span
                className={cn(
                  "font-bold px-2 py-0.5 rounded",
                  log.processingState === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {log.processingState}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
