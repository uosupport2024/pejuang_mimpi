import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, CalendarRange, Plus, X, Clock, Search } from "lucide-react";
import { CalendarMark, UserPlusRounded } from "@solar-icons/react";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import type { ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useRouter } from "@/shared/router/router";
import { fetchLocations, type BackendLocation } from "@/features/location/api/location";
import {
  fetchShiftOptions,
  createShiftOption,
  fetchScheduleEmployees,
  fetchMappingShifts,
  bulkAssignShift,
  updateMappingShift,
  deleteMappingShift,
  type ShiftOption,
  type ScheduleEmployee,
  type ScheduleUserEntry,
  type ScheduleUserShift,
} from "../api/schedule-shift";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Avatar initials use the app's navbar blue everywhere — same color in the
// employee table and the schedule preview below it.
const AVATAR_COLOR = THEME_COLORS.hex.navBg;

// Soft pastel { background, text } pairs — deterministic per shift id so
// the same shift always renders in the same color across the schedule grid.
const SHIFT_PALETTE: { bg: string; text: string }[] = [
  { bg: "#DDF2E4", text: "#2f6b41" }, // soft green
  { bg: "#FBE4D5", text: "#b35a1f" }, // soft peach
  { bg: "#DCE6FB", text: "#35538f" }, // soft blue
  { bg: "#EFE0FA", text: "#7a4fa0" }, // soft purple
  { bg: "#FCE3EC", text: "#a13d63" }, // soft pink
  { bg: "#E1F3F1", text: "#2f6e68" }, // soft teal
  { bg: "#FFF3D6", text: "#93701a" }, // soft gold
];

function shiftPalette(shiftId: number): { bg: string; text: string } {
  return SHIFT_PALETTE[shiftId % SHIFT_PALETTE.length];
}

