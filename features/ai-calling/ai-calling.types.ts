export type AICallStatus =
  | "initiated" | "ringing" | "in_progress" | "completed" | "busy" | "no_answer" | "failed" | "canceled";

export interface AICall {
  _id: string;
  workspaceId: string;
  contactId?: string | null;
  agentId?: string | null;
  direction: "inbound" | "outbound";
  status: AICallStatus;
  fromNumber: string;
  toNumber: string;
  provider: "twilio";
  providerCallId?: string | null;
  startedAt?: string | null;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds: number;
  transcript?: Array<{ role: "user" | "assistant" | "system"; text: string; at: string }>;
  summary?: string;
  outcome?: string;
  createdAt: string;
}

export interface AICallingNumber {
  _id: string;
  workspaceId: string;
  phoneNumberE164: string;
  label: string;
  provider: "twilio";
  agentId?: string | null;
  enabled: boolean;
}
