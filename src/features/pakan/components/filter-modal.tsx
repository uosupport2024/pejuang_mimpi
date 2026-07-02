import { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
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

// Fetch Indonesian provinces helper using wilayah.id (stable HTTPS with CORS)
async function fetchProvinces(): Promise<{ id: string; name: string }[]> {
  try {
    const cached = localStorage.getItem("indonesian_provinces_v2");
    if (cached) return JSON.parse(cached);

    const res = await fetch("https://wilayah.id/api/provinces.json");
    const json = await res.json();
    const formatted = (json.data || []).map((p: any) => ({
      id: p.code,
      name: p.name.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));

    localStorage.setItem("indonesian_provinces_v2", JSON.stringify(formatted));
    return formatted;
  } catch (err) {
    console.error("Failed to fetch provinces:", err);
    return [
      { id: "31", name: "DKI Jakarta" },
      { id: "32", name: "Jawa Barat" },
      { id: "33", name: "Jawa Tengah" },
      { id: "35", name: "Jawa Timur" }
    ];
  }
}

// Fetch Indonesian cities/regencies for a specific province
async function fetchCitiesForProvince(provinceId: string): Promise<{ id: string; name: string }[]> {
  try {
    const cacheKey = `indonesian_cities_v2_${provinceId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`https://wilayah.id/api/regencies/${provinceId}.json`);
    const json = await res.json();
    const formatted = (json.data || []).map((r: any) => {
      const cleanName = r.name
        .toLowerCase()
        .replace(/(kabupaten|kota|administrasi|adm\.)\s+/g, "")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      return { id: r.code, name: cleanName };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    localStorage.setItem(cacheKey, JSON.stringify(formatted));
    return formatted;
  } catch (err) {
    console.error(`Failed to fetch cities for province ${provinceId}:`, err);
    return [];
  }
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  tempFilteredCount,
  tempJobTypes = [],
  toggleTempJobType = () => {},
  tempWorkplaces = [],
  toggleTempWorkplace = () => {},
  tempCategories = [],
  toggleTempCategory = () => {},
  tempProvinces = [],
  toggleTempProvince = () => {},
  tempCities = [],
  toggleTempCity = () => {},
  tempMinSalary = 0,
  setTempMinSalary = () => {},
}: FilterModalProps) {
  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship"];
  const workplaceOptions = ["On-site", "Hybrid", "Remote"];
  const categoryOptions = [
    { id: "tech", name: "Tech" },
    { id: "design", name: "Design" },
    { id: "fnb", name: "F&B" },
    { id: "admin", name: "Admin" },
  ];
  const salaryOptions = [
    { label: "Semua", value: 0 },
    { label: "Rp 3 jt+", value: 3.0 },
    { label: "Rp 5 jt+", value: 5.0 },
    { label: "Rp 7 jt+", value: 7.0 },
    { label: "Rp 9 jt+", value: 9.0 },
  ];

  // Provinces State
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [provinceSearch, setProvinceSearch] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  // Cities State
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement | null>(null);

  // Load provinces initially
  useEffect(() => {
    async function load() {
      const data = await fetchProvinces();
      setProvinces(data);
    }
    load();
  }, []);

  const tempProvinceIds = (tempProvinces || []).map((p) => p.id).join(",");

  // Fetch and combine cities when selected provinces change
  useEffect(() => {
    async function loadCities() {
      if (tempProvinces && tempProvinces.length > 0) {
        const regenciesData = await Promise.all(
          tempProvinces.map((prov) => fetchCitiesForProvince(prov.id))
        );
        const combined = regenciesData.flat().sort((a, b) => a.name.localeCompare(b.name));
        setCities(combined);
      } else {
        setCities([]);
      }
    }
    loadCities();
  }, [tempProvinceIds]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProvinces = provinceSearch.trim()
    ? provinces
        .filter((prov) =>
          prov.name.toLowerCase().includes(provinceSearch.toLowerCase()) &&
          !tempProvinces.some((p) => p.id === prov.id)
        )
        .slice(0, 5)
    : provinces.filter((prov) => !tempProvinces.some((p) => p.id === prov.id)).slice(0, 5);

  const filteredCities = citySearch.trim()
    ? cities
        .filter((city) =>
          city.name.toLowerCase().includes(citySearch.toLowerCase()) &&
          !tempCities.includes(city.name)
        )
        .slice(0, 5)
    : cities.filter((city) => !tempCities.includes(city.name)).slice(0, 5);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
      />

      {/* Slide-up bottom drawer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Top Drag/Indicator bar */}
        <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-150/60 text-zinc-500 hover:text-zinc-850 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-gray-900">Filter Lowongan</span>
          </div>

          <button
            onClick={() => {
              onReset();
              setProvinceSearch("");
              setCitySearch("");
            }}
            className="text-xs font-bold text-[#e0542c] hover:text-[#c23f1b] transition-colors cursor-pointer"
          >
            Atur Ulang
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4.5">
          {/* Section: Job Type */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Tipe Pekerjaan
            </span>
            <div className="flex flex-wrap gap-2.5">
              {jobTypeOptions.map((type) => {
                const isActive = tempJobTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleTempJobType(type)}
                    className={`px-4 py-2 rounded-2xl text-xs font-normal transition-all duration-150 cursor-pointer border ${isActive
                      ? "bg-[#e0542c] text-white border-[#e0542c]"
                      : "bg-white border-zinc-300 text-gray-750 hover:bg-zinc-50"
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Workplace Type */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Lokasi Kerja
            </span>
            <div className="flex flex-wrap gap-2.5">
              {workplaceOptions.map((workplace) => {
                const isActive = tempWorkplaces.includes(workplace);
                return (
                  <button
                    key={workplace}
                    type="button"
                    onClick={() => toggleTempWorkplace(workplace)}
                    className={`px-4 py-2 rounded-2xl text-xs font-normal transition-all duration-150 cursor-pointer border ${isActive
                      ? "bg-[#e0542c] text-white border-[#e0542c]"
                      : "bg-white border-zinc-300 text-gray-750 hover:bg-zinc-50"
                      }`}
                  >
                    {workplace}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Provinsi (Multi-Select Step 1) */}
          <div className="space-y-2 relative" ref={provinceDropdownRef}>
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Pilih Provinsi
            </span>

            {/* Selected Provinces Tags */}
            {tempProvinces.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tempProvinces.map((prov) => (
                  <span
                    key={prov.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-semibold rounded-full border border-zinc-200"
                  >
                    <span>{prov.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleTempProvince(prov)}
                      className="hover:bg-zinc-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik nama provinsi... (cth: DKI Jakarta, DIY Yogyakarta)"
                value={provinceSearch}
                onChange={(e) => {
                  setProvinceSearch(e.target.value);
                  setShowProvinceDropdown(true);
                }}
                onFocus={() => setShowProvinceDropdown(true)}
                className="w-full h-10 pl-9 pr-4 bg-white border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e0542c]"
              />
            </div>

            {showProvinceDropdown && filteredProvinces.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-zinc-100">
                {filteredProvinces.map((prov) => (
                  <div
                    key={prov.id}
                    onClick={() => {
                      toggleTempProvince(prov);
                      setProvinceSearch("");
                      setShowProvinceDropdown(false);
                    }}
                    className="px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer font-semibold text-left transition-colors"
                  >
                    {prov.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Kota (Multi-Select Step 2) */}
          <div className="space-y-2 relative" ref={cityDropdownRef}>
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Pilih Kota / Kabupaten
            </span>

            {/* Selected Cities Tags */}
            {tempCities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tempCities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e0542c]/10 text-[#e0542c] text-[10px] font-semibold rounded-full"
                  >
                    <span>{city}</span>
                    <button
                      type="button"
                      onClick={() => toggleTempCity(city)}
                      className="hover:bg-[#e0542c]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input Search box */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  tempProvinces.length > 0
                    ? "Ketik nama kota... (cth: Bandung, Bekasi)"
                    : "Pilih provinsi terlebih dahulu"
                }
                disabled={tempProvinces.length === 0}
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                className={`w-full h-10 pl-9 pr-4 bg-white border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e0542c] ${
                  tempProvinces.length === 0 ? "opacity-55 cursor-not-allowed bg-zinc-50" : ""
                }`}
              />
            </div>

            {/* Dropdown Suggestions List */}
            {tempProvinces.length > 0 && showCityDropdown && filteredCities.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-zinc-100">
                {filteredCities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => {
                      toggleTempCity(city.name);
                      setCitySearch("");
                      setShowCityDropdown(false);
                    }}
                    className="px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer font-semibold text-left transition-colors"
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Specialization Category */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Kategori Spesialisasi
            </span>
            <div className="flex flex-wrap gap-2.5">
              {categoryOptions.map((cat) => {
                const isActive = tempCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleTempCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-normal transition-all duration-150 cursor-pointer border ${isActive
                      ? "bg-[#e0542c] text-white border-[#e0542c]"
                      : "bg-white border-zinc-300 text-gray-750 hover:bg-zinc-50"
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Minimum Salary */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 block text-left">
              Rentang Gaji Minimum
            </span>
            <div className="flex flex-wrap gap-2.5">
              {salaryOptions.map((salary) => {
                const isActive = tempMinSalary === salary.value;
                return (
                  <button
                    key={salary.label}
                    type="button"
                    onClick={() => setTempMinSalary(salary.value)}
                    className={`px-4 py-2 rounded-2xl text-xs font-normal transition-all duration-150 cursor-pointer border ${isActive
                      ? "bg-[#e0542c] text-white border-[#e0542c]"
                      : "bg-white border-zinc-300 text-gray-750 hover:bg-zinc-50"
                      }`}
                  >
                    {salary.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-white shrink-0 border-t border-zinc-100">
          <button
            onClick={onApply}
            className="w-full py-3.5 bg-[#e0542c] hover:bg-[#c23f1b] text-white font-bold rounded-2xl transition-all duration-200 text-xs cursor-pointer shadow-sm"
          >
            Tampilkan {tempFilteredCount} Lowongan
          </button>
        </div>
      </div>
    </>
  );
}
