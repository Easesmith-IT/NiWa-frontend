"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { AgentIdentitySectionProps } from "../ai-agent.types";

export const AgentIdentitySection: React.FC<AgentIdentitySectionProps> = ({
  currentData,
  onUpdateField,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        1. Identity & Organization Context
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Agent Name</label>
          <Input
            value={currentData.agentName || ""}
            onChange={(e) => onUpdateField("agentName", e.target.value)}
            placeholder="e.g. AI Senior Business Consultant"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Agent Role</label>
          <Input
            value={currentData.agentRole || ""}
            onChange={(e) => onUpdateField("agentRole", e.target.value)}
            placeholder="e.g. Senior Business Consultant"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-foreground">Organization / Business Name</label>
          <Input
            value={currentData.businessName || ""}
            onChange={(e) => onUpdateField("businessName", e.target.value)}
            placeholder="e.g. Easesmith"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-foreground">Agent Purpose</label>
          <Textarea
            rows={2}
            value={currentData.agentPurpose || ""}
            onChange={(e) => onUpdateField("agentPurpose", e.target.value)}
            placeholder="Describe what this AI employee is designed to achieve..."
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-foreground">Organization Description</label>
          <Textarea
            rows={2}
            value={currentData.businessDescription || ""}
            onChange={(e) => onUpdateField("businessDescription", e.target.value)}
            placeholder="Brief description of products, services, or organization background..."
          />
        </div>
      </div>
    </div>
  );
};

