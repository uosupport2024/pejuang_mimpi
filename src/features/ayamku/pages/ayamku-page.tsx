import { useState, useEffect, useMemo, useRef } from "react";
import { Star, Wand2, X, Compass } from "lucide-react";
import bgMorning from "@/assets/bg/bg-path-morning.webp";
import bgDay from "@/assets/bg/bg-path.webp";
import bgAfternoon from "@/assets/bg/bg-path-afternoon.webp";
import bgNight from "@/assets/bg/bg-path-night.webp";
import type { AyamkuPageProps } from "../types/ayamku.type";
import { THEME_COLORS } from "@/shared/constants/colors";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "@/shared/router/router";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import pejuangMimpiRiv from "@/assets/rive/pejuang_mimpi.riv";
import jaluSvg from "@/assets/accessories/jalu.svg";
import sorbanImg from "@/assets/accessories/sorban.webp";
import sorban1Img from "@/assets/accessories/sorban-1.webp";
import sorban2Img from "@/assets/accessories/sorban-2.webp";
import sorban3Img from "@/assets/accessories/sorban-3.webp";
import sorban4Img from "@/assets/accessories/sorban-4.webp";
import sorban5Img from "@/assets/accessories/sorban-5.webp";

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

// PALET WARNA PECI
const PECI_COLORS = [
  { name: "Hitam Klasik", hex: "#231f20" },
  { name: "Putih", hex: "#f8fafc" },
  { name: "Merah Marun", hex: "#7f1d1d" },
  { name: "Hijau Santri", hex: "#15803d" },
  { name: "Biru Dongker", hex: "#1e3a8a" },
  { name: "Coklat", hex: "#582f0e" },
  { name: "Ungu", hex: "#581c87" },
  { name: "Kuning Emas", hex: "#b45309" },
];

// DAFTAR MOTIF / POLA PECI
const PECI_PATTERNS = [
  { id: "polos", name: "Polos" },
  { id: "garis_emas", name: "List Emas" },
  { id: "batik_kawung", name: "Batik Kawung" },
  { id: "bintang_islami", name: "Bintang Islami" },
  { id: "songket_emas", name: "Tenun Songket" },
  { id: "ukir_sulur", name: "Ukir Sulur" },
];

