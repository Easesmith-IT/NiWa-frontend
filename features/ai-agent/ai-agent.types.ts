
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
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: (payload: AgentCreatePayload) => void;
  onDeleteAgent: (agentId: string) => void;
  onSetDefaultAgent: (agentId: string) => void;
  onApplyTemplate: (agentId: string, templateId: string) => void;
}

export interface AgentConfigurationTabProps {
  currentData: BusinessAISettings;
  activeAgentId: string;
  agents: AIAgent[];
  isSaving: boolean;
  onSelectAgent: (agentId: string) => void;
  onUpdateField: <K extends keyof BusinessAISettings>(key: K, value: BusinessAISettings[K]) => void;
  onUpdateBehavior: (key: keyof BusinessAISettings["behavior"], value: boolean) => void;
  onUpdateHandoffTrigger: (key: keyof HumanHandoffTriggers, value: boolean) => void;
  onSave: () => void;
}

export interface AgentKnowledgeTabProps {
  sources: KnowledgeSource[];
  agents: AIAgent[];
  isLoading: boolean;
  onAddSource: (type: "text" | "faq") => void;
  onEditSource: (source: KnowledgeSource) => void;
  onDeleteSource: (sourceId: string) => void;
  onToggleSourceStatus: (sourceId: string, isActive: boolean) => void;
}

export interface AgentPlaygroundTabProps {
  agents: AIAgent[];
  activeAgentId: string;
  testQuery: string;
  isTesting: boolean;
  testResult: AITestResponse | null;
  onSelectAgent: (agentId: string) => void;
  onQueryChange: (query: string) => void;
  onRunTest: () => void;
}

export interface AgentActivityTabProps {
  logs: AIActivityLog[];
  isLoading: boolean;
  onRefresh: () => void;
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

