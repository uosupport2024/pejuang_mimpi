import { useState, useEffect, useMemo, useCallback } from "react";
import type { JobOpening } from "../types/pakan.type";
import { fetchLokers } from "../api/loker";

const BASE_MOCK_JOBS: JobOpening[] = [
  { id: "1", position: "Frontend Developer", company: "PT Finexy Digital Corp", location: "Jakarta Selatan • Hybrid", salary: "Rp 6,5 - 9,0 jt", category: "tech", jobType: "Full-time", workplace: "Hybrid", salaryMin: 6.5, salaryMax: 9.0 },
  { id: "2", position: "Social Media Specialist", company: "Mimpi Creative Agency", location: "Bandung • Remote", salary: "Rp 4,5 - 6,0 jt", category: "design", jobType: "Part-time", workplace: "Remote", salaryMin: 4.5, salaryMax: 6.0 },
  { id: "3", position: "Barista & Store Helper", company: "Kopi Nusantara Co", location: "Surabaya • Full-time", salary: "Rp 3,5 - 4,5 jt", category: "fnb", jobType: "Full-time", workplace: "On-site", salaryMin: 3.5, salaryMax: 4.5 },
  { id: "4", position: "Admin Operational", company: "PT Logistik Jaya", location: "Tangerang • On-site", salary: "Rp 4,8 - 5,5 jt", category: "admin", jobType: "Contract", workplace: "On-site", salaryMin: 4.8, salaryMax: 5.5 },
  { id: "5", position: "UI/UX Designer", company: "GoDigital Indonesia", location: "Jakarta • Hybrid", salary: "Rp 7,0 - 10,0 jt", category: "design", jobType: "Full-time", workplace: "Hybrid", salaryMin: 7.0, salaryMax: 10.0 },
  { id: "6", position: "Backend Engineer", company: "TechInnovate Solutions", location: "Jakarta • Remote", salary: "Rp 8,0 - 12,0 jt", category: "tech", jobType: "Full-time", workplace: "Remote", salaryMin: 8.0, salaryMax: 12.0 },
  { id: "7", position: "Chef de Partie", company: "Rasa Selera Restaurant", location: "Bali • On-site", salary: "Rp 5,0 - 7,0 jt", category: "fnb", jobType: "Full-time", workplace: "On-site", salaryMin: 5.0, salaryMax: 7.0 },
  { id: "8", position: "Executive Assistant", company: "Global Trade Corp", location: "Jakarta • On-site", salary: "Rp 6,0 - 8,0 jt", category: "admin", jobType: "Full-time", workplace: "On-site", salaryMin: 6.0, salaryMax: 8.0 },
];

const EXTENDED_MOCK_JOBS: JobOpening[] = [];
for (let batch = 0; batch < 4; batch++) {
  BASE_MOCK_JOBS.forEach((job) => {
    let suffix = "";
    if (batch === 1) suffix = " (Senior)";
    if (batch === 2) suffix = " (Junior)";
    if (batch === 3) suffix = " (Lead)";

    EXTENDED_MOCK_JOBS.push({
      ...job,
      id: `${job.id}-batch-${batch}`,
      position: `${job.position}${suffix}`,
      company: batch > 0 ? `${job.company} Ltd.` : job.company,
    });
  });
}

