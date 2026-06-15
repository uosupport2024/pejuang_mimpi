/**
 * Configuration for the application's color theme.
 * Custom theme matching the Finexy orange and white layout.
 */
export const THEME_COLORS = {
  hex: {
    outerBg: "#334c7a",       // Dark blue outer background for login
    leftBg: "#f5f4ed",        // Warm cream left column background for login
    rightBg: "#ffffff",       // Solid white right column background
    primary: "#e0542c",       // Finexy Orange
    primaryHover: "#c23f1b",  // Darker Orange
    accent: "#fee279",        // Yellow accent
    textDark: "#1f2937",      // Near black text
    textMuted: "#6b7280",     // Grey text
    navBg: "#1e2a4a",         // Navigation bar blue
    navBgHover: "#161f36",    // Darker navigation bar blue for hover
  },

  classes: {
    outerBg: "bg-[#334c7a]",
    leftBg: "bg-[#f5f4ed]",
    rightBg: "bg-[#ffffff]",
    textPrimary: "text-[#1f2937] dark:text-[#1f2937]",
    textAccent: "text-[#fee279]",
    navBg: "bg-[#1e2a4a] hover:bg-[#161f36]",
    
    buttonBg: "bg-[#e0542c] hover:bg-[#c23f1b]",
    buttonText: "text-white",
    buttonShadow: "shadow-md shadow-[#e0542c]/15",

    // Added back for Dashboard compatibility
    badgeBg: "bg-[#e0542c]",
    badgeIconColor: "text-[#fee279]",
    heroBg: "bg-[#e0542c]",
    metricNormalBadge: "bg-emerald-500/10 text-emerald-600",
    metricAccentBadge: "bg-[#fee279]/10 text-[#fee279]",
    metricPrimaryBadge: "bg-[#e0542c]/10 text-[#e0542c]",
  }
}
