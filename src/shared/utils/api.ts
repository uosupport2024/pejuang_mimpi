import { getCookie } from "./cookies";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://attandance-pot.test/api/v1";

export function getHeaders() {
  const token = getCookie("auth_token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

// In-flight promise cache to prevent concurrent duplicate GET requests (React StrictMode, double mounts)
const inFlightRequests = new Map<string, Promise<Response>>();

/**
 * Fetch wrapper that automatically deduplicates concurrent identical GET requests
 * to prevent duplicate network calls and 429 Too Many Requests errors.
 */
export function dedupFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const urlKey = typeof input === "string" ? input : input.toString();

  // Only deduplicate GET requests
  if (method === "GET") {
    if (inFlightRequests.has(urlKey)) {
      return inFlightRequests.get(urlKey)!.then((res) => res.clone());
    }

    const fetchPromise = window.fetch(input, init).finally(() => {
      // Clear in-flight cache shortly after request finishes
      setTimeout(() => {
        inFlightRequests.delete(urlKey);
      }, 600);
    });

    inFlightRequests.set(urlKey, fetchPromise);
    return fetchPromise.then((res) => res.clone());
  }

  return window.fetch(input, init);
}
