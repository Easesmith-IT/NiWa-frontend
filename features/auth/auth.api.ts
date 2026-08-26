import { apiClient } from "../../lib/api/api-client";
import type { LoginPayload, LoginResponse, ProfileResponse } from "./auth.types";

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const { data } = await apiClient.get<ProfileResponse>("/auth/profile");
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
