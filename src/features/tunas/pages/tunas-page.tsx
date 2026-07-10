import { useState } from "react";
import { MapPin, ArrowLeft, Briefcase, Clock, Bookmark } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import logoWhite from "@/assets/logo/logo-white.png";
import patternBg from "@/assets/bg/pattern-background.png";
import { AbsensiCard } from "../components/absensi-card";
import { MenuGrid } from "../components/menu-grid";
// import { KehadiranHeatmap } from "../components/kehadiran-heatmap";
import { AttendanceHistory } from "../components/attendance-history";
import { useTunas } from "../hooks/use-tunas";
// import { THEME_COLORS } from "@/shared/constants/colors";
import type { TunasPageProps } from "../types/tunas.type";
import { PakanLokerList } from "../../pakan/components/pakan-list";
import { usePakan } from "../../pakan/hooks/use-pakan";

function PakanLokerSubPage() {
  const {
    searchQuery,
    setSearchQuery,
    filteredJobs,
    isLoading,
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
    tempProvinces,
    toggleTempProvince,
    tempCities,
    toggleTempCity,
    tempMinSalary,
    setTempMinSalary,
  } = usePakan();

  return (
    <div className="space-y-4">
      <PakanLokerList
        jobs={filteredJobs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
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
        tempProvinces={tempProvinces}
        toggleTempProvince={toggleTempProvince}
        tempCities={tempCities}
        toggleTempCity={toggleTempCity}
        tempMinSalary={tempMinSalary}
        setTempMinSalary={setTempMinSalary}
      />
    </div>
  );
}

export function TunasPage({ user }: TunasPageProps) {
  const { navigate } = useRouter();
  const { clockInTime, clockOutTime, isCheckedIn, dayName, dateString, locationName, profileData } = useTunas();
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
        {/* Flat Sticky Navy Header matching detail page layout */}
        <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md -mx-5 -mt-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "150px 150px",
              backgroundRepeat: "repeat"
            }}
          />
          <div className="flex items-center gap-3 relative z-10 w-full justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView("dashboard")}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-bold tracking-tight">Pakan</span>
            </div>
            <button
              onClick={() => toast.success("Pencarian disimpan!")}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <Bookmark className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Loker Content Page */}
        <div className="pt-2">
          <PakanLokerSubPage />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner Card - matching the design in Sangkar */}
      <div className="-mt-6 -mx-5 relative mb-4">
        <div className="w-full bg-[#1e2a4a] text-white rounded-t-none rounded-b-[40px] shadow-lg shadow-[#1e2a4a]/20 border-b border-white/10 flex flex-col p-6 pt-7 pb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "150px 150px",
              backgroundRepeat: "repeat"
            }}
          />

          {/* Content */}
          <div className="flex justify-between items-start z-10 relative mb-4">
            {/* Left: Logo & User Info */}
            <div className="flex items-center gap-3.5">
              <img src={logoWhite} alt="Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 leading-none">
                  {getGreeting()}
                </span>
                <span className="text-lg font-bold tracking-tight text-white mt-1.5 leading-none">
                  {user.name}
                </span>
              </div>
            </div>

            {/* Right: Pakan Button */}
            <button
              type="button"
              onClick={() => setActiveView("pakan")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer hover:shadow-[#e0542c]/20"
            >
              <Briefcase className="w-3.5 h-3.5 text-white/95" />
              <span>Pakan</span>
            </button>
          </div>

          {/* Divider line */}
          <div className="h-[1px] bg-white/15 w-full my-1.5 z-10 relative" />

          {/* Bottom row: Date & Location */}
          <div className="flex justify-between items-center z-10 relative mt-2 text-xs">
            <span className="font-semibold text-white/80">
              {dayName}, {dateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[9px] font-bold tracking-wide uppercase max-w-[180px] shadow-xs">
              <MapPin className="w-3 h-3 text-white/90 shrink-0" />
              <span className="truncate">{locationName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Clock In / Out & Action Card (Style matching user screenshot, no border) */}
      <div className={`w-full bg-[#1e2a4a] text-white p-5 rounded-3xl shadow-lg transition-all duration-300 flex flex-col ${
        !isCheckedIn 
          ? "border border-[#e0542c]/40 shadow-[0_0_15px_rgba(224,84,44,0.15)]" 
          : "border border-white/5 shadow-[#1e2a4a]/20"
      }`}>
        {/* Top: Job & Office Location */}
        <div className="flex justify-between items-center w-full border-b border-white/10 pb-3 mb-3 text-left">
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase text-white/50 font-bold tracking-wider leading-none">Divisi Kerja</span>
            <span className="text-xs font-bold text-white mt-1 leading-none">
              {profileData?.jabatan?.nama_jabatan || "Operasional"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7.5px] uppercase text-white/50 font-bold tracking-wider leading-none">Lokasi Kantor</span>
            <span className="text-xs font-bold text-[#fee279] mt-1 leading-none uppercase">
              {profileData?.lokasi?.nama_lokasi || "Kantor Pusat"}
            </span>
          </div>
        </div>

        {/* Notice Banner if not Checked In */}
        {!isCheckedIn && (
          <div className="flex items-center gap-2 px-3.5 py-2 mb-3.5 bg-[#e0542c]/10 border border-[#e0542c]/20 rounded-xl text-[9px] text-[#ff7e5a] font-bold tracking-wide uppercase select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0542c] shrink-0" />
            <span>Penting: Anda belum absen masuk hari ini!</span>
          </div>
        )}

        {/* Bottom: Clock Times & Action Button */}
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Times Info (Left Column) */}
          <div className="flex items-center gap-8 text-left">
            {/* Clock In */}
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider leading-none">Masuk</span>
              <span className="text-sm font-bold text-white mt-2 leading-none">
                {clockInTime === "--:--" ? "--" : clockInTime}
              </span>
            </div>

            {/* Clock Out */}
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider leading-none">Pulang</span>
              <span className="text-sm font-bold text-white mt-2 leading-none">
                {clockOutTime === "--:--" ? "--" : clockOutTime}
              </span>
            </div>
          </div>

          {/* Capsule Button (Right Column) */}
          <div className="relative">
            {/* Tooltip 'Ayokk klik akuu' */}
            {!isCheckedIn && (
              <div className="absolute bottom-full mb-3.5 right-1/2 translate-x-1/2 bg-[#ff7e5a] text-white text-[8px] font-black py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md shadow-[#e0542c]/20 animate-bounce z-20 border border-white/10 select-none">
                <span>Ayokk klik akuu!</span>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#ff7e5a]" />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                navigate("MobileAbsensi");
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5 ${
                isCheckedIn && clockOutTime !== "--:--"
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-tr from-[#e0542c] to-[#ff7e5a] text-white shadow-[#e0542c]/15"
              } ${!isCheckedIn ? "animate-wiggle" : ""}`}
              disabled={isCheckedIn && clockOutTime !== "--:--"}
            >
              {!(isCheckedIn && clockOutTime !== "--:--") && <Clock className="w-3.5 h-3.5 text-white/90" />}
              {!isCheckedIn
                ? "Masuk"
                : clockOutTime === "--:--"
                  ? "Keluar"
                  : "Selesai"}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance card */}
      <AbsensiCard
        izinCuti={profileData?.izin_cuti}
        izinLainnya={profileData?.izin_lainnya}
        izinTelat={profileData?.izin_telat}
        izinPulangCepat={profileData?.izin_pulang_cepat}
      />

      {/* Services Grid Menu */}
      <MenuGrid />

      {/* Heatmap Statistic - Hidden for now */}
      {/* <KehadiranHeatmap /> */}

      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
}
