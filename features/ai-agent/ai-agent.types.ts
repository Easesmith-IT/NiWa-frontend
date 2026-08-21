import { 
  AIAgent, 
  BusinessAISettings, 
  AgentTemplatePreset, 
  KnowledgeSource, 
  AIActivityLog, 
  MemoryFieldDefinition, 
  HumanHandoffTriggers,
  AITestResponse
} from "./ai-agent.api";

import { AccessFilter } from "../../app/(app)/ai-agent/components/KnowledgeFilters";

// ----------------------------------------------------------------------
// CALLBACK CONTRACTS
// ----------------------------------------------------------------------

export type AgentCreatePayload = {
  name: string;
  templateId: string;
  isDefault?: boolean;
};

export type AgentUpdatePayload = {
  agentId: string;
  data: Partial<AIAgent>;
};

export type KnowledgeSourceCreatePayload = {
  type: "text" | "faq" | "document";
  title: string;
  content?: string;
  question?: string;
  answer?: string;
  accessMode: "all_agents" | "selected_agents";
  assignedAgentIds: string[];
};

export type KnowledgeSourceUpdatePayload = {
  sourceId: string;
  data: Partial<KnowledgeSourceCreatePayload>;
};

// ----------------------------------------------------------------------
// UI COMPONENT CONTRACTS
// ----------------------------------------------------------------------

export interface AgentLibraryTabProps {
  agents: AIAgent[];
  templates: AgentTemplatePreset[];
  activeAgentId: string;
  isCreating: boolean;
  onSelectAgent: (agent: AIAgent) => void;
  onCreateAgent: (payload: AgentCreatePayload) => void;
  onDeleteAgent: (agentId: string) => void;
  onSetDefaultAgent: (agentId: string) => void;
}

export interface AgentConfigurationHeaderProps {
  activeAgent: AIAgent | undefined;
  agents: AIAgent[];
  templates: AgentTemplatePreset[];
  onSelectAgentId: (agentId: string) => void;
}

export interface AgentIdentitySectionProps {
  currentData: BusinessAISettings;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
}

export interface AgentBehaviorSectionProps {
  currentData: BusinessAISettings;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onUpdateBehavior: (key: keyof BusinessAISettings["behavior"], value: boolean) => void;
}

export interface AgentScopeSectionProps {
  currentData: BusinessAISettings;
  showAdvancedInstructions: boolean;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onToggleShowAdvancedInstructions: () => void;
}

export interface AgentInstructionsSectionProps {
  currentData: BusinessAISettings;
  showAdvancedInstructions: boolean;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onResetToTemplateDefaults: () => void;
  onToggleShowAdvancedInstructions: () => void;
}

export interface AgentLanguageSectionProps {
  currentData: BusinessAISettings;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
}

export interface AgentMemorySectionProps {
  currentData: BusinessAISettings;
  showAdvancedMemory: boolean;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onOpenAddMemoryModal: () => void;
  onOpenEditMemoryModal: (item: MemoryFieldDefinition) => void;
  onDeleteMemoryField: (key: string) => void;
  onToggleShowAdvancedMemory: () => void;
}

export interface AgentHandoffSectionProps {
  currentData: BusinessAISettings;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onUpdateHandoffTrigger: (key: keyof HumanHandoffTriggers, value: boolean) => void;
}

export interface AgentConfigurationTabProps {
  activeAgent: AIAgent | undefined;
  agents: AIAgent[];
  templates: AgentTemplatePreset[];
  currentData: BusinessAISettings;
  isApplyingTemplate: boolean;
  showAdvancedInstructions: boolean;
  showAdvancedMemory: boolean;
  onSelectAgentId: (agentId: string) => void;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onUpdateBehavior: (key: keyof BusinessAISettings["behavior"], value: boolean) => void;
  onUpdateHandoffTrigger: (key: keyof HumanHandoffTriggers, value: boolean) => void;
  onApplyTemplate: (templateId: string) => void;
  onResetToTemplateDefaults: () => void;
  onOpenAddMemoryModal: () => void;
  onOpenEditMemoryModal: (item: MemoryFieldDefinition) => void;
  onDeleteMemoryField: (key: string) => void;
  onToggleShowAdvancedInstructions: () => void;
  onToggleShowAdvancedMemory: () => void;
}

export interface AgentKnowledgeTabProps {
  sources: KnowledgeSource[];
  agents: AIAgent[];
  selectedKnowledgeAgentId: string;
  accessFilter: AccessFilter;
  onSelectKnowledgeAgent: (agentId: string) => void;
  onChangeAccessFilter: (filter: AccessFilter) => void;
  onAddSource: (type: "text" | "faq") => void;
  onEditSource: (source: KnowledgeSource) => void;
  onDeleteSource: (sourceId: string) => void;
  onToggleSourceStatus: (sourceId: string, status: "ready" | "disabled") => void;
}

export interface AgentPlaygroundTabProps {
  testQuery: string;
  isTesting: boolean;
  testResult: AITestResponse | null | undefined;
  onQueryChange: (query: string) => void;
  onRunTest: (e: React.FormEvent) => void;
}

export interface AgentActivityTabProps {
  logs: AIActivityLog[];
  isLoading?: boolean;
}

export interface AgentMemoryConfiguratorProps {
  schema: MemoryFieldDefinition[];
  isEnabled: boolean;
  onToggleEnable: (enabled: boolean) => void;
  onAddField: (field: MemoryFieldDefinition) => void;
  onUpdateField: (key: string, field: MemoryFieldDefinition) => void;
  onDeleteField: (key: string) => void;
}

export interface AgentKnowledgeFormProps {
  initialData?: Partial<KnowledgeSource>;
  type: "text" | "faq";
  agents: AIAgent[];
  isSaving: boolean;
  onSave: (payload: KnowledgeSourceCreatePayload | KnowledgeSourceUpdatePayload) => void;
  onCancel: () => void;
}