// KOMPONEN SVG PECI DENGAN WARNA DINAMIS, MOTIF/POLA, DAN BORDER HITAM
function PeciSVG({
  color = "#231f20",
  pattern = "polos",
  className = "w-full h-full object-contain filter drop-shadow-md",
}: {
  color?: string;
  pattern?: string;
  className?: string;
}) {
  const isLight = color === "#f8fafc" || color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#fff";
  const goldColor = isLight ? "#b45309" : "#fbbf24";
  const goldAccent = isLight ? "#d97706" : "#fef08a";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109.76 61.91" className={className}>
      <defs>
        {/* Clip Path yang mengikuti kontur badan peci */}
        <clipPath id="peciBodyClip">
          <path d="M1.34,58.73c.21-.52.57-1.33,1.15-2.24,1.5-2.4,4.03-4.84,8.79-6.83,8.63-3.59,20.72-4.05,27.32-4.21,5.18-.13,11.2-.26,19.58,0,5.08.16,13,1.07,28.85,2.9.83.1,6.82.83,12.42,3.74,0,0,0,0,0,0,.84.45,1.44.96,1.97,1.45,1.98,1.86,3.16,3.57,3.16,3.57.45.65.77,1.2,1.4,2.29.58,1.01,1.04,1.87,1.36,2.5.81-.9,1.62-1.81,2.43-2.71l-1.34-10.85-3.73-30.85c-4.06-3.27-10.14-7.53-18.24-11.13C81,3.95,73.3.54,62.85.01c-3.08-.16-9.66,1.04-22.83,3.44-12.59,2.29-18.91,3.9-24.26,9.09-1.4,1.36-2.41,2.65-3.06,3.55-3.6,11.16-7.2,22.31-10.79,33.47-.64,1.9-1.27,3.8-1.91,5.7l1.34,3.46Z" />
        </clipPath>

        {/* Pattern: Batik Kawung */}
        <pattern id="patternKawung" width="10" height="10" patternUnits="userSpaceOnUse">
          <ellipse cx="5" cy="2" rx="3.5" ry="1.8" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.32" />
          <ellipse cx="5" cy="8" rx="3.5" ry="1.8" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.32" />
          <ellipse cx="2" cy="5" rx="1.8" ry="3.5" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.32" />
          <ellipse cx="8" cy="5" rx="1.8" ry="3.5" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.32" />
          <circle cx="5" cy="5" r="0.75" fill={goldAccent} opacity="0.4" />
        </pattern>

        {/* Pattern: Bintang Islami */}
        <pattern id="patternBintang" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="6" height="6" fill="none" stroke={goldColor} strokeWidth="0.5" transform="rotate(45 6 6)" opacity="0.32" />
          <rect x="3" y="3" width="6" height="6" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.32" />
          <circle cx="6" cy="6" r="1" fill={goldAccent} opacity="0.38" />
        </pattern>

        {/* Pattern: Tenun Songket */}
        <pattern id="patternSongket" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,4 L4,0 L8,4 L4,8 Z" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.3" />
          <path d="M2,4 L4,2 L6,4 L4,6 Z" fill={goldAccent} opacity="0.22" />
          <line x1="0" y1="0" x2="8" y2="8" stroke={goldColor} strokeWidth="0.25" opacity="0.18" />
        </pattern>
      </defs>

      <g id="Peci">
        {/* Main Peci Body dengan border hitam permanen */}
        <path
          fill={color}
          stroke="#231f20"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M1.34,58.73c.21-.52.57-1.33,1.15-2.24,1.5-2.4,4.03-4.84,8.79-6.83,8.63-3.59,20.72-4.05,27.32-4.21,5.18-.13,11.2-.26,19.58,0,5.08.16,13,1.07,28.85,2.9.83.1,6.82.83,12.42,3.74,0,0,0,0,0,0,.84.45,1.44.96,1.97,1.45,1.98,1.86,3.16,3.57,3.16,3.57.45.65.77,1.2,1.4,2.29.58,1.01,1.04,1.87,1.36,2.5.81-.9,1.62-1.81,2.43-2.71l-1.34-10.85-3.73-30.85c-4.06-3.27-10.14-7.53-18.24-11.13C81,3.95,73.3.54,62.85.01c-3.08-.16-9.66,1.04-22.83,3.44-12.59,2.29-18.91,3.9-24.26,9.09-1.4,1.36-2.41,2.65-3.06,3.55-3.6,11.16-7.2,22.31-10.79,33.47-.64,1.9-1.27,3.8-1.91,5.7l1.34,3.46Z"
        />

        {/* Motif / Pola Layer (Dibatasi oleh kontur peci) */}
        <g clipPath="url(#peciBodyClip)" className="pointer-events-none">
          {pattern === "garis_emas" && (
            <g opacity="0.55">
              {/* Gold Trim Bottom (Dinaikkan agar pas di atas lis bawah peci) */}
              <path d="M-5,44 Q55,34 115,44" fill="none" stroke={goldColor} strokeWidth="2.0" />
              <path d="M-5,41 Q55,31 115,41" fill="none" stroke={goldAccent} strokeWidth="0.8" />
              {/* Gold Trim Top (Diturunkan agar pas di bawah mahkota atas) */}
              <path d="M5,28 Q60,16 105,30" fill="none" stroke={goldColor} strokeWidth="2.0" />
              <path d="M5,31 Q60,19 105,33" fill="none" stroke={goldAccent} strokeWidth="0.8" />
            </g>
          )}

          {pattern === "batik_kawung" && (
            <rect x="-10" y="0" width="130" height="65" fill="url(#patternKawung)" />
          )}

          {pattern === "bintang_islami" && (
            <rect x="-10" y="0" width="130" height="65" fill="url(#patternBintang)" />
          )}

          {pattern === "songket_emas" && (
            <rect x="-10" y="0" width="130" height="65" fill="url(#patternSongket)" />
          )}

          {pattern === "ukir_sulur" && (
            <g opacity="0.45">
              {/* Garis batas lengkung atas & bawah bermotif halus */}
              <path d="M5,28 Q55,16 105,30" fill="none" stroke={goldAccent} strokeWidth="0.8" strokeDasharray="2 2" />
              <path d="M2,44 Q55,34 108,44" fill="none" stroke={goldAccent} strokeWidth="0.8" strokeDasharray="2 2" />

              {/* Batang Sulur Emas Mengalir Mengikuti Lengkung Peci */}
              <path
                d="M2,39 Q11,31 20,31 Q28,31 36,33 Q45,35 55,24 Q65,35 74,33 Q82,31 90,31 Q99,31 108,39"
                fill="none"
                stroke={goldColor}
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              {/* Ornamen Tengah (Bunga Sulur Mahkota) */}
              <circle cx="55" cy="24" r="1.8" fill={goldAccent} />
              <path d="M55,18 Q52,21 55,24 Q58,21 55,18 Z" fill={goldColor} />
              <path d="M50,22 Q47,20 48,24 Q51,24 50,22 Z" fill={goldAccent} />
              <path d="M60,22 Q63,20 62,24 Q59,24 60,22 Z" fill={goldAccent} />

              {/* Ornamen Sulur Kiri */}
              <circle cx="20" cy="31" r="1.5" fill={goldAccent} />
              <path d="M20,26 Q18,28.5 20,31 Q22,28.5 20,26 Z" fill={goldColor} />
              <circle cx="36" cy="33" r="1.1" fill={goldAccent} />

              {/* Ornamen Sulur Kanan */}
              <circle cx="90" cy="31" r="1.5" fill={goldAccent} />
              <path d="M90,26 Q88,28.5 90,31 Q92,28.5 90,26 Z" fill={goldColor} />
              <circle cx="74" cy="33" r="1.1" fill={goldAccent} />
            </g>
          )}
        </g>

        {/* Left Side Shadow / Fold Highlight */}
        <path
          fill="black"
          opacity={0.25}
          stroke="#231f20"
          strokeWidth="0.8"
          strokeLinejoin="round"
          d="M12.7,16.1l-.1.06c-3.56,11.05-7.13,22.1-10.69,33.15-.64,1.9-1.27,3.8-1.91,5.7l1.34,3.46c.21-.52.57-1.33,1.15-2.24.42-.66,3.25-5.1,8.79-6.83.82-.26,1.5-.39,1.88-.46-.61-4.79-1.07-13.58,2.29-23.77,2.92-8.87,7.52-15.05,10.56-18.55-2,.58-5.06,1.73-8.17,4.12-2.41,1.85-4.06,3.84-5.12,5.34Z"
        />
      </g>
    </svg>
  );
}

