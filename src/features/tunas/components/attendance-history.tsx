import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { THEME_COLORS } from "@/shared/constants/colors";

type AttendanceStatus = "Early" | "On Time" | "Late";

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
    bgClass: `bg-gradient-to-br ${THEME_COLORS.celengan.motor.gradient}`,
    shadowClass: "shadow-lg shadow-[#F25C2A]/15",
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

export function AttendanceHistory() {
  const historyData: HistoryItem[] = [
    { day: 12, dayName: "Fri", checkIn: "07:58", checkOut: "17:02", totalHours: "08:04", location: "Kantor Pusat, Jakarta Barat", status: "Early" },
    { day: 11, dayName: "Thu", checkIn: "07:55", checkOut: "17:00", totalHours: "08:05", location: "Kantor Pusat, Jakarta Barat", status: "Early" },
    { day: 10, dayName: "Wed", checkIn: "08:02", checkOut: "17:05", totalHours: "08:03", location: "Kantor Pusat, Jakarta Barat", status: "On Time" },
    { day: 9, dayName: "Tue", checkIn: "07:57", checkOut: "17:01", totalHours: "08:04", location: "Kantor Pusat, Jakarta Barat", status: "Early" },
    { day: 8, dayName: "Mon", checkIn: "08:05", checkOut: "17:10", totalHours: "08:05", location: "Kantor Pusat, Jakarta Barat", status: "On Time" },
    { day: 5, dayName: "Fri", checkIn: "08:19", checkOut: "17:03", totalHours: "07:44", location: "Kantor Pusat, Jakarta Barat", status: "Late" },
    { day: 4, dayName: "Thu", checkIn: "08:01", checkOut: "17:00", totalHours: "07:59", location: "Kantor Pusat, Jakarta Barat", status: "On Time" },
  ];

  return (
    <div className="flex flex-col text-left gap-2.5 mt-1">
      {/* Header Row */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Riwayat Presensi
        </span>
        <button
          type="button"
          onClick={() => toast.info("Membuka riwayat absensi lengkap...")}
          style={{ color: THEME_COLORS.hex.navBg }}
          className="text-[10px] font-bold cursor-pointer hover:opacity-75"
        >
          Lihat Semua
        </button>
      </div>

      {/* History Cards */}
      <div className="flex flex-col gap-2.5">
        {historyData.map((item, index) => {
          const style = cardStyles[item.status];
          const displayDayName = indonesianDays[item.dayName] || item.dayName;

          return (
            <div
              key={index}
              className={`flex items-stretch rounded-2xl shadow-md transition-all hover:scale-[1.005] duration-200 text-white overflow-hidden ${style.bgClass} ${style.shadowClass}`}
            >
              {/* Left Column: Full-height Translucent Date Badge (Flush with left/top/bottom edges) */}
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
                  <span>{item.checkIn}</span>
                  <span className="text-white/60 font-semibold">—</span>
                  <span>{item.checkOut}</span>
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
                  <span className="text-[11px] font-bold leading-none text-white">{item.totalHours}</span>
                  <span className="text-[7.5px] font-bold uppercase mt-1 leading-none text-white/80 tracking-wider">Jam</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
