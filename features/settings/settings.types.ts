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

// Future-facing prop contracts for Phase 5-D decomposition
export interface OperatorProfileCardProps {
  user?: ProfileResponse["user"];
  isLoading?: boolean;
  isSaving?: boolean;
  submitMessage?: string | null;
  submitError?: string | null;
  onUpdateProfile?: (values: ProfileUpdatePayload) => void;
}

export interface SecurityCredentialsCardProps {
  isUpdating?: boolean;
  passwordMessage?: string | null;
  passwordError?: string | null;
  onChangePassword?: (values: PasswordChangePayload) => void;
}

export interface MetaCredentialsCardProps {
  settings?: SettingsPayload;
  metaWebhookEndpoint?: string;
  secretsConfigured?: SettingsResponse["secretsConfigured"];
  connectionDiagnostics?: ConnectionTestResponse;
  connectionError?: string | null;
  showStoredSecrets: boolean;
  isSaving?: boolean;
  isTesting?: boolean;
  submitMessage?: string | null;
  submitError?: string | null;
  onToggleSecrets?: () => void;
  onSaveSettings?: (values: SettingsPayload) => void;
  onTestConnection?: () => void;
}
