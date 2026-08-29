import { useState, useRef } from "react";
import {
  Check,
  Play,
  Lock,
  Star,
  BookOpen,
  Trophy,
  Sparkles,
  ArrowLeft,
  X
} from "lucide-react";
import { type Lesson as APILesson } from "@/features/training/api/course";
import { THEME_COLORS } from "@/shared/constants/colors";

interface LearningPathMapProps {
  lessons: APILesson[];
  onSelectLesson: (lesson: APILesson) => void;
  buttonColor?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function LearningPathMap({
  lessons,
  onSelectLesson,
  buttonColor = THEME_COLORS.hex.primary,
  isFullscreen = false,
  onToggleFullscreen
}: LearningPathMapProps) {
  const [selectedLesson, setSelectedLesson] = useState<APILesson | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeColor =
    typeof buttonColor === "string" && !buttonColor.includes("gradient")
      ? buttonColor
      : THEME_COLORS.hex.primary;

  // Find active / current lesson index (first non-completed lesson)
  const activeLessonIndex = lessons.findIndex(
    (l) => l.seen_status !== "completed"
  );
  const currentIdx = activeLessonIndex === -1 ? lessons.length - 1 : activeLessonIndex;

  // Format title to avoid duplicate numbers like "1. 1. Intro"
  const formatTitle = (title: string, index: number) => {
    const cleaned = title.replace(/^\d+[\.\-\s]+/, "").trim();
    return `${index + 1}. ${cleaned}`;
  };

  // Pattern of horizontal offsets: Center (0), Right (+68), Center (0), Left (-68)
  const getNodeOffset = (index: number) => {
    const pattern = [0, 68, 0, -68];
    return pattern[index % pattern.length];
  };

  const ROW_HEIGHT = 132;
  const MAP_WIDTH = 360; // Exact track container width

  // Generate coordinates for SVG path (exact center of each node)
  const nodeCoords = lessons.map((_, idx) => {
    const x = MAP_WIDTH / 2 + getNodeOffset(idx);
    const y = idx * ROW_HEIGHT + ROW_HEIGHT / 2 + 10;
    return { x, y };
  });

  const lastCoord = nodeCoords[nodeCoords.length - 1] || { x: MAP_WIDTH / 2, y: 80 };
  const finishX = MAP_WIDTH / 2;
  const finishY = lastCoord.y + 70;
  const totalHeight = Math.max(finishY + 45, 320);

  // Continuous S-curve road path connecting all nodes + final segment to finish line
  let roadPathD = "";
  nodeCoords.forEach((coord, idx) => {
    if (idx === 0) {
      roadPathD = `M ${coord.x} ${coord.y}`;
    } else {
      const prev = nodeCoords[idx - 1];
      const cy1 = prev.y + ROW_HEIGHT * 0.65;
      const cy2 = coord.y - ROW_HEIGHT * 0.65;
      roadPathD += ` C ${prev.x} ${cy1}, ${coord.x} ${cy2}, ${coord.x} ${coord.y}`;
    }
  });
  // Add smooth final connecting path from last node to centered finish line
  const lastCy1 = lastCoord.y + 35;
  const lastCy2 = finishY - 35;
  roadPathD += ` C ${lastCoord.x} ${lastCy1}, ${finishX} ${lastCy2}, ${finishX} ${finishY}`;

  return (
    <div
      className={`select-none relative bg-[#eaf4e6] overflow-x-hidden overflow-y-auto transition-all duration-200 flex flex-col items-center ${
        isFullscreen
          ? "fixed inset-0 z-[100] rounded-none w-screen h-screen pt-14 pb-8 bg-[#eaf4e6]"
          : "w-full rounded-2xl border border-[#cfe2c8] shadow-xs p-0 pb-2 bg-[#eaf4e6]"
      }`}
    >
      {/* Fullscreen Floating Header Navigation Bar */}
      {isFullscreen && onToggleFullscreen && (
        <div className="fixed top-0 inset-x-0 z-[110] px-4 py-3 bg-gradient-to-b from-black/40 via-black/15 to-transparent flex items-center justify-between pointer-events-none">
          <button
            onClick={onToggleFullscreen}
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg text-xs font-bold active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <span className="text-white/90 text-xs font-bold drop-shadow-sm pr-2">
            Peta Petualangan
          </span>
        </div>
      )}

      {/* Synchronized Track Container (Holds BOTH the SVG and Nodes locked to the exact same 360px coordinate system) */}
      <div
        ref={containerRef}
        style={{ width: `${MAP_WIDTH}px`, minHeight: `${totalHeight}px` }}
        className="relative mx-auto flex flex-col items-center shrink-0"
      >

      {/* Background SVG Landscape (Klaster Pohon Bulat Rindang, Cemara, dan Bioma Petualangan) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ height: `${totalHeight}px` }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="tentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={THEME_COLORS.hex.primary} />
            <stop offset="100%" stopColor={THEME_COLORS.hex.primaryHover} />
          </linearGradient>
          <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d8ecd1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#cae4c1" stopOpacity="0.4" />
          </linearGradient>

          {/* 1. KLASTER POHON BULAT-BULAT RINDANG (Round Oak Trees Grove) */}
          <g id="cluster-round-grove">
            {/* Shadow */}
            <ellipse cx="0" cy="20" rx="32" ry="8" fill={THEME_COLORS.hex.textDark} opacity="0.1" />
            {/* Left Tree */}
            <g transform="translate(-14, 2) scale(0.85)">
              <rect x="-3" y="10" width="6" height="14" fill="#5a3d1e" rx="1.5" />
              <circle cx="0" cy="4" r="14" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-4" cy="0" r="11" fill={THEME_COLORS.hex.sawahPertumbuhan} />
              <circle cx="2" cy="-4" r="8" fill="#93bd82" />
            </g>
            {/* Center Big Tree */}
            <g transform="translate(4, -4)">
              <rect x="-3.5" y="12" width="7" height="18" fill="#6d4c2b" rx="2" />
              <circle cx="0" cy="4" r="18" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-5" cy="-1" r="14" fill={THEME_COLORS.hex.sawahPertumbuhan} />
              <circle cx="4" cy="-5" r="10" fill="#93bd82" />
              <circle cx="-1" cy="-5" r="5" fill="#abcf9c" opacity="0.6" />
            </g>
            {/* Right Small Round Tree */}
            <g transform="translate(18, 6) scale(0.7)">
              <rect x="-2.5" y="8" width="5" height="12" fill="#5a3d1e" rx="1" />
              <circle cx="0" cy="3" r="12" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-3" cy="0" r="9" fill={THEME_COLORS.hex.sawahPertumbuhan} />
            </g>
            {/* Bush at base */}
            <g transform="translate(-4, 18) scale(0.8)">
              <circle cx="-6" cy="0" r="6" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="6" cy="0" r="7" fill={THEME_COLORS.hex.sawahPertumbuhan} />
              <circle cx="0" cy="-3" r="6" fill="#93bd82" />
            </g>
          </g>

          {/* 2. KLASTER KOMBINASI POHON BULAT & PINUS (Mixed Forest Grove) */}
          <g id="cluster-mixed-grove">
            <ellipse cx="0" cy="18" rx="30" ry="7.5" fill={THEME_COLORS.hex.textDark} opacity="0.09" />
            {/* Pine tree on left */}
            <g transform="translate(-14, 0) scale(0.8)">
              <rect x="-2" y="10" width="4" height="12" fill="#5a3d1e" rx="1" />
              <polygon points="0,-14 -10,0 10,0" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <polygon points="0,-5 -12,8 12,8" fill={THEME_COLORS.hex.sawahPertumbuhan} />
              <polygon points="0,3 -14,16 14,16" fill="#8cb878" />
            </g>
            {/* Round tree on right */}
            <g transform="translate(8, -2)">
              <rect x="-3" y="10" width="6" height="16" fill="#6d4c2b" rx="1.5" />
              <circle cx="0" cy="4" r="16" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-4" cy="-1" r="12" fill={THEME_COLORS.hex.sawahPertumbuhan} />
              <circle cx="3" cy="-4" r="9" fill="#93bd82" />
            </g>
            {/* Tiny bush and flower */}
            <g transform="translate(18, 14) scale(0.7)">
              <circle cx="0" cy="0" r="2.5" fill={THEME_COLORS.hex.accent} />
              <circle cx="-2.5" cy="0" r="1.5" fill="#ffffff" />
              <circle cx="2.5" cy="0" r="1.5" fill="#ffffff" />
            </g>
          </g>

          {/* 3. EXPEDITION CAMP & POHON (Tenda, Api Unggun & Klaster Pohon) */}
          <g id="cluster-camp-grove">
            <ellipse cx="0" cy="20" rx="32" ry="8" fill={THEME_COLORS.hex.textDark} opacity="0.1" />
            {/* Round tree behind tent */}
            <g transform="translate(14, -4) scale(0.85)">
              <rect x="-2.5" y="10" width="5" height="14" fill="#5a3d1e" rx="1" />
              <circle cx="0" cy="4" r="14" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-3" cy="0" r="11" fill={THEME_COLORS.hex.sawahPertumbuhan} />
            </g>
            {/* Camp Tent */}
            <g transform="translate(-10, 6)">
              <polygon points="0,-18 -18,12 18,12" fill="url(#tentGrad)" />
              <polygon points="0,-18 0,12 10,12" fill="#8c2e11" />
              <line x1="0" y1="-18" x2="0" y2="-24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <polygon points="0,-24 8,-21 0,-18" fill={THEME_COLORS.hex.accent} />
            </g>
            {/* Campfire */}
            <g transform="translate(14, 16) scale(0.85)">
              <ellipse cx="0" cy="3" rx="7" ry="3" fill="#64748b" />
              <polygon points="0,-8 -4,2 4,2" fill="#f97316" />
              <polygon points="0,-6 -2,2 2,2" fill={THEME_COLORS.hex.accent} />
            </g>
          </g>

          {/* 4. KINCIR ANGIN & KLASTER POHON BULAT (Windmill & Round Trees) */}
          <g id="cluster-windmill-grove">
            <ellipse cx="0" cy="22" rx="30" ry="7.5" fill={THEME_COLORS.hex.textDark} opacity="0.1" />
            {/* Round tree beside windmill */}
            <g transform="translate(-16, 2) scale(0.8)">
              <rect x="-2.5" y="10" width="5" height="14" fill="#5a3d1e" rx="1" />
              <circle cx="0" cy="4" r="14" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-3" cy="0" r="10" fill={THEME_COLORS.hex.sawahPertumbuhan} />
            </g>
            {/* Windmill Tower */}
            <g transform="translate(8, 0)">
              <polygon points="-7,18 7,18 4,-10 -4,-10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M -6 -10 Q 0 -18 6 -10 Z" fill={THEME_COLORS.hex.primary} />
              <circle cx="0" cy="-8" r="2.5" fill="#475569" />
              {/* Blades */}
              <g transform="translate(0, -8)">
                <line x1="-14" y1="-14" x2="14" y2="14" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="14" y1="-14" x2="-14" y2="14" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
                <polygon points="-14,-14 -7,-19 0,-8" fill="#e2e8f0" opacity="0.9" />
                <polygon points="14,14 7,19 0,8" fill="#e2e8f0" opacity="0.9" />
                <circle cx="0" cy="0" r="2" fill={THEME_COLORS.hex.accent} />
              </g>
            </g>
          </g>

          {/* 5. DANAU AIR JERNIH & RUMPUN POHON (Scenic Lake & Trees) */}
          <g id="cluster-lake-grove">
            <ellipse cx="0" cy="14" rx="28" ry="12" fill="url(#waterGrad)" />
            <ellipse cx="-2" cy="12" rx="22" ry="8" fill="#bae6fd" opacity="0.6" />
            <path d="M -12 12 Q -6 10 0 12" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 6 15 Q 12 13 18 15" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            {/* Overhanging round tree */}
            <g transform="translate(-16, -2) scale(0.75)">
              <circle cx="0" cy="0" r="14" fill={THEME_COLORS.hex.sawahPertumbuhanDark} />
              <circle cx="-3" cy="-3" r="10" fill={THEME_COLORS.hex.sawahPertumbuhan} />
            </g>
            {/* Rocks */}
            <ellipse cx="16" cy="16" rx="6" ry="3.5" fill="#94a3b8" />
            <ellipse cx="15" cy="14" rx="5" ry="2.8" fill="#cbd5e1" />
          </g>
        </defs>

        {/* 1. Organic Rolling Landscape Contours */}
        {lessons.map((_, idx) => {
          const patchY = idx * ROW_HEIGHT + 30;
          const isEven = idx % 2 === 0;
          return (
            <g key={`hill-${idx}`}>
              <path
                d={
                  isEven
                    ? `M -40 ${patchY - 30} Q 90 ${patchY - 45} 140 ${patchY + 30} Q 70 ${patchY + 75} -40 ${patchY + 50} Z`
                    : `M ${MAP_WIDTH + 40} ${patchY - 30} Q ${MAP_WIDTH - 90} ${patchY - 45} ${MAP_WIDTH - 140} ${patchY + 30} Q ${MAP_WIDTH - 70} ${patchY + 75} ${MAP_WIDTH + 40} ${patchY + 50} Z`
                }
                fill="url(#hillGrad1)"
              />
            </g>
          );
        })}

        {/* 2. THE MAIN WINDING ROAD (Jalur Petualangan Tempat Node Berada) */}
        {/* Road Outer Curb / Border - Starts flat under node 1 */}
        <path
          d={roadPathD}
          fill="none"
          stroke="#d0c8b6"
          strokeWidth="48"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
        {/* Road Paved Surface (Warm Cream leftBg from colors.ts) */}
        <path
          d={roadPathD}
          fill="none"
          stroke={THEME_COLORS.hex.leftBg}
          strokeWidth="42"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />

        {/* Road Step-by-Step Progress Trail Lines */}
        {nodeCoords.map((coord, idx) => {
          if (idx === nodeCoords.length - 1) return null;
          const nextCoord = nodeCoords[idx + 1];
          const isCompleted = lessons[idx].seen_status === "completed";

          const cy1 = coord.y + ROW_HEIGHT * 0.65;
          const cy2 = nextCoord.y - ROW_HEIGHT * 0.65;
          const segmentD = `M ${coord.x} ${coord.y} C ${coord.x} ${cy1}, ${nextCoord.x} ${cy2}, ${nextCoord.x} ${nextCoord.y}`;

          return (
            <path
              key={`segment-${idx}`}
              d={segmentD}
              fill="none"
              stroke={
                isCompleted
                  ? THEME_COLORS.hex.sawahPertumbuhan
                  : "#c8beaa"
              }
              strokeWidth="4"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          );
        })}

        {/* 3. Rich, Varied Forest Clusters on BOTH Left & Right Sides */}
        {lessons.map((_, idx) => {
          const rowY = idx * ROW_HEIGHT + 45;
          const offset = getNodeOffset(idx);

          // Primary Landmark placement (on open side)
          const isNodeOnRight = offset > 10;
          const isNodeOnLeft = offset < -10;
          const leftClusterX = 42;
          const rightClusterX = MAP_WIDTH - 42;

          // Theme cycling for varied biomes
          const clusterThemes = [
            "cluster-round-grove",
            "cluster-mixed-grove",
            "cluster-camp-grove",
            "cluster-windmill-grove",
            "cluster-lake-grove"
          ];
          const mainTheme = clusterThemes[idx % clusterThemes.length];
          const secondaryTheme = clusterThemes[(idx + 2) % clusterThemes.length];

          return (
            <g key={`land-group-${idx}`}>
              {/* Left Side Forest Cluster */}
              <g transform={`translate(${leftClusterX}, ${rowY}) scale(0.95)`}>
                <use href={`#${isNodeOnRight ? mainTheme : secondaryTheme}`} />
              </g>

              {/* Right Side Forest Cluster */}
              <g transform={`translate(${rightClusterX}, ${rowY + 6}) scale(0.92)`}>
                <use href={`#${isNodeOnLeft ? mainTheme : secondaryTheme}`} />
              </g>
            </g>
          );
        })}

        {/* 4. Checkered Race Finish Line (Garis Finish Balapan Hitam Putih) */}
        <g transform={`translate(${finishX}, ${finishY})`}>
          {/* Finish Line Road Marking (2 Rows of Alternating Black and White Checkered Squares) */}
          <g transform="translate(-24, -8)">
            {/* Base Drop Shadow & Asphalt Bed */}
            <rect x="-2" y="-2" width="52" height="20" fill="#18181b" rx="2" opacity="0.25" />
            <rect x="0" y="0" width="48" height="16" fill="#ffffff" rx="1" stroke="#18181b" strokeWidth="1" />
            {/* Checkered Squares: Row 1 */}
            <rect x="0" y="0" width="8" height="8" fill="#18181b" />
            <rect x="16" y="0" width="8" height="8" fill="#18181b" />
            <rect x="32" y="0" width="8" height="8" fill="#18181b" />
            {/* Checkered Squares: Row 2 */}
            <rect x="8" y="8" width="8" height="8" fill="#18181b" />
            <rect x="24" y="8" width="8" height="8" fill="#18181b" />
            <rect x="40" y="8" width="8" height="8" fill="#18181b" />
          </g>

          {/* Left Finish Flag Pole & Banner */}
          <g transform="translate(-26, 0)">
            <line x1="0" y1="8" x2="0" y2="-22" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="-23" r="2.5" fill="#f59e0b" />
            {/* Checkered Flag Left */}
            <rect x="-14" y="-22" width="14" height="10" fill="#ffffff" stroke="#18181b" strokeWidth="0.75" rx="0.5" />
            <rect x="-14" y="-22" width="7" height="5" fill="#18181b" />
            <rect x="-7" y="-17" width="7" height="5" fill="#18181b" />
          </g>

          {/* Right Finish Flag Pole & Banner */}
          <g transform="translate(26, 0)">
            <line x1="0" y1="8" x2="0" y2="-22" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="-23" r="2.5" fill="#f59e0b" />
            {/* Checkered Flag Right */}
            <rect x="0" y="-22" width="14" height="10" fill="#ffffff" stroke="#18181b" strokeWidth="0.75" rx="0.5" />
            <rect x="0" y="-22" width="7" height="5" fill="#18181b" />
            <rect x="7" y="-17" width="7" height="5" fill="#18181b" />
          </g>

          {/* Overhead Finish Arch Ribbon */}
          <path
            d="M -26 -20 Q 0 -30 26 -20"
            fill="none"
            stroke="#e0542c"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M -26 -20 Q 0 -30 26 -20"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x="0"
            y="-27"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7.5"
            fontWeight="900"
            letterSpacing="1"
            style={{
              paintOrder: "stroke",
              stroke: "#c23f1b",
              strokeWidth: "2.5px",
              strokeLinejoin: "round"
            }}
          >
            FINISH
          </text>
        </g>
      </svg>

      {/* Nodes List on top of SVG */}
      <div className="relative z-10 w-full">
        {lessons.map((lesson, idx) => {
            const isCompleted = lesson.seen_status === "completed";
            const isCurrent = idx === currentIdx;
            const isLocked = idx > currentIdx && !isCompleted;
            const offset = getNodeOffset(idx);

            // Positioning rule based on user sketch:
            // If node is on the left (offset < -10) -> Title is on the RIGHT
            // Otherwise (center or right) -> Title is on the LEFT
            const isBoxOnRight = offset < -10;
            const nodeCenterX = MAP_WIDTH / 2 + offset;
            const nodeRadius = 32;

            return (
              <div
                key={lesson.id}
                style={{ height: `${ROW_HEIGHT}px` }}
                className="w-full relative flex items-center justify-center"
              >
                {/* 3D Duolingo Button Node Sitting Directly on the Road */}
                <div
                  style={{ transform: `translateX(${offset}px)` }}
                  className="relative flex flex-col items-center z-10"
                >
                  {/* Current Active Indicator Badge floating above */}
                  {isCurrent && !isCompleted && (
                    <div className="absolute -top-7 z-20 flex flex-col items-center animate-bounce duration-700 whitespace-nowrap pointer-events-none">
                      <div
                        style={{
                          backgroundColor: activeColor,
                          color: "#ffffff"
                        }}
                        className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/20"
                      >
                        <Sparkles size={9} className="fill-current text-amber-300" />
                        Mulai Di Sini
                      </div>
                      <div
                        style={{ borderTopColor: activeColor }}
                        className="w-0 h-0 border-x-4 border-x-transparent border-t-4"
                      />
                    </div>
                  )}

                  {/* Active Outer Ring */}
                  {isCurrent && (
                    <div
                      style={{ borderColor: `${activeColor}40` }}
                      className="absolute -inset-2.5 rounded-full border-4 animate-ping opacity-75 pointer-events-none"
                    />
                  )}

                  <button
                    onClick={() => {
                      if (!isLocked) {
                        setSelectedLesson(lesson);
                      }
                    }}
                    disabled={isLocked}
                    style={{
                      backgroundColor: isCompleted
                        ? THEME_COLORS.hex.sawahPertumbuhan
                        : isCurrent
                        ? activeColor
                        : "#ffffff",
                      borderBottomColor: isCompleted
                        ? THEME_COLORS.hex.sawahPertumbuhanDark
                        : isCurrent
                        ? THEME_COLORS.hex.primaryHover
                        : "#cbd5e1"
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white border-b-[6px] transition-all duration-150 shadow-md relative z-10 ${
                      isLocked
                        ? "cursor-not-allowed border-b-[5px] text-zinc-400"
                        : "cursor-pointer active:translate-y-1 active:border-b-[2px] hover:brightness-105"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={28} className="stroke-[3.5] drop-shadow-xs" />
                    ) : isCurrent ? (
                      <Play size={24} className="fill-current ml-1 drop-shadow-xs" />
                    ) : isLocked ? (
                      <Lock size={22} className="text-zinc-400" />
                    ) : (
                      <Star size={24} className="fill-current" />
                    )}
                  </button>
                </div>

                {/* Title placed beside node: 100% cardless with crisp white text-shadow halo */}
                <div
                  onClick={() => {
                    if (!isLocked) setSelectedLesson(lesson);
                  }}
                  style={
                    isBoxOnRight
                      ? {
                          left: `${nodeCenterX + nodeRadius + 14}px`,
                          maxWidth: "140px"
                        }
                      : {
                          right: `${MAP_WIDTH - (nodeCenterX - nodeRadius) + 14}px`,
                          maxWidth: "140px"
                        }
                  }
                  className={`absolute top-1/2 -translate-y-1/2 select-none transition-opacity duration-150 z-30 ${
                    isBoxOnRight ? "text-left" : "text-right"
                  } ${
                    isCurrent
                      ? "cursor-pointer"
                      : isCompleted
                      ? "cursor-pointer"
                      : "opacity-75 cursor-not-allowed"
                  }`}
                >
                  <h4
                    style={{
                      color: THEME_COLORS.hex.textDark,
                      textShadow:
                        "0 0 6px #ffffff, 0 0 10px #ffffff, 0 1px 2px #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff"
                    }}
                    className="text-xs font-bold leading-snug line-clamp-2 break-words"
                  >
                    {formatTitle(lesson.title, idx)}
                  </h4>
                  <div
                    className={`flex items-center gap-1 mt-0.5 ${
                      isBoxOnRight ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isCompleted ? (
                      <span
                        style={{
                          color: THEME_COLORS.hex.sawahPertumbuhanText,
                          textShadow: "0 0 6px #ffffff, 0 0 8px #ffffff"
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider"
                      >
                        Selesai
                      </span>
                    ) : isCurrent ? (
                      <span
                        style={{
                          color: activeColor,
                          textShadow: "0 0 6px #ffffff, 0 0 8px #ffffff"
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider"
                      >
                        +{lesson.lesson_points || 10} Poin
                      </span>
                    ) : (
                      <span
                        style={{
                          textShadow: "0 0 6px #ffffff, 0 0 8px #ffffff"
                        }}
                        className="text-[9px] font-medium text-zinc-600"
                      >
                        {lesson.chunks_count || 0} Konten
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Lesson Detail Popover / Modal on Tap */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-zinc-100 space-y-4 animate-in slide-in-from-bottom-6 duration-200 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  style={{
                    backgroundColor:
                      selectedLesson.seen_status === "completed"
                        ? `${THEME_COLORS.hex.sawahPertumbuhan}1A`
                        : `${activeColor}1A`,
                    color:
                      selectedLesson.seen_status === "completed"
                        ? THEME_COLORS.hex.sawahPertumbuhanText
                        : activeColor
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                >
                  {selectedLesson.seen_status === "completed" ? (
                    <Check size={20} className="stroke-[3]" />
                  ) : (
                    <Play size={18} className="fill-current" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Materi Pembelajaran
                  </span>
                  <h3
                    style={{ color: THEME_COLORS.hex.textDark }}
                    className="text-xs font-bold leading-snug line-clamp-2"
                  >
                    {selectedLesson.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content & Points Badge Row */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-zinc-400" />
                <span className="text-xs font-bold text-zinc-700">
                  {selectedLesson.chunks_count || 0} Bagian Konten
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-zinc-700">
                  +{selectedLesson.lesson_points || 10} Poin POT
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  const lessonToOpen = selectedLesson;
                  setSelectedLesson(null);
                  onSelectLesson(lessonToOpen);
                }}
                style={{
                  backgroundColor:
                    selectedLesson.seen_status === "completed"
                      ? THEME_COLORS.hex.sawahPertumbuhan
                      : activeColor
                }}
                className="w-full py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play size={14} className="fill-current" />
                {selectedLesson.seen_status === "completed"
                  ? "Pelajari Ulang"
                  : selectedLesson.seen_status === "in_progress"
                  ? "Lanjutkan Belajar"
                  : "Mulai Belajar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