// Duration in hours between two "HH:MM" times, wrapping past midnight
// (e.g. an overnight 22:00-06:00 shift is 8 hours, not negative).
function shiftDurationHours(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60;
  return (endMin - startMin) / 60;
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

// `appearance-none` + a manual after:-drawn checkmark, matching the pattern
// already used in employee-input-shift-page.tsx — the root :root { color-scheme:
// light dark } in index.css makes native checkbox rendering (accent-color
// included) come out solid/dark in this shell, so it can't be styled through
// the native control alone.
const CHECKBOX_CLASS =
  "w-3.5 h-3.5 rounded border-2 border-gray-300 bg-white cursor-pointer appearance-none flex items-center justify-center after:content-['✓'] after:text-[9px] after:font-black after:text-white after:hidden checked:after:block checked:bg-[#e0542c] checked:border-[#e0542c] transition-colors focus:outline-none shrink-0";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const WEEKDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const EMPLOYEE_PAGE_SIZE = 8;

function toDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA");
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setDate(date.getDate() - date.getDay());
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatRangeLabel(start: Date, end: Date): string {
  const startLabel = `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)}`;
  const endLabel = `${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  return `${startLabel} - ${endLabel}`;
}

const MAX_SCHEDULE_RANGE_DAYS = 14;

function buildMonthDays(month: Date): (Date | null)[] {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(month.getFullYear(), month.getMonth(), d));
  return days;
}

export function ScheduleShiftPage() {
  const { navigate } = useRouter();

  // Master data
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  // Employee list (server-paginated)
  const [employees, setEmployees] = useState<ScheduleEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [employeePage, setEmployeePage] = useState(1);
  const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
  const [employeeTotalItems, setEmployeeTotalItems] = useState(0);
  const isFirstSearchRender = useRef(true);

  // Filters
  const [locationFilter, setLocationFilter] = useState<string>("");

  // Assignment form state
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState(false);
  const [shiftSearchQuery, setShiftSearchQuery] = useState("");
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("08:00");
  const [newShiftEnd, setNewShiftEnd] = useState("17:00");
  const [creatingShift, setCreatingShift] = useState(false);
  const shiftDropdownRef = useRef<HTMLDivElement>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Employee selection (persists across pages — only ids are needed for the bulk API call)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Schedule preview
  const [scheduleRangeStart, setScheduleRangeStart] = useState<Date | null>(() => startOfWeek(new Date()));
  const [scheduleRangeEnd, setScheduleRangeEnd] = useState<Date | null>(() => {
    const d = startOfWeek(new Date());
    d.setDate(d.getDate() + 6);
    return d;
  });
  const [scheduleCalendarOpen, setScheduleCalendarOpen] = useState(false);
  const [scheduleCalendarMonth, setScheduleCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const scheduleCalendarRef = useRef<HTMLDivElement>(null);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleUserEntry[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [schedulePage, setSchedulePage] = useState(1);
  const [schedulePerPage, setSchedulePerPage] = useState(10);
  const [scheduleTotalPages, setScheduleTotalPages] = useState(1);
  const [scheduleTotalItems, setScheduleTotalItems] = useState(0);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("");
  const [scheduleLocationFilter, setScheduleLocationFilter] = useState<string>("");
  const [debouncedScheduleSearch, setDebouncedScheduleSearch] = useState("");
  const isFirstScheduleSearchRender = useRef(true);

  // Cell edit modal — click a day cell in the Jadwal grid to add / change / remove a shift
  const [cellModal, setCellModal] = useState<{
    employeeId: number;
    employeeName: string;
    date: Date;
    existing: ScheduleUserShift | null;
  } | null>(null);
  const [modalShiftId, setModalShiftId] = useState<string>("");
  const [savingCell, setSavingCell] = useState(false);
  const [deletingCell, setDeletingCell] = useState(false);

  // Load shifts & locations once
  useEffect(() => {
    fetchShiftOptions()
      .then((data) => {
        setShifts(data);
        if (data.length > 0) setSelectedShiftId(String(data[0].id));
      })
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar shift."))
      .finally(() => setLoadingShifts(false));

    fetchLocations()
      .then(setLocations)
      .catch(() => {});
  }, []);

  // Debounce search input -> resets to page 1
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setEmployeePage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to page 1 whenever the location filter changes
  useEffect(() => {
    setEmployeePage(1);
  }, [locationFilter]);

  // Fetch employees (server-side search, filter & pagination)
  useEffect(() => {
    setLoadingEmployees(true);
    fetchScheduleEmployees({
      q: debouncedSearch,
      page: employeePage,
      per_page: EMPLOYEE_PAGE_SIZE,
      lokasi_id: locationFilter || undefined,
    })
      .then((res) => {
        setEmployees(res.data || []);
        setEmployeeTotalPages(res.last_page || 1);
        setEmployeeTotalItems(res.total || 0);
      })
      .catch((err: any) => toast.error(err.message || "Gagal memuat daftar pegawai."))
      .finally(() => setLoadingEmployees(false));
  }, [debouncedSearch, employeePage, locationFilter]);

  // Debounce the Jadwal name search
  useEffect(() => {
    if (isFirstScheduleSearchRender.current) {
      isFirstScheduleSearchRender.current = false;
      return;
    }
    const t = setTimeout(() => setDebouncedScheduleSearch(scheduleSearchQuery), 400);
    return () => clearTimeout(t);
  }, [scheduleSearchQuery]);

  // The mapping-shifts endpoint has no name search of its own, but it does
  // accept a user_ids filter — so a name search resolves matching employees
  // via the (already search-capable) employees endpoint first, then filters
  // the schedule fetch to just those ids. No backend change needed.
  const loadSchedule = useCallback(async () => {
    if (!scheduleRangeStart || !scheduleRangeEnd) return;
    setLoadingSchedule(true);
    try {
      let userIds: number[] | undefined;
      if (debouncedScheduleSearch.trim()) {
        const matches = await fetchScheduleEmployees({
          q: debouncedScheduleSearch.trim(),
          per_page: 50,
          lokasi_id: scheduleLocationFilter || undefined,
        });
        userIds = (matches.data || []).map((e) => e.id);
        if (userIds.length === 0) {
          setScheduleEntries([]);
          setScheduleTotalPages(1);
          setScheduleTotalItems(0);
          return;
        }
      }

      const res = await fetchMappingShifts({
        start_date: toDateStr(scheduleRangeStart),
        end_date: toDateStr(scheduleRangeEnd),
        lokasi_id: scheduleLocationFilter || undefined,
        per_page: schedulePerPage,
        page: schedulePage,
        user_ids: userIds,
      });
      setScheduleEntries(res.data || []);
      setScheduleTotalPages(res.last_page || 1);
      setScheduleTotalItems(res.total || 0);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat jadwal shift.");
    } finally {
      setLoadingSchedule(false);
    }
  }, [scheduleRangeStart, scheduleRangeEnd, scheduleLocationFilter, schedulePerPage, schedulePage, debouncedScheduleSearch]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Reset to page 1 whenever the filters or page size change (not on schedulePage itself)
  useEffect(() => {
    setSchedulePage(1);
  }, [scheduleRangeStart, scheduleRangeEnd, scheduleLocationFilter, schedulePerPage, debouncedScheduleSearch]);

  const openCellModal = (employeeId: number, employeeName: string, date: Date, existing: ScheduleUserShift | null) => {
    setCellModal({ employeeId, employeeName, date, existing });
    setModalShiftId(existing ? String(existing.shift_id) : shifts[0] ? String(shifts[0].id) : "");
  };

  const handleSaveCell = async () => {
    if (!cellModal || !modalShiftId) return;
    try {
      setSavingCell(true);
      if (cellModal.existing) {
        await updateMappingShift(cellModal.existing.mapping_shift_id, { shift_id: Number(modalShiftId) });
        toast.success("Jadwal berhasil diperbarui.");
      } else {
        await bulkAssignShift({
          user_ids: [cellModal.employeeId],
          shift_id: Number(modalShiftId),
          start_date: toDateStr(cellModal.date),
          end_date: toDateStr(cellModal.date),
        });
        toast.success("Shift berhasil ditambahkan.");
      }
      setCellModal(null);
      loadSchedule();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan jadwal.");
    } finally {
      setSavingCell(false);
    }
  };

  const handleDeleteCell = async () => {
    if (!cellModal?.existing) return;
    try {
      setDeletingCell(true);
      await deleteMappingShift(cellModal.existing.mapping_shift_id);
      toast.success("Jadwal berhasil dihapus.");
      setCellModal(null);
      loadSchedule();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus jadwal.");
    } finally {
      setDeletingCell(false);
    }
  };

  // Close the shift dropdown / schedule date-range popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(e.target as Node)) {
        setShiftDropdownOpen(false);
        setIsAddingShift(false);
        setShiftSearchQuery("");
      }
      if (scheduleCalendarRef.current && !scheduleCalendarRef.current.contains(e.target as Node)) {
        setScheduleCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Schedule preview date-range picker (view-only, no past-date restriction,
  // capped at MAX_SCHEDULE_RANGE_DAYS so the mapping-shifts fetch stays bounded).
  // Once a start date is picked, anything more than MAX_SCHEDULE_RANGE_DAYS - 1
  // days away in either direction is disabled outright, so an out-of-range
  // end date can never actually be clicked.
  const handleScheduleDayClick = (day: Date) => {
    if (!scheduleRangeStart || scheduleRangeEnd) {
      setScheduleRangeStart(day);
      setScheduleRangeEnd(null);
      return;
    }
    if (toDateStr(day) < toDateStr(scheduleRangeStart)) {
      setScheduleRangeEnd(scheduleRangeStart);
      setScheduleRangeStart(day);
    } else {
      setScheduleRangeEnd(day);
    }
    setScheduleCalendarOpen(false);
  };

  const isInScheduleRange = (day: Date) => {
    if (!scheduleRangeStart) return false;
    const end = scheduleRangeEnd || scheduleRangeStart;
    const dStr = toDateStr(day);
    return dStr >= toDateStr(scheduleRangeStart) && dStr <= toDateStr(end);
  };

  const isScheduleDayDisabled = (day: Date) => {
    if (!scheduleRangeStart || scheduleRangeEnd) return false;
    const diffDays = Math.round(Math.abs(day.getTime() - scheduleRangeStart.getTime()) / 86400000);
    return diffDays > MAX_SCHEDULE_RANGE_DAYS - 1;
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftName.trim() || !newShiftStart || !newShiftEnd) {
      toast.error("Lengkapi nama dan jam shift terlebih dahulu.");
      return;
    }
    try {
      setCreatingShift(true);
      const created = await createShiftOption({
        nama_shift: newShiftName.trim(),
        jam_masuk: newShiftStart,
        jam_keluar: newShiftEnd,
      });
      setShifts((prev) => [...prev, created]);
      setSelectedShiftId(String(created.id));
      toast.success(`Shift "${created.nama_shift}" berhasil ditambahkan.`);
      setIsAddingShift(false);
      setNewShiftName("");
      setNewShiftStart("08:00");
      setNewShiftEnd("17:00");
      setShiftDropdownOpen(false);
      setShiftSearchQuery("");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan shift baru.");
    } finally {
      setCreatingShift(false);
    }
  };

  // Selection helpers (page-scoped "select all" — selection itself persists across pages)
  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOnPageSelected = employees.length > 0 && employees.every((e) => selectedIds.has(e.id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        employees.forEach((e) => next.delete(e.id));
      } else {
        employees.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  // Calendar helpers (left panel date range picker)
  const daysArray = buildMonthDays(calendarMonth);
  const scheduleDaysArray = buildMonthDays(scheduleCalendarMonth);

  const todayStr = toDateStr(new Date());

  const isInRange = (day: Date) => {
    if (!rangeStart) return false;
    const end = rangeEnd || rangeStart;
    const dStr = toDateStr(day);
    return dStr >= toDateStr(rangeStart) && dStr <= toDateStr(end);
  };

  const handleDayClick = (day: Date) => {
    const dStr = toDateStr(day);
    if (dStr < todayStr) {
      toast.error("Tanggal yang sudah berlalu tidak dapat dipilih.");
      return;
    }
    if (!rangeStart || rangeEnd) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (dStr < toDateStr(rangeStart)) {
      setRangeEnd(rangeStart);
      setRangeStart(day);
    } else {
      setRangeEnd(day);
    }
  };

  const canAssign = Boolean(selectedShiftId) && Boolean(rangeStart) && selectedIds.size > 0 && !submitting;

  const handleAssign = async () => {
    if (!selectedShiftId || !rangeStart) {
      toast.error("Pilih shift dan tanggal terlebih dahulu.");
      return;
    }
    if (selectedIds.size === 0) {
      toast.error("Pilih minimal satu pegawai.");
      return;
    }
    try {
      setSubmitting(true);
      const result = await bulkAssignShift({
        user_ids: Array.from(selectedIds),
        shift_id: Number(selectedShiftId),
        start_date: toDateStr(rangeStart),
        end_date: toDateStr(rangeEnd || rangeStart),
      });
      toast.success(
        `Shift berhasil diterapkan ke ${result?.summary?.users_affected ?? selectedIds.size} pegawai.`
      );
      setSelectedIds(new Set());
      loadSchedule();
    } catch (err: any) {
      toast.error(err.message || "Gagal menerapkan jadwal shift.");
    } finally {
      setSubmitting(false);
    }
  };

  // Schedule preview
  const rangeDays = useMemo(() => {
    if (!scheduleRangeStart || !scheduleRangeEnd) return [];
    const days: Date[] = [];
    const cur = new Date(scheduleRangeStart);
    while (cur <= scheduleRangeEnd) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [scheduleRangeStart, scheduleRangeEnd]);

  const scheduleRows = useMemo(() => {
    return [...scheduleEntries]
      .map((entry) => ({
        ...entry,
        byDate: new Map(entry.shifts.map((s) => [s.date, s])),
        totalHours: entry.shifts.reduce((sum, s) => sum + shiftDurationHours(s.start, s.end), 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scheduleEntries]);

  const selectedShift = shifts.find((s) => String(s.id) === selectedShiftId) || null;
  const filteredShifts = useMemo(() => {
    const q = shiftSearchQuery.trim().toLowerCase();
    if (!q) return shifts;
    return shifts.filter((s) => s.nama_shift.toLowerCase().includes(q));
  }, [shifts, shiftSearchQuery]);
  const shiftLabel = selectedShift?.nama_shift;
  const rangeLabel = rangeStart
    ? `${formatDateShort(rangeStart)}${rangeEnd && toDateStr(rangeEnd) !== toDateStr(rangeStart) ? ` - ${formatDateShort(rangeEnd)}` : ""}`
    : "";

  const employeeColumns: ColumnDef<ScheduleEmployee>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={allOnPageSelected}
          onChange={toggleSelectAllOnPage}
          onClick={(e) => e.stopPropagation()}
          className={CHECKBOX_CLASS}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleOne(row.id)}
          onClick={(e) => e.stopPropagation()}
          className={CHECKBOX_CLASS}
        />
      ),
      className: "w-10 text-center",
      sortable: false,
    },
    {
      header: "Nama",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: AVATAR_COLOR }}
            className="w-7 h-7 rounded-full text-white text-[9.5px] font-black flex items-center justify-center shrink-0"
          >
            {getInitials(row.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 leading-tight truncate">{row.name}</p>
            <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5 truncate">@{row.username}</p>
          </div>
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="space-y-1 w-full max-w-[120px]">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-2.5 w-1/2 rounded" />
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => <span className="text-gray-600 font-medium">{row.email}</span>,
    },
    {
      header: "Telepon",
      accessorKey: "telepon",
      cell: (row) => <span className="text-gray-600 font-medium">{row.telepon || "-"}</span>,
    },
    {
      header: "Lokasi",
      cell: (row) => <span className="text-gray-600 font-medium">{row.lokasi?.nama_lokasi || "-"}</span>,
      sortable: false,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3">
        <div
          style={{ backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        >
          <CalendarMark size={20} weight="Bold" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
            Jadwal Shift
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Atur dan tugaskan shift kerja untuk banyak pegawai sekaligus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Shift & Date panel — stretches to match the employee section's
            height on desktop (no sticky/h-fit, so it stays in normal flow and
            never "floats" independently while scrolling); on mobile the grid
            collapses to a single column so this is a non-issue there. */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Step 1: Shift */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0"
              >
                1
              </span>
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Pilih Shift</h2>
            </div>

            {loadingShifts ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <div className="relative" ref={shiftDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShiftDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none transition-all cursor-pointer shadow-2xs hover:border-gray-300"
                >
                  {selectedShift ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        style={{ backgroundColor: shiftPalette(selectedShift.id).text }}
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                      />
                      <span className="text-xs font-bold text-gray-800 truncate">{selectedShift.nama_shift}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">Belum ada shift dipilih</span>
                  )}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedShift && (
                      <span className="text-[10.5px] font-semibold text-gray-400">
                        {selectedShift.jam_masuk} - {selectedShift.jam_keluar}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${shiftDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {shiftDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200/80 rounded-xl shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-100">
                    {shifts.length > 0 && (
                      <div className="relative mb-1.5">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          autoFocus
                          value={shiftSearchQuery}
                          onChange={(e) => setShiftSearchQuery(e.target.value)}
                          placeholder="Cari shift..."
                          className="w-full h-8 pl-8 pr-2.5 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
                        />
                      </div>
                    )}

                    {shifts.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {filteredShifts.length === 0 ? (
                          <p className="text-[11px] text-gray-400 font-medium text-center py-3">
                            Tidak ada shift yang cocok.
                          </p>
                        ) : (
                          filteredShifts.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedShiftId(String(s.id));
                                setShiftDropdownOpen(false);
                                setShiftSearchQuery("");
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                                String(s.id) === selectedShiftId ? "bg-zinc-100" : "hover:bg-zinc-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  style={{ backgroundColor: shiftPalette(s.id).text }}
                                  className="w-2 h-2 rounded-full shrink-0"
                                />
                                <span className="text-xs font-bold text-gray-800 truncate">{s.nama_shift}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                                {s.jam_masuk} - {s.jam_keluar}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    <div className={shifts.length > 0 ? "pt-1.5 mt-1.5 border-t border-gray-100" : ""}>
                      {!isAddingShift ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingShift(true);
                            setNewShiftName(shiftSearchQuery.trim());
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-[11px] font-bold text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Shift
                        </button>
                      ) : (
                        <form onSubmit={handleCreateShift} className="space-y-2 p-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                              Shift Baru
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAddingShift(false)}
                              className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            autoFocus
                            required
                            value={newShiftName}
                            onChange={(e) => setNewShiftName(e.target.value)}
                            placeholder="Contoh: Shift Pagi"
                            className="w-full h-8 px-2.5 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <input
                                type="time"
                                required
                                value={newShiftStart}
                                onChange={(e) => setNewShiftStart(e.target.value)}
                                className="w-full h-8 pl-2 pr-7 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
                              />
                              <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                              <input
                                type="time"
                                required
                                value={newShiftEnd}
                                onChange={(e) => setNewShiftEnd(e.target.value)}
                                className="w-full h-8 pl-2 pr-7 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
                              />
                              <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setIsAddingShift(false)}
                              className="flex-1 h-8 text-[11px] font-bold text-gray-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={creatingShift}
                              style={!creatingShift ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                              className={`flex-1 h-8 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                                creatingShift ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "text-white hover:opacity-90"
                              }`}
                            >
                              {creatingShift ? "Menyimpan..." : "Tambah"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Dates — flex-1 so it absorbs any extra height from the
              stretched left column, keeping its bottom edge aligned with the
              employee section's bottom instead of leaving a gap. */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0"
              >
                2
              </span>
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Pilih Tanggal</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Mulai</p>
                <p className="text-xs font-black text-gray-800 mt-0.5">
                  {rangeStart ? formatDateShort(rangeStart) : "-"}
                </p>
              </div>
              <div className="p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Selesai</p>
                <p className="text-xs font-black text-gray-800 mt-0.5">
                  {rangeEnd ? formatDateShort(rangeEnd) : rangeStart ? formatDateShort(rangeStart) : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-lg transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-gray-800">
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-lg transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_SHORT.map((w) => (
                <span key={w} className="text-[9px] font-black text-gray-400 uppercase">
                  {w.charAt(0)}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dStr = toDateStr(day);
                const isPast = dStr < todayStr;
                const inRange = isInRange(day);
                const isEdge = (rangeStart && dStr === toDateStr(rangeStart)) || (rangeEnd && dStr === toDateStr(rangeEnd));

                return (
                  <button
                    key={dStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDayClick(day)}
                    style={
                      isEdge
                        ? { backgroundColor: THEME_COLORS.hex.primary }
                        : inRange
                        ? { backgroundColor: `${THEME_COLORS.hex.primary}22` }
                        : undefined
                    }
                    className={`aspect-square text-[10.5px] font-bold rounded-lg transition-all ${
                      isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isEdge
                        ? "text-white shadow-xs cursor-pointer"
                        : inRange
                        ? "text-gray-700 cursor-pointer"
                        : "text-gray-700 hover:bg-zinc-100 cursor-pointer"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {rangeStart && (
              <button
                type="button"
                onClick={() => {
                  setRangeStart(null);
                  setRangeEnd(null);
                }}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer transition-colors"
              >
                Reset tanggal
              </button>
            )}
          </div>
        </div>

        {/* Right: Employees panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <ReusableTable
            columns={employeeColumns}
            data={employees}
            loading={loadingEmployees}
            className="border border-gray-200/80 shadow-xs flex-1"
            fillHeight
            rowClassName={(row) =>
              selectedIds.has(row.id)
                ? "bg-[#e0542c14] hover:bg-[#e0542c22] cursor-pointer"
                : "hover:bg-zinc-50/30 cursor-pointer"
            }
            onRowClick={(row) => toggleOne(row.id)}
            showSearch={true}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari nama, username, email, telepon..."
            searchContainerClassName="relative w-full flex-1"
            emptyMessage="Tidak ada data pegawai."
            showPagination={true}
            currentPage={employeePage}
            totalPages={employeeTotalPages}
            totalItems={employeeTotalItems}
            itemsPerPage={EMPLOYEE_PAGE_SIZE}
            onPageChange={setEmployeePage}
            addButtonText="Tambah Pegawai"
            addButtonIcon={<UserPlusRounded size={16} weight="Linear" />}
            onAddClick={() => navigate("EmployeeAdd")}
            customActions={
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-9 px-3 text-xs font-bold bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-700 cursor-pointer shadow-2xs"
              >
                <option value="">Semua Lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama_lokasi}
                  </option>
                ))}
              </select>
            }
          />

          {/* Assign action bar */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-600 font-semibold">
              <span style={{ color: THEME_COLORS.hex.primary }} className="font-black">
                {selectedIds.size}
              </span>{" "}
              pegawai dipilih
              {shiftLabel && rangeLabel && (
                <span className="text-gray-400 font-medium">
                  {" "}
                  &middot; {shiftLabel} &middot; {rangeLabel}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={!canAssign}
              onClick={handleAssign}
              style={canAssign ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border-0 flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${
                canAssign
                  ? "text-white hover:opacity-90 active:scale-98"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
              }`}
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarRange className="w-3.5 h-3.5" />}
              {submitting ? "Menerapkan..." : `Terapkan ke ${selectedIds.size} Pegawai`}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule preview */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-4 gap-3">
          <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">Jadwal</h2>
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={scheduleSearchQuery}
                onChange={(e) => setScheduleSearchQuery(e.target.value)}
                placeholder="Cari nama pegawai..."
                className="h-9 w-44 sm:w-52 pl-8 pr-2.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-700 font-medium shadow-2xs"
              />
            </div>
            <select
              value={scheduleLocationFilter}
              onChange={(e) => setScheduleLocationFilter(e.target.value)}
              className="h-9 px-3 text-xs font-bold bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-700 cursor-pointer shadow-2xs"
            >
              <option value="">Semua Lokasi</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama_lokasi}
                </option>
              ))}
            </select>

            <div className="relative" ref={scheduleCalendarRef}>
              <button
                type="button"
                onClick={() => setScheduleCalendarOpen((o) => !o)}
                className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white shadow-2xs text-xs font-bold text-gray-800 whitespace-nowrap cursor-pointer hover:border-gray-300 transition-colors"
              >
                <CalendarMark size={13} weight="Linear" className="text-gray-400" />
                {scheduleRangeStart && scheduleRangeEnd
                  ? formatRangeLabel(scheduleRangeStart, scheduleRangeEnd)
                  : "Pilih rentang tanggal"}
              </button>

              {scheduleCalendarOpen && (
                <div className="absolute z-30 mt-1.5 right-0 w-64 bg-white border border-gray-200/80 rounded-xl shadow-lg p-3 animate-in fade-in zoom-in-95 duration-100">
                  <p className="text-[10px] text-gray-400 font-semibold mb-2">
                    Maksimal {MAX_SCHEDULE_RANGE_DAYS} hari &middot; klik tanggal awal lalu tanggal akhir
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => setScheduleCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-lg transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-gray-800">
                      {MONTH_NAMES[scheduleCalendarMonth.getMonth()]} {scheduleCalendarMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScheduleCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      className="p-1.5 border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-lg transition-all cursor-pointer text-gray-600 bg-white shadow-2xs"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {WEEKDAY_SHORT.map((w) => (
                      <span key={w} className="text-[9px] font-black text-gray-400 uppercase">
                        {w.charAt(0)}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {scheduleDaysArray.map((day, idx) => {
                      if (!day) return <div key={`sched-empty-${idx}`} />;
                      const dStr = toDateStr(day);
                      const inRange = isInScheduleRange(day);
                      const isEdge =
                        (scheduleRangeStart && dStr === toDateStr(scheduleRangeStart)) ||
                        (scheduleRangeEnd && dStr === toDateStr(scheduleRangeEnd));
                      const isDisabled = isScheduleDayDisabled(day);

                      return (
                        <button
                          key={dStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleScheduleDayClick(day)}
                          style={
                            isEdge
                              ? { backgroundColor: THEME_COLORS.hex.primary }
                              : inRange
                              ? { backgroundColor: `${THEME_COLORS.hex.primary}22` }
                              : undefined
                          }
                          className={`aspect-square text-[10.5px] font-bold rounded-lg transition-all ${
                            isDisabled
                              ? "text-gray-300 cursor-not-allowed"
                              : isEdge
                              ? "text-white shadow-xs cursor-pointer"
                              : inRange
                              ? "text-gray-700 cursor-pointer"
                              : "text-gray-700 hover:bg-zinc-100 cursor-pointer"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loadingSchedule ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : scheduleRows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-gray-400 font-semibold">
              {debouncedScheduleSearch.trim()
                ? `Tidak ada pegawai yang cocok dengan "${debouncedScheduleSearch.trim()}".`
                : `Tidak ada pegawai${scheduleLocationFilter ? " untuk lokasi ini" : ""}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100 sticky left-0 bg-white">
                    Pegawai
                  </th>
                  {rangeDays.map((d) => (
                    <th
                      key={toDateStr(d)}
                      className="text-center py-2 px-1.5 border-b border-gray-100 min-w-[92px]"
                    >
                      <div className="text-[10px] font-black text-gray-600 uppercase">{WEEKDAY_SHORT[d.getDay()]}</div>
                      <div className="text-[9px] font-semibold text-gray-400">{d.getDate()}/{d.getMonth() + 1}</div>
                    </th>
                  ))}
                  <th className="text-center py-2 px-3 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/40">
                    <td className="py-1.5 px-3 border-b border-gray-50/80 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: AVATAR_COLOR }}
                          className="w-7 h-7 rounded-full text-white text-[9.5px] font-black flex items-center justify-center shrink-0"
                        >
                          {getInitials(row.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 leading-tight truncate">{row.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5 truncate">
                            {row.location_name || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {rangeDays.map((d) => {
                      const mapping = row.byDate.get(toDateStr(d));
                      const palette = mapping ? shiftPalette(mapping.shift_id) : null;
                      return (
                        <td key={toDateStr(d)} className="text-center py-1.5 px-1 border-b border-gray-50/80">
                          {mapping ? (
                            <button
                              type="button"
                              onClick={() => openCellModal(row.id, row.name, d, mapping)}
                              style={{ backgroundColor: palette!.bg, color: palette!.text }}
                              className="w-full rounded-lg px-1.5 py-1.5 leading-tight text-left cursor-pointer hover:opacity-80 transition-opacity"
                              title={mapping.shift_name || undefined}
                            >
                              <p className="text-[10px] font-black truncate">{mapping.shift_name || "Shift"}</p>
                              {mapping.start && mapping.end && (
                                <p className="text-[9px] font-semibold opacity-80 truncate">
                                  {mapping.start}-{mapping.end}
                                </p>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openCellModal(row.id, row.name, d, null)}
                              className="w-full rounded-lg border border-dashed border-gray-200 py-2.5 flex items-center justify-center text-gray-300 hover:border-gray-300 hover:text-gray-400 hover:bg-zinc-50/60 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center py-1.5 px-3 border-b border-gray-50/80">
                      <span className="text-xs font-black text-gray-700">{formatHours(row.totalHours)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingSchedule && scheduleRows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>
                Menampilkan <span className="text-gray-900 font-semibold">{(schedulePage - 1) * schedulePerPage + 1}</span> sampai{" "}
                <span className="text-gray-900 font-semibold">{Math.min(schedulePage * schedulePerPage, scheduleTotalItems)}</span> dari{" "}
                <span className="text-gray-900 font-semibold">{scheduleTotalItems}</span> pegawai
              </span>
              <select
                value={schedulePerPage}
                onChange={(e) => setSchedulePerPage(Number(e.target.value))}
                className="h-7 px-2 text-xs font-bold bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-700 cursor-pointer shadow-2xs"
              >
                <option value={10}>10 / halaman</option>
                <option value={20}>20 / halaman</option>
                <option value={50}>50 / halaman</option>
              </select>
            </div>

            {scheduleTotalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={schedulePage === 1}
                  onClick={() => setSchedulePage((p) => p - 1)}
                  className="w-7 h-7 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-gray-700 px-1.5">
                  {schedulePage} / {scheduleTotalPages}
                </span>
                <button
                  type="button"
                  disabled={schedulePage === scheduleTotalPages}
                  onClick={() => setSchedulePage((p) => p + 1)}
                  className="w-7 h-7 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cell edit modal: add a shift on an empty day, or change/remove one that's already assigned */}
      {cellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">{cellModal.employeeName}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  {cellModal.date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCellModal(null)}
                className="p-1 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Pilih Shift</label>
              {shifts.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium py-1">Belum ada master shift.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {shifts.map((s) => {
                    const palette = shiftPalette(s.id);
                    const isSelected = String(s.id) === modalShiftId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setModalShiftId(String(s.id))}
                        style={isSelected ? { backgroundColor: palette.bg, borderColor: palette.text, color: palette.text } : undefined}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
                          isSelected ? "" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span style={{ backgroundColor: palette.text }} className="w-2 h-2 rounded-full shrink-0" />
                        {s.nama_shift}
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold opacity-75 pl-1 border-l border-current/25">
                            <Clock className="w-3 h-3" />
                            {s.jam_masuk} - {s.jam_keluar}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              {cellModal.existing ? (
                <button
                  type="button"
                  onClick={handleDeleteCell}
                  disabled={deletingCell || savingCell}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingCell ? "Menghapus..." : "Hapus Jadwal"}
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCellModal(null)}
                  disabled={savingCell || deletingCell}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCell}
                  disabled={!modalShiftId || savingCell || deletingCell}
                  style={modalShiftId && !savingCell ? { backgroundColor: THEME_COLORS.hex.primary } : undefined}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                    modalShiftId && !savingCell ? "text-white hover:opacity-90" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  {savingCell ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
