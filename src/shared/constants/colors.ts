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
    outerBg: `bg-[${hex.outerBg}]`,
    leftBg: `bg-[${hex.leftBg}]`,
    rightBg: `bg-[${hex.rightBg}]`,
    textPrimary: `text-[${hex.textDark}] dark:text-[${hex.textDark}]`,
    textAccent: `text-[${hex.accent}]`,
    navBg: `bg-[${hex.navBg}] hover:bg-[${hex.navBgHover}]`,
    
    buttonBg: `bg-[${hex.primary}] hover:bg-[${hex.primaryHover}]`,
    buttonText: "text-white",
    buttonShadow: `shadow-md shadow-[${hex.primary}]/15`,

    // Added back for Dashboard compatibility
    badgeBg: `bg-[${hex.primary}]`,
    badgeIconColor: `text-[${hex.accent}]`,
    heroBg: `bg-[${hex.primary}]`,
    metricNormalBadge: "bg-emerald-500/10 text-emerald-600",
    metricAccentBadge: `bg-[${hex.accent}]/10 text-[${hex.accent}]`,
    metricPrimaryBadge: `bg-[${hex.primary}]/10 text-[${hex.primary}]`,
  },

  // Celengan/Savings Card configuration
  celengan: {
    rumah: {
      gradient: `from-[${hex.sawahPertumbuhan}] to-[${hex.sawahPertumbuhanDark}]`,
      solid: hex.sawahPertumbuhan,
    },
    motor: {
      gradient: `from-[${hex.apiSemangat}] to-[${hex.apiSemangatDark}]`,
      solid: hex.apiSemangat,
    },
    liburanBali: {
      gradient: `from-[${hex.airKehidupan}] to-[${hex.airKehidupanDark}]`,
      solid: hex.airKehidupan,
    },
    laptopBaru: {
      gradient: `from-[${hex.padiKemakmuran}] to-[${hex.padiKemakmuranDark}]`,
      solid: hex.padiKemakmuran,
    },
  },

  // Tunas Loker List badge styles
  badges: {
    type: `bg-[${hex.sawahPertumbuhan}]/10 text-[${hex.sawahPertumbuhanText}] border border-[${hex.sawahPertumbuhan}]/20`,
    location: `bg-[${hex.padiKemakmuran}]/12 text-[${hex.padiKemakmuranText}] border border-[${hex.padiKemakmuran}]/20`,
    education: `bg-[${hex.airKehidupan}]/10 text-[${hex.airKehidupanText}] border border-[${hex.airKehidupan}]/20`,
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
