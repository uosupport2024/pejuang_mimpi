import { useEffect, useRef } from "react";
import { Search, Briefcase, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { FilterModal } from "./filter-modal";
import type { JobOpening } from "../types/pakan.type";

interface PakanLokerListProps {
  jobs: JobOpening[];
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
  tempMinSalary: number;
  setTempMinSalary: (salary: number) => void;
}

export function PakanLokerList({
  jobs,
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
  tempMinSalary,
  setTempMinSalary,
}: PakanLokerListProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

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
      <div className="flex flex-col gap-3">
        {jobs.length > 0 ? (
          jobs.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-4 bg-white hover:bg-zinc-50/35 rounded-2xl border border-zinc-150 shadow-xs transition-all duration-200 cursor-pointer group"
              onClick={() => toast.success(`Membuka lamaran untuk ${item.position} di ${item.company}...`)}
            >
              {/* Top Row: Title & Salary */}
              <div className="flex justify-between items-start gap-3 w-full">
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-gray-950 group-hover:text-[#e0542c] transition-colors truncate">
                    {item.position}
                  </span>
                  <span className="text-[10px] text-zinc-450 font-bold truncate mt-0.5">
                    {item.company}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-[#e0542c]">{item.salary}</span>
                </div>
              </div>

              {/* Bottom Row: Metadata Badges & Location */}
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-100 w-full">
                {/* Badges */}
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#1e2a4a]/5 text-[#1e2a4a] uppercase tracking-wider">
                    {item.jobType}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${item.workplace === "Remote"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : item.workplace === "Hybrid"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-zinc-500/10 text-zinc-600"
                    }`}>
                    {item.workplace}
                  </span>
                </div>

                {/* Location */}
                <span className="text-[9px] text-zinc-450 font-bold truncate max-w-[150px]">
                  {item.location.split("•")[0].trim()}
                </span>
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
                  className="flex flex-col p-4 bg-white rounded-2xl border border-zinc-150 shadow-xs animate-pulse"
                >
                  {/* Top Row Skeleton */}
                  <div className="flex justify-between items-start gap-3 w-full">
                    <div className="flex flex-col text-left min-w-0">
                      <div className="h-3 w-32 bg-zinc-200 rounded-md mb-2" />
                      <div className="h-2.5 w-20 bg-zinc-100 rounded-md" />
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="h-3.5 w-16 bg-zinc-200 rounded-md" />
                    </div>
                  </div>

                  {/* Bottom Row Skeleton */}
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-100 w-full">
                    <div className="flex gap-1.5">
                      <div className="h-4 w-12 bg-zinc-100 rounded-md" />
                      <div className="h-4 w-12 bg-zinc-100 rounded-md" />
                    </div>
                    <div className="h-2.5 w-20 bg-zinc-100 rounded-md" />
                  </div>
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
        tempMinSalary={tempMinSalary}
        setTempMinSalary={setTempMinSalary}
      />
    </div>
  );
}
