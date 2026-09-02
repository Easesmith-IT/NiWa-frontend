import React from "react";
import { FlowConditionBuilder } from "../../crm/flows/components/FlowConditionBuilder";
import type { FlowCondition } from "../../crm/flows/flow.types";
import type { AutomationConditionRecord } from "../automation.types";

export interface AutomationConditionEditorProps {
  conditions: AutomationConditionRecord[];
  onAddCondition: () => void;
  onUpdateSource: (index: number, source: string) => void;
  onUpdateOperator: (index: number, operator: AutomationConditionRecord["operator"]) => void;
  onUpdateValue: (index: number, value: string) => void;
  onChangeConditions?: (conditions: AutomationConditionRecord[]) => void;
}

export const AutomationConditionEditor: React.FC<AutomationConditionEditorProps> = ({
  conditions,
  onChangeConditions,
  onAddCondition,
  onUpdateSource,
  onUpdateOperator,
  onUpdateValue,
}) => {
  // Convert AutomationConditionRecord to FlowCondition shape for FlowConditionBuilder
  const flowConditions: FlowCondition[] = conditions.map((c) => ({
    source: c.source,
    operator: (c.operator === "equals" ? "=" : c.operator === "not_equals" ? "!=" : c.operator) as any,
    value: c.value,
    logic: "AND",
  }));

  const handleFlowConditionsChange = (next: FlowCondition[]) => {
    if (onChangeConditions) {
      onChangeConditions(
        next.map((nc) => ({
          source: nc.source,
          operator: (nc.operator === "=" ? "equals" : nc.operator === "!=" ? "not_equals" : nc.operator) as any,
          value: String(nc.value ?? ""),
        })),
      );
    } else {
      // Fallback for legacy handlers
      if (next.length > conditions.length) {
        onAddCondition();
      }
      next.forEach((nc, idx) => {
        if (conditions[idx]) {
          if (conditions[idx].source !== nc.source) onUpdateSource(idx, nc.source);
          const legacyOp = (nc.operator === "=" ? "equals" : nc.operator === "!=" ? "not_equals" : nc.operator) as any;
          if (conditions[idx].operator !== legacyOp) onUpdateOperator(idx, legacyOp);
          if (conditions[idx].value !== String(nc.value ?? "")) onUpdateValue(idx, String(nc.value ?? ""));
        }
      });
    }
  };

  return (
    <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
      <FlowConditionBuilder
        conditions={flowConditions}
        onChange={handleFlowConditionsChange}
      />
    </div>
  );
};
