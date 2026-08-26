import { useState } from "react";
import {
  useAutomationLifecycleV1Mutation,
  useAutomationTestV1Mutation,
  useAutomationsQuery,
  useCreateAutomationV1Mutation,
} from "../automation.queries";
import type {
  AutomationConditionRecordV1,
  AutomationStepRecordV1,
} from "../automation.types";

export const newCondition = (): AutomationConditionRecordV1 => ({
  operator: "contains",
  source: "trigger.previewText",
  value: "",
});

export const newStep = (): AutomationStepRecordV1 => ({
  config: { body: "" },
  type: "send_message",
});

export function useAutomationOrchestration() {
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "archived" | "paused">("all");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"incoming_message" | "manual">("incoming_message");
  const [messageTypeFilter, setMessageTypeFilter] = useState("");
  const [conditions, setConditions] = useState<AutomationConditionRecordV1[]>([newCondition()]);
  const [steps, setSteps] = useState<AutomationStepRecordV1[]>([newStep()]);
  const [testContactId, setTestContactId] = useState("");

  const automationsQuery = useAutomationsQuery(statusFilter === "all" ? undefined : { status: statusFilter });
  const createAutomationMutation = useCreateAutomationV1Mutation();
  const lifecycleMutation = useAutomationLifecycleV1Mutation();
  const testAutomationMutation = useAutomationTestV1Mutation();

  const automations = automationsQuery.data?.data ?? [];

  const handleAddCondition = () => {
    setConditions((current) => [...current, newCondition()]);
  };

  const handleUpdateConditionSource = (index: number, source: string) => {
    setConditions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, source } : item)),
    );
  };

  const handleUpdateConditionOperator = (
    index: number,
    operator: AutomationConditionRecordV1["operator"],
  ) => {
    setConditions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, operator } : item)),
    );
  };

  const handleUpdateConditionValue = (index: number, value: string) => {
    setConditions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, value } : item)),
    );
  };

  const handleAddStep = () => {
    setSteps((current) => [...current, newStep()]);
  };

  const handleUpdateStepType = (index: number, type: AutomationStepRecordV1["type"]) => {
    setSteps((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          type,
          config:
            type === "send_message"
              ? { body: "" }
              : type === "create_task"
                ? { title: "", priority: "medium", dueInMinutes: 60 }
                : type === "create_note"
                  ? { content: "", pinned: false }
                  : { delayMinutes: 5 },
        };
      }),
    );
  };

  const handleUpdateStepConfig = (index: number, newConfig: Record<string, unknown>) => {
    setSteps((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, config: newConfig } : item,
      ),
    );
  };

  const handleCreateAutomation = () => {
    if (!name.trim() || steps.length === 0 || createAutomationMutation.isPending) return;

    createAutomationMutation.mutate(
      {
        conditions: conditions
          .filter((item) => item.source.trim())
          .map((item) => ({
            ...item,
            value: item.value ?? undefined,
          })),
        description: description.trim() || undefined,
        name: name.trim(),
        steps,
        trigger: {
          config:
            triggerType === "incoming_message" && messageTypeFilter.trim()
              ? { messageTypes: [messageTypeFilter.trim()] }
              : {},
          type: triggerType,
        },
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setTriggerType("incoming_message");
          setMessageTypeFilter("");
          setConditions([newCondition()]);
          setSteps([newStep()]);
        },
      },
    );
  };

  const handleActivateAutomation = (automationId: string) => {
    lifecycleMutation.mutate({ action: "activate", automationId });
  };

  const handlePauseAutomation = (automationId: string) => {
    lifecycleMutation.mutate({ action: "pause", automationId });
  };

  const handleArchiveAutomation = (automationId: string) => {
    lifecycleMutation.mutate({ action: "archive", automationId });
  };

  const handleRunTest = (automationId: string) => {
    if (!testContactId.trim() || testAutomationMutation.isPending) return;
    testAutomationMutation.mutate({
      automationId,
      payload: {
        contactId: testContactId.trim(),
      },
    });
  };

  return {
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
    setConditions,
    steps,
    setSteps,
    testContactId,
    setTestContactId,
    automationsQuery,
    createAutomationMutation,
    lifecycleMutation,
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
  };
}
