import { useState } from "react";
import { Star } from "lucide-react";
import ayamkuBg from "@/assets/bg/ayamku-bg.jpg";
import ayamkuPet from "@/assets/bg/ayamku-pet.png";
import logoWhite from "@/assets/logo/logo-white.png";
import { toast } from "sonner";
import type { AyamkuPageProps } from "../types/ayamku.type";

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

// EXACT VECTOR REPLICAS OF THE CHICKEN'S JENGGER & GELAMBIR (Matching reference image exactly)
const JenggerDefaultSVG = () => (
  <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md">
    <path
      d="M20 62 C15 50, 18 35, 32 30 C36 16, 52 14, 65 24 C72 15, 88 18, 90 35 C95 44, 90 56, 80 62"
      fill="#ff2e2e"
      stroke="#2c1a04"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 62 C35 66, 65 66, 80 62"
      fill="none"
      stroke="#2c1a04"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
  </svg>
);

const GelambirDefaultSVG = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-md">
    {/* Left Lobe */}
    <path
      d="M40 25 C30 25, 20 35, 20 54 C20 68, 38 68, 40 56 Z"
      fill="#ff2e2e"
      stroke="#2c1a04"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    {/* Right Lobe */}
    <path
      d="M40 25 C50 25, 60 35, 60 54 C60 68, 42 68, 40 56 Z"
      fill="#ff2e2e"
      stroke="#2c1a04"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);

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


