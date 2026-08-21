import { v1ApiClient } from "../../lib/api/v1-client";
import type {
  BasicMessageResponse,
  ConnectionTestResponse,
  PasswordChangePayload,
  ProfileResponse,
  ProfileUpdatePayload,
  SettingsPayload,
  SettingsResponse,
} from "../../lib/api/types";

export const getSettings = async (showStoredSecrets?: boolean) => {
  const response = await v1ApiClient.get<SettingsResponse>("/settings", {
    params: {
      includeSecrets: showStoredSecrets ? "true" : undefined,
    },
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await v1ApiClient.get<ProfileResponse>("/auth/profile");
  return response.data;
};

export const updateSettings = async (values: SettingsPayload) => {
  const response = await v1ApiClient.put<SettingsResponse>("/settings", values);
  return response.data;
};

export const testConnection = async () => {
  const response = await v1ApiClient.post<ConnectionTestResponse>("/settings/test-connection");
  return response.data;
};

export const updateProfile = async (values: ProfileUpdatePayload) => {
  const response = await v1ApiClient.put<ProfileResponse>("/auth/profile", values);
  return response.data;
};

export const changePassword = async (values: PasswordChangePayload) => {
  const response = await v1ApiClient.post<BasicMessageResponse>("/auth/change-password", values);
  return response.data;
};
