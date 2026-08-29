import { useState, useEffect, useMemo } from "react";
import { Star, Ban, Wand2 } from "lucide-react";
import bgMorning from "@/assets/bg/bg-path-morning.webp";
import bgDay from "@/assets/bg/bg-path.webp";
import bgAfternoon from "@/assets/bg/bg-path-afternoon.webp";
import bgNight from "@/assets/bg/bg-path-night.webp";
import { toast } from "sonner";
import type { AyamkuPageProps } from "../types/ayamku.type";
import { THEME_COLORS } from "@/shared/constants/colors";
import { motion, AnimatePresence } from "motion/react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import pejuangMimpiRiv from "@/assets/rive/pejuang_mimpi.riv";

// Pilih background berdasarkan jam device
function getTimeOfDayBg(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return bgMorning;   // Pagi  05.00 – 10.59
  if (hour >= 11 && hour < 15) return bgDay;       // Siang 11.00 – 14.59
  if (hour >= 15 && hour < 18) return bgAfternoon; // Sore  15.00 – 17.59
  return bgNight;                                   // Malam 18.00 – 04.59
}

type MisiStatus = "selesai" | "berlangsung" | "terlambat";
type MisiKategori = "login" | "absen" | "profil" | "pembelajaran" | "notifikasi" | "pencapaian";

interface Misi {
  id: string;
  judul: string;
  deskripsi: string;
  progres: string;
  status: MisiStatus;
  kategori: MisiKategori;
  poin: number;
}

const MISI_DATA: Misi[] = [
  {
    id: "M-01",
    judul: "Login 7 Hari Berturut-turut",
    deskripsi: "Buka aplikasi dan login setiap hari selama 7 hari penuh tanpa terputus",
    progres: "5/7 Hari",
    status: "berlangsung",
    kategori: "login",
    poin: 50,
  },
];

// --- KEPALA (Hats / Headwear) ---
const StrawHatSVG = () => (
  <svg viewBox="0 0 120 60" className="w-full h-full drop-shadow-md">
    <ellipse cx="60" cy="45" rx="55" ry="12" fill="#e6c280" stroke="#9e7030" strokeWidth="2" />
    <path d="M32 40 C32 12, 88 12, 88 40 Z" fill="#f0d5a6" stroke="#9e7030" strokeWidth="2" />
    <path d="M33 38 C45 36, 75 36, 87 38 L86 42 C75 40, 45 40, 34 42 Z" fill="#ff2e2e" />
  </svg>
);

const TopHatSVG = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
    <ellipse cx="50" cy="65" rx="45" ry="8" fill="#333" stroke="#111" strokeWidth="2" />
    <path d="M22 62 L28 15 C28 12, 72 12, 72 15 L78 62 Z" fill="#1e1e1e" stroke="#111" strokeWidth="2" />
    <path d="M22 60 C35 58, 65 58, 78 60 L76 50 C65 48, 35 48, 24 50 Z" fill="#ff2e2e" />
    <rect x="45" y="48" width="10" height="12" fill="#ffd700" rx="1" />
    <rect x="48" y="51" width="4" height="6" fill="#ff2e2e" />
  </svg>
);

const CrownSVG = () => (
  <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-md">
    <path d="M10 52 L10 25 L30 38 L50 15 L70 38 L90 25 L90 52 Z" fill="#ffd700" stroke="#b8860b" strokeWidth="2" />
    <rect x="10" y="47" width="80" height="6" fill="#d4af37" rx="1" />
    <circle cx="10" cy="25" r="3.5" fill="#ff0000" />
    <circle cx="50" cy="15" r="4.5" fill="#0000ff" />
    <circle cx="90" cy="25" r="3.5" fill="#ff0000" />
  </svg>
);

const BuilderHatSVG = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-md">
    <path d="M15 45 C15 20, 85 20, 85 45 Z" fill="#ffcc00" stroke="#cc9900" strokeWidth="2" />
    <ellipse cx="50" cy="45" rx="42" ry="6" fill="#ffcc00" stroke="#cc9900" strokeWidth="1.5" />
    <rect x="46" y="22" width="8" height="20" fill="#e5b800" rx="1" />
  </svg>
);

const BaseballCapSVG = () => (
  <svg viewBox="0 0 110 60" className="w-full h-full drop-shadow-md">
    <path d="M20 42 C20 15, 80 15, 80 42 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <path d="M15 40 C40 38, 70 38, 95 44 C95 44, 90 49, 75 48 C60 47, 25 45, 15 40 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
    <circle cx="50" cy="16" r="3" fill="#ffffff" />
  </svg>
);

const FirefighterHatSVG = () => (
  <svg viewBox="0 0 110 70" className="w-full h-full drop-shadow-md">
    <path d="M25 48 C25 20, 85 20, 85 48 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
    <ellipse cx="55" cy="48" rx="50" ry="8" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
    <path d="M45 42 L65 42 L60 28 L50 28 Z" fill="#fbbf24" />
    <circle cx="55" cy="35" r="3.5" fill="#dc2626" />
  </svg>
);

const ConicalHatSVG = () => (
  <svg viewBox="0 0 120 60" className="w-full h-full drop-shadow-md">
    <polygon points="60,10 5,50 115,50" fill="#d7c49e" stroke="#b09b74" strokeWidth="2" />
    <line x1="60" y1="10" x2="60" y2="50" stroke="#b09b74" strokeWidth="1.5" />
    <line x1="60" y1="10" x2="30" y2="50" stroke="#b09b74" strokeWidth="1" />
    <line x1="60" y1="10" x2="90" y2="50" stroke="#b09b74" strokeWidth="1" />
  </svg>
);

