/**
 * Configuration for the application's color theme.
 * All hex codes are centralized in the `hex` object, and referenced throughout `classes`, `celengan`, `badges`, and `presets`.
 */
const hex = {
  outerBg: "#334c7a",       // Dark blue outer background for login
  leftBg: "#f5f4ed",        // Warm cream left column background for login
  rightBg: "#ffffff",       // Solid white right column background
  primary: "#e0542c",       // Finexy Orange
  primaryHover: "#c23f1b",  // Darker Orange
  accent: "#fee279",        // Yellow accent
  accentBlue: "#498fbf",    // Light blue accent for login
  textDark: "#1f2937",      // Near black text
  textMuted: "#6b7280",     // Grey text
  navBg: "#1e2a4a",         // Navigation bar blue
  navBgHover: "#161f36",    // Darker navigation bar blue for hover
  
  // Celengan & Nature Palette
  sawahPertumbuhan: "#7FA46D",
  sawahPertumbuhanDark: "#5C824C",
  sawahPertumbuhanText: "#516b46",

  apiSemangat: "#F25C2A",
  apiSemangatDark: "#C54117",

  airKehidupan: "#5C8A90",
  airKehidupanDark: "#3F686D",
  airKehidupanText: "#3b595d",

  padiKemakmuran: "#F2B233",
  padiKemakmuranDark: "#C58F1B",
  padiKemakmuranText: "#916715",

  // Extended Tenant & UI Presets
  oceanBlue: "#1E40AF",
  oceanBlueLight: "#3B82F6",
  modernTeal: "#0F766E",
  modernTealLight: "#14B8A6",
  royalIndigo: "#3730A3",
  royalIndigoLight: "#6366F1",
  slateClassic: "#334C7A",
  slateClassicLight: "#64748B",

  danger: "#ef4444",
} as const;

export const THEME_COLORS = {
  hex,

  classes: {
    outerBg: "bg-[#334c7a]",
    leftBg: "bg-[#f5f4ed]",
    rightBg: "bg-white",
    textPrimary: "text-[#1f2937] dark:text-[#1f2937]",
    textAccent: "text-[#fee279]",
    navBg: "bg-[#1e2a4a] hover:bg-[#161f36]",
    
    buttonBg: "bg-[#e0542c] hover:bg-[#c23f1b]",
    buttonText: "text-white",
    buttonShadow: "shadow-md shadow-[#e0542c]/15",

    // Dashboard & layout compatibility
    badgeBg: "bg-[#e0542c]",
    badgeIconColor: "text-[#fee279]",
    heroBg: "bg-[#e0542c]",
    metricNormalBadge: "bg-emerald-500/10 text-emerald-600",
    metricAccentBadge: "bg-[#fee279]/10 text-[#fee279]",
    metricPrimaryBadge: "bg-[#e0542c]/10 text-[#e0542c]",
  },

  // Celengan/Savings Card configuration with both class and style fallbacks
  celengan: {
    rumah: {
      gradient: "bg-gradient-rumah",
      gradientStyle: { background: "linear-gradient(135deg, #7FA46D 0%, #5C824C 100%)" },
      solid: hex.sawahPertumbuhan,
    },
    motor: {
      gradient: "bg-gradient-motor",
      gradientStyle: { background: "linear-gradient(135deg, #F25C2A 0%, #C54117 100%)" },
      solid: hex.apiSemangat,
    },
    liburanBali: {
      gradient: "bg-gradient-liburan",
      gradientStyle: { background: "linear-gradient(135deg, #5C8A90 0%, #3F686D 100%)" },
      solid: hex.airKehidupan,
    },
    laptopBaru: {
      gradient: "bg-gradient-laptop",
      gradientStyle: { background: "linear-gradient(135deg, #F2B233 0%, #C58F1B 100%)" },
      solid: hex.padiKemakmuran,
    },
  },

  // Tunas Loker List badge styles
  badges: {
    type: "badge-type",
    location: "badge-location",
    education: "badge-education",
  },

  // Tenant Brand Color Presets
  presets: [
    { name: "Pejuang Navy", main: hex.navBg, sub: hex.primary },
    { name: "Pejuang Orange", main: hex.primary, sub: hex.padiKemakmuran },
    { name: "Sawah Hijau", main: hex.sawahPertumbuhan, sub: hex.padiKemakmuran },
    { name: "Air Kehidupan", main: hex.airKehidupan, sub: hex.sawahPertumbuhan },
    { name: "Api Semangat", main: hex.apiSemangat, sub: hex.padiKemakmuran },
    { name: "Ocean Blue", main: hex.oceanBlue, sub: hex.oceanBlueLight },
    { name: "Modern Teal", main: hex.modernTeal, sub: hex.modernTealLight },
    { name: "Royal Indigo", main: hex.royalIndigo, sub: hex.royalIndigoLight },
    { name: "Slate Classic", main: hex.slateClassic, sub: hex.slateClassicLight },
  ],
};

export interface TenantSubColors {
  sub?: string;
  accent?: string;
  accentBlue?: string;
  sawahPertumbuhan?: string;
  apiSemangat?: string;
  airKehidupan?: string;
  padiKemakmuran?: string;
  [key: string]: any;
}

export const DEFAULT_SUB_COLORS: TenantSubColors = {
  sub: hex.padiKemakmuran,
  accent: hex.accent,
  accentBlue: hex.accentBlue,
  sawahPertumbuhan: hex.sawahPertumbuhan,
  apiSemangat: hex.apiSemangat,
  airKehidupan: hex.airKehidupan,
  padiKemakmuran: hex.padiKemakmuran,
};

/**
 * Parse sub_color from backend (supports JSON object, JSON string, or single hex string)
 */
export function parseSubColor(value: unknown): TenantSubColors {
  if (!value) return { ...DEFAULT_SUB_COLORS };
  
  if (typeof value === "object" && value !== null) {
    return {
      ...DEFAULT_SUB_COLORS,
      ...(value as TenantSubColors),
      sub: (value as any).sub || (value as any).secondary || (value as any).accent || (value as any).padiKemakmuran || DEFAULT_SUB_COLORS.sub,
    };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return {
            ...DEFAULT_SUB_COLORS,
            ...parsed,
            sub: parsed.sub || parsed.secondary || parsed.accent || parsed.padiKemakmuran || DEFAULT_SUB_COLORS.sub,
          };
        }
      } catch {
        // Not valid JSON object string, fallback
      }
    }
    if (trimmed.startsWith("#")) {
      return {
        ...DEFAULT_SUB_COLORS,
        sub: trimmed,
      };
    }
  }

  return { ...DEFAULT_SUB_COLORS };
}

/**
 * Safely extract a single HEX string for sub/accent color
 */
export function getSubColorHex(value: unknown, fallback: string = hex.padiKemakmuran): string {
  if (!value) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) return trimmed;
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed.sub || parsed.secondary || parsed.accent || parsed.padiKemakmuran || fallback;
        }
      } catch {}
    }
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    return obj.sub || obj.secondary || obj.accent || obj.padiKemakmuran || fallback;
  }

  return fallback;
}

/**
 * Serialize sub_color to JSON string for BE payload
 */
export function serializeSubColor(value: TenantSubColors | string | null | undefined): string {
  if (!value) return JSON.stringify(DEFAULT_SUB_COLORS);
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }
  if (trimmed.startsWith("#")) {
    return JSON.stringify({
      ...DEFAULT_SUB_COLORS,
      sub: trimmed,
    });
  }
  return JSON.stringify({
    ...DEFAULT_SUB_COLORS,
    sub: trimmed,
  });
}

