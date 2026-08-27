import axios, { AxiosError } from "axios";

import { clearAccessToken, getAccessToken, redirectToLogin, setAccessToken } from "../auth";
import { getActiveWorkspaceId } from "../workspace/workspace-state";
import { getBaseApiUrl } from "./base-url";

const getApiBaseUrl = () => getBaseApiUrl();

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

const isPlatformEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return cleanUrl.startsWith("/auth/") || cleanUrl === "/auth";
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = config.url;

  if (isPlatformEndpoint(url)) {
    delete config.headers["x-workspace-id"];
    return config;
  }

  // Workspace-scoped requests require a valid active workspace ID
  let workspaceId = config.headers["x-workspace-id"] as string | undefined;
  if (!workspaceId) {
    const activeId = getActiveWorkspaceId();
    if (activeId) {
      workspaceId = activeId;
      config.headers["x-workspace-id"] = activeId;
    }
  }

  if (!workspaceId) {
    const error = new AxiosError(
      "No active workspace selected. A valid active workspace ID is required for workspace-scoped requests.",
      "ERR_MISSING_WORKSPACE_ID",
      config,
    );
    return Promise.reject(error);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const isAuthRoute =
      typeof originalRequest?.url === "string" && isPlatformEndpoint(originalRequest.url);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await apiClient.post("/auth/refresh");
        const nextAccessToken = refreshResponse.data?.accessToken;

        if (typeof nextAccessToken === "string" && nextAccessToken.length > 0) {
          setAccessToken(nextAccessToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        clearAccessToken();
        redirectToLogin();
      }
    }

    if (error.response?.status === 401) {
      clearAccessToken();
    }

    return Promise.reject(error);
  },
);