export function usePakan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [page, setPage] = useState(1);
  const [isServerActive, setIsServerActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  // Active filters applied to the listing
  const [activeJobTypes, setActiveJobTypes] = useState<string[]>([]);
  const [activeWorkplaces, setActiveWorkplaces] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeMinSalary, setActiveMinSalary] = useState<number>(0);
  const [activeProvinces, setActiveProvinces] = useState<{ id: string; name: string }[]>([]);
  const [activeCities, setActiveCities] = useState<string[]>([]);

  // Temporary/draft filters (inside the modal/drawer)
  const [tempJobTypes, setTempJobTypes] = useState<string[]>([]);
  const [tempWorkplaces, setTempWorkplaces] = useState<string[]>([]);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempMinSalary, setTempMinSalary] = useState<number>(0);
  const [tempProvinces, setTempProvinces] = useState<{ id: string; name: string }[]>([]);
  const [tempCities, setTempCities] = useState<string[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Synchronize draft states when the modal is opened
  const openFilters = useCallback(() => {
    setTempJobTypes(activeJobTypes);
    setTempWorkplaces(activeWorkplaces);
    setTempCategories(activeCategories);
    setTempMinSalary(activeMinSalary);
    setTempProvinces(activeProvinces);
    setTempCities(activeCities);
    setIsFilterOpen(true);
  }, [activeJobTypes, activeWorkplaces, activeCategories, activeMinSalary, activeProvinces, activeCities]);

  // Load jobs from backend API dynamically
  const loadJobs = useCallback(async (pageNum: number, isAppend: boolean) => {
    try {
      if (pageNum === 1 && !isAppend) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Map UI filters to backend API job_type values
      let apiJobType: string | undefined = undefined;
      if (activeWorkplaces.includes("Remote")) {
        apiJobType = "remote";
      } else if (activeWorkplaces.includes("Hybrid")) {
        apiJobType = "hybrid";
      } else if (activeWorkplaces.includes("On-site")) {
        apiJobType = undefined;
      } else if (activeJobTypes.includes("Part-time")) {
        apiJobType = "paruh_waktu";
      } else if (activeJobTypes.includes("Full-time")) {
        apiJobType = "purna_waktu";
      }

      // Scale minimum salary by 1,000,000 for database compatibility
      const apiSalaryMin = activeMinSalary > 0 ? activeMinSalary * 1_000_000 : undefined;

      // Map city filter to API search query 'q' if no search string is inputted
      let apiQ = searchQuery;
      if (!apiQ && activeCities.length > 0) {
        apiQ = activeCities[0];
      }

      const res = await fetchLokers({
        q: apiQ,
        page: pageNum,
        per_page: 5,
        job_type: apiJobType,
        salary_min: apiSalaryMin,
      });

      setIsServerActive(true);
      if (isAppend) {
        setJobs(prev => [...prev, ...res.data]);
      } else {
        setJobs(res.data);
      }
      setHasMore(pageNum < res.last_page);
    } catch (err) {
      console.warn("Backend API not reachable, using fallback mock jobs.", err);
      setIsServerActive(false);
      if (!isAppend) {
        setJobs(EXTENDED_MOCK_JOBS);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, activeJobTypes, activeWorkplaces, activeMinSalary]);

  // Trigger initial load when search or filter parameters change
  useEffect(() => {
    setPage(1);
    loadJobs(1, false);
  }, [searchQuery, activeJobTypes, activeWorkplaces, activeCategories, activeMinSalary, activeCities, loadJobs]);

  // Reset all filters (either draft or active)
  const resetFilters = useCallback(() => {
    setTempJobTypes([]);
    setTempWorkplaces([]);
    setTempCategories([]);
    setTempMinSalary(0);
    setTempProvinces([]);
    setTempCities([]);
  }, []);

  // Apply drafted filters
  const applyFilters = useCallback(() => {
    setActiveJobTypes(tempJobTypes);
    setActiveWorkplaces(tempWorkplaces);
    setActiveCategories(tempCategories);
    setActiveMinSalary(tempMinSalary);
    setActiveProvinces(tempProvinces);
    setActiveCities(tempCities);
    setIsFilterOpen(false);
  }, [tempJobTypes, tempWorkplaces, tempCategories, tempMinSalary, tempProvinces, tempCities]);

  // Compute live match count based on temporary/draft filters (shows count on Terapkan button)
  const tempFilteredCount = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Search query filter
      const matchesSearch =
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Job Type filter
      if (tempJobTypes.length > 0 && !tempJobTypes.includes(job.jobType)) return false;

      // 3. Workplace filter
      if (tempWorkplaces.length > 0 && !tempWorkplaces.includes(job.workplace)) return false;

      // 4. Specialization/Category filter
      if (tempCategories.length > 0 && !tempCategories.includes(job.category)) return false;

      // 5. Min Salary filter
      if (tempMinSalary > 0 && job.salaryMin < tempMinSalary) return false;

      // 6. City/Location filter
      if (tempCities.length > 0) {
        const matchesCity = tempCities.some(city => 
          job.location.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(job.location.toLowerCase())
        );
        if (!matchesCity) return false;
      }

      return true;
    }).length;
  }, [jobs, searchQuery, tempJobTypes, tempWorkplaces, tempCategories, tempMinSalary]);

  // Active filtered jobs to render in UI
  const filteredJobs = useMemo(() => {
    if (isServerActive) {
      // Server already applied search & type queries, return accumulated jobs directly
      return jobs;
    }
    return jobs.filter((job) => {
      // 1. Search query filter
      const matchesSearch =
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Job Type filter
      if (activeJobTypes.length > 0 && !activeJobTypes.includes(job.jobType)) return false;

      // 3. Workplace filter
      if (activeWorkplaces.length > 0 && !activeWorkplaces.includes(job.workplace)) return false;

      // 4. Specialization/Category filter
      if (activeCategories.length > 0 && !activeCategories.includes(job.category)) return false;

      // 5. Min Salary filter
      if (activeMinSalary > 0 && job.salaryMin < activeMinSalary) return false;

      // 6. City/Location filter
      if (activeCities.length > 0) {
        const matchesCity = activeCities.some(city => 
          job.location.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(job.location.toLowerCase())
        );
        if (!matchesCity) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, activeJobTypes, activeWorkplaces, activeCategories, activeMinSalary, activeCities, isServerActive]);

  // Reset pagination when search query or active filters change (for client side fallback)
  useEffect(() => {
    if (!isServerActive) {
      setVisibleCount(5);
      setHasMore(filteredJobs.length > 5);
    }
  }, [searchQuery, activeJobTypes, activeWorkplaces, activeCategories, activeMinSalary, activeCities, filteredJobs.length, isServerActive]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    if (isServerActive) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadJobs(nextPage, true);
    } else {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => {
          const nextCount = prev + 5;
          if (nextCount >= filteredJobs.length) {
            setHasMore(false);
          }
          return nextCount;
        });
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [isLoading, isLoadingMore, hasMore, isServerActive, page, loadJobs, filteredJobs.length]);

  const displayedJobs = useMemo(() => {
    if (isServerActive) {
      return filteredJobs;
    }
    return filteredJobs.slice(0, visibleCount);
  }, [filteredJobs, visibleCount, isServerActive]);

  // Helper selectors for draft filters
  const toggleTempJobType = useCallback((type: string) => {
    setTempJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const toggleTempWorkplace = useCallback((workplace: string) => {
    setTempWorkplaces((prev) =>
      prev.includes(workplace) ? prev.filter((w) => w !== workplace) : [...prev, workplace]
    );
  }, []);

  const toggleTempCategory = useCallback((category: string) => {
    setTempCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const toggleTempCity = useCallback((city: string) => {
    setTempCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }, []);

  const toggleTempProvince = useCallback((province: { id: string; name: string }) => {
    setTempProvinces((prev) => {
      const exists = prev.some((p) => p.id === province.id);
      if (exists) {
        return prev.filter((p) => p.id !== province.id);
      } else {
        return [...prev, province];
      }
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredJobs: displayedJobs,
    totalJobsCount: filteredJobs.length,
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

    // Temp selection tools
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
  };
}
