import React from "react";
import { Workflow } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { AutomationConditionRecord, AutomationStepRecord } from "../automation.types";
import { AutomationConditionEditor } from "./AutomationConditionEditor";
import { AutomationStepEditor } from "./AutomationStepEditor";

export interface AutomationCreateCardProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  triggerType: "incoming_message" | "manual";
  onTriggerTypeChange: (value: "incoming_message" | "manual") => void;
  messageTypeFilter: string;
  onMessageTypeFilterChange: (value: string) => void;
  conditions: AutomationConditionRecord[];
  onAddCondition: () => void;
  onUpdateConditionSource: (index: number, source: string) => void;
  onUpdateConditionOperator: (index: number, operator: AutomationConditionRecord["operator"]) => void;
  onUpdateConditionValue: (index: number, value: string) => void;
  steps: AutomationStepRecord[];
  onAddStep: () => void;
  onUpdateStepType: (index: number, type: AutomationStepRecord["type"]) => void;
  onUpdateStepConfig: (index: number, config: Record<string, unknown>) => void;
  isCreating: boolean;
  onCreateAutomation: () => void;
}

export const AutomationCreateCard: React.FC<AutomationCreateCardProps> = ({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  triggerType,
  onTriggerTypeChange,
  messageTypeFilter,
  onMessageTypeFilterChange,
  conditions,
  onAddCondition,
  onUpdateConditionSource,
  onUpdateConditionOperator,
  onUpdateConditionValue,
  steps,
  onAddStep,
  onUpdateStepType,
  onUpdateStepConfig,
  isCreating,
  onCreateAutomation,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <Workflow className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <h2 className="text-sm font-semibold text-foreground">Create Automation</h2>
      </div>
      <Input
        placeholder="Automation name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <Textarea
        className="min-h-20 text-xs"
        placeholder="Describe what this automation does..."
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
      <div className="grid gap-2 md:grid-cols-2">
        <select
          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          value={triggerType}
          onChange={(event) => onTriggerTypeChange(event.target.value as "incoming_message" | "manual")}
        >
          <option value="incoming_message">Incoming message</option>
          <option value="manual">Manual</option>
        </select>
        <Input
          placeholder="Message type filter (optional)"
          value={messageTypeFilter}
          onChange={(event) => onMessageTypeFilterChange(event.target.value)}
        />
      </div>

      <AutomationConditionEditor
        conditions={conditions}
        onAddCondition={onAddCondition}
        onUpdateOperator={onUpdateConditionOperator}
        onUpdateSource={onUpdateConditionSource}
        onUpdateValue={onUpdateConditionValue}
      />

      <AutomationStepEditor
        onAddStep={onAddStep}
        onUpdateStepConfig={onUpdateStepConfig}
        onUpdateStepType={onUpdateStepType}
        steps={steps}
      />

      <Button
        className="w-full font-medium"
        disabled={!name.trim() || steps.length === 0 || isCreating}
        onClick={onCreateAutomation}
        type="button"
        variant="primary"
      >
        {isCreating ? "Saving..." : "Create Automation"}
      </Button>
    </Card>
  );
};
