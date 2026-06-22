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
    
    // Celengan & Nature Palette
    sawahPertumbuhan: "#7FA46D",
    apiSemangat: "#F25C2A",
    airKehidupan: "#5C8A90",
    padiKemakmuran: "#F2B233",
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
  },

  // Celengan/Savings Card configuration
  celengan: {
    rumah: {
      gradient: "from-[#7FA46D] to-[#5C824C]",
      solid: "#7FA46D",
    },
    motor: {
      gradient: "from-[#F25C2A] to-[#C54117]",
      solid: "#F25C2A",
    },
    liburanBali: {
      gradient: "from-[#5C8A90] to-[#3F686D]",
      solid: "#5C8A90",
    },
    laptopBaru: {
      gradient: "from-[#F2B233] to-[#C58F1B]",
      solid: "#F2B233",
    },
  },

  // Tunas Loker List badge styles
  badges: {
    type: "bg-[#7FA46D]/10 text-[#516b46] border border-[#7FA46D]/20",       // Sawah Pertumbuhan (Green)
    location: "bg-[#F2B233]/12 text-[#916715] border border-[#F2B233]/20",   // Padi Kemakmuran (Yellow)
    education: "bg-[#5C8A90]/10 text-[#3b595d] border border-[#5C8A90]/20",  // Air Kehidupan (Blue-Teal)
  }
}
