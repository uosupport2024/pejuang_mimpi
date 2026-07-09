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
