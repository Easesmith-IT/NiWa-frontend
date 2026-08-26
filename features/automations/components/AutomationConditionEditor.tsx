import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { AutomationConditionRecord } from "../automation.types";

export interface AutomationConditionEditorProps {
  conditions: AutomationConditionRecord[];
  onAddCondition: () => void;
  onUpdateSource: (index: number, source: string) => void;
  onUpdateOperator: (index: number, operator: AutomationConditionRecord["operator"]) => void;
  onUpdateValue: (index: number, value: string) => void;
}

export const AutomationConditionEditor: React.FC<AutomationConditionEditorProps> = ({
  conditions,
  onAddCondition,
  onUpdateSource,
  onUpdateOperator,
  onUpdateValue,
}) => {
  return (
    <div className="space-y-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-foreground">Conditions</p>
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={onAddCondition}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </Button>
      </div>
      {conditions.map((condition, index) => (
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]" key={index}>
          <Input
            className="bg-white dark:bg-[#121416]"
            placeholder="Source path"
            value={condition.source}
            onChange={(event) => onUpdateSource(index, event.target.value)}
          />
          <select
            className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#121416]"
            value={condition.operator}
            onChange={(event) =>
              onUpdateOperator(
                index,
                event.target.value as AutomationConditionRecord["operator"],
              )
            }
          >
            <option value="contains">contains</option>
            <option value="equals">equals</option>
            <option value="not_equals">not equals</option>
            <option value="exists">exists</option>
          </select>
          <Input
            className="bg-white dark:bg-[#121416]"
            placeholder="Match value"
            value={condition.value ?? ""}
            onChange={(event) => onUpdateValue(index, event.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
