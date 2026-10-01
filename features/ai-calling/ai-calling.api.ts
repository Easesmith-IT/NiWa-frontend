import { apiClient } from "../../lib/api/api-client";
import type { AICall, AICallingNumber } from "./ai-calling.types";

export const fetchAICalls = async (): Promise<{ calls: AICall[] }> =>
  (await apiClient.get<{ calls: AICall[] }>("/ai-calling/calls")).data;

export const fetchAICallingNumbers = async (): Promise<{ numbers: AICallingNumber[] }> =>
  (await apiClient.get<{ numbers: AICallingNumber[] }>("/ai-calling/numbers")).data;

export const saveAICallingNumber = async (payload: {
  phoneNumberE164: string;
  label?: string;
  agentId?: string;
  enabled?: boolean;
}) => (await apiClient.post<{ number: AICallingNumber }>("/ai-calling/numbers", payload)).data;

export const startAICall = async (payload: {
  to: string;
  from?: string;
  contactId?: string;
  agentId?: string;
  greeting?: string;
}) => (await apiClient.post<{ call: AICall }>("/ai-calling/calls", payload)).data;
