import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, MapPin, RefreshCw, Calendar, ChevronDown, Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { fetchJadwalHistoryAPI, fetchShiftsAPI } from "../api/absensi";

type AttendanceStatus = "Early" | "On Time" | "Late";

interface HistoryItem {
  day: number;
  dayName: string;
  monthName: string;
  year: number;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  location: string;
  status: AttendanceStatus;
}

interface ShiftOption {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
}

const cardBg: Record<AttendanceStatus, string> = {
  Early: "bg-[#4A7A80]",
  "On Time": "bg-[#516B46]",
  Late: "bg-[#C54117]",
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

const formatDisplay = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()}`;

const calcTotalHours = (ci: string, co: string): string => {
  const [inH, inM] = ci.split(":").map(Number);
  const [outH, outM] = co.split(":").map(Number);
  if (isNaN(inH) || isNaN(outH)) return "--:--";
  let diff = (outH * 60 + outM) - (inH * 60 + inM);
  if (diff < 0) diff += 24 * 60;
  return `${Math.floor(diff / 60).toString().padStart(2, "0")}:${(diff % 60).toString().padStart(2, "0")}`;
};

const mapItem = (item: any): HistoryItem => {
  const d = new Date(item.tanggal);
  const ci = item.jam_absen ? item.jam_absen.substring(0, 5) : "--:--";
  const co = item.jam_pulang ? item.jam_pulang.substring(0, 5) : "--:--";
  let status: AttendanceStatus = "On Time";
  if (item.telat && parseFloat(item.telat) > 0) {
    status = "Late";
  } else if (ci !== "--:--") {
    const s = item.Shift || item.shift;
    if (s?.jam_masuk) {
      const [inH, inM] = ci.split(":").map(Number);
      const [sH, sM] = s.jam_masuk.split(":").map(Number);
      if (!isNaN(inH) && !isNaN(sH) && (sH * 60 + sM) - (inH * 60 + inM) > 5) status = "Early";
    }
  }
  return {
    day: d.getDate(),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthName: indonesianMonths[d.getMonth()] || "Jan",
    year: d.getFullYear(),
    checkIn: ci,
    checkOut: co,
    totalHours: ci !== "--:--" && co !== "--:--" ? calcTotalHours(ci, co) : "--:--",
    location: item.lokasi?.nama_lokasi || "Kantor Cabang",
    status,
  };
};

export function MobileHistoryPage() {
  const { navigate } = useRouter();

  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultEnd.getDate() - 30);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([defaultStart, defaultEnd]);
  const [startDate, endDate] = dateRange;

  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Search & custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shiftSearchQuery, setShiftSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadHistory = useCallback(async (
    targetPage: number,
    sDate: Date,
    eDate: Date,
    shiftId: number | null,
    append = false
  ) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const rawData = await fetchJadwalHistoryAPI(
        targetPage, 10,
        formatDate(sDate), formatDate(eDate),
        shiftId
      );
      setHasMore((rawData || []).length >= 10);
      const mapped = (rawData || []).map(mapItem);
      setHistoryList(prev => append ? [...prev, ...mapped] : mapped);
    } catch {
      toast.error("Gagal mengambil data riwayat presensi");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const initialLoaded = useRef(false);
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    loadHistory(1, defaultStart, defaultEnd, null);
    fetchShiftsAPI()
      .then(setShifts)
      .catch(() => {});
  }, []);

  const handleRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    const [s, e] = range;
    if (s && e) {
      setPage(1);
      setHasMore(true);
      loadHistory(1, s, e, selectedShiftId);
    }
  };

  const handleShiftSelect = (id: number | null) => {
    setSelectedShiftId(id);
    setIsDropdownOpen(false);
    setShiftSearchQuery("");
    setPage(1);
    setHasMore(true);
    if (startDate && endDate) {
      loadHistory(1, startDate, endDate, id);
    }
  };

  const handleLoadMore = () => {
    if (!startDate || !endDate) return;
    const next = page + 1;
    setPage(next);
    loadHistory(next, startDate, endDate, selectedShiftId, true);
  };

  const rangeLabel = startDate && endDate
    ? `${formatDisplay(startDate)}  –  ${formatDisplay(endDate)}`
    : startDate
    ? `${formatDisplay(startDate)}  –  ...`
    : "Pilih Rentang Tanggal";

  const selectedShift = shifts.find(s => s.id === selectedShiftId);

  // Filter shifts based on search query
  const filteredShifts = shifts.filter(s =>
    s.nama_shift.toLowerCase().includes(shiftSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
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
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Laporan Presensi</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Semua Riwayat</h1>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex gap-2 items-start relative z-40">
        {/* Range Date Picker */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">Rentang Tanggal</span>
          <DatePicker
            selectsRange
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            onChange={handleRangeChange}
            dateFormat="dd MMM yyyy"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            customInput={
              <button
                type="button"
                className="w-full h-[38px] flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 text-left hover:border-[#1e2a4a]/40 transition-colors cursor-pointer min-w-0"
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[10px] font-semibold text-zinc-700 truncate leading-none">{rangeLabel}</span>
              </button>
            }
          />
        </div>

        {/* Searchable Shift Filter Dropdown (Custom Shadcn combobox style) */}
        <div className="flex-1 flex flex-col gap-1 relative" ref={dropdownRef}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">Shift</span>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-[38px] flex items-center justify-between gap-2 bg-white border border-zinc-200 rounded-xl px-3 text-left hover:border-[#1e2a4a]/40 transition-colors cursor-pointer min-w-0"
          >
            <span className="text-[10px] font-semibold text-zinc-700 truncate leading-none">
              {selectedShift ? selectedShift.nama_shift : "Semua Shift"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-[56px] left-0 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 flex flex-col max-h-[220px]">
              {/* Search input header */}
              <div className="px-2 pb-1.5 pt-0.5 border-b border-zinc-100 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari shift..."
                  value={shiftSearchQuery}
                  onChange={(e) => setShiftSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[10px] font-medium text-zinc-800 placeholder-zinc-400 p-0"
                />
              </div>

              {/* Scrollable list options */}
              <div className="overflow-y-auto flex-1 mt-1">
                <button
                  type="button"
                  onClick={() => handleShiftSelect(null)}
                  className={`w-full text-left px-3 py-2 text-[10px] font-medium transition-colors hover:bg-zinc-50 ${!selectedShiftId ? "bg-zinc-50 text-[#e0542c] font-bold" : "text-zinc-700"}`}
                >
                  Semua Shift
                </button>
                {filteredShifts.length === 0 ? (
                  <div className="px-3 py-2 text-[9px] font-semibold text-zinc-400 text-center">
                    Tidak ditemukan
                  </div>
                ) : (
                  filteredShifts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleShiftSelect(s.id)}
                      className={`w-full text-left px-3 py-2 text-[10px] font-medium transition-colors hover:bg-zinc-50 ${selectedShiftId === s.id ? "bg-zinc-50 text-[#e0542c] font-bold" : "text-zinc-700"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{s.nama_shift}</span>
                        <span className="text-[8px] text-zinc-400 shrink-0 ml-1.5">
                          {s.jam_masuk?.substring(0, 5)} - {s.jam_keluar?.substring(0, 5)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {selectedShift && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#1e2a4a] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
            <span>{selectedShift.nama_shift}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/77">{selectedShift.jam_masuk?.substring(0,5)}–{selectedShift.jam_keluar?.substring(0,5)}</span>
            <button
              onClick={() => handleShiftSelect(null)}
              className="ml-0.5 text-white/60 hover:text-white cursor-pointer leading-none text-xs"
            >×</button>
          </div>
        </div>
      )}

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
            <p>Tidak ada riwayat presensi</p>
            <p className="text-zinc-300 mt-1">pada filter yang dipilih.</p>
          </div>
        ) : (
          <>
            {historyList.map((item, idx) => (
              <div key={idx} className={`flex items-stretch rounded-2xl text-white overflow-hidden ${cardBg[item.status]}`}>
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
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate max-w-[110px]">{item.location}</span>
                  </div>
                </div>
                <div className="flex items-center pr-4 shrink-0">
                  <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[52px] text-center">
                    <span className="text-[11px] font-bold leading-none">{item.totalHours}</span>
                    <span className="text-[7.5px] font-bold uppercase mt-1 leading-none text-white/80 tracking-wider">Jam</span>
                  </div>
                </div>
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

      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker-popper { z-index: 9999 !important; }
        
        /* Premium light-themed DatePicker styles matching Shadcn UI */
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          background-color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          padding: 4px;
        }
        
        .react-datepicker__header {
          background-color: #ffffff;
          border-bottom: 1px solid #f4f4f5;
          padding: 8px 8px 6px;
        }
        
        .react-datepicker__current-month {
          color: #18181b;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        
        .react-datepicker__month-select,
        .react-datepicker__year-select {
          background-color: #f4f4f5;
          border: 1px solid #e4e4e7;
          color: #18181b;
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 10px;
          font-weight: 600;
          outline: none;
          margin: 0 2px;
          cursor: pointer;
        }
        
        .react-datepicker__month-select:hover,
        .react-datepicker__year-select:hover {
          background-color: #e4e4e7;
        }

        .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          margin-top: 6px;
          border-top: 1px solid #f4f4f5;
          padding-top: 6px;
        }
        
        .react-datepicker__day-name {
          color: #71717a;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          width: 28px;
          text-align: center;
          margin: 0;
        }
        
        .react-datepicker__month {
          margin: 4px;
        }

        .react-datepicker__week {
          display: flex;
          justify-content: space-around;
        }
        
        .react-datepicker__day {
          color: #27272a;
          font-size: 11px;
          font-weight: 555;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          margin: 2px 0;
          transition: all 0.1s ease;
          cursor: pointer;
        }
        
        .react-datepicker__day:hover {
          background-color: #f4f4f5;
          color: #18181b;
        }
        
        /* Soft range selected styling */
        .react-datepicker__day--in-range {
          background-color: #fdf2f0 !important;
          color: #c23f1b !important;
          border-radius: 0px;
        }

        .react-datepicker__day--in-selecting-range {
          background-color: #fdf2f0 !important;
          color: #c23f1b !important;
        }
        
        /* Solid range endpoints */
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
        .react-datepicker__day--selected {
          background-color: #e0542c !important;
          color: #ffffff !important;
          font-weight: 700;
          border-radius: 8px !important;
        }
        
        .react-datepicker__day--today {
          color: #e0542c;
          font-weight: 700;
          border: 1px solid #e0542c30;
        }

        .react-datepicker__day--disabled {
          color: #d4d4d8;
          cursor: not-allowed;
        }

        .react-datepicker__day--disabled:hover {
          background-color: transparent;
          color: #d4d4d8;
        }
        
        /* Nav arrow chevrons styling */
        .react-datepicker__navigation {
          top: 10px;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #71717a;
          border-width: 2px 2px 0 0;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #18181b;
        }
      `}</style>
    </div>
  );
}
