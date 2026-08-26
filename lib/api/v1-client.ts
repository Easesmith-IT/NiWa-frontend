import axios from "axios";

import { clearAccessToken, getAccessToken, redirectToLogin, setAccessToken } from "../auth";
import { getBaseApiUrl } from "./base-url";

const getV1BaseUrl = () => `${getBaseApiUrl()}/v1`;

export const v1ApiClient = axios.create({
  baseURL: getV1BaseUrl(),
  withCredentials: true,
});

v1ApiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers["x-workspace-id"]) {
    const activeWorkspaceId =
      (typeof window !== "undefined" && localStorage.getItem("activeWorkspaceId")) ||
      process.env.NEXT_PUBLIC_WORKSPACE_ID ||
      "ws-default";
    config.headers["x-workspace-id"] = activeWorkspaceId;
  }

  return config;
});

v1ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const isAuthRoute = typeof originalRequest?.url === "string" && originalRequest.url.startsWith("/auth/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await v1ApiClient.post("/auth/refresh");
        const nextAccessToken = refreshResponse.data?.accessToken;

        if (typeof nextAccessToken === "string" && nextAccessToken.length > 0) {
          setAccessToken(nextAccessToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return v1ApiClient(originalRequest);
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
