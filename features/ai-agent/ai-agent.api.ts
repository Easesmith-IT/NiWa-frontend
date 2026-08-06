import { v1ApiClient } from "../../lib/api/v1-client";

export interface MemoryFieldDefinition {
  key: string;
  description: string;
  type: "string" | "number" | "boolean" | "string_array";
  multiple?: boolean;
}

export interface AgentBehaviorConfig {
  diagnoseBeforeRecommending: boolean;
  challengeAssumptions: boolean;
  explainReasoning: boolean;
  preferActionableAdvice: boolean;
  useNumbersWhenUseful: boolean;
  avoidGenericRecommendations: boolean;
}

export interface HumanHandoffTriggers {
  explicitHumanRequest: boolean;
  unableToAnswer: boolean;
  dissatisfied: boolean;
  sensitiveRequest: boolean;
}

export type ScopeLevel = "strict" | "focused" | "flexible" | "general";
export type AutonomyLevel = "answer_only" | "assist" | "goal_driven" | "action_enabled";
export type KnowledgePolicy = "grounded_only" | "grounded_business" | "assisted" | "open";

export interface BusinessAISettings {
  workspaceId: string;
  templateId: string;
  enabled: boolean;
  autoReplyEnabled: boolean;
  agentName: string;
  agentRole: string;
  agentPurpose: string;
  businessName: string;
  businessDescription: string;
  conversationStyle: "direct" | "consultative" | "supportive" | "sales_oriented" | "custom";
  responseStyle: "professional" | "friendly" | "casual" | "custom";
  responseLength: "short" | "balanced" | "detailed";
  questionsPerReply: number;
  behavior: AgentBehaviorConfig;
  // Scope & Boundaries
  scopeLevel: ScopeLevel;
  autonomyLevel: AutonomyLevel;
  knowledgePolicy: KnowledgePolicy;
  capabilities: string[];
  restrictedCapabilities: string[];
  primaryObjective: string;
  secondaryObjectives: string[];
  allowAdjacentTopics: boolean;
  allowGeneralKnowledge: boolean;
  allowCasualConversation: boolean;
  redirectOutOfScope: boolean;
  outOfScopeMessage: string;
  knowledgePackIds: string[];
  recommendedIntegrations: string[];
  enabledTools: string[];
  languageMode: "auto" | "english" | "hindi" | "hinglish" | "custom";
  matchCustomerLanguage: boolean;
  allowHinglish: boolean;
  preserveTechnicalEnglish: boolean;
  preferredLanguage: string;
  agentInstructions: string;
  systemPrompt: string;
  memoryEnabled: boolean;
  memorySchema: MemoryFieldDefinition[];
  maxFactsPerConversation: number;
  maxFactLength: number;
  unknownAnswerBehavior: "ask_customer" | "explain_unavailable" | "safe_response" | "no_response" | "handoff";
  fallbackResponse: string;
  humanHandoffEnabled: boolean;
  handoffTriggers: HumanHandoffTriggers;
  handoffMessage: string;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  useConversationHistory: boolean;
  maxHistoryMessages: number;
  greetingFastPathEnabled: boolean;
  acknowledgementFastPathEnabled: boolean;
  testedSuccessfully: boolean;
  hasApiKey: boolean;
}

export interface AgentTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: "business" | "real_estate" | "travel" | "healthcare" | "support" | "sales" | "ecommerce" | "custom";
  icon: string;
  preset: Partial<BusinessAISettings>;
}

export interface KnowledgePackEntry {
  id: string;
  topic: string;
  content: string;
  keywords: string[];
}

export interface KnowledgePack {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: "active" | "deprecated";
  entries: KnowledgePackEntry[];
}

export interface KnowledgeSource {
  _id: string;
  workspaceId: string;
  type: "text" | "faq" | "document";
  title: string;
  content?: string;
  question?: string;
  answer?: string;
  status: "ready" | "disabled";
  createdAt: string;
  updatedAt: string;
}

export interface ScoredChunk {
  chunkText: string;
  sourceTitle: string;
  sourceId: string;
  score: number;
  sourceType?: "workspace" | "template_pack" | "integration";
}

export interface DecisionTrace {
  scope: string;
  scopeConfidence: number;
  scopeReason: string;
  knowledgePolicy: string;
  knowledgeUsed: string;
  memoryUsed: string;
  objective: string;
  action: string;
}

