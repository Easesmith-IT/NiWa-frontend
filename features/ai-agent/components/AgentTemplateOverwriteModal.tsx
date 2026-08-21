"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";

export interface AgentTemplateOverwriteModalProps {
  isOpen: boolean;
  pendingTemplateId: string | null;
  isApplying: boolean;
  onConfirm: (templateId: string) => void;
  onClose: () => void;
}

export const AgentTemplateOverwriteModal: React.FC<AgentTemplateOverwriteModalProps> = ({
  isOpen,
  pendingTemplateId,
  isApplying,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-bold text-foreground">Apply Template Preset?</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Applying this template will replace current agent behavior, diagnostic rules, and recommended memory schema. Organization info and Knowledge Base content will be preserved.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => pendingTemplateId && onConfirm(pendingTemplateId)}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};

