import { useState, useEffect } from "react";
import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";

// Dynamically import all default chicken PNG icons from the directory
const chickenModules = import.meta.glob("@/assets/icon-celengan/*.png", { eager: true, import: "default" }) as Record<string, string>;

export const CHICKEN_ICONS: Record<string, { name: string; url: string }> = {};

// Normalize key names and map to objects containing original name and URL
Object.entries(chickenModules).forEach(([path, url]) => {
  const filename = path.split("/").pop()?.replace(".png", "") || "";
  const key = filename.toLowerCase().replace(/\s+/g, "");
  CHICKEN_ICONS[key] = {
    name: filename,
    url: url
  };
});

export function getChickenIconLabel(key: string): string {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
  if (CHICKEN_ICONS[normalizedKey]) {
    return CHICKEN_ICONS[normalizedKey].name;
  }
  return "Impian Celengan";
}

// Helper function to resolve icon URL (supports custom URL, storage path, or fallback local icon)
export function getChickenIcon(iconName: string | null | undefined): string {
  if (!iconName) {
    const firstIcon = Object.values(CHICKEN_ICONS)[0];
    return firstIcon ? firstIcon.url : "";
  }

  // Full URL or base64 data URL
  if (iconName.startsWith("http://") || iconName.startsWith("https://") || iconName.startsWith("data:")) {
    return iconName;
  }

  // Storage relative path
  if (iconName.startsWith("/storage") || iconName.startsWith("storage/") || iconName.startsWith("tenant_icons/")) {
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
    const cleanPath = iconName.startsWith("/") ? iconName : `/${iconName}`;
    const storagePath = cleanPath.startsWith("/storage") ? cleanPath : `/storage${cleanPath}`;
    return `${baseUrl}${storagePath}`;
  }

  // Local CHICKEN_ICONS match
  const key = iconName.toLowerCase().replace(/\s+/g, "");
  if (CHICKEN_ICONS[key]) {
    return CHICKEN_ICONS[key].url;
  }

  // Try partial match
  const foundKey = Object.keys(CHICKEN_ICONS).find((k) => k.includes(key) || key.includes(k));
  if (foundKey) {
    return CHICKEN_ICONS[foundKey].url;
  }

  const firstIcon = Object.values(CHICKEN_ICONS)[0];
  return firstIcon ? firstIcon.url : "";
}

export interface CelenganIconOption {
  key: string;
  name: string;
  url: string;
  isCustom?: boolean;
}

/**
 * Hook to retrieve available celengan icons for the current user/tenant.
 * If tenant has custom icons registered in master icon celengan, it returns those icons.
 * If not, it falls back to the default CHICKEN_ICONS.
 */
export function useCelenganIcons() {
  const [icons, setIcons] = useState<CelenganIconOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTenantIcons() {
      try {
        const response = await dedupFetch(`${API_BASE_URL}/tenant-icons`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (response.ok) {
          const resJson = await response.json();
          const customList = resJson.data || resJson || [];

          if (Array.isArray(customList) && customList.length > 0) {
            const mapped: CelenganIconOption[] = customList.map((item: any, idx: number) => ({
              key: item.icon || item.icon_url || `custom-icon-${item.id || idx}`,
              name: `Icon #${item.id || idx + 1}`,
              url: item.icon_url || getChickenIcon(item.icon),
              isCustom: true,
            }));
            if (isMounted) {
              setIcons(mapped);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Could not load custom tenant icons, falling back to default:", e);
      }

      // Fallback: return default chicken icons
      const defaultList: CelenganIconOption[] = Object.entries(CHICKEN_ICONS).map(([key, val]) => ({
        key,
        name: val.name,
        url: val.url,
        isCustom: false,
      }));

      if (isMounted) {
        setIcons(defaultList);
        setLoading(false);
      }
    }

    loadTenantIcons();

    return () => {
      isMounted = false;
    };
  }, []);

  return { icons, loading };
}
