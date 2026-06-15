import { MapPin, Clock } from "lucide-react";
import { AbsensiCard } from "../components/absensi-card";
import { MenuGrid } from "../components/menu-grid";
import { KehadiranHeatmap } from "../components/kehadiran-heatmap";
import { AttendanceHistory } from "../components/attendance-history";
import { useTunas } from "../hooks/use-tunas";
import { THEME_COLORS } from "@/shared/constants/colors";
import type { TunasPageProps } from "../types/tunas.type";

export function TunasPage({ user }: TunasPageProps) {
  const { clockInTime, clockOutTime, isCheckedIn, handleClockPress, dayName, dateString, locationName } = useTunas();

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-4">
      {/* Greeting & Attendance Button Header */}
      <div className="flex justify-between items-center px-1 pt-1">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
            {getGreeting()}
          </span>
          <span className="text-lg font-black text-gray-900 mt-0.5 leading-none">
            {user.name}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClockPress}
          className={`w-11 h-11 rounded-full ${THEME_COLORS.classes.navBg} text-white flex items-center justify-center shadow-lg shadow-[#1e2a4a]/20 transition-all duration-200 active:scale-95 cursor-pointer group shrink-0 border border-white/5`}
          title="Lakukan Absensi"
        >
          <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Day, Date & Location Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-zinc-500 leading-none">
            {dayName}, {dateString}
          </span>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e2a4a] text-white text-[9px] font-black tracking-wide uppercase max-w-[180px] shadow-xs">
            <MapPin className="w-3 h-3 text-white/90 shrink-0" />
            <span className="truncate">{locationName}</span>
          </span>
        </div>
      </div>

      {/* Attendance card */}
      <AbsensiCard
        clockInTime={clockInTime}
        clockOutTime={clockOutTime}
        isCheckedIn={isCheckedIn}
      />

      {/* Services Grid Menu */}
      <MenuGrid />

      {/* Heatmap Statistic */}
      <KehadiranHeatmap />

      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
}
