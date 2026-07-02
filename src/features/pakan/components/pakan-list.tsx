import { useEffect, useRef } from "react";
import { Search, Briefcase, SlidersHorizontal } from "lucide-react";
import { FilterModal } from "./filter-modal";
import type { JobOpening } from "../types/pakan.type";
import { useNavigate } from "react-router-dom";
import { THEME_COLORS } from "@/shared/constants/colors";

interface PakanLokerListProps {
  jobs: JobOpening[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;

  // Filter Drawer props
  isFilterOpen: boolean;
  openFilters: () => void;
  onCloseFilters: () => void;
  applyFilters: () => void;
  resetFilters: () => void;
  tempFilteredCount: number;
  tempJobTypes: string[];
  toggleTempJobType: (type: string) => void;
  tempWorkplaces: string[];
  toggleTempWorkplace: (workplace: string) => void;
  tempCategories: string[];
  toggleTempCategory: (category: string) => void;
  tempProvinces: { id: string; name: string }[];
  toggleTempProvince: (province: { id: string; name: string }) => void;
  tempCities: string[];
  toggleTempCity: (city: string) => void;
  tempMinSalary: number;
  setTempMinSalary: (salary: number) => void;
}

export function PakanLokerList({
  jobs,
  isLoading,
  searchQuery,
  onSearchChange,
  isLoadingMore,
  hasMore,
  loadMore,

  isFilterOpen,
  openFilters,
  onCloseFilters,
  applyFilters,
  resetFilters,
  tempFilteredCount,
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
}: PakanLokerListProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Button Container */}
      <div className="flex gap-2.5 items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari posisi, perusahaan, atau lokasi..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/80 rounded-2xl text-xs font-semibold text-gray-800 placeholder-zinc-400 focus:outline-hidden focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a]/10 shadow-xs transition-all"
          />
        </div>

        {/* Orange Filter Button */}
        <button
          type="button"
          onClick={openFilters}
          className="w-11 h-10.5 rounded-2xl bg-[#e0542c] hover:bg-[#c23f1b] text-white flex items-center justify-center hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
          title="Filter Lowongan"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center px-0.5">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Daftar Lowongan Kerja</span>
        <span className="text-[10px] text-zinc-450 font-bold">{jobs.length} Loker Dimuat</span>
      </div>

      {/* List of jobs */}
      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          // Initial skeleton loading template
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100/70 shadow-md shadow-black/[0.06] animate-pulse"
              >
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <div className="h-3.5 bg-zinc-200 rounded w-2/3 mb-2" />
                  <div className="h-2.5 bg-zinc-100 rounded w-1/3 mb-2.5" />
                  <div className="flex gap-1.5">
                    <div className="h-4 bg-zinc-100 rounded-full w-14" />
                    <div className="h-4 bg-zinc-100 rounded-full w-14" />
                    <div className="h-4 bg-zinc-100 rounded-full w-14" />
                  </div>
                </div>
                <div className="h-3.5 bg-zinc-200 rounded w-16 shrink-0 ml-3" />
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center justify-between p-3.5 bg-white hover:bg-zinc-50/40 rounded-2xl border border-gray-100/70 shadow-md shadow-black/[0.06] transition-all duration-200 cursor-pointer group hover:scale-[1.005] hover:shadow-lg"
              onClick={() => navigate(`/mobile/loker/${item.id}`)}
            >
              <div className="flex flex-col text-left min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 group-hover:text-[#e0542c] transition-colors truncate">
                  {item.position}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold truncate mt-0.5">
                  {item.company}
                </span>

                {/* Badges row matching homepage style */}
                <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-none select-none">
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.type}`}>
                    {item.jobType || "Full-time"}
                  </span>
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.location}`}>
                    {item.workplace || "On-site"}
                  </span>
                  <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${THEME_COLORS.badges.education}`}>
                    {item.location.split("•")[0].trim()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col text-right shrink-0 ml-3 self-center">
                <span className="text-xs font-bold text-[#e0542c]">{item.salary}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
            <Briefcase className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500">Tidak ada lowongan ditemukan</p>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>

      {/* Infinite Scroll Trigger & Skeleton Cards */}
      {hasMore && (
        <div ref={observerRef} className="space-y-3">
          {isLoadingMore ? (
            <>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100/70 shadow-md shadow-black/[0.06] animate-pulse"
                >
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <div className="h-3.5 bg-zinc-200 rounded w-2/3 mb-2" />
                    <div className="h-2.5 bg-zinc-100 rounded w-1/3 mb-2.5" />
                    <div className="flex gap-1.5">
                      <div className="h-4 bg-zinc-100 rounded-full w-14" />
                      <div className="h-4 bg-zinc-100 rounded-full w-14" />
                      <div className="h-4 bg-zinc-100 rounded-full w-14" />
                    </div>
                  </div>
                  <div className="h-3.5 bg-zinc-200 rounded w-16 shrink-0 ml-3" />
                </div>
              ))}
            </>
          ) : (
            <div className="h-4" /> // Invisible trigger area
          )}
        </div>
      )}

      {!hasMore && jobs.length > 0 && (
        <div className="py-6 text-center text-[10px] text-zinc-450 font-bold uppercase tracking-wider">
          Semua lowongan telah ditampilkan
        </div>
      )}

      {/* Slide-up filter drawer (Glints/JobStreet style) */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={onCloseFilters}
        onApply={applyFilters}
        onReset={resetFilters}
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
