import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RefreshCw, Calendar, Clock } from "lucide-react";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { fetchOvertimeHistoryAPI } from "../api/absensi";

type LemburStatus = "Approved" | "Pending" | "Rejected";

interface LemburHistoryItem {
  id: number;
  day: number;
  dayName: string;
  monthName: string;
  year: number;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: LemburStatus;
  notes: string | null;
  approvedBy: string;
}

const cardBg: Record<LemburStatus, string> = {
  Approved: "bg-[#516B46]", // Padi/Green theme
  Pending: "bg-[#d2911b]",  // Finexy Orange/Yellow theme
  Rejected: "bg-[#C54117]", // Rose/Red theme
};

const indonesianDays: Record<string, string> = {
  Mon: "Sen", Tue: "Sel", Wed: "Rab", Thu: "Kam",
  Fri: "Jum", Sat: "Sab", Sun: "Min",
};

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const formatDate = (date: Date) => date.toLocaleDateString("en-CA");

const mapItem = (item: any): LemburHistoryItem => {
  const d = new Date(item.tanggal);
  const ci = item.jam_masuk ? item.jam_masuk.substring(0, 5) : "--:--";
  const co = item.jam_keluar ? item.jam_keluar.substring(0, 5) : "--:--";
  
  return {
    id: item.id,
    day: d.getDate(),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthName: indonesianMonths[d.getMonth()] || "Jan",
    year: d.getFullYear(),
    checkIn: ci,
    checkOut: co,
    totalHours: item.total_lembur_formatted || "Belum Pulang",
    status: (item.status as LemburStatus) || "Pending",
    notes: item.notes,
    approvedBy: item.approved_by_name || ""
  };
};

export function MobileLemburHistoryPage() {
  const { navigate } = useRouter();

  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultEnd.getDate() - 30);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([defaultStart, defaultEnd]);
  const [startDate, endDate] = dateRange;

  const [historyList, setHistoryList] = useState<LemburHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadHistory = useCallback(async (
    targetPage: number,
    sDate: Date,
    eDate: Date,
    append = false
  ) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const rawData = await fetchOvertimeHistoryAPI(
        targetPage, 10,
        formatDate(sDate), formatDate(eDate)
      );
      setHasMore((rawData || []).length >= 10);
      const mapped = (rawData || []).map(mapItem);
      setHistoryList(prev => append ? [...prev, ...mapped] : mapped);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data riwayat lembur");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const initialLoaded = useRef(false);
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    loadHistory(1, defaultStart, defaultEnd);
  }, []);

  const handleRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    const [s, e] = range;
    if (s && e) {
      setPage(1);
      setHasMore(true);
      loadHistory(1, s, e);
    }
  };

  const handleLoadMore = () => {
    if (!startDate || !endDate) return;
    const next = page + 1;
    setPage(next);
    loadHistory(next, startDate, endDate, true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#e0542c] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "150px 150px", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center px-6 pt-7 pb-6 gap-3.5">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Riwayat Overtime</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Riwayat Lembur</h1>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-1 relative z-40">
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none text-left">Rentang Tanggal</span>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleRangeChange}
          maxDate={new Date()}
        />
      </div>

      {/* History List */}
      <div className="space-y-2.5 pb-8 relative z-10">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-stretch rounded-2xl bg-zinc-100 h-[78px] animate-pulse overflow-hidden">
                <div className="w-16 bg-zinc-200/60 shrink-0" />
                <div className="flex-1 py-4 pl-4 pr-4 flex flex-col justify-center gap-2">
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
            <p>Tidak ada riwayat lembur</p>
            <p className="text-zinc-300 mt-1">pada filter yang dipilih.</p>
          </div>
        ) : (
          <>
            {historyList.map((item, idx) => (
              <div key={idx} className={`flex flex-col rounded-2xl text-white overflow-hidden shadow-sm ${cardBg[item.status]}`}>
                <div className="flex items-stretch">
                  <div className="w-16 bg-white/15 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xl font-bold leading-none">{item.day}</span>
                    <span className="text-[9px] font-bold uppercase mt-1.5 leading-none text-white/90 tracking-wider">
                      {indonesianDays[item.dayName] || item.dayName}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-4 pl-4 pr-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold leading-none">
                      <span>{item.checkIn}</span>
                      <span className="text-white/60 font-semibold">—</span>
                      <span>{item.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-white/80 font-semibold text-[8px] leading-none">
                      <span className="uppercase opacity-85">{item.monthName} {item.year}</span>
                      <span className="text-white/30">•</span>
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.totalHours}</span>
                    </div>
                  </div>
                  <div className="flex items-center pr-4 shrink-0">
                    <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1 text-center min-w-[65px]">
                      <span className="text-[9px] font-bold leading-none uppercase">{item.status}</span>
                    </div>
                  </div>
                </div>
                {item.notes && (
                  <div className="px-4 pb-3 pt-1 border-t border-white/10 text-left bg-black/10">
                    <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider">Catatan Admin</p>
                    <p className="text-[10.5px] font-semibold text-white/90 mt-0.5 leading-normal">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full mt-2 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] transition-all text-xs font-bold text-zinc-600 flex items-center justify-center gap-2 cursor-pointer bg-white"
              >
                {isLoadingMore
                  ? <><RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />Memuat...</>
                  : "Muat Lebih Banyak"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
