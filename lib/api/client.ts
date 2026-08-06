import axios from "axios";

import { clearAccessToken, getAccessToken, redirectToLogin, setAccessToken } from "../auth";

export const getBaseApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const isBrowser = typeof window !== "undefined";
  const isLocalhost =
    isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (envUrl) {
    if (isBrowser && !isLocalhost && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return `${window.location.origin}/api`;
    }
    return envUrl;
  }

  if (isBrowser && !isLocalhost) {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000/api";
};

export const apiClient = axios.create({
  baseURL: getBaseApiUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const isAuthRoute = typeof originalRequest?.url === "string" && originalRequest.url.startsWith("/auth/");

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