// PALET WARNA CUPLUK / PECI RAJUT
const CUPLUK_COLORS = [
  { name: "Cokelat Rajut", hex: "#8d6e53" },
  { name: "Putih Bersih", hex: "#f8fafc" },
  { name: "Krem Pasir", hex: "#d7c4a8" },
  { name: "Hitam Elegan", hex: "#231f20" },
  { name: "Abu-abu", hex: "#64748b" },
  { name: "Hijau Zaitun", hex: "#4d5e3a" },
  { name: "Biru Dongker", hex: "#1e3a8a" },
  { name: "Merah Marun", hex: "#7f1d1d" },
];

// KOMPONEN SVG CUPLUK / PECI RAJUT DENGAN TEKSTUR RAJUT KHAS & BORDER HITAM
function CuplukPeciSVG({
  color = "#8d6e53",
  className = "w-full h-full object-contain filter drop-shadow-md",
}: {
  color?: string;
  className?: string;
}) {
  const isLight = color === "#f8fafc" || color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#fff";
  const lineDark = isLight ? "#64748b" : "#1a1614";
  const lineLight = isLight ? "#ffffff" : "#fef08a";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56" className={className}>
      <defs>
        {/* Clip path untuk badan cupluk rajut berkubah halus */}
        <clipPath id="cuplukBodyClip">
          <path d="M4,50 C3.5,42 4,34 5,30 C7,12 24,2 50,2 C76,2 93,12 95,30 C96,34 96.5,42 96,50 Q50,42 4,50 Z" />
        </clipPath>

        {/* Pola Tekstur Rajutan Halus (Knitted Mesh) */}
        <pattern id="knitTexture" width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0,1.5 Q1.5,0 3,1.5 Q1.5,3 0,1.5 Z" fill="none" stroke={lineDark} strokeWidth="0.35" opacity="0.2" />
        </pattern>
      </defs>

      <g id="CuplukPeci">
        {/* Badan Utama Cupluk dengan Border Hitam */}
        <path
          fill={color}
          stroke="#231f20"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M4,50 C3.5,42 4,34 5,30 C7,12 24,2 50,2 C76,2 93,12 95,30 C96,34 96.5,42 96,50 Q50,42 4,50 Z"
        />

        {/* Detail Tekstur Rajut di dalam ClipPath */}
        <g clipPath="url(#cuplukBodyClip)" className="pointer-events-none">
          {/* Base Knit Mesh Texture */}
          <rect x="0" y="0" width="100" height="56" fill="url(#knitTexture)" />

          {/* Kubah Atas (Concentric Knitted Ridges) */}
          <g opacity="0.35">
            <path d="M12,23 Q50,11 88,23" fill="none" stroke={lineDark} strokeWidth="0.8" />
            <path d="M20,16 Q50,7 80,16" fill="none" stroke={lineDark} strokeWidth="0.8" />
            <path d="M30,11 Q50,4 70,11" fill="none" stroke={lineDark} strokeWidth="0.8" />
            <path d="M40,6.5 Q50,2.5 60,6.5" fill="none" stroke={lineDark} strokeWidth="0.8" />

            {/* Titik Pusat Puncak Rajutan */}
            <circle cx="50" cy="3.5" r="1.5" fill={lineDark} />
          </g>

          {/* Pola Chevron / Segitiga Rajut & Lubang Angin Sesuai Gambar Referensi */}
          <g opacity="0.45">
            {/* Garis Chevron Utama */}
            <path
              d="M5,35 L14,27 L23,34 L32,26 L41,33 L50,25 L59,33 L68,26 L77,34 L86,27 L95,35"
              fill="none"
              stroke={lineDark}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            {/* Garis Chevron Kedua */}
            <path
              d="M5,32 L14,24 L23,31 L32,23 L41,30 L50,22 L59,30 L68,23 L77,31 L86,24 L95,32"
              fill="none"
              stroke={lineLight}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />

            {/* Lubang Angin Rajutan (Eyelets) di Setiap Puncak Segitiga */}
            <circle cx="14" cy="22" r="1.0" fill={lineDark} />
            <circle cx="32" cy="20.5" r="1.0" fill={lineDark} />
            <circle cx="50" cy="19" r="1.1" fill={lineDark} />
            <circle cx="68" cy="20.5" r="1.0" fill={lineDark} />
            <circle cx="86" cy="22" r="1.0" fill={lineDark} />

            <circle cx="14" cy="22" r="0.4" fill={lineLight} />
            <circle cx="32" cy="20.5" r="0.4" fill={lineLight} />
            <circle cx="50" cy="19" r="0.5" fill={lineLight} />
            <circle cx="68" cy="20.5" r="0.4" fill={lineLight} />
            <circle cx="86" cy="22" r="0.4" fill={lineLight} />
          </g>

          {/* Lis Rib Bawah (Ribbed Knit Brim) — Trikot Rajut Bergaris Padat */}
          <g opacity="0.5">
            {/* Garis Rib Horizontal */}
            <path d="M4.5,46.5 Q50,38.5 95.5,46.5" fill="none" stroke={lineDark} strokeWidth="1.0" />
            <path d="M5,43 Q50,35 95,43" fill="none" stroke={lineDark} strokeWidth="1.0" />
            <path d="M5.5,39.5 Q50,31.5 94.5,39.5" fill="none" stroke={lineDark} strokeWidth="1.0" />
            <path d="M6,36 Q50,28 94,36" fill="none" stroke={lineDark} strokeWidth="1.0" />

            {/* Tekstur Jahitan Rajut Vertikal Halus di Lis Bawah */}
            <path d="M4.5,46.5 Q50,38.5 95.5,46.5" fill="none" stroke={lineLight} strokeWidth="0.6" strokeDasharray="1.2 1.8" />
            <path d="M5,43 Q50,35 95,43" fill="none" stroke={lineLight} strokeWidth="0.6" strokeDasharray="1.2 1.8" />
            <path d="M5.5,39.5 Q50,31.5 94.5,39.5" fill="none" stroke={lineLight} strokeWidth="0.6" strokeDasharray="1.2 1.8" />
          </g>

          {/* Highlight & Shading 3D untuk Efek Bulat Kubah */}
          <path
            d="M4,50 C3.5,42 4,34 5,30 C7,12 24,2 50,2 C35,4 12,18 9,35 C8,41 7,46 4,50 Z"
            fill="black"
            opacity="0.12"
          />
          <path
            d="M50,2 C65,2 85,10 93,25 C95,30 95.5,38 95,44 C93,36 90,26 80,14 C70,6 58,3 50,2 Z"
            fill="white"
            opacity="0.08"
          />
        </g>
      </g>
    </svg>
  );
}

