import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { fetchJadwalHistoryAPI } from "../api/absensi";
import { useRouter } from "@/shared/router/router";

type AttendanceStatus = "Early" | "On Time" | "Late" | "Absent" | "Permit" | "Holiday";

interface HistoryItem {
  day: number;
  dayName: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  location: string;
  status: AttendanceStatus;
}

const cardStyles: Record<AttendanceStatus, { bgClass: string; shadowClass: string }> = {
  Early: {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.liburanBali.gradient}`,
    shadowClass: "shadow-lg shadow-[#5C8A90]/15",
  },
  "On Time": {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient}`,
    shadowClass: "shadow-lg shadow-[#7FA46D]/15",
  },
  Late: {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.laptopBaru.gradient}`, // Yellow/Gold for Late
    shadowClass: "shadow-lg shadow-[#F2B233]/15",
  },
  Absent: {
    bgClass: "bg-gradient-to-br from-[#e0542c] to-[#c23f1b]", // Red/Orange for Alpa (Absent)
    shadowClass: "shadow-lg shadow-[#e0542c]/20",
  },
  Permit: {
    bgClass: "bg-gradient-to-br from-amber-500 to-amber-600", // Amber for Sakit/Izin/Cuti
    shadowClass: "shadow-lg shadow-amber-500/15",
  },
  Holiday: {
    bgClass: "bg-gradient-to-br from-slate-400 to-slate-500", // Slate for Libur
    shadowClass: "shadow-lg shadow-slate-400/15",
  },
};

const indonesianDays: Record<string, string> = {
  Mon: "Sen",
  Tue: "Sel",
  Wed: "Rab",
  Thu: "Kam",
  Fri: "Jum",
  Sat: "Sab",
  Sun: "Min",
};

const calculateTotalHours = (checkIn: string, checkOut: string): string => {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  if (isNaN(inH) || isNaN(outH)) return "--:--";
  let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
  if (diffMins < 0) diffMins += 24 * 60; // crossover midnight
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export function AttendanceHistory() {
  const { navigate } = useRouter();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const loadHistory = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const formatDate = (date: Date) => {
          return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
        };

        const startDate = formatDate(sevenDaysAgo);
        const endDate = formatDate(today);

        const rawData = await fetchJadwalHistoryAPI(1, 10, startDate, endDate);

        // Filter on frontend to safeguard against unfiltered backend responses
        const filteredData = (rawData || []).filter((item: any) => {
          if (!item.tanggal) return false;
          return item.tanggal >= startDate && item.tanggal <= endDate;
        });

        // Map backend MappingShift models to HistoryItems
        const mapped: HistoryItem[] = filteredData.map((item: any) => {
          const dateObj = new Date(item.tanggal);
          const day = dateObj.getDate() || parseInt(item.tanggal.split("-")[2]) || 1;
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }) || "Mon";

          const checkIn = item.jam_absen ? item.jam_absen.substring(0, 5) : "--:--";
          const checkOut = item.jam_pulang ? item.jam_pulang.substring(0, 5) : "--:--";

          const totalHours = checkIn !== "--:--" && checkOut !== "--:--"
            ? calculateTotalHours(checkIn, checkOut)
            : "--:--";

          const location = item.lokasi?.nama_lokasi || "Kantor Cabang";

          // Determine status: Late if telat > 0, otherwise default to On Time (or Early if they clocked in early)
          let status: AttendanceStatus = "On Time";
          if (checkIn === "--:--" && checkOut === "--:--") {
            const statusAbsen = item.status_absen || "";
            if (statusAbsen === "Sakit" || statusAbsen === "Izin Masuk" || statusAbsen === "Izin" || statusAbsen === "Cuti") {
              status = "Permit";
            } else if (statusAbsen === "Libur") {
              status = "Holiday";
            } else {
              status = "Absent";
            }
          } else if (item.telat && parseFloat(item.telat) > 0) {
            status = "Late";
          } else if (checkIn !== "--:--") {
            const shiftObj = item.Shift || item.shift;
            if (shiftObj && shiftObj.jam_masuk) {
              const [inH, inM] = checkIn.split(":").map(Number);
              const [sH, sM] = shiftObj.jam_masuk.split(":").map(Number);
              if (!isNaN(inH) && !isNaN(sH)) {
                // If they checked in > 5 minutes before scheduled start time
                if ((sH * 60 + sM) - (inH * 60 + inM) > 5) {
                  status = "Early";
                }
              }
            }
          }

          return {
            day,
            dayName,
            checkIn,
            checkOut,
            totalHours,
            location,
            status,
          };
        });

        setHistoryList(mapped);
      } catch (err) {
        console.error("Gagal memuat riwayat presensi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="flex flex-col text-left gap-2.5 mt-1">
      {/* Header Row */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Riwayat Presensi
        </span>
        <button
          type="button"
          onClick={() => navigate("MobileHistory")}
          style={{ color: THEME_COLORS.hex.navBg }}
          className="text-[10px] font-bold cursor-pointer hover:opacity-75"
        >
          Lihat Semua
        </button>
      </div>

      {/* History Cards */}
      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-stretch rounded-2xl bg-zinc-100 border border-zinc-200/50 h-[84px] animate-pulse overflow-hidden"
              >
                {/* Left Column Skeleton */}
                <div className="w-16 bg-zinc-200/60 shrink-0" />

                {/* Middle Column Skeleton */}
                <div className="flex-1 py-4.5 pl-4 pr-4 flex flex-col justify-center gap-2">
                  <div className="h-4 bg-zinc-200 rounded-md w-24" />
                  <div className="h-3 bg-zinc-200 rounded-md w-36 mt-1" />
                </div>

                {/* Right Column Skeleton */}
                <div className="flex items-center pr-4 shrink-0">
                  <div className="h-10 w-14 bg-zinc-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs font-semibold bg-white rounded-2xl border border-zinc-200/50">
            Belum ada riwayat presensi.
          </div>
        ) : (
          historyList.map((item, index) => {
            const style = cardStyles[item.status] || cardStyles["On Time"];
            const displayDayName = indonesianDays[item.dayName] || item.dayName;

            return (
              <div
                key={index}
                className={`flex items-stretch rounded-2xl shadow-md transition-all hover:scale-[1.005] duration-200 text-white overflow-hidden ${style.bgClass} ${style.shadowClass}`}
              >
                {/* Left Column: Full-height Translucent Date Badge */}
                <div className="w-16 bg-white/15 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold leading-none text-white">{item.day}</span>
                  <span className="text-[9px] font-bold uppercase mt-1.5 leading-none text-white/90 tracking-wider">
                    {displayDayName}
                  </span>
                </div>

                {/* Middle Column: Times & Location */}
                <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-4.5 pl-4 pr-4">
                  {/* Times Row */}
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white leading-none">
                    {item.status === "Absent" ? (
                      <span>Alpa</span>
                    ) : item.status === "Permit" ? (
                      <span>Izin / Sakit / Cuti</span>
                    ) : item.status === "Holiday" ? (
                      <span>Hari Libur</span>
                    ) : (
                      <>
                        <span>{item.checkIn}</span>
                        <span className="text-white/60 font-semibold">—</span>
                        <span>{item.checkOut}</span>
                      </>
                    )}
                  </div>

                  {/* Location Row */}
                  <div className="flex items-center gap-1 mt-2 text-white/80 font-semibold text-[9px] leading-none">
                    <MapPin className="w-3 h-3 text-white/80 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                {/* Right Column: Total Work Hours Glass Badge */}
                <div className="flex items-center pr-4 shrink-0">
                  <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[56px] shrink-0 text-center">
                    <span className="text-[11px] font-bold leading-none text-white">
                      {["Absent", "Permit", "Holiday"].includes(item.status) ? "-" : item.totalHours}
                    </span>
                    <span className="text-[7.5px] font-bold uppercase mt-1 leading-none text-white/80 tracking-wider">Jam</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
