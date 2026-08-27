import type { ProfileResponse } from "../auth";

export interface SettingsPayload {
  appId: string;
  appSecret: string;
  accessToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  verifyToken: string;
  webhookUrl: string;
  apiVersion: string;
  cloudApiBaseUrl: string;
}

export interface SettingsResponse {
  settings: SettingsPayload;
  secretsConfigured?: {
    appSecret: boolean;
    accessToken: boolean;
    verifyToken: boolean;
  };
  metaWebhookEndpoint: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  latencyMs?: number;
  statusCode?: number;
  missingFields?: string[];
  responseBody?: unknown;
  details?: Record<string, unknown>;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
}

export interface PasswordChangePayload {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface BasicMessageResponse {
  message: string;
  success?: boolean;
}

export interface SettingsQueryOptions {
  includeSecrets?: boolean;
}

export type { ProfileResponse };
export type { OperatorProfileCardProps } from "./components/OperatorProfileCard";
export type { SecurityCredentialsCardProps } from "./components/SecurityCredentialsCard";
export type { MetaCredentialsCardProps } from "./components/MetaCredentialsCard";
