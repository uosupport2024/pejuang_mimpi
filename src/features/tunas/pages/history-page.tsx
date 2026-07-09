import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, RefreshCw, Calendar } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import { THEME_COLORS } from "@/shared/constants/colors";
import patternBg from "@/assets/bg/pattern-background.png";
import { fetchJadwalHistoryAPI } from "../api/absensi";

type AttendanceStatus = "Early" | "On Time" | "Late";

interface HistoryItem {
  day: number;
  dayName: string;
  monthName: string;
  year: number;
  dateStr: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  location: string;
  status: AttendanceStatus;
}

const cardStyles: Record<AttendanceStatus, { bgClass: string; shadowClass: string }> = {
  Early: {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.liburanBali.gradient}`,
    shadowClass: "shadow-md shadow-[#5C8A90]/15",
  },
  "On Time": {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.rumah.gradient}`,
    shadowClass: "shadow-md shadow-[#7FA46D]/15",
  },
  Late: {
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.motor.gradient}`,
    shadowClass: "shadow-md shadow-[#F25C2A]/15",
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

const indonesianMonths = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Okt", "November", "Desember"
];

const calculateTotalHours = (checkIn: string, checkOut: string): string => {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  if (isNaN(inH) || isNaN(outH)) return "--:--";
  let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
  if (diffMins < 0) diffMins += 24 * 60;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export function MobileHistoryPage() {
  const { navigate } = useRouter();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const isFetched = useRef(false);

  const loadHistory = async (targetPage: number, append = false) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      // Fetch data for the last 90 days
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-CA");
      };

      const startDate = formatDate(ninetyDaysAgo);
      const endDate = formatDate(today);

      const rawData = await fetchJadwalHistoryAPI(targetPage, 10, startDate, endDate);
      
      if (!rawData || rawData.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const mapped: HistoryItem[] = (rawData || []).map((item: any) => {
        const dateObj = new Date(item.tanggal);
        const day = dateObj.getDate() || parseInt(item.tanggal.split("-")[2]) || 1;
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }) || "Mon";
        const monthIndex = dateObj.getMonth();
        const monthName = indonesianMonths[monthIndex] || "Januari";
        const year = dateObj.getFullYear() || 2026;

        const checkIn = item.jam_absen ? item.jam_absen.substring(0, 5) : "--:--";
        const checkOut = item.jam_pulang ? item.jam_pulang.substring(0, 5) : "--:--";

        const totalHours = checkIn !== "--:--" && checkOut !== "--:--"
          ? calculateTotalHours(checkIn, checkOut)
          : "--:--";

        const location = item.lokasi?.nama_lokasi || "Kantor Cabang";

        let status: AttendanceStatus = "On Time";
        if (item.telat && parseFloat(item.telat) > 0) {
          status = "Late";
        } else if (checkIn !== "--:--") {
          const shiftObj = item.Shift || item.shift;
          if (shiftObj && shiftObj.jam_masuk) {
            const [inH, inM] = checkIn.split(":").map(Number);
            const [sH, sM] = shiftObj.jam_masuk.split(":").map(Number);
            if (!isNaN(inH) && !isNaN(sH)) {
              if ((sH * 60 + sM) - (inH * 60 + inM) > 5) {
                status = "Early";
              }
            }
          }
        }

        return {
          day,
          dayName,
          monthName,
          year,
          dateStr: item.tanggal,
          checkIn,
          checkOut,
          totalHours,
          location,
          status,
        };
      });

      if (append) {
        setHistoryList((prev) => [...prev, ...mapped]);
      } else {
        setHistoryList(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat presensi:", err);
      toast.error("Gagal mengambil data riwayat presensi");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    loadHistory(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage, true);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="relative z-10 flex items-center px-6 pt-7 pb-6 gap-3.5">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Laporan Presensi</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
              Semua Riwayat
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="space-y-3 pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-stretch rounded-2xl bg-zinc-100 border border-zinc-200/50 h-[84px] animate-pulse overflow-hidden"
              >
                <div className="w-16 bg-zinc-200/60 shrink-0" />
                <div className="flex-1 py-4.5 pl-4 pr-4 flex flex-col justify-center gap-2">
                  <div className="h-4 bg-zinc-200 rounded-md w-24" />
                  <div className="h-3 bg-zinc-200 rounded-md w-36 mt-1" />
                </div>
                <div className="flex items-center pr-4 shrink-0">
                  <div className="h-10 w-14 bg-zinc-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs font-semibold bg-white rounded-2xl border border-zinc-200/50">
            <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            Belum ada catatan riwayat presensi.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {historyList.map((item, index) => {
                const style = cardStyles[item.status] || cardStyles["On Time"];
                const displayDayName = indonesianDays[item.dayName] || item.dayName;

                return (
                  <div
                    key={index}
                    className={`flex items-stretch rounded-2xl shadow-sm text-white overflow-hidden ${style.bgClass} ${style.shadowClass}`}
                  >
                    {/* Left Column: Date badge */}
                    <div className="w-16 bg-white/15 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xl font-bold leading-none text-white">{item.day}</span>
                      <span className="text-[9px] font-bold uppercase mt-1.5 leading-none text-white/90 tracking-wider">
                        {displayDayName}
                      </span>
                    </div>

                    {/* Middle Column: details */}
                    <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-4 pl-4 pr-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white leading-none">
                        <span>{item.checkIn}</span>
                        <span className="text-white/60 font-semibold">—</span>
                        <span>{item.checkOut}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-white/80 font-semibold text-[8px] leading-none">
                        <span className="uppercase opacity-85">{item.monthName} {item.year}</span>
                        <span className="text-white/30">•</span>
                        <MapPin className="w-2.5 h-2.5 text-white/80 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.location}</span>
                      </div>
                    </div>

                    {/* Right Column: hours */}
                    <div className="flex items-center pr-4 shrink-0">
                      <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[56px] text-center">
                        <span className="text-[11px] font-bold leading-none text-white">{item.totalHours}</span>
                        <span className="text-[7.5px] font-bold uppercase mt-1 leading-none text-white/80 tracking-wider">Jam</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full mt-4 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] transition-all text-xs font-bold text-zinc-600 flex items-center justify-center gap-2 cursor-pointer bg-white"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                    Memuat Lebih Banyak...
                  </>
                ) : (
                  "Muat Lebih Banyak"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