const ChefHatSVG = () => (
  <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-md">
    <rect x="30" y="55" width="40" height="20" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="2" />
    <path d="M20 50 C10 40, 25 20, 40 28 C50 15, 70 20, 75 32 C90 30, 85 50, 75 55 L25 55 Z" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
  </svg>
);

const LaurelWreathSVG = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
    <path d="M15 35 Q5 15 50 12 Q95 15 85 35" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="20" cy="22" rx="6" ry="3" fill="#22c55e" transform="rotate(-30 20 22)" />
    <ellipse cx="32" cy="15" rx="6" ry="3" fill="#22c55e" transform="rotate(-15 32 15)" />
    <ellipse cx="48" cy="12" rx="6" ry="3" fill="#22c55e" />
    <ellipse cx="68" cy="15" rx="6" ry="3" fill="#22c55e" transform="rotate(15 68 15)" />
    <ellipse cx="80" cy="22" rx="6" ry="3" fill="#22c55e" transform="rotate(30 80 22)" />
  </svg>
);

const ReindeerHornsSVG = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
    <path d="M30 45 L20 15 M20 15 L10 10 M20 15 L28 8 M24 25 L14 26" fill="none" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M70 45 L80 15 M80 15 L90 10 M80 15 L72 8 M76 25 L86 26" fill="none" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M30 45 Q50 52 70 45" fill="none" stroke="#dc2626" strokeWidth="3.5" />
  </svg>
);

const SantaHatSVG = () => (
  <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-md">
    <path d="M25 45 C30 20, 65 10, 80 25 C85 30, 80 40, 75 42 L25 45 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
    <rect x="20" y="40" width="60" height="10" fill="#ffffff" rx="4" />
    <circle cx="78" cy="35" r="7" fill="#ffffff" />
  </svg>
);

const WizardHatSVG = () => (
  <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-md">
    <ellipse cx="50" cy="75" rx="45" ry="8" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
    <path d="M20 72 L50 10 L75 72 Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
    <polygon points="45,35 47,40 52,40 48,43 50,48 45,45 40,48 42,43 38,40 43,40" fill="#fbbf24" />
    <polygon points="58,50 60,53 64,53 61,55 62,59 58,57 54,59 55,55 52,53 56,53" fill="#fbbf24" />
  </svg>
);

const AngelHaloSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <ellipse cx="50" cy="20" rx="35" ry="10" fill="none" stroke="#fef08a" strokeWidth="5.5" opacity="0.9" />
    <ellipse cx="50" cy="20" rx="35" ry="10" fill="none" stroke="#fbbf24" strokeWidth="2" />
  </svg>
);

const DevilHornsSVG = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
    <path d="M25 40 Q15 25 12 10 Q25 15 32 32 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
    <path d="M75 40 Q85 25 88 10 Q75 15 68 32 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
  </svg>
);

const BirthdayHatSVG = () => (
  <svg viewBox="0 0 80 90" className="w-full h-full drop-shadow-md">
    <polygon points="40,10 10,75 70,75" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
    <circle cx="40" cy="8" r="6" fill="#fbbf24" />
    <circle cx="30" cy="40" r="3" fill="#3b82f6" />
    <circle cx="50" cy="55" r="3.5" fill="#10b981" />
    <circle cx="35" cy="65" r="3" fill="#fbbf24" />
  </svg>
);

const GamingHeadsetSVG = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
    <path d="M15 50 C15 15, 85 15, 85 50" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
    <rect x="8" y="40" width="12" height="22" fill="#10b981" rx="4" stroke="#1f2937" strokeWidth="2" />
    <rect x="80" y="40" width="12" height="22" fill="#10b981" rx="4" stroke="#1f2937" strokeWidth="2" />
    <path d="M15 55 L8 62" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const CatEarsSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <polygon points="15,35 10,10 35,28" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
    <polygon points="17,32 14,16 30,27" fill="#fbcfe8" />
    <polygon points="85,35 90,10 65,28" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
    <polygon points="83,32 86,16 70,27" fill="#fbcfe8" />
    <path d="M30 32 Q50 38 70 32" fill="none" stroke="#db2777" strokeWidth="3" />
  </svg>
);

const DetectiveCapSVG = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-md">
    <path d="M20 40 C20 15, 80 15, 80 40 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
    <path d="M10 40 L90 40 L85 46 L15 46 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
    <rect x="42" y="32" width="16" height="8" fill="#fbbf24" rx="1" />
  </svg>
);

const PirateHatSVG = () => (
  <svg viewBox="0 0 110 65" className="w-full h-full drop-shadow-md">
    <path d="M5 45 C15 25, 95 25, 105 45 C80 32, 30 32, 5 45 Z" fill="#1e2937" stroke="#111827" strokeWidth="2" />
    <circle cx="55" cy="35" r="4" fill="#ef4444" />
    <path d="M52 35 L58 35 M55 32 L55 38" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

const FlowerCrownSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <path d="M15 25 Q50 35 85 25" fill="none" stroke="#10b981" strokeWidth="3.5" />
    <circle cx="25" cy="20" r="5" fill="#ec4899" />
    <circle cx="25" cy="20" r="2" fill="#fbbf24" />
    <circle cx="50" cy="24" r="6" fill="#a855f7" />
    <circle cx="50" cy="24" r="2.5" fill="#fbbf24" />
    <circle cx="75" cy="20" r="5" fill="#3b82f6" />
    <circle cx="75" cy="20" r="2" fill="#fbbf24" />
  </svg>
);


