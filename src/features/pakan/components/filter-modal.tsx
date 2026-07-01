import { X } from "lucide-react";

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
  tempMinSalary: number;
  setTempMinSalary: (salary: number) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  tempFilteredCount,
  tempJobTypes,
  toggleTempJobType,
  tempWorkplaces,
  toggleTempWorkplace,
  tempCategories,
  toggleTempCategory,
  tempMinSalary,
  setTempMinSalary,
}: FilterModalProps) {
  if (!isOpen) return null;

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
            onClick={onReset}
            className="text-xs font-bold text-[#e0542c] hover:text-[#c23f1b] transition-colors cursor-pointer"
          >
            Atur Ulang
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Job Type */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
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
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                        ? "bg-[#e0542c] text-white border border-transparent"
                        : "bg-zinc-50 border border-gray-200/80 text-gray-750 hover:bg-zinc-100/60"
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Workplace Type */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
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
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                        ? "bg-[#e0542c] text-white border border-transparent"
                        : "bg-zinc-50 border border-gray-200/80 text-gray-750 hover:bg-zinc-100/60"
                      }`}
                  >
                    {workplace}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Specialization Category */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
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
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                        ? "bg-[#e0542c] text-white border border-transparent"
                        : "bg-zinc-50 border border-gray-200/80 text-gray-750 hover:bg-zinc-100/60"
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Minimum Salary */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-left">
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
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                        ? "bg-[#e0542c] text-white border border-transparent"
                        : "bg-zinc-50 border border-gray-200/80 text-gray-750 hover:bg-zinc-100/60"
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
        <div className="p-5 bg-white shrink-0">
          <button
            onClick={onApply}
            className="w-full py-3.5 bg-[#e0542c] hover:bg-[#c23f1b] text-white font-bold rounded-2xl transition-all duration-200 text-xs cursor-pointer"
          >
            Tampilkan {tempFilteredCount} Lowongan
          </button>
        </div>
      </div>
    </>
  );
}
