import React from "react";
import { FlowActionBuilder } from "../../crm/flows/components/FlowActionBuilder";
import type { FlowStep } from "../../crm/flows/flow.types";
import type { AutomationStepRecord } from "../automation.types";

export interface AutomationStepEditorProps {
  steps: AutomationStepRecord[];
  onAddStep: () => void;
  onUpdateStepType: (index: number, type: AutomationStepRecord["type"]) => void;
  onUpdateStepConfig: (index: number, config: Record<string, unknown>) => void;
  onChangeSteps?: (steps: AutomationStepRecord[]) => void;
}

export const AutomationStepEditor: React.FC<AutomationStepEditorProps> = ({
  steps,
  onChangeSteps,
}) => {
  const flowSteps: FlowStep[] = steps.map((s) => ({
    type: (s.type === "create_note" ? "create_activity" : s.type) as any,
    config: s.config || {},
  }));

  const handleFlowStepsChange = (next: FlowStep[]) => {
    if (onChangeSteps) {
      onChangeSteps(
        next.map((ns) => ({
          type: (ns.type === "create_activity" ? "create_note" : ns.type) as any,
          config: ns.config || {},
        })),
      );
    }
  };

  return (
    <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
      <FlowActionBuilder
        steps={flowSteps}
        onChange={handleFlowStepsChange}
      />
    </div>
  );
};