// --- MATA (Glasses / Eyes) ---
const CoolSunglassesSVG = () => (
  <svg viewBox="0 0 100 35" className="w-full h-full drop-shadow-md">
    <path d="M10 10 L45 10 L41 28 C30 32, 15 32, 12 25 Z" fill="#111" stroke="#333" strokeWidth="2" />
    <path d="M55 10 L90 10 L88 25 C85 32, 70 32, 59 28 Z" fill="#111" stroke="#333" strokeWidth="2" />
    <path d="M15 13 L32 13 L22 25 Z" fill="rgba(255,255,255,0.25)" />
    <path d="M60 13 L77 13 L67 25 Z" fill="rgba(255,255,255,0.25)" />
    <rect x="42" y="11" width="16" height="4.5" fill="#333" rx="1" />
  </svg>
);

const RoundGlassesSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <circle cx="25" cy="20" r="15" fill="rgba(173,216,230,0.15)" stroke="#ffd700" strokeWidth="3" />
    <circle cx="75" cy="20" r="15" fill="rgba(173,216,230,0.15)" stroke="#ffd700" strokeWidth="3" />
    <path d="M40 20 C45 12, 55 12, 60 20" fill="none" stroke="#ffd700" strokeWidth="3" />
    <path d="M17 12 Q27 10 23 22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
    <path d="M67 12 Q77 10 73 22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
  </svg>
);

const PirateEyepatchSVG = () => (
  <svg viewBox="0 0 100 35" className="w-full h-full drop-shadow-md">
    <line x1="5" y1="5" x2="95" y2="25" stroke="#111" strokeWidth="3.5" />
    <path d="M12 8 L42 12 L38 30 C30 33, 18 32, 15 25 Z" fill="#111" stroke="#222" strokeWidth="1.5" />
  </svg>
);

const MonocleSVG = () => (
  <svg viewBox="0 0 100 45" className="w-full h-full drop-shadow-md">
    <circle cx="68" cy="20" r="12" fill="rgba(173,216,230,0.1)" stroke="#ffd700" strokeWidth="2.5" />
    <path d="M78 26 Q90 35 85 45" fill="none" stroke="#ffd700" strokeWidth="1.5" />
  </svg>
);

const HeartGlassesSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <path d="M12 12 C12 5, 27 5, 27 12 C27 5, 42 5, 42 12 C42 22, 27 30, 27 32 C27 30, 12 22, 12 12 Z" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
    <path d="M58 12 C58 5, 73 5, 73 12 C73 5, 88 5, 88 12 C88 22, 73 30, 73 32 C73 30, 58 22, 58 12 Z" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
    <line x1="42" y1="18" x2="58" y2="18" stroke="#db2777" strokeWidth="3" />
  </svg>
);

const PixelThugGlassesSVG = () => (
  <svg viewBox="0 0 100 30" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
    <rect x="10" y="10" width="80" height="6" fill="#000000" />
    <rect x="15" y="16" width="22" height="6" fill="#000000" />
    <rect x="63" y="16" width="22" height="6" fill="#000000" />
    <rect x="20" y="12" width="6" height="3" fill="#ffffff" />
    <rect x="68" y="12" width="6" height="3" fill="#ffffff" />
  </svg>
);

const GogglesSVG = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-md">
    <rect x="10" y="10" width="80" height="20" rx="10" fill="#1e2937" stroke="#4b5563" strokeWidth="2" />
    <circle cx="30" cy="20" r="8" fill="#93c5fd" opacity="0.8" />
    <circle cx="70" cy="20" r="8" fill="#93c5fd" opacity="0.8" />
  </svg>
);

const ThreeDGlassesSVG = () => (
  <svg viewBox="0 0 100 35" className="w-full h-full drop-shadow-md">
    <rect x="10" y="8" width="80" height="20" fill="#ffffff" stroke="#000000" strokeWidth="2.5" rx="3" />
    <rect x="15" y="12" width="30" height="12" fill="#ef4444" />
    <rect x="55" y="12" width="30" height="12" fill="#3b82f6" />
    <rect x="45" y="10" width="10" height="5" fill="#000000" />
  </svg>
);

const CyborgEyeSVG = () => (
  <svg viewBox="0 0 100 35" className="w-full h-full drop-shadow-md">
    <circle cx="28" cy="18" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
    <circle cx="28" cy="18" r="2.5" fill="#ffffff" className="animate-pulse" />
    <path d="M12 18 L20 18 M36 18 L48 18" stroke="#ef4444" strokeWidth="1.5" />
  </svg>
);

const VisorNeonSVG = () => (
  <svg viewBox="0 0 100 30" className="w-full h-full drop-shadow-md">
    <path d="M10 8 L90 8 L85 24 L15 24 Z" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="2.5" />
    <line x1="12" y1="12" x2="88" y2="12" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
  </svg>
);


// --- DAGU / LEHER (Collar / Neckwear / Spur) ---
const BowTieSVG = () => (
  <svg viewBox="0 0 80 40" className="w-full h-full drop-shadow-md">
    <path d="M10 10 L40 20 L10 30 Z" fill="#ff2e2e" stroke="#a31010" strokeWidth="2.5" />
    <path d="M70 10 L40 20 L70 30 Z" fill="#ff2e2e" stroke="#a31010" strokeWidth="2.5" />
    <circle cx="40" cy="20" r="8" fill="#a31010" />
  </svg>
);

