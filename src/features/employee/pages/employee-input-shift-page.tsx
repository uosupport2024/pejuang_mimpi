import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, MapPin, Calendar as CalendarIcon, Clock, Lock } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import {
  fetchEmployeeMappingShiftsAPI,
  postMappingShiftAPI,
  deleteMappingShiftAPI,
  fetchShiftsAPI
} from "../api/shift";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { THEME_COLORS } from "@/shared/constants/colors";

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

  // Handle cell click to quick-fill form (disabled for past dates)
  const handleCellClick = (date: Date) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const dateStr = date.toLocaleDateString("en-CA");

    if (dateStr < todayStr) {
      toast.error("Tanggal yang sudah berlalu tidak dapat diubah.");
      return;
    }

    setTanggalMulai(dateStr);
    setTanggalAkhir(dateStr);

    const existing = getMappingForDate(date);
    if (existing) {
      setSelectedShiftId(existing.shift_id.toString());
      setLockLocation(existing.lock_location === "1");
    }
  };

  // Drag and drop state
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);
  const [draggedMapping, setDraggedMapping] = useState<MappingShift | null>(null);

  // Drag & drop confirmation modal state
  const [dragConfirm, setDragConfirm] = useState<{
    isOpen: boolean;
    sourceMapping: MappingShift | null;
    targetDateStr: string;
  }>({
    isOpen: false,
    sourceMapping: null,
    targetDateStr: "",
  });
  const [processingDrag, setProcessingDrag] = useState(false);

  // Helper for solid badge colors matching user request
  const getShiftBadgeStyle = (namaShift: string, isPast: boolean = false) => {
    if (isPast) {
      return "bg-zinc-200 text-zinc-500 border-zinc-300 opacity-70 cursor-not-allowed shadow-none";
    }
    const name = namaShift.toLowerCase();
    if (name.includes("libur")) {
      return "text-white shadow-xs";
    }
    if (name.includes("malam")) {
      return "text-white shadow-xs";
    }
    if (name.includes("security") || name.includes("3") || name.includes("pagi")) {
      return "text-white shadow-xs";
    }
    return "text-white shadow-xs";
  };

  const getShiftBadgeBg = (namaShift: string, isPast: boolean = false) => {
    if (isPast) return undefined;
    const name = namaShift.toLowerCase();
    if (name.includes("libur")) return THEME_COLORS.hex.primary;
    if (name.includes("malam")) return THEME_COLORS.hex.airKehidupan;
    if (name.includes("security") || name.includes("3") || name.includes("pagi")) return THEME_COLORS.hex.sawahPertumbuhan;
    return THEME_COLORS.hex.padiKemakmuran;
  };

  // Handle Drag and Drop Shift to new Date (triggers modal choice)
  const handleDropShift = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    setDraggedOverDate(null);

    const todayStr = new Date().toLocaleDateString("en-CA");
    const targetDateStr = targetDate.toLocaleDateString("en-CA");

    if (targetDateStr < todayStr) {
      toast.error("Shift tidak dapat dipindahkan ke tanggal yang sudah berlalu.");
      return;
    }

    let payload: any = null;

    try {
      const rawData = e.dataTransfer.getData("application/json");
      if (rawData) payload = JSON.parse(rawData);
    } catch (err) {
      console.error("Drop data parse error:", err);
    }

    const activeShift = payload?.shift || draggedMapping?.shift;
    const sourceMappingId = payload?.mappingId || draggedMapping?.id;
    const sourceDate = payload?.sourceDate || draggedMapping?.tanggal;
    const shiftId = payload?.shift_id || draggedMapping?.shift_id;
    const lockLocation = payload?.lock_location === "1" || draggedMapping?.lock_location === "1";

    if (!shiftId) return;
    if (sourceDate === targetDateStr) return;

    setDragConfirm({
      isOpen: true,
      sourceMapping: draggedMapping || {
        id: sourceMappingId,
        shift_id: Number(shiftId),
        tanggal: sourceDate,
        status_absen: activeShift?.nama_shift || "Shift Assigned",
        lock_location: lockLocation ? "1" : "0",
        shift: activeShift,
      },
      targetDateStr,
    });
  };

  // Execute Drag & Drop (Move vs Duplicate)
  const handleExecuteDragDrop = async (action: "move" | "duplicate") => {
    if (!dragConfirm.sourceMapping || !dragConfirm.targetDateStr) return;

    const { sourceMapping, targetDateStr } = dragConfirm;
    const shiftId = sourceMapping.shift_id;
    const isLockLoc = sourceMapping.lock_location === "1";

    try {
      setProcessingDrag(true);
      toast.loading(action === "move" ? "Memindahkan shift..." : "Menduplikasi shift...", { id: "drag-action" });

      // 1. Assign shift to target date
      await postMappingShiftAPI({
        user_id: Number(employeeId),
        shift_id: Number(shiftId),
        tanggal_mulai: targetDateStr,
        tanggal_akhir: targetDateStr,
        lock_location: isLockLoc,
      });

      // 2. If action === 'move', delete old shift mapping on source date!
      if (action === "move" && sourceMapping.id) {
        await deleteMappingShiftAPI(sourceMapping.id);
      }

      toast.success(
        action === "move"
          ? `Shift berhasil dipindahkan ke ${targetDateStr}`
          : `Shift berhasil diduplikasi ke ${targetDateStr}`,
        { id: "drag-action" }
      );

      setDragConfirm({ isOpen: false, sourceMapping: null, targetDateStr: "" });
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memproses shift.", { id: "drag-action" });
      loadData();
    } finally {
      setProcessingDrag(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("Employee")}
            className="p-2 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl transition-all cursor-pointer text-gray-600 bg-white flex items-center justify-center shrink-0 shadow-2xs"
            title="Kembali ke Daftar Pegawai"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col text-left min-w-0">
            <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
              Penugasan Shift Pegawai
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              Atur dan kelola jadwal shift kerja bulanan untuk karyawan.
            </p>
          </div>
        </div>

        {employee && (
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 rounded-xl shrink-0 w-full sm:w-auto">
            <div
              style={{ backgroundColor: THEME_COLORS.hex.navBg }}
              className="w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs"
            >
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-extrabold text-gray-800 leading-tight truncate">{employee.name}</span>
              <span className="text-[10px] text-gray-400 font-semibold truncate">{employee.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <CalendarIcon style={{ color: THEME_COLORS.hex.primary }} className="w-4 h-4" />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Form Penugasan Shift
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shift Select */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>Pilih Shift Kerja</span>
              </label>
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none transition-all cursor-pointer shadow-2xs"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none transition-all shadow-2xs"
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
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Lock Location Checkbox */}
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-start gap-3 text-left">
              <input
                type="checkbox"
                id="lock_location"
                checked={lockLocation}
                onChange={(e) => setLockLocation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 bg-white cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:font-extrabold after:text-white after:hidden checked:after:block transition-all focus:outline-none shrink-0"
              />
              <div className="flex flex-col">
                <label htmlFor="lock_location" className="text-xs font-bold text-gray-800 cursor-pointer select-none flex items-center gap-1.5">
                  <Lock style={{ color: THEME_COLORS.hex.primary }} className="w-3 h-3" />
                  <span>Kunci Lokasi (Lock Location)</span>
                </label>
                <span className="text-[10px] text-gray-500 font-medium leading-normal mt-1">
                  Absensi hanya diizinkan di dalam koordinat geofencing kantor.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={!submitting ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all border-0 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                submitting
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                  : "text-white hover:opacity-90 active:scale-98"
              }`}
            >
              {submitting ? "Menyimpan Shift..." : "Terapkan Shift"}
            </button>
          </form>
        </div>

        {/* Right: Responsive Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[520px]">
          {/* Calendar Header & Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-4 gap-3">
            <div className="flex items-center gap-2 text-left">
              <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                Kalender Shift Kerja
              </h2>
              <span
                style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}1A` }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {monthNames[month]} {year}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-gray-800 min-w-[110px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
                title="Bulan Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shift Legend Badges Bar */}
          <div className="flex flex-wrap items-center gap-3 pb-3 mb-3 border-b border-gray-100 text-[10px] font-bold text-gray-600">
            <span className="text-gray-400 uppercase font-black text-[9px] tracking-wider">Legend:</span>
            <span
              style={{ color: THEME_COLORS.hex.sawahPertumbuhanText, backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}26` }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            >
              <span style={{ backgroundColor: THEME_COLORS.hex.sawahPertumbuhan }} className="w-2 h-2 rounded-full" /> Pagi / Normal
            </span>
            <span
              style={{ color: THEME_COLORS.hex.airKehidupanText, backgroundColor: `${THEME_COLORS.hex.airKehidupan}26` }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            >
              <span style={{ backgroundColor: THEME_COLORS.hex.airKehidupan }} className="w-2 h-2 rounded-full" /> Malam
            </span>
            <span
              style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}26` }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            >
              <span style={{ backgroundColor: THEME_COLORS.hex.primary }} className="w-2 h-2 rounded-full" /> Off / Libur
            </span>
          </div>

          {/* Horizontally Scrollable Calendar Container for Mobile View */}
          <div className="overflow-x-auto flex-1 pb-2">
            <div className="min-w-[620px] flex-1 flex flex-col">
              {/* Days of Week Row */}
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((dayName, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-black uppercase tracking-wider py-1.5 rounded-lg ${
                      idx === 0 || idx === 6 ? "text-rose-500 bg-rose-50/50" : "text-gray-500 bg-zinc-50/70"
                    }`}
                  >
                    {dayName}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              {loading ? (
                <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[420px]">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={`skeleton-cell-${i}`}
                      className="relative min-h-[85px] border border-gray-100 p-2 rounded-xl flex flex-col justify-between bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        {i % 4 === 0 && <Skeleton className="w-3 h-3 rounded-full" />}
                      </div>
                      {i % 2 === 0 ? (
                        <div className="mt-1 border border-zinc-100/60 rounded-lg p-1.5 flex flex-col gap-1 bg-zinc-50/50">
                          <Skeleton className="h-3 w-3/4 rounded" />
                          <Skeleton className="h-2 w-1/2 rounded" />
                        </div>
                      ) : (
                        <Skeleton className="h-2 w-8 rounded self-start mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[420px]">
                  {daysArray.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="bg-zinc-50/40 rounded-xl border border-dashed border-zinc-200/50" />;
                    }

                    const todayStr = new Date().toLocaleDateString("en-CA");
                    const dayStr = day.toLocaleDateString("en-CA");
                    const isPast = dayStr < todayStr;
                    const isToday = todayStr === dayStr;
                    const mapping = getMappingForDate(day);
                    const isDragTarget = !isPast && draggedOverDate === day.toDateString();

                    return (
                      <div
                        key={`day-${day.getDate()}`}
                        onClick={() => !isPast && handleCellClick(day)}
                        onDragOver={(e) => {
                          if (isPast) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDragEnter={(e) => {
                          if (isPast) return;
                          e.preventDefault();
                          setDraggedOverDate(day.toDateString());
                        }}
                        onDragLeave={(e) => {
                          if (isPast) return;
                          e.preventDefault();
                          if (draggedOverDate === day.toDateString()) {
                            setDraggedOverDate(null);
                          }
                        }}
                        onDrop={(e) => !isPast && handleDropShift(e, day)}
                        style={isDragTarget ? { borderColor: THEME_COLORS.hex.primary } : undefined}
                        className={`relative min-h-[88px] border p-2 rounded-xl flex flex-col justify-between transition-all group ${
                          isPast
                            ? "bg-zinc-50/70 border-zinc-200/50 opacity-60 cursor-not-allowed select-none"
                            : isDragTarget
                            ? "border-2 scale-[1.02] shadow-md z-10 cursor-pointer"
                            : isToday
                            ? "bg-amber-50/40 border-amber-300 shadow-2xs cursor-pointer"
                            : "bg-white border-gray-200/80 hover:border-gray-300 hover:bg-zinc-50/40 cursor-pointer shadow-2xs"
                        }`}
                      >
                        {/* Day number & today marker */}
                        <div className="flex justify-between items-center">
                          <span
                            style={isToday ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                            className={`text-xs font-black ${
                              isToday
                                ? "text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs"
                                : isPast
                                ? "text-gray-400 font-bold"
                                : "text-gray-800"
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          {mapping?.lock_location === "1" && (
                            <span title="Kunci Lokasi Aktif">
                              <MapPin className={`w-3 h-3 ${isPast ? "text-gray-400" : "text-rose-500"}`} />
                            </span>
                          )}
                        </div>

                        {/* Mapped shift content */}
                        {mapping ? (
                          <div
                            draggable={!isPast}
                            onDragStart={(e) => {
                              if (isPast) {
                                e.preventDefault();
                                return;
                              }
                              e.stopPropagation();
                              setDraggedMapping(mapping);
                              e.dataTransfer.setData(
                                "application/json",
                                JSON.stringify({
                                  shift_id: mapping.shift_id,
                                  lock_location: mapping.lock_location,
                                  sourceDate: mapping.tanggal,
                                  shift: mapping.shift,
                                  status_absen: mapping.status_absen,
                                })
                              );
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDraggedMapping(null);
                              setDraggedOverDate(null);
                            }}
                            style={{
                              backgroundColor: getShiftBadgeBg(mapping.shift?.nama_shift || mapping.status_absen, isPast)
                            }}
                            className={`mt-1.5 border rounded-lg p-1.5 text-left flex flex-col gap-0.5 relative group/badge overflow-hidden transition-all ${
                              isPast
                                ? "cursor-not-allowed opacity-75"
                                : "cursor-grab active:cursor-grabbing hover:scale-[1.02]"
                            } ${getShiftBadgeStyle(
                              mapping.shift?.nama_shift || mapping.status_absen,
                              isPast
                            )}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid double click form fill
                              if (!isPast) handleCellClick(day);
                            }}
                          >
                            <span className="text-[10px] font-black leading-tight truncate">
                              {mapping.shift?.nama_shift || mapping.status_absen}
                            </span>
                            <span className="text-[8.5px] font-bold leading-tight opacity-90">
                              {mapping.shift?.jam_masuk && mapping.shift?.jam_keluar
                                ? `${mapping.shift.jam_masuk} - ${mapping.shift.jam_keluar}`
                                : mapping.status_absen}
                            </span>

                            {/* Quick delete button */}
                            {!isPast && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerDelete(mapping.id, mapping.tanggal);
                                }}
                                className="absolute right-0.5 top-0.5 bottom-0.5 px-1 bg-black/20 text-white hover:bg-black/40 rounded-md opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 flex items-center justify-center cursor-pointer border-0 shadow-xs"
                                title="Hapus Shift"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center py-2">
                            <span className="text-[10px] text-gray-300 font-semibold group-hover:text-gray-400 transition-colors">
                              {!isPast && "+ Shift"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

      {/* Drag & Drop Action Choice Modal */}
      {dragConfirm.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={processingDrag ? undefined : () => setDragConfirm({ isOpen: false, sourceMapping: null, targetDateStr: "" })}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 space-y-4 z-50 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                style={{ color: THEME_COLORS.hex.primary, backgroundColor: `${THEME_COLORS.hex.primary}1A`, borderColor: `${THEME_COLORS.hex.primary}33` }}
                className="p-3 rounded-full flex items-center justify-center w-14 h-14 border"
              >
                <CalendarIcon className="w-7 h-7" />
              </div>

              <div className="space-y-1 text-center">
                <h3 className="text-sm font-black text-gray-900 tracking-tight leading-tight">
                  Atur Shift Kalender
                </h3>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Pilih aksi untuk shift <span className="text-gray-900 font-black">"{dragConfirm.sourceMapping?.shift?.nama_shift || dragConfirm.sourceMapping?.status_absen}"</span> dari tanggal <span className="text-gray-900 font-bold">{dragConfirm.sourceMapping?.tanggal}</span> ke tanggal <span style={{ color: THEME_COLORS.hex.primary }} className="font-black">{dragConfirm.targetDateStr}</span>:
                </p>
              </div>
            </div>

            {/* Horizontal Action Choice Buttons Row */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={processingDrag}
                onClick={() => setDragConfirm({ isOpen: false, sourceMapping: null, targetDateStr: "" })}
                className="py-2.5 px-4 text-xs font-bold text-gray-600 hover:text-gray-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processingDrag}
                  onClick={() => handleExecuteDragDrop("duplicate")}
                  style={{ backgroundColor: THEME_COLORS.hex.navBg }}
                  className="py-2.5 px-4 text-xs font-extrabold text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 hover:opacity-90"
                >
                  {processingDrag ? "Memproses..." : "Duplikat"}
                </button>

                <button
                  type="button"
                  disabled={processingDrag}
                  onClick={() => handleExecuteDragDrop("move")}
                  style={{ backgroundColor: THEME_COLORS.hex.primary }}
                  className="py-2.5 px-4 text-xs font-extrabold text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 hover:opacity-90"
                >
                  {processingDrag ? "Memproses..." : "Pindahkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
