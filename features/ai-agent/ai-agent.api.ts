import axios from "axios";
import { getAccessToken } from "../../lib/auth";

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface BusinessAISettings {
  workspaceId: string;
  enabled: boolean;
  autoReplyEnabled: boolean;
  agentName: string;
  businessName: string;
  systemPrompt: string;
  responseStyle: "professional" | "friendly" | "casual" | "custom";
  responseLength: "short" | "balanced" | "detailed";
  languageMode: "auto" | "english" | "hindi" | "hinglish" | "custom";
  preferredLanguage: string;
  unknownAnswerBehavior: "safe_response" | "no_response" | "handoff";
  fallbackResponse: string;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  useConversationHistory: boolean;
  maxHistoryMessages: number;
  testedSuccessfully: boolean;
  hasApiKey: boolean;
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
  const response = await axios.get("/api/v1/ai-agent/settings", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateAISettings = async (
  payload: Partial<BusinessAISettings>,
): Promise<{ settings: BusinessAISettings }> => {
  const response = await axios.put("/api/v1/ai-agent/settings", payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const runAITestingPlayground = async (query: string): Promise<AITestResponse> => {
  const response = await axios.post(
    "/api/v1/ai-agent/test",
    { query },
    { headers: getAuthHeaders() },
  );
  return response.data;
};

export const fetchAIActivityLogs = async (): Promise<{
  activities: AIActivityLog[];
  metrics: { total: number; completedCount: number; failedCount: number };
}> => {
  const response = await axios.get("/api/v1/ai-agent/activity", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchKnowledgeSources = async (): Promise<{ sources: KnowledgeSource[] }> => {
  const response = await axios.get("/api/v1/ai-agent/knowledge", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createKnowledgeSource = async (payload: {
  type: "text" | "faq";
  title?: string;
  content?: string;
  question?: string;
  answer?: string;
}): Promise<{ source: KnowledgeSource }> => {
  const response = await axios.post("/api/v1/ai-agent/knowledge", payload, {
    headers: getAuthHeaders(),
  });
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
  const response = await axios.patch(`/api/v1/ai-agent/knowledge/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const toggleKnowledgeSourceStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "ready" | "disabled";
}): Promise<{ source: KnowledgeSource }> => {
  const response = await axios.patch(
    `/api/v1/ai-agent/knowledge/${id}/status`,
    { status },
    { headers: getAuthHeaders() },
  );
  return response.data;
};

export const deleteKnowledgeSource = async (id: string): Promise<void> => {
  await axios.delete(`/api/v1/ai-agent/knowledge/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const updateConversationAIMode = async ({
  conversationId,
  aiMode,
}: {
  conversationId: string;
  aiMode: "AI_ACTIVE" | "AI_PAUSED" | "HUMAN_ONLY";
}): Promise<void> => {
  await axios.patch(
    `/api/v1/conversations/${conversationId}/ai-mode`,
    { aiMode },
    { headers: getAuthHeaders() },
  );
};