const BlackBowTieSVG = () => (
  <svg viewBox="0 0 80 40" className="w-full h-full drop-shadow-md">
    <path d="M10 10 L40 20 L10 30 Z" fill="#1f2937" stroke="#111827" strokeWidth="2.5" />
    <path d="M70 10 L40 20 L70 30 Z" fill="#1f2937" stroke="#111827" strokeWidth="2.5" />
    <circle cx="40" cy="20" r="8" fill="#111827" />
  </svg>
);

const NecktieSVG = () => (
  <svg viewBox="0 0 40 100" className="w-full h-full drop-shadow-md">
    <path d="M10 5 L30 5 L25 20 L15 20 Z" fill="#ff2e2e" stroke="#a31010" strokeWidth="2" />
    <path d="M15 20 L25 20 L30 85 L20 98 L10 85 Z" fill="#ff2e2e" stroke="#a31010" strokeWidth="2" />
    <path d="M12 30 L27 45" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" />
    <path d="M11 50 L29 68" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" />
    <path d="M11 70 L25 84" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" />
  </svg>
);

const BlueNecktieSVG = () => (
  <svg viewBox="0 0 40 100" className="w-full h-full drop-shadow-md">
    <path d="M10 5 L30 5 L25 20 L15 20 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <path d="M15 20 L25 20 L30 85 L20 98 L10 85 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
  </svg>
);

const BossChainSVG = () => (
  <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-md">
    <path d="M10 10 Q50 50 90 10" fill="none" stroke="#ffd700" strokeWidth="4.5" />
    <g transform="translate(23, 26)">
      <rect x="0" y="0" width="54" height="24" fill="#ffd700" stroke="#b8860b" strokeWidth="2.5" rx="5" />
      <text x="27" y="17" fill="#111" fontSize="12" fontWeight="900" textAnchor="middle" letterSpacing="1">
        BOSS
      </text>
    </g>
  </svg>
);

const GoldChainDiamondSVG = () => (
  <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-md">
    <path d="M15 10 Q50 45 85 10" fill="none" stroke="#ffd700" strokeWidth="4.5" />
    <polygon points="50,28 62,40 50,55 38,40" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
  </svg>
);

const BlueScarfSVG = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
    <path d="M15 15 C15 30, 85 30, 85 15 L80 28 C80 35, 20 35, 20 28 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
    <path d="M22 28 L15 48 L27 48 Z" fill="#2563eb" />
  </svg>
);

const MagicScarfSVG = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
    <path d="M15 15 C15 30, 85 30, 85 15 L80 28 C80 35, 20 35, 20 28 Z" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="2" />
    <path d="M22 28 L15 48 L27 48 Z" fill="#f59e0b" />
  </svg>
);

const BellCollarSVG = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
    <path d="M15 12 Q50 32 85 12" fill="none" stroke="#dc2626" strokeWidth="5.5" strokeLinecap="round" />
    <circle cx="50" cy="25" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <circle cx="50" cy="29" r="2" fill="#111827" />
  </svg>
);

const BandanaNeckSVG = () => (
  <svg viewBox="0 0 90 60" className="w-full h-full drop-shadow-md">
    <polygon points="15,10 75,10 45,45" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    <circle cx="30" cy="18" r="2.5" fill="#ffffff" />
    <circle cx="60" cy="18" r="2.5" fill="#ffffff" />
    <circle cx="45" cy="30" r="2.5" fill="#ffffff" />
  </svg>
);


