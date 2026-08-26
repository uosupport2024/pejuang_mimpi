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

  // Tenant Brand Color Presets (3 Warna: Sidebar, Navbar, Button)
  presets: [
    { name: "Pejuang Navy", sidebar: "#1E2A4A", navbar: "#2A3B66", button: "#E0542C", main: "#1E2A4A", sub: "#E0542C" },
    { name: "Pejuang Orange", sidebar: "#1F2937", navbar: "#111827", button: "#E0542C", main: "#E0542C", sub: "#F2B233" },
    { name: "Sawah Hijau", sidebar: "#2D4A22", navbar: "#3D6330", button: "#7FA46D", main: "#7FA46D", sub: "#F2B233" },
    { name: "Air Kehidupan", sidebar: "#264347", navbar: "#3A6065", button: "#5C8A90", main: "#5C8A90", sub: "#7FA46D" },
    { name: "Api Semangat", sidebar: "#3D1A10", navbar: "#542517", button: "#F25C2A", main: "#F25C2A", sub: "#F2B233" },
    { name: "Ocean Blue", sidebar: "#0F172A", navbar: "#1E293B", button: "#2563EB", main: "#1E40AF", sub: "#3B82F6" },
    { name: "Modern Teal", sidebar: "#042F2E", navbar: "#115E59", button: "#0D9488", main: "#0F766E", sub: "#14B8A6" },
    { name: "Royal Indigo", sidebar: "#1E1B4B", navbar: "#312E81", button: "#6366F1", main: "#3730A3", sub: "#6366F1" },
    { name: "Slate Classic", sidebar: "#1E293B", navbar: "#334155", button: "#475569", main: "#334C7A", sub: "#64748B" },
    { name: "Sunset Gold", sidebar: "#2A2017", navbar: "#3D2E1E", button: "#F2B233", main: "#F2B233", sub: "#F25C2A" },
  ],
};

export interface GradientStop {
  offset: number; // 0 - 100
  color: string;  // Hex e.g. #FFFFFF
  opacity?: number; // 0 - 100
}

export interface GradientConfig {
  type: "solid" | "linear" | "radial";
  angle?: number; // degrees e.g. 135
  stops?: GradientStop[];
  css?: string;
}

export type ColorOrGradient = string | GradientConfig;

export interface TenantSubColors {
  sub?: string;
  sidebar?: ColorOrGradient;
  navbar?: ColorOrGradient;
  button?: string;
  accent?: string;
  accentBlue?: string;
  sawahPertumbuhan?: string;
  apiSemangat?: string;
  airKehidupan?: string;
  padiKemakmuran?: string;
  [key: string]: any;
}

export const DEFAULT_SUB_COLORS: TenantSubColors = {
  sub: hex.primary,
  sidebar: hex.navBg,
  navbar: hex.navBg,
  button: hex.primary,
  accent: hex.accent,
  accentBlue: hex.accentBlue,
  sawahPertumbuhan: hex.sawahPertumbuhan,
  apiSemangat: hex.apiSemangat,
  airKehidupan: hex.airKehidupan,
  padiKemakmuran: hex.padiKemakmuran,
};

/**
 * Convert color hex with opacity (0-100) to rgba or hex8
 */
export function colorToRgba(hexColor: string, opacity: number = 100): string {
  if (!hexColor) return "rgba(0,0,0,1)";
  const cleanHex = hexColor.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }
  return hexColor;
}

/**
 * Convert a ColorOrGradient value to valid CSS background string
 */
export function buildCssBackground(value: ColorOrGradient | null | undefined, fallback: string = hex.navBg): string {
  if (!value) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("linear-gradient") || trimmed.startsWith("radial-gradient") || trimmed.startsWith("#") || trimmed.startsWith("rgb")) {
      return trimmed;
    }
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return buildCssBackground(parsed, fallback);
      } catch {}
    }
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  }

  if (typeof value === "object" && value !== null) {
    if (value.css) return value.css;
    if (value.type === "solid") {
      const firstStop = value.stops?.[0];
      return firstStop ? colorToRgba(firstStop.color, firstStop.opacity ?? 100) : fallback;
    }
    if (value.type === "linear") {
      const angle = value.angle ?? 135;
      const stops = value.stops && value.stops.length > 0 ? value.stops : [
        { offset: 0, color: fallback, opacity: 100 },
        { offset: 100, color: fallback, opacity: 100 },
      ];
      const stopStrings = stops.map((s) => `${colorToRgba(s.color, s.opacity ?? 100)} ${s.offset}%`).join(", ");
      return `linear-gradient(${angle}deg, ${stopStrings})`;
    }
    if (value.type === "radial") {
      const stops = value.stops && value.stops.length > 0 ? value.stops : [
        { offset: 0, color: fallback, opacity: 100 },
        { offset: 100, color: fallback, opacity: 100 },
      ];
      const stopStrings = stops.map((s) => `${colorToRgba(s.color, s.opacity ?? 100)} ${s.offset}%`).join(", ");
      return `radial-gradient(circle, ${stopStrings})`;
    }
  }

  return fallback;
}

