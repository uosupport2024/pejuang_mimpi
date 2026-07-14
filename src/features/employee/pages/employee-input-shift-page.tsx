import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, MapPin } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import {
  fetchEmployeeMappingShiftsAPI,
  postMappingShiftAPI,
  deleteMappingShiftAPI,
  fetchShiftsAPI
} from "../api/shift";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";

interface ShiftTemplate {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
}

interface MappingShift {
  id: number;
  shift_id: number;
  tanggal: string;
  status_absen: string;
  lock_location: string | null;
  shift?: ShiftTemplate;
}

export function EmployeeInputShiftPage() {
  const { navigate } = useRouter();
  const location = useLocation();
  const employeeId = location.state?.employeeId;

  // Local state
  const [employee, setEmployee] = useState<any>(null);
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [mappings, setMappings] = useState<MappingShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [tanggalMulai, setTanggalMulai] = useState<string>("");
  const [tanggalAkhir, setTanggalAkhir] = useState<string>("");
  const [lockLocation, setLockLocation] = useState<boolean>(false);

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    date: string;
  }>({
    isOpen: false,
    id: null,
    date: "",
  });
  const [deleting, setDeleting] = useState(false);

  // Load shifts and mappings
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch shift templates
      const shiftList = await fetchShiftsAPI();
      setShifts(shiftList);

      // Default select to first shift if available
      if (shiftList.length > 0) {
        setSelectedShiftId(shiftList[0].id.toString());
      }

      // Fetch employee mappings for the current month range +/- 1 month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

      const startStr = startOfMonth.toLocaleDateString("en-CA");
      const endStr = endOfMonth.toLocaleDateString("en-CA");

      const response = await fetchEmployeeMappingShiftsAPI(employeeId, startStr, endStr);
      setEmployee(response.employee);
      setMappings(response.mappings);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memuat data shift pegawai.");
    } finally {
      setLoading(false);
    }
  };

  // Initial validation check on mount
  useEffect(() => {
    if (!employeeId) {
      toast.error("Pegawai tidak ditentukan.");
      navigate("Employee");
    }
  }, []);

  // Load data when employeeId or currentDate changes
  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId, currentDate]);

  // Submit new mapping
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId || !tanggalMulai || !tanggalAkhir) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      await postMappingShiftAPI({
        user_id: Number(employeeId),
        shift_id: Number(selectedShiftId),
        tanggal_mulai: tanggalMulai,
        tanggal_akhir: tanggalAkhir,
        lock_location: lockLocation,
      });

      toast.success("Shift berhasil disimpan.");
      loadData();

      // Reset form range
      setTanggalMulai("");
      setTanggalAkhir("");
      setLockLocation(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan shift.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger delete confirmation
  const triggerDelete = (id: number, date: string) => {
    setConfirmDelete({ isOpen: true, id, date });
  };

  // Perform delete
  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      setDeleting(true);
      await deleteMappingShiftAPI(confirmDelete.id);
      toast.success("Mapping shift berhasil dihapus.");
      setConfirmDelete({ isOpen: false, id: null, date: "" });
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus shift.");
    } finally {
      setDeleting(false);
    }
  };

  // Calendar Helper methods
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfWeek(year, month);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Generate date list for current month grid
  const daysArray = [];
  // Blank cells before the start of the month
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(new Date(year, month, d));
  }

  // Find mapping for a specific date
  const getMappingForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    return mappings.find(m => m.tanggal === dateStr);
  };

  // Handle cell click to quick-fill form
  const handleCellClick = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    setTanggalMulai(dateStr);
    setTanggalAkhir(dateStr);

    const existing = getMappingForDate(date);
    if (existing) {
      setSelectedShiftId(existing.shift_id.toString());
      setLockLocation(existing.lock_location === "1");
    }
  };

  // Helper for colors
  const getShiftBadgeStyle = (namaShift: string) => {
    const name = namaShift.toLowerCase();
    if (name.includes("libur")) {
      return "bg-[#F25C2A]/10 text-[#C54117] border-[#F25C2A]/20 hover:bg-[#F25C2A]/20";
    }
    if (name.includes("malam")) {
      return "bg-[#5C8A90]/10 text-[#3b595d] border-[#5C8A90]/20 hover:bg-[#5C8A90]/20";
    }
    if (name.includes("security") || name.includes("3") || name.includes("pagi")) {
      return "bg-[#7FA46D]/10 text-[#516b46] border-[#7FA46D]/20 hover:bg-[#7FA46D]/20";
    }
    return "bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20 hover:bg-[#F2B233]/30";
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-black text-gray-800">
              Tambah / Edit Shift Range
            </h2>
            <button
              type="button"
              onClick={() => navigate("Employee")}
              className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-lg transition-all cursor-pointer text-gray-500 bg-white flex items-center justify-center"
              title="Kembali ke Daftar Pegawai"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {employee && (
            <div className="bg-zinc-50 border border-zinc-100/70 px-3.5 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1e2a4a] flex items-center justify-center font-black text-white shrink-0 text-xs">
                {employee.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[11px] font-extrabold text-gray-850 leading-tight truncate">{employee.name}</span>
                <span className="text-[9.5px] text-gray-400 font-bold mt-0.5 truncate">{employee.email}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shift Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                Shift Pegawai
              </label>
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#e0542c] focus:ring-1 focus:ring-[#e0542c]"
                required
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_shift} ({s.jam_masuk} - {s.jam_keluar})
                  </option>
                ))}
              </select>
            </div>

            {/* Date range grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#e0542c]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#e0542c]"
                  required
                />
              </div>
            </div>

            {/* Lock Location Checkbox */}
            <div className="flex items-start gap-3 py-1 px-1">
              <input
                type="checkbox"
                id="lock_location"
                checked={lockLocation}
                onChange={(e) => setLockLocation(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#e0542c] text-[#e0542c] border-gray-300 rounded-md focus:ring-offset-0 focus:ring-1 focus:ring-[#e0542c] cursor-pointer"
              />
              <div className="flex flex-col text-left">
                <label htmlFor="lock_location" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                  Kunci Lokasi (Lock Location)
                </label>
                <span className="text-[10px] text-gray-400 font-bold mt-1.5 leading-snug">
                  Karyawan hanya diperbolehkan melakukan absen masuk dan pulang jika berada di dalam radius lokasi kantor yang ditentukan.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all border-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${submitting
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-[#e0542c] hover:bg-[#c84420] text-white shadow-md shadow-[#e0542c]/15 hover:shadow-lg active:scale-95"
                }`}
            >
              {submitting ? "Menyimpan..." : "Terapkan Shift"}
            </button>
          </form>
        </div>

        {/* Right: Modern Custom Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs flex flex-col min-h-[500px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h2 className="text-sm font-black text-gray-800 leading-none">
              Jadwal Shift Kalender
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-90 rounded-lg transition-all cursor-pointer text-gray-500 bg-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-90 rounded-lg transition-all cursor-pointer text-gray-500 bg-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col">
            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((dayName, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold uppercase tracking-wider py-1.5 text-gray-400 ${idx === 0 || idx === 6 ? "text-rose-450" : ""
                    }`}
                >
                  {dayName}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400 animate-pulse">Memuat kalender shift...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 flex-1 min-h-[420px]">
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-gray-50/50 rounded-xl border border-transparent" />;
                  }

                  const mapping = getMappingForDate(day);
                  const isToday = new Date().toDateString() === day.toDateString();

                  return (
                    <div
                      key={`day-${day.getDate()}`}
                      onClick={() => handleCellClick(day)}
                      className={`relative min-h-[85px] border border-gray-100 p-1.5 rounded-xl flex flex-col justify-between hover:bg-zinc-50/50 transition-colors group cursor-pointer ${isToday ? "bg-amber-50/20 border-amber-300" : "bg-white"
                        }`}
                    >
                      {/* Day number & today marker */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[10.5px] font-extrabold ${isToday
                              ? "bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                              : "text-gray-700"
                            }`}
                        >
                          {day.getDate()}
                        </span>

                        {mapping?.lock_location === "1" && (
                          <span title="Lock Location Active">
                            <MapPin className="w-3 h-3 text-[#e0542c]" />
                          </span>
                        )}
                      </div>

                      {/* Mapped shift content */}
                      {mapping ? (
                        <div
                          className={`mt-1 border border-zinc-100 rounded-lg p-1 text-left flex flex-col gap-0.5 relative group/badge overflow-hidden ${getShiftBadgeStyle(
                            mapping.shift?.nama_shift || mapping.status_absen
                          )}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid double click form fill
                            handleCellClick(day);
                          }}
                        >
                          <span className="text-[9.5px] font-black leading-none truncate">
                            {mapping.shift?.nama_shift || mapping.status_absen}
                          </span>
                          <span className="text-[8px] font-bold leading-none opacity-80 mt-0.5">
                            {mapping.shift?.jam_masuk && mapping.shift?.jam_keluar
                              ? `${mapping.shift.jam_masuk}-${mapping.shift.jam_keluar}`
                              : mapping.status_absen}
                          </span>

                          {/* Quick delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDelete(mapping.id, mapping.tanggal);
                            }}
                            className="absolute right-0.5 top-0.5 bottom-0.5 px-1 bg-rose-500 text-white rounded-md opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 flex items-center justify-center cursor-pointer border-0 shadow-xs"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[8px] text-gray-300 font-bold self-start mt-2">No shift</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, date: "" })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Mapping Shift"
        message={`Apakah Anda yakin ingin menghapus mapping shift pada tanggal ${confirmDelete.date}? Pegawai ini tidak akan memiliki shift terjadwal pada hari tersebut.`}
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
