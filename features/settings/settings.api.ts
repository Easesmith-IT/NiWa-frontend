import { apiClient } from "../../lib/api/api-client";
import type {
  BasicMessageResponse,
  ConnectionTestResponse,
  PasswordChangePayload,
  ProfileResponse,
  ProfileUpdatePayload,
  SettingsPayload,
  SettingsResponse,
} from "./settings.types";

export * from "./settings.types";

export const getSettings = async (showStoredSecrets?: boolean) => {
  const response = await apiClient.get<SettingsResponse>("/settings", {
    params: {
      includeSecrets: showStoredSecrets ? "true" : undefined,
    },
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get<ProfileResponse>("/auth/profile");
  return response.data;
};

export const updateSettings = async (values: SettingsPayload) => {
  const response = await apiClient.put<SettingsResponse>("/settings", values);
  return response.data;
};

export const testConnection = async () => {
  const response = await apiClient.post<ConnectionTestResponse>("/settings/test-connection");
  return response.data;
};

export const updateProfile = async (values: ProfileUpdatePayload) => {
  const response = await apiClient.put<ProfileResponse>("/auth/profile", values);
  return response.data;
};

export const changePassword = async (values: PasswordChangePayload) => {
  const response = await apiClient.post<BasicMessageResponse>("/auth/change-password", values);
  return response.data;
};