/**
 * Parse any ColorOrGradient into a standardized GradientConfig structure
 */
export function parseBackgroundConfig(value: ColorOrGradient | null | undefined, fallbackColor: string = hex.navBg): GradientConfig {
  if (!value) {
    return {
      type: "solid",
      angle: 135,
      stops: [{ offset: 0, color: fallbackColor, opacity: 100 }],
      css: fallbackColor,
    };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseBackgroundConfig(parsed, fallbackColor);
      } catch {}
    }

    if (trimmed.startsWith("linear-gradient")) {
      // Simple parse for linear-gradient(135deg, #xxx 0%, #yyy 100%)
      const matchAngle = trimmed.match(/linear-gradient\((\d+)deg/i);
      const angle = matchAngle ? parseInt(matchAngle[1], 10) : 135;
      
      // Extract color stops
      const stops: GradientStop[] = [];
      const stopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s*(\d+)%/g;
      let m;
      while ((m = stopRegex.exec(trimmed)) !== null) {
        stops.push({
          color: m[1].startsWith("#") ? m[1] : fallbackColor,
          offset: parseInt(m[2], 10),
          opacity: 100,
        });
      }

      return {
        type: "linear",
        angle,
        stops: stops.length > 0 ? stops : [
          { offset: 0, color: fallbackColor, opacity: 100 },
          { offset: 100, color: hex.primary, opacity: 100 },
        ],
        css: trimmed,
      };
    }

    // Treat as solid hex
    const color = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return {
      type: "solid",
      angle: 135,
      stops: [{ offset: 0, color, opacity: 100 }],
      css: color,
    };
  }

  if (typeof value === "object" && value !== null) {
    return {
      type: value.type || "solid",
      angle: value.angle ?? 135,
      stops: value.stops && value.stops.length > 0 ? value.stops : [{ offset: 0, color: fallbackColor, opacity: 100 }],
      css: buildCssBackground(value, fallbackColor),
    };
  }

  return {
    type: "solid",
    angle: 135,
    stops: [{ offset: 0, color: fallbackColor, opacity: 100 }],
    css: fallbackColor,
  };
}

/**
 * Parse sub_color from backend (supports JSON object, JSON string, or single hex string)
 */
export function parseSubColor(value: unknown): TenantSubColors {
  if (!value) return { ...DEFAULT_SUB_COLORS };
  
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    return {
      ...DEFAULT_SUB_COLORS,
      ...obj,
      sub: obj.sub || obj.button || obj.secondary || obj.accent || DEFAULT_SUB_COLORS.sub,
      button: obj.button || obj.sub || obj.accent || DEFAULT_SUB_COLORS.button,
      navbar: obj.navbar || obj.navBg || DEFAULT_SUB_COLORS.navbar,
      sidebar: obj.sidebar || DEFAULT_SUB_COLORS.sidebar,
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
            sub: parsed.sub || parsed.button || parsed.secondary || parsed.accent || DEFAULT_SUB_COLORS.sub,
            button: parsed.button || parsed.sub || parsed.accent || DEFAULT_SUB_COLORS.button,
            navbar: parsed.navbar || parsed.navBg || DEFAULT_SUB_COLORS.navbar,
            sidebar: parsed.sidebar || DEFAULT_SUB_COLORS.sidebar,
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
        button: trimmed,
      };
    }
  }

  return { ...DEFAULT_SUB_COLORS };
}

/**
 * Safely extract a single HEX string for sub/accent color
 */
export function getSubColorHex(value: unknown, fallback: string = hex.primary): string {
  if (!value) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) return trimmed;
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed.button || parsed.sub || parsed.secondary || parsed.accent || fallback;
        }
      } catch {}
    }
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    return obj.button || obj.sub || obj.secondary || obj.accent || fallback;
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
      button: trimmed,
    });
  }
  return JSON.stringify({
    ...DEFAULT_SUB_COLORS,
    sub: trimmed,
    button: trimmed,
  });
}

