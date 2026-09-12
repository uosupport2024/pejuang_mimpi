import { getCookie } from "./cookies";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://attandance-pot.test/api/v1";

export function getHeaders(): Record<string, string> {
  const token = getCookie("auth_token");
  const userProfileStr = getCookie("user_profile");
  let tenantId: string | null = null;

  if (userProfileStr) {
    try {
      const user = JSON.parse(userProfileStr);
      const tid = user.tenant_id || user.tenant?.id || user.tenant_list?.[0]?.tenant_id;
      if (tid) {
        tenantId = String(tid);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
  };
}

// In-flight promise cache to prevent concurrent duplicate GET requests (React StrictMode, double mounts)
const inFlightRequests = new Map<string, Promise<Response>>();

// Short TTL response cache (3 seconds) to prevent looping rapid fetches across re-renders and tab switches
interface CachedResponse {
  res: Response;
  timestamp: number;
}
const responseCache = new Map<string, CachedResponse>();
const SHORT_CACHE_TTL = 3000;

/**
 * Clear the deduplication cache, optionally matching a URL keyword/prefix.
 */
export function clearDedupCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
    inFlightRequests.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
  for (const key of inFlightRequests.keys()) {
    if (key.includes(pattern)) {
      inFlightRequests.delete(key);
    }
  }
}

/**
 * Fetch wrapper that automatically deduplicates concurrent identical GET requests
 * and memoizes recent identical GET results to prevent duplicate network calls and 429 Too Many Requests errors.
 */
export function dedupFetch(input: RequestInfo | URL, init?: RequestInit, bypassCache = false): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const urlKey = typeof input === "string" ? input : input.toString();

  // Only cache and deduplicate GET requests
  if (method === "GET") {
    // 1. Return from short-term cache if still valid
    if (!bypassCache) {
      const cached = responseCache.get(urlKey);
      if (cached && Date.now() - cached.timestamp < SHORT_CACHE_TTL) {
        return Promise.resolve(cached.res.clone());
      }
    }

    // 2. Reuse in-flight request if identical GET is already running
    if (inFlightRequests.has(urlKey)) {
      return inFlightRequests.get(urlKey)!.then((res) => res.clone());
    }

    const fetchPromise = window.fetch(input, init)
      .then((res) => {
        if (res.ok) {
          responseCache.set(urlKey, {
            res: res.clone(),
            timestamp: Date.now(),
          });
        }
        return res;
      })
      .finally(() => {
        inFlightRequests.delete(urlKey);
      });

    inFlightRequests.set(urlKey, fetchPromise);
    return fetchPromise.then((res) => res.clone());
  }

  // For non-GET mutations (POST, PUT, DELETE), clear cache for related queries
  clearDedupCache();
  return window.fetch(input, init);
}
