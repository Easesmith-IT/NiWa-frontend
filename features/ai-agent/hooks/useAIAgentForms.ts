import { useEffect, useMemo, useState } from "react";
import {
  AIAgent,
  BusinessAISettings,
  AgentTemplatePreset,
  HumanHandoffTriggers,
  MemoryFieldDefinition,
} from "../ai-agent.api";
import { useUpdateAISettingsMutation, useUpdateAgentMutation } from "../ai-agent.queries";

interface UseAIAgentFormsProps {
  activeAgent: AIAgent | undefined;
  serverSettings: BusinessAISettings | undefined;
  templates: AgentTemplatePreset[];
  updateSettingsMutation: ReturnType<typeof useUpdateAISettingsMutation>;
  updateAgentMutation: ReturnType<typeof useUpdateAgentMutation>;
}

export function useAIAgentForms({
  activeAgent,
  serverSettings,
  templates,
  updateSettingsMutation,
  updateAgentMutation,
}: UseAIAgentFormsProps) {
  const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessAISettings>>({});

  // Template Overwrite Modal state
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Memory Field Modal state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [editingMemoryKey, setEditingMemoryKey] = useState<string | null>(null);
  const [memoryFieldName, setMemoryFieldName] = useState("");
  const [memoryFieldDesc, setMemoryFieldDesc] = useState("");
  const [memoryFieldType, setMemoryFieldType] = useState<"string" | "number" | "boolean" | "string_array">("string");
  const [memoryFieldError, setMemoryFieldError] = useState<string | null>(null);

  // Collapsed sections state
  const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(false);
  const [showAdvancedMemory, setShowAdvancedMemory] = useState(false);

  // Reset form overrides when switching active agent
  useEffect(() => {
    setFormData({});
  }, [activeAgent?._id]);

  const currentData: BusinessAISettings = useMemo(() => {
    const base = activeAgent
      ? {
          ...serverSettings,
          ...activeAgent,
          agentName: activeAgent.agentName || activeAgent.name,
        }
      : serverSettings || ({} as BusinessAISettings);

    return {
      ...(serverSettings || ({} as BusinessAISettings)),
      ...base,
      capabilities: Array.isArray(base.capabilities) ? base.capabilities : serverSettings?.capabilities || [],
      behavior: {
        diagnoseBeforeRecommending: base.behavior?.diagnoseBeforeRecommending ?? true,
        challengeAssumptions: base.behavior?.challengeAssumptions ?? true,
        explainReasoning: base.behavior?.explainReasoning ?? true,
        preferActionableAdvice: base.behavior?.preferActionableAdvice ?? true,
        useNumbersWhenUseful: base.behavior?.useNumbersWhenUseful ?? true,
        avoidGenericRecommendations: base.behavior?.avoidGenericRecommendations ?? true,
        ...(formData.behavior || {}),
      },
      handoffTriggers: {
        ...({
          explicitHumanRequest: true,
          unableToAnswer: true,
          dissatisfied: true,
          sensitiveRequest: false,
        } as HumanHandoffTriggers),
        ...(serverSettings?.handoffTriggers || {}),
        ...(base.handoffTriggers || {}),
        ...(formData.handoffTriggers || {}),
      },
      ...formData,
    };
  }, [activeAgent, serverSettings, formData]);

  const isDirty = useMemo(() => {
    return Object.keys(formData).length > 0;
  }, [formData]);

  const handleUpdateField = <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateBehavior = (key: keyof BusinessAISettings["behavior"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      behavior: {
        ...(currentData.behavior || {}),
        [key]: value,
      },
    }));
  };

  const handleUpdateHandoffTrigger = (key: keyof BusinessAISettings["handoffTriggers"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      handoffTriggers: {
        ...(currentData.handoffTriggers || {}),
        [key]: value,
      },
    }));
  };

  const handleDiscardChanges = () => {
    setFormData({});
  };

  const handleSaveSettings = () => {
    if (!activeAgent) return;

    if (formData.enabled !== undefined) {
      updateSettingsMutation.mutate({ enabled: formData.enabled });
    }

    updateAgentMutation.mutate(
      {
        id: activeAgent._id,
        name: currentData.agentName || activeAgent.name,
        agentName: currentData.agentName || activeAgent.name,
        agentRole: currentData.agentRole,
        agentPurpose: currentData.agentPurpose,
        scopeLevel: currentData.scopeLevel,
        autonomyLevel: currentData.autonomyLevel,
        knowledgePolicy: currentData.knowledgePolicy,
        capabilities: currentData.capabilities,
        behavior: currentData.behavior,
        memorySchema: currentData.memorySchema,
        primaryObjective: currentData.primaryObjective,
        templateId: currentData.templateId,
      },
      {
        onSuccess: () => {
          setFormData({});
          setSaveFeedback({ type: "success", message: `AI Agent '${activeAgent.name}' saved successfully.` });
          setTimeout(() => setSaveFeedback(null), 3000);
        },
        onError: (err: Error) => {
          setSaveFeedback({ type: "error", message: `Error saving agent: ${err?.message || "Failed to update"}` });
        },
      }
    );
  };

  const executeApplyTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !activeAgent) return;

    const preset = tpl.preset || {};

    updateAgentMutation.mutate(
      {
        id: activeAgent._id,
        templateId: tpl.id,
        agentRole: preset.agentRole || tpl.name,
        agentPurpose: preset.agentPurpose || tpl.description,
        scopeLevel: preset.scopeLevel,
        autonomyLevel: preset.autonomyLevel,
        knowledgePolicy: preset.knowledgePolicy,
        capabilities: preset.capabilities,
        primaryObjective: preset.primaryObjective,
        memorySchema: preset.memorySchema,
      },
      {
        onSuccess: () => {
          setFormData({});
          setIsTemplateModalOpen(false);
          setPendingTemplateId(null);
          setSaveFeedback({ type: "success", message: `Template '${tpl.name}' applied to ${activeAgent.name}.` });
          setTimeout(() => setSaveFeedback(null), 3000);
        },
        onError: (err: Error) => {
          setIsTemplateModalOpen(false);
          setSaveFeedback({ type: "error", message: `Failed to apply template: ${err?.message}` });
        },
      }
    );
  };

  const handleSelectTemplate = (templateId: string) => {
    if (templateId === "custom") {
      handleUpdateField("templateId", "custom");
      return;
    }

    setPendingTemplateId(templateId);
    if (isDirty || currentData.agentInstructions?.trim()) {
      setIsTemplateModalOpen(true);
    } else {
      executeApplyTemplate(templateId);
    }
  };

  const generateSafeKey = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_");
  };

  const handleOpenAddMemoryModal = () => {
    setEditingMemoryKey(null);
    setMemoryFieldName("");
    setMemoryFieldDesc("");
    setMemoryFieldType("string");
    setMemoryFieldError(null);
    setIsMemoryModalOpen(true);
  };

  const handleOpenEditMemoryModal = (item: MemoryFieldDefinition) => {
    setEditingMemoryKey(item.key);
    setMemoryFieldName(item.key.replace(/_/g, " "));
    setMemoryFieldDesc(item.description || "");
    setMemoryFieldType(item.type);
    setMemoryFieldError(null);
    setIsMemoryModalOpen(true);
  };

  const handleSaveMemoryField = (e: React.FormEvent) => {
    e.preventDefault();
    setMemoryFieldError(null);

    if (!memoryFieldName.trim()) {
      setMemoryFieldError("Field name is required");
      return;
    }

    const key = editingMemoryKey || generateSafeKey(memoryFieldName);
    const existingSchema = currentData.memorySchema || [];

    if (!editingMemoryKey && existingSchema.some((f) => f.key.toLowerCase() === key.toLowerCase())) {
      setMemoryFieldError(`Field key '${key}' already exists.`);
      return;
    }

    const newField: MemoryFieldDefinition = {
      key,
      description: memoryFieldDesc.trim(),
      type: memoryFieldType,
    };

    let updatedSchema: MemoryFieldDefinition[];
    if (editingMemoryKey) {
      updatedSchema = existingSchema.map((f) => (f.key === editingMemoryKey ? newField : f));
    } else {
      updatedSchema = [...existingSchema, newField];
    }

    handleUpdateField("memorySchema", updatedSchema);
    setIsMemoryModalOpen(false);
  };

  const handleDeleteMemoryField = (keyToDelete: string) => {
    const updatedSchema = (currentData.memorySchema || []).filter((f) => f.key !== keyToDelete);
    handleUpdateField("memorySchema", updatedSchema);
  };

  const handleResetToTemplateDefaults = () => {
    if (currentData.templateId) {
      executeApplyTemplate(currentData.templateId);
    }
  };

  return {
    saveFeedback,
    setSaveFeedback,
    formData,
    setFormData,
    pendingTemplateId,
    setPendingTemplateId,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    isMemoryModalOpen,
    setIsMemoryModalOpen,
    editingMemoryKey,
    setEditingMemoryKey,
    memoryFieldName,
    setMemoryFieldName,
    memoryFieldDesc,
    setMemoryFieldDesc,
    memoryFieldType,
    setMemoryFieldType,
    memoryFieldError,
    setMemoryFieldError,
    showAdvancedInstructions,
    setShowAdvancedInstructions,
    showAdvancedMemory,
    setShowAdvancedMemory,
    currentData,
    isDirty,
    handleUpdateField,
    handleUpdateBehavior,
    handleUpdateHandoffTrigger,
    handleDiscardChanges,
    handleSaveSettings,
    handleSelectTemplate,
    executeApplyTemplate,
    handleOpenAddMemoryModal,
    handleOpenEditMemoryModal,
    handleSaveMemoryField,
    handleDeleteMemoryField,
    handleResetToTemplateDefaults,
    generateSafeKey,
  };
}
