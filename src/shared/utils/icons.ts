// Dynamically import all chicken PNG icons from the directory
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

// Helper function to resolve icon URL
export function getChickenIcon(iconName: string | null | undefined): string {
  if (!iconName) {
    const firstIcon = Object.values(CHICKEN_ICONS)[0];
    return firstIcon ? firstIcon.url : "";
  }
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