// DAFTAR MODEL SORBAN (6 PILIHAN MODEL ASLI WEBP)
const SORBAN_MODELS = [
  { id: "sorban-hijau-emas", name: "Hijau Emas", src: sorbanImg },
  { id: "sorban-putih", name: "Putih Polos", src: sorban1Img },
  { id: "sorban-hijau", name: "Hijau Santri", src: sorban2Img },
  { id: "sorban-cokelat-emas", name: "Cokelat Emas", src: sorban3Img },
  { id: "sorban-keffiyeh", name: "Keffiyeh", src: sorban4Img },
  { id: "sorban-hitam", name: "Hitam Elegan", src: sorban5Img },
];

// CURATED WEARABLE ACCESSORIES
const ACCESSORIES = [
  // --- KEPALA / TOPI ---
  {
    id: "jalu",
    name: "Jalu",
    category: "topi" as const,
    render: () => <img src={jaluSvg} alt="Jalu" className="w-full h-full object-contain filter drop-shadow-md" />,
    width: 78,
    top: "14.5%",
    left: "52%",
  },
  {
    id: "peci",
    name: "Peci Hitam",
    category: "topi" as const,
    render: (props?: { color?: string; pattern?: string }) => (
      <PeciSVG color={props?.color} pattern={props?.pattern} />
    ),
    width: 76,
    top: "16%",
    left: "50.6%",
  },
  {
    id: "cupluk",
    name: "Cupluk Rajut",
    category: "topi" as const,
    render: (props?: { color?: string }) => (
      <CuplukPeciSVG color={props?.color} />
    ),
    width: 76,
    top: "16%",
    left: "50.6%",
  },
  {
    id: "sorban",
    name: "Sorban",
    category: "topi" as const,
    render: (props?: { model?: string }) => {
      const current = SORBAN_MODELS.find((m) => m.id === props?.model) || SORBAN_MODELS[0];
      return (
        <img
          src={current.src}
          alt={current.name}
          className="w-full h-full object-contain filter drop-shadow-md -rotate-4"
        />
      );
    },
    width: 124,
    top: "18%",
    left: "50.8%",
  },
];

