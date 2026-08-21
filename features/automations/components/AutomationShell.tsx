import React from "react";
import type { useAutomationOrchestration } from "../hooks/useAutomationOrchestration";
import { AutomationCreateCard } from "./AutomationCreateCard";
import { AutomationHeader } from "./AutomationHeader";
import { AutomationRegistryCard } from "./AutomationRegistryCard";

export interface AutomationShellProps {
  orchestration: ReturnType<typeof useAutomationOrchestration>;
}

export const AutomationShell: React.FC<AutomationShellProps> = ({ orchestration }) => {
  const {
    statusFilter,
    setStatusFilter,
    name,
    setName,
    description,
    setDescription,
    triggerType,
    setTriggerType,
    messageTypeFilter,
    setMessageTypeFilter,
    conditions,
    steps,
    testContactId,
    setTestContactId,
    createAutomationMutation,
    testAutomationMutation,
    automations,
    handleAddCondition,
    handleUpdateConditionSource,
    handleUpdateConditionOperator,
    handleUpdateConditionValue,
    handleAddStep,
    handleUpdateStepType,
    handleUpdateStepConfig,
    handleCreateAutomation,
    handleActivateAutomation,
    handlePauseAutomation,
    handleArchiveAutomation,
    handleRunTest,
  } = orchestration;

  return (
    <div className="space-y-4">
      <AutomationHeader />

      <section className="grid gap-4 lg:grid-cols-[430px_minmax(0,1fr)]">
        <AutomationCreateCard
          conditions={conditions}
          description={description}
          isCreating={createAutomationMutation.isPending}
          messageTypeFilter={messageTypeFilter}
          name={name}
          onAddCondition={handleAddCondition}
          onAddStep={handleAddStep}
          onCreateAutomation={handleCreateAutomation}
          onDescriptionChange={setDescription}
          onMessageTypeFilterChange={setMessageTypeFilter}
          onNameChange={setName}
          onTriggerTypeChange={setTriggerType}
          onUpdateConditionOperator={handleUpdateConditionOperator}
          onUpdateConditionSource={handleUpdateConditionSource}
          onUpdateConditionValue={handleUpdateConditionValue}
          onUpdateStepConfig={handleUpdateStepConfig}
          onUpdateStepType={handleUpdateStepType}
          steps={steps}
          triggerType={triggerType}
        />

        <AutomationRegistryCard
          automations={automations}
          isTesting={testAutomationMutation.isPending}
          onActivateAutomation={handleActivateAutomation}
          onArchiveAutomation={handleArchiveAutomation}
          onPauseAutomation={handlePauseAutomation}
          onRunTest={handleRunTest}
          onStatusFilterChange={setStatusFilter}
          onTestContactIdChange={setTestContactId}
          statusFilter={statusFilter}
          testContactId={testContactId}
        />
      </section>
    </div>
  );
};
