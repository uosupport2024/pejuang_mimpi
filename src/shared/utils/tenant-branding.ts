import { API_BASE_URL, getHeaders, dedupFetch } from "./api";
import { parseSubColor, type TenantSubColors } from "@/shared/constants/colors";

export interface TenantBranding {
  id?: number | string;
  name?: string;
  slug?: string;
  logo?: string | null;
  logo_url?: string | null;
  main_color?: string | null;
  sub_color?: string | TenantSubColors | null;
  subColors?: TenantSubColors;
}

let currentBranding: TenantBranding | null = null;
const listeners = new Set<() => void>();

export function subscribeTenantBranding(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  if (typeof document !== "undefined" && currentBranding) {
    const sub = currentBranding.subColors || parseSubColor(currentBranding.sub_color);
    const btn = sub.button || sub.accent || sub.sub || currentBranding.main_color || "#E0542C";
    const side = (typeof sub.sidebar === "string" ? sub.sidebar : (sub.sidebar as any)?.css) || currentBranding.main_color || "#1E2A4A";
    const nav = (typeof sub.navbar === "string" ? sub.navbar : (sub.navbar as any)?.css) || currentBranding.main_color || "#1E2A4A";

    document.documentElement.style.setProperty("--theme-primary", btn);
    document.documentElement.style.setProperty("--theme-button", btn);
    document.documentElement.style.setProperty("--theme-sidebar", side);
    document.documentElement.style.setProperty("--theme-navbar", nav);
  }

  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn("[Tenant Branding] Listener error:", e);
    }
  });
}

export function getTenantBranding(): TenantBranding | null {
  return currentBranding;
}

export function setTenantBranding(branding: Partial<TenantBranding>) {
  currentBranding = {
    ...currentBranding,
    ...branding,
  };
  notifyListeners();
}

/**
 * Fetch and load active tenant branding from backend API
 */
export async function loadTenantBranding(): Promise<TenantBranding | null> {
  try {
    const response = await dedupFetch(`${API_BASE_URL}/tenants/current`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return currentBranding;
    }

    const json = await response.json();
    const data = json.data;
    if (data) {
      const parsedSub = parseSubColor(data.sub_color);
      currentBranding = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        logo_url: data.logo_url || (data.logo ? `${API_BASE_URL.replace('/api/v1', '')}/storage/${data.logo}` : null),
        main_color: data.main_color,
        sub_color: data.sub_color,
        subColors: parsedSub,
      };
      notifyListeners();
      return currentBranding;
    }
  } catch (err) {
    console.warn("[Tenant Branding] Error loading tenant branding:", err);
  }
  return currentBranding;
}
