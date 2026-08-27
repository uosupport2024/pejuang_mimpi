import { useState, useEffect } from "react";
import { Trophy, Crown, Flame, AlertTriangle, Sparkles } from "lucide-react";
import { fetchAttendanceLeaderboardBig3API, fetchAttendanceLeaderboardListAPI } from "../api/absensi";
import { THEME_COLORS, buildCssBackground } from "@/shared/constants/colors";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";

export interface LeaderboardUser {
  user_id: number;
  name: string;
  score: number;
  on_time: number;
  late: number;
  absent: number;
  early_leave: number;
  rank: number;
}

export interface LeaderboardPeriod {
  start?: string;
  end?: string;
}

export function AttendanceLeaderboard() {
  const { navbarBgStyle, buttonColor } = useTenantBranding();
  const [activeTab, setActiveTab] = useState<"big3" | "list">("big3");
  const [big3Data, setBig3Data] = useState<LeaderboardUser[]>([]);
  const [listData, setListData] = useState<LeaderboardUser[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      try {
        setIsLoading(true);
        setError(null);

        const [big3Res, listRes] = await Promise.all([
          fetchAttendanceLeaderboardBig3API().catch((err: any) => {
            console.error("Gagal memuat Big 3 Leaderboard:", err);
            return { period: null, leaderboard: [] };
          }),
          fetchAttendanceLeaderboardListAPI(1, 20).catch((err: any) => {
            console.error("Gagal memuat Leaderboard List:", err);
            return { period: null, leaderboardData: [], currentPage: 1, perPage: 20, total: 0, lastPage: 1 };
          }),
        ]);

        if (isMounted) {
          setBig3Data(big3Res.leaderboard || []);
          setListData(listRes.leaderboardData || []);
          setPeriod(big3Res.period || listRes.period || null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to fetch attendance leaderboard:", err);
          setError(err?.message || "Gagal memuat leaderboard presensi.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDatePeriod = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return "Bulan Ini";
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
      return `${s.toLocaleDateString("id-ID", options)} - ${e.toLocaleDateString("id-ID", options)}`;
    } catch {
      return "Bulan Ini";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const rank1 = big3Data.find((u) => u.rank === 1) || listData.find((u) => u.rank === 1) || big3Data[0] || listData[0];
  const rank2 = big3Data.find((u) => u.rank === 2) || listData.find((u) => u.rank === 2) || big3Data[1] || listData[1];
  const rank3 = big3Data.find((u) => u.rank === 3) || listData.find((u) => u.rank === 3) || big3Data[2] || listData[2];

  return (
    <div className="flex flex-col text-left gap-3 mt-2">
      {/* Header Row */}
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-xs text-white"
            style={{ background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) }}
          >
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Leaderboard Presensi
            </span>
            <span className="text-[9px] font-semibold text-gray-400 mt-0.5">
              {formatDatePeriod(period?.start, period?.end)}
            </span>
          </div>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex bg-zinc-200/50 p-1 rounded-xl border border-zinc-200/40 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("big3")}
            style={activeTab === "big3" ? { background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) } : undefined}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "big3"
                ? "text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Top 3
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            style={activeTab === "list" ? { background: buildCssBackground(buttonColor, THEME_COLORS.hex.primary) } : undefined}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "list"
                ? "text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Semua ({listData.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-[200px] bg-zinc-100/70 rounded-3xl border border-zinc-200/40" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-semibold text-rose-600 space-y-1">
          <AlertTriangle className="w-5 h-5 mx-auto text-rose-500" />
          <p>{error}</p>
        </div>
      ) : big3Data.length === 0 && listData.length === 0 ? (
        <div className="py-10 bg-white rounded-2xl border border-zinc-200/60 text-center space-y-2">
          <Trophy className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="text-xs font-bold text-zinc-600">Belum Ada Data Presensi</p>
          <p className="text-[10px] text-zinc-400 font-medium">Leaderboard presensi bulan ini akan diperbarui secara otomatis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* TOP 3 PODIUM VIEW */}
          {activeTab === "big3" && (
            <div
              style={navbarBgStyle}
              className="text-white rounded-3xl p-5 pt-6 shadow-lg border border-white/10 relative overflow-hidden"
            >
              {/* Soft decorative background glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 blur-xl opacity-20 pointer-events-none rounded-full"
                style={{ backgroundColor: THEME_COLORS.hex.accent }}
              />

              <div className="flex items-center justify-between mb-5 z-10 relative">
                <span
                  style={{ color: THEME_COLORS.hex.accent }}
                  className="text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5"
                >
                  <Sparkles style={{ color: THEME_COLORS.hex.accent }} className="w-3.5 h-3.5" />
                  Top 3 Bulan Ini
                </span>
                <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                  Big 3
                </span>
              </div>

              {/* Clean Podium */}
              <div className="grid grid-cols-3 gap-3 items-end pt-1 pb-1 z-10 relative">
                {/* 2nd Place (Left) */}
                <div className="flex flex-col items-center text-center">
                  {rank2 ? (
                    <>
                      <div className="relative mb-2">
                        <div
                          className="w-12 h-12 rounded-full text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white/30"
                          style={{ backgroundColor: THEME_COLORS.hex.airKehidupan }}
                        >
                          {getInitials(rank2.name)}
                        </div>
                        <span
                          style={{ backgroundColor: THEME_COLORS.hex.airKehidupan, borderColor: THEME_COLORS.hex.navBg }}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white border-2 flex items-center justify-center text-[10px] font-black shadow-xs"
                        >
                          2
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[85px] leading-tight">
                        {rank2.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-300 mt-1">
                        {rank2.score} pts
                      </span>
                      {/* Clean Stand */}
                      <div className="w-full bg-white/10 border border-white/15 rounded-2xl py-3 mt-2.5 flex flex-col items-center">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-200">2nd</span>
                        <span className="text-[9px] text-white/70 font-semibold mt-0.5">{rank2.on_time} Hadir</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-24 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/30 font-bold">
                      -
                    </div>
                  )}
                </div>

                {/* 1st Place (Center - Elevated) */}
                <div className="flex flex-col items-center text-center -mt-3">
                  {rank1 ? (
                    <>
                      <Crown style={{ color: THEME_COLORS.hex.accent }} className="w-5 h-5 mb-1 drop-shadow-md animate-pulse" />
                      <div className="relative mb-2">
                        <div
                          className="w-14 h-14 rounded-full text-zinc-900 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white"
                          style={{ backgroundColor: THEME_COLORS.hex.padiKemakmuran }}
                        >
                          {getInitials(rank1.name)}
                        </div>
                        <span
                          style={{ backgroundColor: THEME_COLORS.hex.padiKemakmuran, borderColor: THEME_COLORS.hex.navBg }}
                          className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full text-zinc-900 border-2 flex items-center justify-center text-[10px] font-black shadow-xs"
                        >
                          1
                        </span>
                      </div>
                      <span
                        style={{ color: THEME_COLORS.hex.accent }}
                        className="text-xs font-black truncate max-w-[95px] leading-tight"
                      >
                        {rank1.name}
                      </span>
                      <span className="text-xs font-black text-amber-300 mt-1">
                        {rank1.score} pts
                      </span>
                      {/* Clean Stand */}
                      <div
                        style={{ backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}33`, borderColor: `${THEME_COLORS.hex.padiKemakmuran}66` }}
                        className="w-full border rounded-2xl py-4 mt-2.5 flex flex-col items-center shadow-sm"
                      >
                        <span style={{ color: THEME_COLORS.hex.accent }} className="text-[10px] font-black uppercase tracking-wider">1st</span>
                        <span className="text-[9px] text-white/90 font-bold mt-0.5">{rank1.on_time} Hadir</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-28 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/30 font-bold">
                      -
                    </div>
                  )}
                </div>

                {/* 3rd Place (Right) */}
                <div className="flex flex-col items-center text-center">
                  {rank3 ? (
                    <>
                      <div className="relative mb-2">
                        <div
                          className="w-12 h-12 rounded-full text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white/30"
                          style={{ backgroundColor: THEME_COLORS.hex.apiSemangat }}
                        >
                          {getInitials(rank3.name)}
                        </div>
                        <span
                          style={{ backgroundColor: THEME_COLORS.hex.apiSemangat, borderColor: THEME_COLORS.hex.navBg }}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white border-2 flex items-center justify-center text-[10px] font-black shadow-xs"
                        >
                          3
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[85px] leading-tight">
                        {rank3.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-300 mt-1">
                        {rank3.score} pts
                      </span>
                      {/* Clean Stand */}
                      <div className="w-full bg-white/10 border border-white/15 rounded-2xl py-2.5 mt-2.5 flex flex-col items-center">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-200">3rd</span>
                        <span className="text-[9px] text-white/70 font-semibold mt-0.5">{rank3.on_time} Hadir</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-20 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/30 font-bold">
                      -
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LIST BY NUMBER VIEW */}
          {activeTab === "list" && (
            <div className="flex flex-col gap-2.5">
              {listData.map((item) => {
                const isRank1 = item.rank === 1;
                const isRank2 = item.rank === 2;
                const isRank3 = item.rank === 3;

                let badgeStyle: React.CSSProperties = {};
                let badgeText = `#${item.rank}`;

                if (isRank1) {
                  badgeStyle = { backgroundColor: THEME_COLORS.hex.padiKemakmuran, color: "#18181b", borderColor: THEME_COLORS.hex.padiKemakmuran };
                  badgeText = "1";
                } else if (isRank2) {
                  badgeStyle = { backgroundColor: THEME_COLORS.hex.airKehidupan, color: "#ffffff", borderColor: THEME_COLORS.hex.airKehidupan };
                  badgeText = "2";
                } else if (isRank3) {
                  badgeStyle = { backgroundColor: THEME_COLORS.hex.apiSemangat, color: "#ffffff", borderColor: THEME_COLORS.hex.apiSemangat };
                  badgeText = "3";
                }

                return (
                  <div
                    key={item.user_id || item.rank}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200/60 rounded-2xl shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Rank Pill + User Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Number Badge */}
                      <div
                        style={badgeStyle}
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 bg-zinc-100 text-zinc-600 border-zinc-200"
                      >
                        {badgeText}
                      </div>

                      {/* Avatar Initials & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={{ backgroundColor: `${THEME_COLORS.hex.navBg}15`, borderColor: `${THEME_COLORS.hex.navBg}30`, color: THEME_COLORS.hex.navBg }}
                          className="w-8.5 h-8.5 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none"
                        >
                          {getInitials(item.name)}
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="text-xs font-bold text-zinc-900 truncate leading-snug">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-500 leading-none mt-0.5">
                            <span style={{ color: THEME_COLORS.hex.sawahPertumbuhan }} className="font-bold">{item.on_time} Hadir</span>
                            {item.late > 0 && <span style={{ color: THEME_COLORS.hex.padiKemakmuran }} className="ml-1.5">• {item.late} Telat</span>}
                            {item.absent > 0 && <span className="text-rose-500 ml-1.5">• {item.absent} Alpa</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Pill */}
                    <div
                      style={navbarBgStyle}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-extrabold shadow-xs shrink-0 ml-2"
                    >
                      <Flame style={{ color: THEME_COLORS.hex.accent, fill: THEME_COLORS.hex.accent }} className="w-3 h-3" />
                      <span>{item.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
