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

const statusStyles: Record<AttendanceStatus, string> = {
  Early: THEME_COLORS.classes.metricNormalBadge,        // emerald-500/10 + emerald-600
  "On Time": THEME_COLORS.classes.metricAccentBadge,    // yellow/10 + yellow
  Late: THEME_COLORS.classes.metricPrimaryBadge,        // orange/10 + orange
};

export function AttendanceHistory() {
  const historyData: HistoryItem[] = [
    { day: 12, dayName: "Fri", checkIn: "07:58", checkOut: "17:02", totalHours: "08:04", location: "Office, West Jakarta, Indonesia", status: "Early" },
    { day: 11, dayName: "Thu", checkIn: "07:55", checkOut: "17:00", totalHours: "08:05", location: "Office, West Jakarta, Indonesia", status: "Early" },
    { day: 10, dayName: "Wed", checkIn: "08:02", checkOut: "17:05", totalHours: "08:03", location: "Office, West Jakarta, Indonesia", status: "On Time" },
    { day: 9, dayName: "Tue", checkIn: "07:57", checkOut: "17:01", totalHours: "08:04", location: "Office, West Jakarta, Indonesia", status: "Early" },
    { day: 8, dayName: "Mon", checkIn: "08:05", checkOut: "17:10", totalHours: "08:05", location: "Office, West Jakarta, Indonesia", status: "On Time" },
    { day: 5, dayName: "Fri", checkIn: "08:19", checkOut: "17:03", totalHours: "07:44", location: "Office, West Jakarta, Indonesia", status: "Late" },
    { day: 4, dayName: "Thu", checkIn: "08:01", checkOut: "17:00", totalHours: "07:59", location: "Office, West Jakarta, Indonesia", status: "On Time" },
  ];

  return (
    <div className="flex flex-col text-left gap-2.5 mt-1">
      {/* Header Row */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Attendance History
        </span>
        <button
          type="button"
          onClick={() => toast.info("Membuka riwayat absensi lengkap...")}
          style={{ color: THEME_COLORS.hex.navBg }}
          className="text-[10px] font-extrabold cursor-pointer hover:opacity-75"
        >
          See More
        </button>
      </div>

      {/* History Cards */}
      <div className="flex flex-col gap-2.5">
        {historyData.map((item, index) => {
          const badge = statusStyles[item.status];
          return (
            <div
              key={index}
              className="flex items-stretch bg-white rounded-2xl border border-gray-100 shadow-sm shadow-zinc-100/60 overflow-hidden"
            >
              {/* Left Block: Square Blue Date Badge */}
              <div className={`flex flex-col items-center justify-center text-white w-16 shrink-0 bg-[${THEME_COLORS.hex.navBg}]`}>
                <span className="text-2xl font-black leading-none">{item.day}</span>
                <span className="text-[10px] font-bold uppercase mt-1 leading-none text-white/75 tracking-wide">
                  {item.dayName}
                </span>
              </div>

              {/* Right Block: Content */}
              <div className="flex-1 flex flex-col justify-center px-3 py-3 gap-1.5 min-w-0">
                {/* Times Row with dividers + status badge */}
                <div className="flex items-center gap-0">
                  {/* Check In */}
                  <div className="flex flex-col pr-3">
                    <span className="text-sm font-black text-gray-800 leading-none">{item.checkIn}</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 leading-none">Check In</span>
                  </div>
                  {/* Divider */}
                  <div className="w-px h-7 bg-gray-200 shrink-0" />
                  {/* Check Out */}
                  <div className="flex flex-col px-3">
                    <span className="text-sm font-black text-gray-800 leading-none">{item.checkOut}</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 leading-none">Check out</span>
                  </div>
                  {/* Divider */}
                  <div className="w-px h-7 bg-gray-200 shrink-0" />
                  {/* Total Hours */}
                  <div className="flex flex-col px-3">
                    <span className="text-sm font-black text-gray-800 leading-none">{item.totalHours}</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 leading-none">Total Hours</span>
                  </div>

                  {/* Status Badge — pushed to right */}
                  <div className="ml-auto pl-1 shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wide uppercase ${badge}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className={`w-2.5 h-2.5 shrink-0 text-[${THEME_COLORS.hex.navBg}]`} />
                  <span className="text-[9px] font-semibold text-zinc-400 truncate">{item.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