// 20 ACCESSORIES PER CATEGORY CONFIG
const ACCESSORIES = [
  // --- KEPALA (20 Items) ---
  { id: "comb_default", name: "Jengger Ori (Bawaan)", category: "topi" as const, render: () => <JenggerDefaultSVG />, width: 85, top: "20%", left: "47%" },
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

  // --- MATA (20 Items) ---
  { id: "none_mata", name: "Mata Ori (Bawaan)", category: "mata" as const, render: () => null, width: 0, top: "0%", left: "0%" },
  { id: "sunglasses", name: "Kacamata Hitam", category: "mata" as const, render: () => <CoolSunglassesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "roundglasses", name: "Kacamata Bulat", category: "mata" as const, render: () => <RoundGlassesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "eyepatch", name: "Penutup Mata", category: "mata" as const, render: () => <PirateEyepatchSVG />, width: 100, top: "35.5%", left: "46%" },
  { id: "monocle", name: "Monokel Emas", category: "mata" as const, render: () => <MonocleSVG />, width: 95, top: "35.5%", left: "46%" },
  { id: "heartglasses", name: "Kacamata Hati", category: "mata" as const, render: () => <HeartGlassesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "pixelglasses", name: "Kacamata Pixel", category: "mata" as const, render: () => <PixelThugGlassesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "goggles", name: "Kacamata Goggles", category: "mata" as const, render: () => <GogglesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "threed", name: "Kacamata 3D", category: "mata" as const, render: () => <ThreeDGlassesSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "cyborg", name: "Mata Cyborg", category: "mata" as const, render: () => <CyborgEyeSVG />, width: 95, top: "35.5%", left: "46%" },
  { id: "neonvisor", name: "Visor Neon Cyber", category: "mata" as const, render: () => <VisorNeonSVG />, width: 105, top: "35.5%", left: "46%" },
  { id: "emoji_sleep", name: "Masker Tidur", category: "mata" as const, render: () => <span className="text-4xl select-none">😴</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_star", name: "Mata Bintang", category: "mata" as const, render: () => <span className="text-4xl select-none">🤩</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_monocle", name: "Detektif Glass", category: "mata" as const, render: () => <span className="text-4xl select-none">🧐</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_nerd", name: "Kacamata Nerd", category: "mata" as const, render: () => <span className="text-4xl select-none">🤓</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_dizzy", name: "Mata Pusing", category: "mata" as const, render: () => <span className="text-4xl select-none">🌀</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_mask", name: "Masker Medis", category: "mata" as const, render: () => <span className="text-4xl select-none">😷</span>, width: 45, top: "37.5%", left: "46%" },
  { id: "emoji_tears", name: "Mata Mewek", category: "mata" as const, render: () => <span className="text-4xl select-none">😭</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_wink", name: "Mata Genit", category: "mata" as const, render: () => <span className="text-4xl select-none">😉</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_fire", name: "Mata Membara", category: "mata" as const, render: () => <span className="text-4xl select-none">🔥</span>, width: 45, top: "35.5%", left: "46%" },
  { id: "emoji_cool", name: "Visor Gelap", category: "mata" as const, render: () => <span className="text-4xl select-none">🕶️</span>, width: 45, top: "35.5%", left: "46%" },

  // --- DAGU / LEHER (20 Items) ---
  { id: "wattle_default", name: "Gelambir Ori (Bawaan)", category: "leher" as const, render: () => <GelambirDefaultSVG />, width: 50, top: "51.5%", left: "45.5%" },
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
  { id: "emoji_guitar", name: "Gitar Rock", category: "leher" as const, render: () => <span className="text-4xl select-none">🎸</span>, width: 45, top: "68%", left: "48%" },
  { id: "emoji_medal", name: "Medali Emas", category: "leher" as const, render: () => <span className="text-4xl select-none">🥇</span>, width: 45, top: "58%", left: "46%" },
  { id: "emoji_trophy", name: "Piala Juara", category: "leher" as const, render: () => <span className="text-4xl select-none">🏆</span>, width: 45, top: "68%", left: "48%" },
  { id: "emoji_flower", name: "Kalung Hawaii", category: "leher" as const, render: () => <span className="text-4xl select-none">🌸</span>, width: 45, top: "56%", left: "46%" },
  { id: "emoji_clover", name: "Kalung Semanggi", category: "leher" as const, render: () => <span className="text-4xl select-none">🍀</span>, width: 45, top: "56%", left: "46%" },
  { id: "emoji_money", name: "Tas Uang", category: "leher" as const, render: () => <span className="text-4xl select-none">💰</span>, width: 45, top: "68%", left: "46%" },
  { id: "emoji_jalu", name: "Jalu Emas", category: "leher" as const, render: () => <span className="text-4xl select-none">🪙</span>, width: 45, top: "66%", left: "46%" },
  { id: "emoji_star_chain", name: "Bintang Sheriff", category: "leher" as const, render: () => <span className="text-4xl select-none">⭐</span>, width: 45, top: "56%", left: "46%" },
  { id: "emoji_microphone", name: "Mic Penyanyi", category: "leher" as const, render: () => <span className="text-4xl select-none">🎤</span>, width: 45, top: "62%", left: "46%" },
];

export function AyamkuPage({ user: _user }: AyamkuPageProps) {
  const totalPoin = MISI_DATA.filter((m) => m.status === "selesai").reduce((a, m) => a + m.poin, 0);

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

  const handleToggleAccessory = (acc: typeof ACCESSORIES[number]) => {
    setEquipped((prev) => {
      const current = prev[acc.category];
      const isSame = current?.id === acc.id;
      let nextVal = isSame ? null : acc;

      if (nextVal) {
        toast.success(`${acc.name} berhasil dipakai! 🐔✨`);
      } else {
        toast.info(`${acc.name} dilepas.`);
      }

      return {
        ...prev,
        [acc.category]: nextVal,
      };
    });
  };

  const handleResetAccessories = () => {
    setEquipped({ topi: null, mata: null, leher: null });
    toast.info("Aksesoris dikembalikan ke tampilan bawaan.");
  };

  // Default overlay configuration:
  // Render default Jengger on head if no hat is selected.
  // Render default Gelambir on throat if no neckwear/chin accessory is selected.
  const activeTopi = equipped.topi || ACCESSORIES.find(a => a.id === "comb_default")!;
  const activeMata = equipped.mata;
  const activeLeher = equipped.leher || ACCESSORIES.find(a => a.id === "wattle_default")!;

  return (
    <div
      className="-mt-6 -mx-5 -mb-20 h-[calc(100vh-64px)] w-[calc(100%+40px)] relative overflow-hidden"
      style={{
        backgroundImage: `url(${ayamkuBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center 85%",
      }}
    >
      {/* Top Gradient Overlay */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/95 drop-shadow-md">
              Peliharaan
            </span>
            <span className="text-xl font-bold tracking-tight text-white mt-0.5 drop-shadow-md">
              Ayamku
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide shadow-xs">
          <Star className="w-3.5 h-3.5 text-[#fee279]" />
          {totalPoin} Poin
        </div>
      </div>

      {/* Pet Chicken with Accessory Overlays */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-36">
        <div className="relative w-[340px] h-[340px] flex items-center justify-center translate-y-[25px]">
          {/* Base Pet Chicken */}
          <img
            src={ayamkuPet}
            alt="Ayamku Pet"
            className="w-110 h-110 object-contain z-0 select-none"
            onClick={() => toast.success("Petok petok! Ayam kamu sangat bahagia! 🐔💖")}
          />

          {/* Hat / Topi Overlay (Jengger Default rendered only if no hat overrides it) */}
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

          {/* Neck / Leher/Dagu Overlay (Gelambir Default rendered only if no neck accessory overrides it) */}
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

      {/* Accessory Selector Panel */}
      <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-3xl p-4 border border-white/10 z-40 flex flex-col gap-3">
        {/* Category & Reset Action */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {(["topi", "mata", "leher"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab
                  ? "bg-[#e0542c] text-white shadow-xs"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
              >
                {tab === "topi" ? "Topi" : tab === "mata" ? "Mata" : "Leher (Dagu)"}
              </button>
            ))}
          </div>
          {(equipped.topi || equipped.mata || equipped.leher) && (
            <button
              onClick={handleResetAccessories}
              className="text-[8px] font-bold uppercase text-red-400 hover:text-red-300 tracking-wider px-2.5 py-1 bg-red-500/10 border border-red-500/25 rounded-lg transition-all cursor-pointer"
            >
              Default
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/10 w-full" />

        {/* Carousel Grid */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar min-h-[96px] items-center">
          {ACCESSORIES.filter((acc) => acc.category === activeTab).map((acc) => {
            const isEquipped = equipped[acc.category]?.id === acc.id || (!equipped[acc.category] && (acc.id === "comb_default" || acc.id === "wattle_default" || (acc.id === "none_mata" && !equipped.mata)));
            return (
              <button
                key={acc.id}
                onClick={() => handleToggleAccessory(acc)}
                className={`shrink-0 flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer h-20 ${isEquipped
                  ? "bg-[#e0542c]/20 border-[#e0542c] shadow-xs shadow-[#e0542c]/10"
                  : "bg-white/5 hover:bg-white/10 border-white/5"
                  }`}
                style={{ width: "84px" }}
              >
                <div className="h-10 flex items-center justify-center overflow-hidden w-full px-1">
                  <div className="scale-75 w-full flex items-center justify-center">
                    {acc.render() || <span className="text-[10px] font-bold text-white/50">Kosong</span>}
                  </div>
                </div>
                <span className="text-[8.5px] font-bold text-center text-white/90 line-clamp-1 w-full px-0.5 leading-none">
                  {acc.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
