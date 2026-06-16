import { useState } from "react";
import { MapPin, Fingerprint, ArrowLeft, Briefcase } from "lucide-react";
import { AbsensiCard } from "../components/absensi-card";
import { MenuGrid } from "../components/menu-grid";
import { KehadiranHeatmap } from "../components/kehadiran-heatmap";
import { AttendanceHistory } from "../components/attendance-history";
import { useTunas } from "../hooks/use-tunas";
import { THEME_COLORS } from "@/shared/constants/colors";
import type { TunasPageProps } from "../types/tunas.type";
import { PakanLokerList } from "../../pakan/components/pakan-list";
import { usePakan } from "../../pakan/hooks/use-pakan";

function PakanLokerSubPage() {
  const {
    searchQuery,
    setSearchQuery,
    filteredJobs,
    isLoadingMore,
    hasMore,
    loadMore,

    // Filter states
    isFilterOpen,
    setIsFilterOpen,
    openFilters,
    applyFilters,
    resetFilters,
    tempFilteredCount,

    // Temp states
    tempJobTypes,
    toggleTempJobType,
    tempWorkplaces,
    toggleTempWorkplace,
    tempCategories,
    toggleTempCategory,
    tempMinSalary,
    setTempMinSalary,
  } = usePakan();

  return (
    <div className="space-y-4">
      <PakanLokerList
        jobs={filteredJobs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}

        // Filter Props
        isFilterOpen={isFilterOpen}
        openFilters={openFilters}
        onCloseFilters={() => setIsFilterOpen(false)}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        tempFilteredCount={tempFilteredCount}
        tempJobTypes={tempJobTypes}
        toggleTempJobType={toggleTempJobType}
        tempWorkplaces={tempWorkplaces}
        toggleTempWorkplace={toggleTempWorkplace}
        tempCategories={tempCategories}
        toggleTempCategory={toggleTempCategory}
        tempMinSalary={tempMinSalary}
        setTempMinSalary={setTempMinSalary}
      />
    </div>
  );
}

export function TunasPage({ user }: TunasPageProps) {
  const { clockInTime, clockOutTime, isCheckedIn, handleClockPress, dayName, dateString, locationName } = useTunas();
  const [activeView, setActiveView] = useState<"dashboard" | "pakan">("dashboard");

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (activeView === "pakan") {
    return (
      <div className="space-y-4">
        {/* Header Back Button */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <button
            onClick={() => setActiveView("dashboard")}
            className="w-8 h-8 rounded-full bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all cursor-pointer hover:bg-zinc-50"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Tunas</span>
            <span className="text-base font-black text-gray-900 leading-none">Pakan (Loker)</span>
          </div>
        </div>

        {/* Loker Content Page */}
        <PakanLokerSubPage />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Greeting Header */}
      <div className="flex justify-between items-center px-1 pt-1">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
            {getGreeting()}
          </span>
          <span className="text-lg font-black text-gray-900 mt-0.5 leading-none">
            {user.name}
          </span>
        </div>
        
        {/* Loker (Pakan) Entry Button on the Top Right */}
        <button
          type="button"
          onClick={() => setActiveView("pakan")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white text-[9px] font-black uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer hover:shadow-[#e0542c]/20 animate-bounce-slow"
        >
          <Briefcase className="w-3 h-3 text-white/95" />
          <span>Pakan</span>
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

      {/* Attendance card + center button */}
      <div className="relative">
        <AbsensiCard
          clockInTime={clockInTime}
          clockOutTime={clockOutTime}
          isCheckedIn={isCheckedIn}
        />
        {/* Tombol absensi di tengah-tengah 4 card */}
        <button
          type="button"
          onClick={handleClockPress}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full ${THEME_COLORS.classes.navBg} text-white flex items-center justify-center shadow-2xl shadow-[#1e2a4a]/40 transition-all duration-200 active:scale-95 cursor-pointer group border-2 border-white/20 ring-[5px] ring-white`}
          title="Lakukan Absensi"
        >
          <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Services Grid Menu */}
      <MenuGrid />

      {/* Heatmap Statistic */}
      <KehadiranHeatmap />

      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
}
