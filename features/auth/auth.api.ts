import { v1ApiClient } from "../../lib/api/v1-client";
import type { LoginPayload, LoginResponse, ProfileResponse } from "./auth.types";

export const loginV1 = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await v1ApiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const getProfileV1 = async (): Promise<ProfileResponse> => {
  const { data } = await v1ApiClient.get<ProfileResponse>("/auth/profile");
  return data;
};

export const logoutV1 = async (): Promise<void> => {
  await v1ApiClient.post("/auth/logout");
};
