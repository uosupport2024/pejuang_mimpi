import { PakanLokerList } from "../components/pakan-list";
import { usePakan } from "../hooks/use-pakan";
import type { PakanPageProps } from "../types/pakan.type";

export function PakanPage({}: PakanPageProps) {
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
      {/* Search Bar & Loker List Section */}
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
