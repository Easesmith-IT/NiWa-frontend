export const getBaseApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const hasWindowLocation =
    typeof window !== "undefined" &&
    typeof window.location !== "undefined" &&
    typeof window.location.hostname === "string";

  const hostname = hasWindowLocation ? window.location.hostname : "";
  const isLocalhost = hasWindowLocation && (hostname === "localhost" || hostname === "127.0.0.1");

  if (envUrl) {
    if (hasWindowLocation && !isLocalhost && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return `${window.location.origin}/api`;
    }
    if (envUrl.includes("localhost:5000") || envUrl.includes("127.0.0.1:5000")) {
      return envUrl.replace(":5000", ":4000");
    }
    return envUrl;
  }

  if (hasWindowLocation && !isLocalhost && window.location.origin) {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:4000/api";
};
