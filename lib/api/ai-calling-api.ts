import { apiClient } from "./api-client";

export interface AICallItem {
  _id: string;
  workspaceId: string;
  contactId?: any;
  agentId?: any;
  callingNumberId?: any;
  direction: "inbound" | "outbound";
  status:
    | "created"
    | "initiating"
    | "ringing"
    | "answered"
    | "in_progress"
    | "completed"
    | "busy"
    | "no_answer"
    | "failed"
    | "canceled";
  processingStatus?: string;
  fromNumber: string;
  toNumber: string;
  startedAt?: string | null;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number;
  endReason?: string | null;
  recording?: {
    status?: string;
    durationSeconds?: number | null;
    format?: string | null;
  };
  summary?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
  disposition?: string | null;
  humanIntervention?: {
    required?: boolean;
    status?: string;
    category?: string;
    priority?: string;
    reason?: string | null;
  };
  transfer?: {
    status?: string;
    targetPhoneNumber?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptTurn {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string | number;
}

export async function getAICalls(params?: { limit?: number }): Promise<{ calls: AICallItem[] }> {
  const res = await apiClient.get<{ calls: AICallItem[] }>("/api/ai-calling/calls", { params });
  return res.data;
}

export async function getAICall(callId: string): Promise<{ call: AICallItem }> {
  const res = await apiClient.get<{ call: AICallItem }>(`/api/ai-calling/calls/${callId}`);
  return res.data;
}

export async function getAICallTranscript(callId: string): Promise<{ turns: TranscriptTurn[] }> {
  const res = await apiClient.get<{ turns: TranscriptTurn[] }>(
    `/api/ai-calling/calls/${callId}/transcript`
  );
  return res.data;
}