// RIVE ANIMATED PET CHICKEN COMPONENT
function RivePetChicken({
  isTalking = false,
  onLoaded,
}: {
  isTalking?: boolean;
  onLoaded?: () => void;
}) {
  const { rive, RiveComponent } = useRive({
    src: pejuangMimpiRiv,
    stateMachines: ["Blink State", "Talking State"],
    autoplay: true, // False agar Talking State tidak otomatis loop terus menerus
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoad: () => {
      onLoaded?.();
    },
  });

  const triggerTalking = useStateMachineInput(rive, "Talking State", "Trigger 1");

  // Pastikan callback terpanggil saat rive siap
  useEffect(() => {
    if (rive && onLoaded) {
      onLoaded();
    }
  }, [rive, onLoaded]);

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
  const { navigate } = useRouter();
  const totalPoin = MISI_DATA.filter((m) => m.status === "selesai").reduce((a, m) => a + m.poin, 0);

  // Background dinamis berdasarkan jam device — hanya dihitung saat pertama mount
  const currentBg = useMemo(() => getTimeOfDayBg(), []);

  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"topi" | "mata" | "leher">("topi");
  const [isRiveLoaded, setIsRiveLoaded] = useState(false);
  const [peciColor, setPeciColor] = useState<string>("#231f20");
  const [peciPattern, setPeciPattern] = useState<string>("polos");
  const [cuplukColor, setCuplukColor] = useState<string>("#8d6e53");
  const [sorbanModel, setSorbanModel] = useState<string>("sorban-hijau-emas");
  const [equipped, setEquipped] = useState<{
    topi: typeof ACCESSORIES[number] | null;
    mata: typeof ACCESSORIES[number] | null;
    leher: typeof ACCESSORIES[number] | null;
  }>({
    topi: ACCESSORIES.find((a) => a.id === "jalu") || null,
    mata: null,
    leher: null,
  });

  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; drift: number; rotate: number; emoji: string }>>([]);
  const [isTalking, setIsTalking] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper pembersih emotikon/emoji agar teks bersih murni
  const stripEmojis = (str: string): string => {
    return str
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, "")
      .replace(/[^\w\s.,!?'"-\/]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

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

  const speakGreeting = (rawText: string) => {
    const clean = stripEmojis(rawText);
    if (!clean) return;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);

    setDisplayedText("");
    setShowBubble(true);
    setIsTalking(true);
    setIsTyping(true);

    // Efek ketik karakter per karakter (typewriter)
    let idx = 0;
    typingTimerRef.current = setInterval(() => {
      idx++;
      if (idx <= clean.length) {
        setDisplayedText(clean.slice(0, idx));
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        // Teks selesai mengetik -> Mulut langsung berhenti berbicara!
        setIsTalking(false);
      }
    }, 38);

    // Suara TTS berbicara bersamaan dengan teks yang sedang mengetik
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const voice = getIndonesianVoice();

        if (voice) {
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.voice = voice;
          utterance.lang = voice.lang || "id-ID";
          utterance.rate = 1.05;
          utterance.pitch = 1.22;

          utterance.onend = () => {
            // Suara selesai -> pastikan mulut langsung berhenti
            setIsTalking(false);
          };
          utterance.onerror = () => setIsTalking(false);

          window.speechSynthesis.speak(utterance);
        } else {
          playPetChirpSound();
        }
      } catch {
        playPetChirpSound();
      }
    } else {
      playPetChirpSound();
    }

    // Timer penutupan otomatis bubble setelah selesai membaca
    autoCloseTimerRef.current = setTimeout(() => {
      setShowBubble(false);
      setIsTalking(false);
    }, Math.max(4200, clean.length * 38 + 2500));
  };

  // Pre-load voices dan sapaan awal berdasarkan waktu (tanpa emot)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    const hour = new Date().getHours();
    let initialGreeting = "Selamat pagi! Semangat terus ya pejuang mimpi!";
    if (hour >= 11 && hour < 15) {
      initialGreeting = "Selamat siang! Tetap semangat ya pejuang mimpi!";
    } else if (hour >= 15 && hour < 18) {
      initialGreeting = "Selamat sore! Semangat terus ya pejuang mimpi!";
    } else if (hour >= 18 || hour < 5) {
      initialGreeting = "Selamat malam! Istirahat yang cukup ya pejuang mimpi!";
    }

    const timer = setTimeout(() => {
      speakGreeting(initialGreeting);
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
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
      "Selamat berjuang! Tetap semangat ya pejuang mimpi!",
      "Kukuruyuuuk! Kamu hebat, pasti bisa!",
      "Ayo, selesaikan misimu hari ini ya!",
      "Yuk, jangan lupa menabung di celenganmu!",
      "Setiap langkah kecil membawamu lebih dekat ke impian!",
      "Aku selalu siap menemani kamu berjuang, semangat ya!",
      "Kerja kerasmu hari ini akan berbuah manis esok hari!",
      "Fokus pada impianmu, jangan mudah menyerah ya!",
    ];
    const picked = randomDialogues[Math.floor(Math.random() * randomDialogues.length)];
    speakGreeting(picked);
  };

  const handleToggleAccessory = (acc: typeof ACCESSORIES[number]) => {
    setEquipped((prev) => {
      const current = prev[acc.category];
      const isSame = current?.id === acc.id;
      // Jika diklik lagi saat sedang terpasang, lepas aksesoris tersebut
      const nextVal = isSame ? null : acc;

      return {
        ...prev,
        [acc.category]: nextVal,
      };
    });
  };

  // Only render overlays when an accessory is explicitly equipped
  const activeTopi = equipped.topi;
  const activeMata = equipped.mata;
  const activeLeher = equipped.leher;

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

      {/* Top Header Overlay — dinaikkan sedikit agar proporsional dan tidak menutupi langit */}
      <div
        className="absolute left-6 right-6 flex justify-end items-center gap-2 z-10"
        style={{ top: "calc(1.25rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* Poin Badge — kiri */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide shadow-xs">
          <Star style={{ color: THEME_COLORS.hex.accent }} className="w-3.5 h-3.5" />
          {totalPoin} Poin
        </div>
        {/* Kompas Kiblat navigate button */}
        <button
          onClick={() => navigate("MobileKiblat")}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer border border-white/20 backdrop-blur-xs bg-black/40 text-emerald-400 hover:bg-black/60 hover:text-emerald-300 hover:scale-105 active:scale-95"
          title="Arah Kiblat"
        >
          <Compass className="w-4 h-4" />
        </button>
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
        {/* Pixel Game Dialogue Box — Terpasang di luar scale agar tidak pernah meluber melewati layar */}
        <AnimatePresence>
          {showBubble && displayedText && (
            <motion.div
              key="pixel-speech-bubble"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute z-40 left-4 right-4 flex flex-col items-center pointer-events-none select-none"
              style={{
                bottom: "calc(50% + 105px)",
                maxWidth: "320px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div className="flex flex-col items-center w-full">
                {/* Retro Pixel Box Frame dengan styling THEME_COLORS */}
                <div
                  className="w-full text-zinc-900 px-4 py-3 relative shadow-2xl"
                  style={{
                    backgroundColor: THEME_COLORS.hex.leftBg,
                    border: `3px solid ${THEME_COLORS.hex.navBg}`,
                    boxShadow: `0 4px 0 0 ${THEME_COLORS.hex.navBg}, 0 -2px 0 0 ${THEME_COLORS.hex.navBg}, -2px 0 0 0 ${THEME_COLORS.hex.navBg}, 2px 0 0 0 ${THEME_COLORS.hex.navBg}, inset 0 0 0 2px ${THEME_COLORS.hex.accent}`,
                    imageRendering: "pixelated",
                  }}
                >
                  {/* Typewriter Text (Berjalan seperti ketikan, TANPA header jalu/talk, & TANPA Emotikon) */}
                  <p
                    style={{ color: THEME_COLORS.hex.textDark }}
                    className="font-mono text-xs font-bold leading-relaxed text-center tracking-tight break-words min-h-[1.4em]"
                  >
                    {displayedText}
                    {isTyping && (
                      <span
                        style={{ backgroundColor: THEME_COLORS.hex.primary }}
                        className="inline-block w-1.5 h-3.5 ml-1 animate-pulse align-middle"
                      />
                    )}
                  </p>
                </div>

                {/* Pixel Stepped Arrow Pointer dengan warna THEME_COLORS.hex.navBg */}
                <div className="flex flex-col items-center -mt-[1px]">
                  <div style={{ backgroundColor: THEME_COLORS.hex.navBg }} className="w-4 h-1.5" />
                  <div style={{ backgroundColor: THEME_COLORS.hex.navBg }} className="w-2.5 h-1" />
                  <div style={{ backgroundColor: THEME_COLORS.hex.navBg }} className="w-1.5 h-1" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-[340px] h-[340px] flex items-center justify-center translate-y-[25px] scale-[1.2] origin-center">
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
            {/* Base Pet Chicken with Rive Animation */}
            <RivePetChicken isTalking={isTalking} onLoaded={() => setIsRiveLoaded(true)} />

            {/* Hat / Topi Overlay - HANYA dirender setelah Rive berhasil dimuat */}
            <AnimatePresence>
              {isRiveLoaded && activeTopi && (
                <motion.div
                  key={activeTopi.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none z-20 select-none"
                  style={{
                    top: activeTopi.top,
                    left: activeTopi.left,
                    width: `${activeTopi.width}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {activeTopi.render({
                      color: activeTopi.id === "cupluk" ? cuplukColor : peciColor,
                      pattern: peciPattern,
                      model: sorbanModel,
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Eyes / Mata Overlay */}
            <AnimatePresence>
              {isRiveLoaded && activeMata && (
                <motion.div
                  key={activeMata.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none z-30 select-none"
                  style={{
                    top: activeMata.top,
                    left: activeMata.left,
                    width: `${activeMata.width}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {activeMata.render()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Neck / Leher Overlay */}
            <AnimatePresence>
              {isRiveLoaded && activeLeher && (
                <motion.div
                  key={activeLeher.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none z-10 select-none"
                  style={{
                    top: activeLeher.top,
                    left: activeLeher.left,
                    width: `${activeLeher.width}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {activeLeher.render()}
                </motion.div>
              )}
            </AnimatePresence>
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
            style={{
              top: "calc(3.5rem + env(safe-area-inset-top, 0px))",
            }}
            className="absolute left-4 right-4 bg-black/60 backdrop-blur-md rounded-3xl p-3.5 border border-white/10 z-40 flex flex-col gap-2.5 shadow-xl"
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowPanel(false)}
                  style={{
                    backgroundColor: `${THEME_COLORS.hex.primary}25`,
                    borderColor: `${THEME_COLORS.hex.primary}60`,
                    color: "white",
                  }}
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border rounded-xl transition-all cursor-pointer hover:bg-white/20 active:scale-95 shadow-xs"
                  title="Tutup Panel Aksesoris"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/10 w-full" />

            {/* Carousel Grid */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar min-h-[80px] items-center">
              {ACCESSORIES.filter((acc) => acc.category === activeTab).map((acc) => {
                const currentEquipped = equipped[acc.category];
                const isEquipped = currentEquipped?.id === acc.id;
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
                        {acc.render({
                          color: acc.id === "cupluk" ? cuplukColor : peciColor,
                          pattern: peciPattern,
                          model: sorbanModel,
                        })}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-center text-white/90 line-clamp-1 w-full px-0.5 leading-none">
                      {acc.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pilihan Warna & Motif Peci (Hanya aktif jika Peci sedang dipilih / dipakai) */}
            <AnimatePresence>
              {equipped.topi?.id === "peci" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2.5 pt-2 border-t border-white/10"
                >
                  {/* Warna Peci */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/90">Warna Peci:</span>
                      <span className="text-[9px] text-amber-300 font-semibold">
                        {PECI_COLORS.find((c) => c.hex === peciColor)?.name || peciColor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
                      {PECI_COLORS.map((c) => {
                        const isSelected = peciColor === c.hex;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => setPeciColor(c.hex)}
                            title={c.name}
                            className={`w-7 h-7 rounded-lg shrink-0 transition-all cursor-pointer flex items-center justify-center ${isSelected
                              ? "border-2 border-white shadow-md ring-2 ring-white/40"
                              : "border border-white/20 hover:border-white/50"
                              }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && (
                              <span className={`text-[10px] font-black ${c.hex === "#f8fafc" ? "text-slate-900" : "text-white"}`}>
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Motif / Pola Peci */}
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/90">Motif / Pola:</span>
                      <span className="text-[9px] text-amber-300 font-semibold">
                        {PECI_PATTERNS.find((p) => p.id === peciPattern)?.name || peciPattern}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-0.5 no-scrollbar">
                      {PECI_PATTERNS.map((p) => {
                        const isSelected = peciPattern === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setPeciPattern(p.id)}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer ${isSelected
                              ? "bg-amber-500 text-white shadow-md border border-amber-300"
                              : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                              }`}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pilihan Warna Cupluk / Peci Rajut (Hanya aktif jika Cupluk sedang dipilih / dipakai) */}
            <AnimatePresence>
              {equipped.topi?.id === "cupluk" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 pt-2 border-t border-white/10"
                >
                  {/* Warna Cupluk */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/90">Warna Peci Rajut:</span>
                      <span className="text-[9px] text-amber-300 font-semibold">
                        {CUPLUK_COLORS.find((c) => c.hex === cuplukColor)?.name || cuplukColor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
                      {CUPLUK_COLORS.map((c) => {
                        const isSelected = cuplukColor === c.hex;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => setCuplukColor(c.hex)}
                            title={c.name}
                            className={`w-7 h-7 rounded-lg shrink-0 transition-all cursor-pointer flex items-center justify-center ${isSelected
                              ? "border-2 border-white shadow-md ring-2 ring-white/40"
                              : "border border-white/20 hover:border-white/50"
                              }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && (
                              <span className={`text-[10px] font-black ${c.hex === "#f8fafc" ? "text-slate-900" : "text-white"}`}>
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pilihan Model Sorban Asli */}
            <AnimatePresence>
              {equipped.topi?.id === "sorban" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 pt-2 border-t border-white/10"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/90">Model Sorban:</span>
                      <span className="text-[9px] text-amber-300 font-semibold">
                        {SORBAN_MODELS.find((m) => m.id === sorbanModel)?.name || "Sorban"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
                      {SORBAN_MODELS.map((m) => {
                        const isSelected = sorbanModel === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setSorbanModel(m.id)}
                            title={m.name}
                            className={`h-11 px-2.5 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${isSelected
                              ? "bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/40"
                              : "bg-white/5 hover:bg-white/10 border-white/10"
                              }`}
                          >
                            <img src={m.src} alt={m.name} className="h-7 w-7 object-contain drop-shadow-xs" />
                            <span className={`text-[9px] font-bold whitespace-nowrap ${isSelected ? "text-amber-300" : "text-white/80"}`}>
                              {m.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
