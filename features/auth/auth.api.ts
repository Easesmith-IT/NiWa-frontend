import { apiClient } from "../../lib/api/api-client";
import type { LoginPayload, LoginResponse, ProfileResponse } from "./auth.types";

export const loginV1 = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const getProfileV1 = async (): Promise<ProfileResponse> => {
  const { data } = await apiClient.get<ProfileResponse>("/auth/profile");
  return data;
};

export const logoutV1 = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