// CURATED WEARABLE ACCESSORIES
const ACCESSORIES = [
  // --- KEPALA / TOPI ---
  { id: "none_topi", name: "Bawaan", category: "topi" as const, render: () => <Ban className="w-5 h-5 text-white/40" />, width: 0, top: "0%", left: "0%" },
  { id: "straw", name: "Topi Jerami", category: "topi" as const, render: () => <StrawHatSVG />, width: 170, top: "18%", left: "47%" },
  { id: "tophat", name: "Topi Tinggi", category: "topi" as const, render: () => <TopHatSVG />, width: 115, top: "12%", left: "47%" },
  { id: "crown", name: "Mahkota Emas", category: "topi" as const, render: () => <CrownSVG />, width: 110, top: "18%", left: "47%" },
  { id: "builder", name: "Helm Proyek", category: "topi" as const, render: () => <BuilderHatSVG />, width: 115, top: "18%", left: "47%" },
  { id: "baseball", name: "Topi Baseball", category: "topi" as const, render: () => <BaseballCapSVG />, width: 120, top: "18%", left: "47%" },
  { id: "firefighter", name: "Helm Damkar", category: "topi" as const, render: () => <FirefighterHatSVG />, width: 120, top: "17%", left: "47%" },
  { id: "conical", name: "Caping Bambu", category: "topi" as const, render: () => <ConicalHatSVG />, width: 135, top: "18%", left: "47%" },
  { id: "chef", name: "Topi Koki", category: "topi" as const, render: () => <ChefHatSVG />, width: 115, top: "12%", left: "47%" },
  { id: "laurel", name: "Daun Laurel", category: "topi" as const, render: () => <LaurelWreathSVG />, width: 115, top: "19%", left: "47%" },
  { id: "reindeer", name: "Tanduk Rusa", category: "topi" as const, render: () => <ReindeerHornsSVG />, width: 120, top: "12%", left: "47%" },
  { id: "santa", name: "Topi Santa", category: "topi" as const, render: () => <SantaHatSVG />, width: 115, top: "18%", left: "47%" },
  { id: "wizard", name: "Topi Penyihir", category: "topi" as const, render: () => <WizardHatSVG />, width: 125, top: "12%", left: "47%" },
  { id: "halo", name: "Halo Malaikat", category: "topi" as const, render: () => <AngelHaloSVG />, width: 100, top: "9%", left: "47%" },
  { id: "devil", name: "Tanduk Iblis", category: "topi" as const, render: () => <DevilHornsSVG />, width: 90, top: "16%", left: "47%" },
  { id: "birthday", name: "Topi Ultah", category: "topi" as const, render: () => <BirthdayHatSVG />, width: 95, top: "12%", left: "47%" },
  { id: "gaming", name: "Headset Gaming", category: "topi" as const, render: () => <GamingHeadsetSVG />, width: 115, top: "20%", left: "47%" },
  { id: "catears", name: "Bando Kucing", category: "topi" as const, render: () => <CatEarsSVG />, width: 105, top: "18%", left: "47%" },
  { id: "detective", name: "Topi Detektif", category: "topi" as const, render: () => <DetectiveCapSVG />, width: 110, top: "18%", left: "47%" },
  { id: "pirate", name: "Topi Bajak Laut", category: "topi" as const, render: () => <PirateHatSVG />, width: 125, top: "17%", left: "47%" },
  { id: "flower_crown", name: "Bando Bunga", category: "topi" as const, render: () => <FlowerCrownSVG />, width: 110, top: "21%", left: "47%" },

  // --- MATA (Kacamata & Visor) ---
  { id: "none_mata", name: "Bawaan", category: "mata" as const, render: () => <Ban className="w-5 h-5 text-white/40" />, width: 0, top: "0%", left: "0%" },
  { id: "sunglasses", name: "Kacamata Hitam", category: "mata" as const, render: () => <CoolSunglassesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "roundglasses", name: "Kacamata Bulat", category: "mata" as const, render: () => <RoundGlassesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "eyepatch", name: "Penutup Mata", category: "mata" as const, render: () => <PirateEyepatchSVG />, width: 100, top: "28%", left: "47.5%" },
  { id: "monocle", name: "Monokel Emas", category: "mata" as const, render: () => <MonocleSVG />, width: 95, top: "28%", left: "47.5%" },
  { id: "heartglasses", name: "Kacamata Hati", category: "mata" as const, render: () => <HeartGlassesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "pixelglasses", name: "Kacamata Pixel", category: "mata" as const, render: () => <PixelThugGlassesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "goggles", name: "Kacamata Goggles", category: "mata" as const, render: () => <GogglesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "threed", name: "Kacamata 3D", category: "mata" as const, render: () => <ThreeDGlassesSVG />, width: 105, top: "28%", left: "47.5%" },
  { id: "cyborg", name: "Mata Cyborg", category: "mata" as const, render: () => <CyborgEyeSVG />, width: 95, top: "28%", left: "47.5%" },
  { id: "neonvisor", name: "Visor Neon Cyber", category: "mata" as const, render: () => <VisorNeonSVG />, width: 105, top: "28%", left: "47.5%" },

  // --- LEHER / DASI / KALUNG ---
  { id: "none_leher", name: "Bawaan", category: "leher" as const, render: () => <Ban className="w-5 h-5 text-white/40" />, width: 0, top: "0%", left: "0%" },
  { id: "redbowtie", name: "Bowtie Merah", category: "leher" as const, render: () => <BowTieSVG />, width: 80, top: "54%", left: "43%" },
  { id: "blackbowtie", name: "Bowtie Hitam", category: "leher" as const, render: () => <BlackBowTieSVG />, width: 80, top: "54%", left: "43%" },
  { id: "redtie", name: "Dasi Strip", category: "leher" as const, render: () => <NecktieSVG />, width: 40, top: "62%", left: "45%" },
  { id: "bluetie", name: "Dasi Biru", category: "leher" as const, render: () => <BlueNecktieSVG />, width: 40, top: "62%", left: "45%" },
  { id: "bosschain", name: "Kalung BOSS", category: "leher" as const, render: () => <BossChainSVG />, width: 100, top: "57%", left: "45%" },
  { id: "diamondchain", name: "Kalung Berlian", category: "leher" as const, render: () => <GoldChainDiamondSVG />, width: 95, top: "57%", left: "45%" },
  { id: "bluescarf", name: "Syal Biru", category: "leher" as const, render: () => <BlueScarfSVG />, width: 115, top: "58%", left: "45%" },
  { id: "magicscarf", name: "Syal Sihir", category: "leher" as const, render: () => <MagicScarfSVG />, width: 115, top: "58%", left: "45%" },
  { id: "bellcollar", name: "Kalung Lonceng", category: "leher" as const, render: () => <BellCollarSVG />, width: 105, top: "55%", left: "45%" },
  { id: "bandananeck", name: "Slayer Merah", category: "leher" as const, render: () => <BandanaNeckSVG />, width: 100, top: "55%", left: "45%" },
];

