import type {
  BasicMessageResponse,
  ConnectionTestResponse,
  PasswordChangePayload,
  ProfileResponse,
  ProfileUpdatePayload,
  SettingsPayload,
  SettingsResponse,
} from "../../lib/api/types";

export type {
  BasicMessageResponse,
  ConnectionTestResponse,
  PasswordChangePayload,
  ProfileResponse,
  ProfileUpdatePayload,
  SettingsPayload,
  SettingsResponse,
};

export interface SettingsQueryOptions {
  includeSecrets?: boolean;
}

export type { OperatorProfileCardProps } from "./components/OperatorProfileCard";
export type { SecurityCredentialsCardProps } from "./components/SecurityCredentialsCard";
export type { MetaCredentialsCardProps } from "./components/MetaCredentialsCard";
