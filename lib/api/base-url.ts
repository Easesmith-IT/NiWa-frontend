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