export interface AITestResponse {
  response: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  testedSuccessfully: boolean;
  knowledgeUsed: boolean;
  knowledgeSources: string[];
  usedChunks: string[];
  scoredChunks: ScoredChunk[];
  decisionTrace?: DecisionTrace;
}

export interface AIActivityLog {
  _id: string;
  workspaceId: string;
  messageId: string;
  conversationId?: string;
  customerPhoneNumber?: string;
  processingState: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reason: string;
  provider: string;
  aiModel: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  errorCode?: string;
  errorMessageSanitized?: string;
  createdAt: string;
}

export const fetchAISettings = async (): Promise<{ settings: BusinessAISettings }> => {
  const response = await v1ApiClient.get<{ settings: BusinessAISettings }>("/ai-agent/settings");
  return response.data;
};

export const fetchAITemplates = async (): Promise<{ templates: AgentTemplatePreset[] }> => {
  const response = await v1ApiClient.get<{ templates: AgentTemplatePreset[] }>("/ai-agent/templates");
  return response.data;
};

export const applyAITemplate = async (templateId: string): Promise<{ settings: BusinessAISettings }> => {
  const response = await v1ApiClient.post<{ settings: BusinessAISettings }>(
    `/ai-agent/templates/${templateId}/apply`,
    {},
  );
  return response.data;
};

export const updateAISettings = async (
  payload: Partial<BusinessAISettings>,
): Promise<{ settings: BusinessAISettings }> => {
  const response = await v1ApiClient.put<{ settings: BusinessAISettings }>("/ai-agent/settings", payload);
  return response.data;
};

export const runAITestingPlayground = async (query: string): Promise<AITestResponse> => {
  const response = await v1ApiClient.post<AITestResponse>("/ai-agent/test", { query });
  return response.data;
};

export const fetchAIActivityLogs = async (): Promise<{
  activities: AIActivityLog[];
  metrics: { total: number; completedCount: number; failedCount: number };
}> => {
  const response = await v1ApiClient.get<{
    activities: AIActivityLog[];
    metrics: { total: number; completedCount: number; failedCount: number };
  }>("/ai-agent/activity");
  return response.data;
};

export const fetchKnowledgeSources = async (): Promise<{ sources: KnowledgeSource[] }> => {
  const response = await v1ApiClient.get<{ sources: KnowledgeSource[] }>("/ai-agent/knowledge");
  return response.data;
};

export const fetchKnowledgePacks = async (): Promise<{ packs: KnowledgePack[] }> => {
  const response = await v1ApiClient.get<{ packs: KnowledgePack[] }>("/ai-agent/knowledge-packs");
  return response.data;
};

export const createKnowledgeSource = async (payload: {
  type: "text" | "faq";
  title?: string;
  content?: string;
  question?: string;
  answer?: string;
}): Promise<{ source: KnowledgeSource }> => {
  const response = await v1ApiClient.post<{ source: KnowledgeSource }>("/ai-agent/knowledge", payload);
  return response.data;
};

export const updateKnowledgeSource = async ({
  id,
  ...payload
}: {
  id: string;
  title?: string;
  content?: string;
  question?: string;
  answer?: string;
}): Promise<{ source: KnowledgeSource }> => {
  const response = await v1ApiClient.patch<{ source: KnowledgeSource }>(
    `/ai-agent/knowledge/${id}`,
    payload,
  );
  return response.data;
};

export const toggleKnowledgeSourceStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "ready" | "disabled";
}): Promise<{ source: KnowledgeSource }> => {
  const response = await v1ApiClient.patch<{ source: KnowledgeSource }>(
    `/ai-agent/knowledge/${id}/status`,
    { status },
  );
  return response.data;
};

export const deleteKnowledgeSource = async (id: string): Promise<void> => {
  await v1ApiClient.delete(`/ai-agent/knowledge/${id}`);
};

export const updateConversationAIMode = async ({
  conversationId,
  aiMode,
}: {
  conversationId: string;
  aiMode: "AI_ACTIVE" | "AI_PAUSED" | "HUMAN_ONLY";
}): Promise<void> => {
  await v1ApiClient.patch(`/conversations/${conversationId}/ai-mode`, { aiMode });
};

