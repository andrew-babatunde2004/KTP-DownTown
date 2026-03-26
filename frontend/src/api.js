const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const fallbackApiBaseUrl = isLocalHost ? "http://localhost:3000" : "";
const apiBaseUrl = (configuredApiBaseUrl || fallbackApiBaseUrl).replace(/\/$/, "");

export function apiUrl(path) {
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