// RIVE ANIMATED PET CHICKEN COMPONENT
function RivePetChicken({ isTalking = false }: { isTalking?: boolean }) {
  const { rive, RiveComponent } = useRive({
    src: pejuangMimpiRiv,
    stateMachines: ["Blink State", "Talking State"],
    autoplay: true, // False agar Talking State tidak otomatis loop terus menerus
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const triggerTalking = useStateMachineInput(rive, "Talking State", "Trigger 1");

  // Jalankan animasi Blink secara independen sesuai interval 3 detik
  useEffect(() => {
    if (!rive) return;

    // Pastikan Talking State dalam posisi pause saat awal
    rive.pause("Talking State");
    rive.pause("Talking");

  }, [rive]);

  // Kontrol Talking State: HANYA berjalan ketika isTalking bernilai true
  useEffect(() => {
    if (!rive) return;

    if (isTalking) {
      // Nyalakan Talking State saat sedang bicara
      rive.play("Talking State");
      rive.play("Talking");
      if (triggerTalking) {
        triggerTalking.fire();
      }
    } else {
      // Hentikan/pause Talking State saat selesai bicara
      rive.pause("Talking State");
      rive.pause("Talking");
    }
  }, [isTalking, rive, triggerTalking]);

  return (
    <div className="w-110 h-110 relative z-10 select-none pointer-events-none flex items-center justify-center">
      <RiveComponent className="w-full h-full" />
    </div>
  );
}

// GENTLE BREEZE & FLOATING PARTICLES EFFECT
function GentleBreeze() {
  // Pre-configured wind stream lines
  const windStreams = [
    { id: 1, top: "22%", width: 140, duration: 6.5, delay: 0 },
    { id: 2, top: "45%", width: 180, duration: 7.2, delay: 2.2 },
    { id: 3, top: "68%", width: 130, duration: 5.8, delay: 4.1 },
    { id: 4, top: "35%", width: 160, duration: 8.0, delay: 1.2 },
  ];

  // Pre-configured floating leaves & petals
  const floatingLeaves = [
    { id: 1, startTop: "18%", color: "#86efac", size: 10, duration: 9.0, delay: 0, scale: 0.9 },
    { id: 2, startTop: "32%", color: "#fef08a", size: 12, duration: 11.5, delay: 2.5, scale: 1 },
    { id: 3, startTop: "50%", color: "#4ade80", size: 8, duration: 8.2, delay: 4.8, scale: 0.8 },
    { id: 4, startTop: "65%", color: "#fbcfe8", size: 9, duration: 10.0, delay: 1.0, scale: 0.85 },
    { id: 5, startTop: "28%", color: "#bbf7d0", size: 11, duration: 12.0, delay: 6.2, scale: 0.95 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-5 select-none">
      {/* Soft Wind Stream Gusts */}
      {windStreams.map((w) => (
        <motion.div
          key={`wind-${w.id}`}
          initial={{ x: "-120%", opacity: 0 }}
          animate={{
            x: ["-100%", "550%"],
            opacity: [0, 0.45, 0.6, 0.4, 0],
          }}
          transition={{
            duration: w.duration,
            repeat: Infinity,
            delay: w.delay,
            ease: "easeInOut",
          }}
          style={{ top: w.top, width: `${w.width}px` }}
          className="absolute h-6 flex items-center"
        >
          <svg viewBox="0 0 200 24" fill="none" className="w-full h-full stroke-white/40 filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.3)]">
            <path
              d="M0 12 C 40 4, 80 20, 130 10 C 160 4, 185 8, 200 12"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="160 40"
            />
          </svg>
        </motion.div>
      ))}

      {/* Floating Gentle Leaves & Petals */}
      {floatingLeaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          initial={{ x: "-10%", y: 0, rotate: 0, opacity: 0 }}
          animate={{
            x: ["-10%", "520%"],
            y: [0, -18, 14, -10, 16, -6, 0],
            rotate: [0, 90, 180, 290, 360],
            opacity: [0, 0.75, 0.9, 0.75, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear",
          }}
          style={{
            top: leaf.startTop,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
          }}
          className="absolute"
        >
          <svg viewBox="0 0 24 24" fill={leaf.color} className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] opacity-80">
            {/* Organic leaf petal shape */}
            <path d="M12 2 C16 6, 22 10, 22 16 C22 20, 18 22, 14 22 C8 22, 2 16, 2 12 C2 6, 8 2, 12 2 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function AyamkuPage({ user: _user }: AyamkuPageProps) {
  const totalPoin = MISI_DATA.filter((m) => m.status === "selesai").reduce((a, m) => a + m.poin, 0);

  // Background dinamis berdasarkan jam device — hanya dihitung saat pertama mount
  const currentBg = useMemo(() => getTimeOfDayBg(), []);

  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"topi" | "mata" | "leher">("topi");
  const [equipped, setEquipped] = useState<{
    topi: typeof ACCESSORIES[number] | null;
    mata: typeof ACCESSORIES[number] | null;
    leher: typeof ACCESSORIES[number] | null;
  }>({
    topi: null,
    mata: null,
    leher: null,
  });

  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; drift: number; rotate: number; emoji: string }>>([]);
  const [isTalking, setIsTalking] = useState(true);
  const [dialogueText, setDialogueText] = useState<string>("Selamat sore! 🌅 Semangat terus ya pejuang mimpi!");

  // Audio effect chirp lucu khas maskot jika browser tidak memiliki voice Indonesia
  const playPetChirpSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const freqs = [659.25, 880.00, 1046.50]; // E5, A5, C6 (ceria & imut)
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        const startTime = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch {
      // Audio fallback silently
    }
  };

  // Mencari voice Bahasa Indonesia asli di browser / OS
  const getIndonesianVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Cari voice yang benar-benar Bahasa Indonesia
    const idVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith("id") ||
        v.lang.toLowerCase().startsWith("in") ||
        v.name.toLowerCase().includes("indonesia") ||
        v.name.toLowerCase().includes("bahasa") ||
        v.name.toLowerCase().includes("gadis") ||
        v.name.toLowerCase().includes("ardi")
    );

    if (idVoices.length > 0) {
      // Prioritaskan suara Natural / Google / Gadis / Ardi
      const naturalVoice = idVoices.find(
        (v) =>
          v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("online") ||
          v.name.toLowerCase().includes("gadis") ||
          v.name.toLowerCase().includes("ardi") ||
          v.name.toLowerCase().includes("google")
      );
      return naturalVoice || idVoices[0];
    }

    return null;
  };

  const speakGreeting = (text: string) => {
    setDialogueText(text);
    setIsTalking(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const voice = getIndonesianVoice();

        // HANYA gunakan TTS jika OS/browser memiliki voice Indonesia asli
        // Mencegah voice default bahasa Inggris membaca teks Indonesia yang menimbulkan aksen bule
        if (voice) {
          const cleanText = text
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
            .replace(/!+/g, "!")
            .trim();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.voice = voice;
          utterance.lang = voice.lang || "id-ID";
          utterance.rate = 1.05;
          utterance.pitch = 1.22;

          utterance.onend = () => setIsTalking(false);
          utterance.onerror = () => setIsTalking(false);

          window.speechSynthesis.speak(utterance);
        } else {
          // Jika OS tidak punya voice Indonesia, bunyikan efek suara maskot ceria
          playPetChirpSound();
        }
      } catch {
        playPetChirpSound();
      }
    } else {
      playPetChirpSound();
    }

    setTimeout(() => {
      setIsTalking(false);
    }, 3800);
  };

  // Pre-load voices dan bicara sapaan awal
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Trigger preload daftar voice di browser
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    const timer = setTimeout(() => {
      speakGreeting("Selamat sore! 🌅 Semangat terus ya pejuang mimpi!");
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handlePetTap = () => {
    // Spawn 1-2 floating joy emojis
    const emojis = ["💖", "✨", "🐣", "⭐", "🎉", "🌾", "❤️"];
    const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 120,
      drift: (Math.random() - 0.5) * 60,
      rotate: (Math.random() - 0.5) * 40,
      emoji: chosenEmoji,
    };

    setFloatingHearts((prev) => [...prev.slice(-6), newHeart]);

    const randomDialogues = [
      "Selamat sore! 🌅 Tetap semangat ya pejuang mimpi!",
      "Kukuruyuuuk! 🐔 Kamu hebat, pasti bisa!",
      "Ayo, selesaikan misimu hari ini ya! 🎯",
      "Yuk, jangan lupa menabung di celenganmu! 💰",
      "Setiap langkah kecil membawamu lebih dekat ke impian! ✨",
      "Aku selalu siap nemenin kamu berjuang, semangat ya! 🐣💛",
    ];
    const picked = randomDialogues[Math.floor(Math.random() * randomDialogues.length)];
    speakGreeting(picked);
  };

  const handleToggleAccessory = (acc: typeof ACCESSORIES[number]) => {
    if (acc.id.startsWith("none_")) {
      setEquipped((prev) => ({
        ...prev,
        [acc.category]: null,
      }));
      toast.info("Tampilan Bawaan", {
        description: `Aksesoris ${acc.category === "topi" ? "topi" : acc.category === "mata" ? "kacamata" : "leher"} dilepas.`
      });
      return;
    }

    setEquipped((prev) => {
      const current = prev[acc.category];
      const isSame = current?.id === acc.id;
      const nextVal = isSame ? null : acc;

      if (nextVal) {
        toast.success("Aksesoris Dipakai", {
          description: `${acc.name} berhasil dipakai! 🐔✨`
        });
      } else {
        toast.info("Aksesoris Dilepas", {
          description: `${acc.name} dilepas.`
        });
      }

      return {
        ...prev,
        [acc.category]: nextVal,
      };
    });
  };

  const handleResetAccessories = () => {
    setEquipped({ topi: null, mata: null, leher: null });
    toast.info("Tampilan Bawaan", {
      description: "Semua aksesoris dikembalikan ke tampilan bawaan."
    });
  };

  // Only render overlays when an accessory is explicitly equipped (and not "none_")
  const activeTopi = equipped.topi && !equipped.topi.id.startsWith("none_") ? equipped.topi : null;
  const activeMata = equipped.mata && !equipped.mata.id.startsWith("none_") ? equipped.mata : null;
  const activeLeher = equipped.leher && !equipped.leher.id.startsWith("none_") ? equipped.leher : null;

  return (
    <div
      className="-mt-6 -mx-5 -mb-20 h-[calc(100vh-64px)] w-[calc(100%+40px)] relative overflow-hidden"
      style={{
        backgroundImage: `url(${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center 60%",
      }}
    >
      {/* Top Gradient Overlay */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Gentle Breeze Ambient Effect */}
      <GentleBreeze />

      {/* Top Header Overlay — top disesuaikan dengan notification bar mobile */}
      <div
        className="absolute left-6 right-6 flex justify-end items-center gap-2 z-10"
        style={{ top: "calc(2.5rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* Poin Badge — kiri */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide shadow-xs">
          <Star style={{ color: THEME_COLORS.hex.accent }} className="w-3.5 h-3.5" />
          {totalPoin} Poin
        </div>
        {/* Makeover toggle button — kanan */}
        <button
          onClick={() => setShowPanel((v) => !v)}
          style={showPanel ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer border border-white/20 backdrop-blur-xs ${showPanel
            ? "text-white"
            : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white"
            }`}
          title="Pilih Aksesoris"
        >
          <Wand2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pet Chicken with Accessory Overlays */}
      <div className="absolute inset-0 flex items-center justify-center pt-36 pb-4">
        <div className="relative w-[340px] h-[340px] flex items-center justify-center translate-y-[25px]">
          {/* Floating Joy Particles / Emojis on Tap */}
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.5, x: h.x, y: 20, rotate: h.rotate }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0.5, 1.4, 1.1],
                y: -140,
                x: h.x + h.drift,
                rotate: h.rotate + 30,
              }}
              transition={{ duration: 0.95, ease: "easeOut" }}
              className="absolute top-[20%] left-1/2 -translate-x-1/2 pointer-events-none select-none z-50 text-3xl filter drop-shadow-md"
            >
              {h.emoji}
            </motion.div>
          ))}

          {/* Ground Contact Shadows (tenang / static) */}
          <div className="absolute top-[83%] left-1/2 -translate-x-1/2 w-48 h-4.5 bg-black/25 rounded-[100%] blur-[4px] pointer-events-none z-0" />
          <div className="absolute top-[83.5%] left-[39%] -translate-x-1/2 w-14 h-2.5 bg-black/45 rounded-[100%] blur-[1.5px] pointer-events-none z-0" />
          <div className="absolute top-[83.5%] left-[57%] -translate-x-1/2 w-14 h-2.5 bg-black/45 rounded-[100%] blur-[1.5px] pointer-events-none z-0" />

          {/* Chicken Body: Diam dan tenang, tidak meloncat saat ditap */}
          <div
            onClick={handlePetTap}
            className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
          >
            {/* Speech Bubble saat bicara */}
            <AnimatePresence>
              {isTalking && dialogueText && (
                <motion.div
                  key="dialogue-speech-bubble"
                  initial={{ opacity: 0, y: 12, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.85 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 bg-white/95 text-slate-800 px-3.5 py-1.5 rounded-2xl shadow-xl border border-amber-300/80 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap pointer-events-none drop-shadow-md"
                >
                  <span className="text-sm">🐔💬</span>
                  <span className="leading-none">{dialogueText}</span>
                  {/* Bubble Pointer */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-white/95" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Base Pet Chicken with Rive Animation */}
            <RivePetChicken isTalking={isTalking} />

            {/* Hat / Topi Overlay */}
            {activeTopi && (
              <div
                className="absolute pointer-events-none z-20 select-none"
                style={{
                  top: activeTopi.top,
                  left: activeTopi.left,
                  width: `${activeTopi.width}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {activeTopi.render()}
              </div>
            )}

            {/* Eyes / Mata Overlay */}
            {activeMata && (
              <div
                className="absolute pointer-events-none z-30 select-none"
                style={{
                  top: activeMata.top,
                  left: activeMata.left,
                  width: `${activeMata.width}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {activeMata.render()}
              </div>
            )}

            {/* Neck / Leher Overlay */}
            {activeLeher && (
              <div
                className="absolute pointer-events-none z-10 select-none"
                style={{
                  top: activeLeher.top,
                  left: activeLeher.left,
                  width: `${activeLeher.width}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {activeLeher.render()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessory Selector Panel — dikontrol dari icon header */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="accessory-panel"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-[88px] left-4 right-4 bg-black/60 backdrop-blur-md rounded-3xl p-3.5 border border-white/10 z-40 flex flex-col gap-2.5 shadow-xl"
          >
            {/* Category & Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {(["topi", "mata", "leher"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={activeTab === tab ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                    className={`px-3.5 py-1.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab
                      ? "text-white shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                  >
                    {tab === "topi" ? "Topi" : tab === "mata" ? "Mata" : "Leher (Dagu)"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {(equipped.topi || equipped.mata || equipped.leher) && (
                  <button
                    onClick={handleResetAccessories}
                    className="text-[8px] font-bold uppercase text-red-400 hover:text-red-300 tracking-wider px-2.5 py-1 bg-red-500/10 border border-red-500/25 rounded-lg transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/10 w-full" />

            {/* Carousel Grid */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar min-h-[80px] items-center">
              {ACCESSORIES.filter((acc) => acc.category === activeTab).map((acc) => {
                const currentEquipped = equipped[acc.category];
                const isEquipped = (!currentEquipped && acc.id.startsWith("none_")) || (currentEquipped?.id === acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleToggleAccessory(acc)}
                    style={isEquipped ? {
                      backgroundColor: `${THEME_COLORS.hex.primary}33`,
                      borderColor: THEME_COLORS.hex.primary,
                      width: "78px"
                    } : { width: "78px" }}
                    className={`shrink-0 flex flex-col items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer h-[72px] ${isEquipped ? "shadow-xs" : "bg-white/5 hover:bg-white/10 border-white/5"
                      }`}
                  >
                    <div className="h-9 flex items-center justify-center overflow-hidden w-full px-1">
                      <div className="scale-75 w-full flex items-center justify-center">
                        {acc.render()}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-center text-white/90 line-clamp-1 w-full px-0.5 leading-none">
                      {acc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
