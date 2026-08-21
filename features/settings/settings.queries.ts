import { useMutation, useQuery } from "@tanstack/react-query";
import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  changePassword,
  getProfile,
  getSettings,
  testConnection,
  updateProfile,
  updateSettings,
} from "./settings.api";
import type {
  PasswordChangePayload,
  ProfileUpdatePayload,
  SettingsPayload,
} from "./settings.types";

export const settingsKeys = {
  all: v1QueryKeys.settings,
  settings: (showStoredSecrets?: boolean) => [...settingsKeys.all, showStoredSecrets] as const,
  profile: v1QueryKeys.profile,
};

export const useSettingsQuery = (showStoredSecrets: boolean) =>
  useQuery({
    queryKey: settingsKeys.settings(showStoredSecrets),
    queryFn: () => getSettings(showStoredSecrets),
  });

export const useProfileQuery = () =>
  useQuery({
    queryKey: settingsKeys.profile,
    queryFn: () => getProfile(),
  });

export const useUpdateSettingsMutation = () =>
  useMutation({
    mutationFn: (values: SettingsPayload) => updateSettings(values),
  });

export const useTestConnectionMutation = () =>
  useMutation({
    mutationFn: () => testConnection(),
  });

export const useUpdateProfileMutation = () =>
  useMutation({
    mutationFn: (values: ProfileUpdatePayload) => updateProfile(values),
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (values: PasswordChangePayload) => changePassword(values),
  });
