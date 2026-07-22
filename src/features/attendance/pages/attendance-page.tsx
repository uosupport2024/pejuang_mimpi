import { useState, useEffect } from "react";
import { Download, User, Clock, AlertTriangle, CheckCircle2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { fetchLocations, type BackendLocation } from "@/features/location/api/location";
import { type RekapItem } from "../../payroll/api/payroll";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { Magnifier, DocumentText, InfoCircle } from "@solar-icons/react";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getCookie } from "@/shared/utils/cookies";
import { API_BASE_URL } from "@/shared/utils/api";

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const formatDisplayDate = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()}`;

export function AttendancePage() {
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [rekapItems, setRekapItems] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [downloadingEndpoint, setDownloadingEndpoint] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    mulai: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}-01`; // First day of current month
    })(),
    akhir: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`; // Today
    })(),
    lokasi: "",
    q: "",
  });

  // Load locations
  useEffect(() => {
    let isMounted = true;
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        if (isMounted) {
          setLocations(data);
        }
      } catch (err: any) {
        toast.error("Gagal memuat daftar lokasi kantor");
      }
    };
    loadLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch data
  const loadAttendanceData = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        mulai: customFilters.mulai,
        akhir: customFilters.akhir,
        ...(customFilters.lokasi && { lokasi: customFilters.lokasi }),
        ...(customFilters.q && { q: customFilters.q }),
        page: String(page),
      });

      const token = getCookie("auth_token");
      const response = await fetch(`${API_BASE_URL}/rekap-data?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data absensi.");
      }

      const res = await response.json();
      if (res.code === 200 && res.data) {
        const paginatedData = res.data;
        setRekapItems(paginatedData.data || []);
        setCurrentPage(paginatedData.current_page || 1);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data rekap absensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData(1);
  }, []);

  const handleSearchChange = (query: string) => {
    const nextFilters = { ...filters, q: query };
    setFilters(nextFilters);
    loadAttendanceData(1, nextFilters);
  };

  const handleLocationChange = (locId: string) => {
    const nextFilters = { ...filters, lokasi: locId === "all" ? "" : locId };
    setFilters(nextFilters);
    loadAttendanceData(1, nextFilters);
  };

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    const [start, end] = range;

    const formatDateStr = (d: Date | null) => {
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const nextFilters = {
      ...filters,
      mulai: formatDateStr(start),
      akhir: formatDateStr(end),
    };

    setFilters(nextFilters);

    if (start && end) {
      loadAttendanceData(1, nextFilters);
    }
  };

  const handlePageChange = (page: number) => {
    loadAttendanceData(page);
  };

  const handleDownload = async (endpoint: string, filename: string, isPdf = false) => {
    let pdfWindow: Window | null = null;
    if (isPdf) {
      pdfWindow = window.open("about:blank", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head><title>Memuat PDF...</title></head>
            <body style="margin:0; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f4f4f5; color:#71717a;">
              <div style="text-align:center;">
                <svg style="animation: spin 1s linear infinite; height: 32px; width: 32px; color: #e0542c; margin: 0 auto 12px auto;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p style="font-size: 14px; font-weight: 500;">Menyiapkan dokumen PDF Anda...</p>
              </div>
              <style>
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </body>
          </html>
        `);
      }
    }

    try {
      setDownloadingEndpoint(endpoint);
      const baseUrl = API_BASE_URL;
      const qParams = new URLSearchParams({
        mulai: filters.mulai,
        akhir: filters.akhir,
        ...(filters.lokasi && { lokasi: filters.lokasi }),
      });
      
      const url = `${baseUrl}${endpoint}?${qParams.toString()}`;
      const token = getCookie("auth_token");
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengunduh file (Status: ${response.status})`);
      }

      const blob = await response.blob();
      const fileBlob = isPdf ? new Blob([blob], { type: "application/pdf" }) : blob;
      const blobUrl = window.URL.createObjectURL(fileBlob);
      
      if (isPdf && pdfWindow) {
        pdfWindow.location.href = blobUrl;
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      setIsExportModalOpen(false);
    } catch (err: any) {
      if (pdfWindow) {
        pdfWindow.close();
      }
      toast.error(err.message || "Gagal mengunduh file");
    } finally {
      setDownloadingEndpoint(null);
    }
  };

  const startVal = filters.mulai ? new Date(filters.mulai) : null;
  const endVal = filters.akhir ? new Date(filters.akhir) : null;

  // Calculate overview metrics from current page
  const totalEmployees = totalItems;
  const totalOvertimeHours = rekapItems.reduce((acc, curr) => acc + (curr.jam_lembur || 0), 0);
  const totalAbsences = rekapItems.reduce((acc, curr) => acc + (curr.sakit_dan_izin || 0), 0);
  const averageAttendanceRate = rekapItems.length > 0 
    ? rekapItems.reduce((acc, curr) => {
        const worked = curr.total_hadir ?? 0;
        const rate = curr.total_hari_kerja > 0 ? (worked / curr.total_hari_kerja) * 100 : 100;
        return acc + rate;
      }, 0) / rekapItems.length
    : 100;

  const sortedItems = [...rekapItems].sort((a, b) => {
    const totalWorkedA = a.total_hadir ?? 0;
    const rateA = a.total_hari_kerja > 0 ? (totalWorkedA / a.total_hari_kerja) * 100 : 100;
    
    const totalWorkedB = b.total_hadir ?? 0;
    const rateB = b.total_hari_kerja > 0 ? (totalWorkedB / b.total_hari_kerja) * 100 : 100;
    
    return rateB - rateA;
  });

  const columns: ColumnDef<RekapItem>[] = [
    {
      header: "Pegawai",
      className: "w-[30%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-xs font-bold text-gray-800 truncate">{row.name}</h4>
          <span className="text-[10px] text-[#5C8A90] font-medium mt-0.5 block">
            {row.jabatan_nama}
          </span>
        </div>
      ),
      skeleton: () => (
        <div className="flex flex-col justify-center gap-1.5 min-w-0">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-2 w-16 rounded" />
        </div>
      ),
    },
    {
      header: "Total Hadir",
      className: "w-[15%] text-left pl-[22px]",
      cell: (row) => {
        const totalWorked = row.total_hadir ?? 0;
        return (
          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2 size={14} className="text-[#7FA46D]" />
            <span className="text-xs font-bold text-gray-700">{totalWorked} / {row.total_hari_kerja} Hari</span>
          </div>
        );
      },
      skeleton: () => (
        <div className="flex items-center gap-2 shrink-0 pl-1">
          <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      ),
    },
    {
      header: "Lembur",
      className: "w-[15%] text-left pl-[22px]",
      cell: (row) => (
        <div className="flex items-center gap-2 shrink-0">
          <Clock size={14} className="text-[#F2B233]" />
          <span className="text-xs font-bold text-gray-700">{row.jam_lembur}j {row.menit_lembur}m</span>
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center gap-2 shrink-0 pl-1">
          <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-12 rounded" />
        </div>
      ),
    },
    {
      header: "Ketidakhadiran",
      className: "w-[15%] text-left pl-[22px]",
      cell: (row) => (
        <div className="flex items-center gap-2 shrink-0">
          <AlertTriangle size={14} className={row.sakit_dan_izin > 0 ? "text-[#e0542c]" : "text-gray-350"} />
          <span className={`text-xs font-bold ${row.sakit_dan_izin > 0 ? "text-[#e0542c]" : "text-gray-700"}`}>
            {row.sakit_dan_izin} Hari
          </span>
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center gap-2 shrink-0 pl-1">
          <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-10 rounded" />
        </div>
      ),
    },
    {
      header: "Skor Kehadiran",
      className: "w-[25%] text-right pr-4",
      cell: (row) => {
        const totalWorked = row.total_hadir ?? 0;
        const attendanceRate = row.total_hari_kerja > 0 ? (totalWorked / row.total_hari_kerja) * 100 : 100;

        let rateColor = "text-[#7FA46D]";
        let barColor = "bg-[#7FA46D]";
        let statusLabel = "Sangat Baik";
        let badgeColor = "bg-[#7FA46D]/10 text-[#516b46] border-[#7FA46D]/20";

        if (attendanceRate < 90 && attendanceRate >= 75) {
          rateColor = "text-[#F2B233]";
          barColor = "bg-[#F2B233]";
          statusLabel = "Cukup Baik";
          badgeColor = "bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20";
        } else if (attendanceRate < 75) {
          rateColor = "text-[#e0542c]";
          barColor = "bg-[#e0542c]";
          statusLabel = "Perlu Evaluasi";
          badgeColor = "bg-[#e0542c]/10 text-[#c23f1b] border-[#e0542c]/20";
        }

        return (
          <div className="flex items-center justify-end gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold ${rateColor}`}>{attendanceRate.toFixed(0)}%</span>
              <div className="w-16 h-1.5 bg-zinc-150 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                />
              </div>
            </div>
            <span className={`text-[9px] font-bold border rounded-md px-2.5 py-1 text-center min-w-[80px] shrink-0 ${badgeColor}`}>
              {statusLabel}
            </span>
          </div>
        );
      },
      skeleton: () => (
        <div className="flex items-center justify-end gap-3.5 shrink-0">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-1.5 w-16 rounded-full shrink-0" />
          <Skeleton className="h-6 w-20 rounded shrink-0" />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pegawai */}
        <div className="p-4 bg-[#5C8A90] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Total Pegawai</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{totalEmployees} Orang</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
        </div>

        {/* Card 2: Kehadiran Rata-rata */}
        <div className="p-4 bg-[#7FA46D] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Rata-rata Kehadiran</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{averageAttendanceRate.toFixed(0)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Jam Lembur */}
        <div className="p-4 bg-[#F2B233] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Total Lembur</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{totalOvertimeHours} Jam</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Sakit / Izin */}
        <div className="p-4 bg-[#e0542c] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Total Sakit & Izin</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{totalAbsences} Hari</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Filter and Cards Container */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Filter Row */}
        <div className="p-5 border-b border-gray-100 bg-zinc-50/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
            {/* Filter inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              {/* 1. Search Karyawan */}
              <div className="relative w-full sm:max-w-[220px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Magnifier size={18} weight="Linear" />
                </span>
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari nama pegawai..."
                  className="w-full h-9 box-border pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
                />
              </div>

              {/* 2. Rentang Tanggal */}
              <div className="w-full sm:w-64">
                <DateRangePicker
                  startDate={startVal}
                  endDate={endVal}
                  onChange={handleDateRangeChange}
                  className="h-9"
                />
              </div>

              {/* 3. Lokasi Dropdown */}
              <div className="w-full sm:w-48">
                <Select
                  value={filters.lokasi || "all"}
                  onValueChange={(val) => handleLocationChange(val || "all")}
                >
                  <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                    <SelectValue>
                      {filters.lokasi
                        ? locations.find((l) => String(l.id) === filters.lokasi)?.nama_lokasi || "Semua Lokasi"
                        : "Semua Lokasi"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[150px]">
                    <SelectItem value="all" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                      Semua Lokasi
                    </SelectItem>
                    {locations.map((l) => (
                      <SelectItem
                        key={l.id}
                        value={String(l.id)}
                        className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2"
                      >
                        {l.nama_lokasi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle & Export Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              {/* Toggle Buttons */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg shrink-0 h-9 box-border">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#5C8A90] text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Tampilan List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                    viewMode === "card"
                      ? "bg-[#5C8A90] text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Tampilan Card"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex-1 sm:flex-initial h-9 px-4 flex items-center justify-center gap-2 bg-[#e0542c] hover:bg-[#c23f1b] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <DocumentText size={16} className="text-[#fee279]" />
                <span>Export Rekap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card-Grid or List Layout representing the rekap data */}
        {viewMode === "card" ? (
          <div className="p-6 bg-zinc-50/30">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 shrink-0" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 bg-zinc-100 rounded" />
                            <div className="h-2 w-16 bg-zinc-100 rounded" />
                          </div>
                        </div>
                        <div className="h-5 w-20 bg-zinc-100 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-2.5 w-16 bg-zinc-100 rounded" />
                          <div className="h-2.5 w-8 bg-zinc-100 rounded" />
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
                      <div className="space-y-2">
                        <div className="h-2 w-12 bg-zinc-100 rounded mx-auto" />
                        <div className="h-3 w-8 bg-zinc-100 rounded mx-auto" />
                      </div>
                      <div className="space-y-2 border-x border-gray-100">
                        <div className="h-2 w-12 bg-zinc-100 rounded mx-auto" />
                        <div className="h-3 w-8 bg-zinc-100 rounded mx-auto" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-12 bg-zinc-100 rounded mx-auto" />
                        <div className="h-3 w-8 bg-zinc-100 rounded mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : rekapItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle className="w-10 h-10 text-gray-300 mb-3" />
                <h3 className="text-sm font-bold text-gray-700">Tidak Ada Data</h3>
                <p className="text-xs text-gray-400 max-w-xs mt-1">Tidak ditemukan log rekapitulasi kehadiran berdasarkan filter yang dipilih.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedItems.map((item) => {
                  const totalWorked = item.total_hadir ?? 0;
                  const attendanceRate = item.total_hari_kerja > 0 ? (totalWorked / item.total_hari_kerja) * 100 : 100;
                  
                  // Get name initials for avatar
                  const initials = item.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  // Style indicators
                  let rateColor = "text-[#7FA46D]";
                  let barColor = "bg-[#7FA46D]";
                  let statusLabel = "Sangat Baik";
                  let badgeColor = "bg-[#7FA46D]/10 text-[#516b46] border-[#7FA46D]/20";

                  if (attendanceRate < 90 && attendanceRate >= 75) {
                    rateColor = "text-[#F2B233]";
                    barColor = "bg-[#F2B233]";
                    statusLabel = "Cukup Baik";
                    badgeColor = "bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20";
                  } else if (attendanceRate < 75) {
                    rateColor = "text-[#e0542c]";
                    barColor = "bg-[#e0542c]";
                    statusLabel = "Perlu Evaluasi";
                    badgeColor = "bg-[#e0542c]/10 text-[#c23f1b] border-[#e0542c]/20";
                  }

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Header Card */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#e0542c]/10 text-[#e0542c] font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                              <span className="text-[10px] text-[#5C8A90] font-medium mt-0.5 block">
                                {item.jabatan_nama}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold border rounded-md px-2 py-0.5 shrink-0 ${badgeColor}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-semibold">Skor Kehadiran</span>
                            <span className={`font-extrabold ${rateColor}`}>{attendanceRate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats Metrics Block */}
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-4 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-gray-400 block">Total Hadir</span>
                          <span className="text-xs font-bold text-gray-700">{totalWorked} / {item.total_hari_kerja}</span>
                        </div>
                        <div className="space-y-0.5 border-x border-gray-100">
                          <span className="text-[9px] text-gray-400 block">Lembur</span>
                          <span className="text-xs font-bold text-gray-700">{item.jam_lembur}j {item.menit_lembur}m</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-gray-400 block">Sakit / Izin</span>
                          <span className={`text-xs font-bold ${item.sakit_dan_izin > 0 ? "text-[#e0542c]" : "text-gray-750"}`}>
                            {item.sakit_dan_izin} Hari
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={loading ? [] : sortedItems}
            loading={loading}
            showSearch={false}
            showPagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            className="border-none shadow-none p-0 bg-transparent rounded-none"
            rowClassName="hover:bg-zinc-50/30"
            emptyMessage="Tidak ada data rekapitulasi."
          />
        )}

        {/* Pagination Controls for Card View */}
        {!loading && totalPages > 1 && viewMode === "card" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-white">
            <div className="text-[11px] text-gray-500 font-medium">
              Menampilkan <span className="font-semibold text-gray-700">{rekapItems.length}</span> dari{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span> pegawai
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="text-[10px] font-semibold text-gray-600 px-2.5">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => !downloadingEndpoint && setIsExportModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 space-y-5 z-[101] animate-in zoom-in-95 duration-200 relative">
            {/* Close Button */}
            <button
              type="button"
              disabled={downloadingEndpoint !== null}
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon & Title Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#e0542c]/10 text-[#e0542c] rounded-xl border border-[#e0542c]/20 shrink-0">
                <DocumentText size={24} className="text-[#e0542c]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-800">Export Laporan</h3>
                <p className="text-[11px] text-gray-500 leading-normal">Unduh data rekapitulasi jam kerja, lembur, dan payroll pegawai.</p>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-[#5C8A90]/10 border border-[#5C8A90]/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[#3b595d] font-bold text-[10px]">
                <InfoCircle size={14} className="text-[#5C8A90]" />
                <span>Filter Aktif Saat Ini</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                <div>
                  <span className="text-gray-400 block text-[9px]">Periode</span>
                  <span className="font-semibold text-gray-700">
                    {startVal && endVal
                      ? `${formatDisplayDate(startVal)} - ${formatDisplayDate(endVal)}`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">Lokasi</span>
                  <span className="font-semibold text-gray-700">
                    {filters.lokasi
                      ? locations.find((l) => String(l.id) === filters.lokasi)?.nama_lokasi || "Semua Lokasi"
                      : "Semua Lokasi"}
                  </span>
                </div>
                {filters.q && (
                  <div className="col-span-2 border-t border-[#5C8A90]/10 pt-2">
                    <span className="text-gray-400 block text-[9px]">Pencarian Pegawai</span>
                    <span className="font-semibold text-gray-700">"{filters.q}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Export Format Actions */}
            <div className="space-y-3">
              {/* Option 1: Ringkasan */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Ringkasan Rekap & Payroll</h4>
                  <p className="text-[10px] text-gray-500">Laporan ringkas gaji dan insentif.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={downloadingEndpoint !== null}
                    onClick={() => {
                      handleDownload("/rekap-data/export", "Ringkasan Rekap & Payroll.xlsx");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-[#7FA46D] hover:bg-[#6e935d] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingEndpoint === "/rekap-data/export" ? (
                      <svg className="animate-spin h-3 w-3 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download size={10} className="mr-1" />
                    )}
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    disabled={downloadingEndpoint !== null}
                    onClick={() => {
                      handleDownload("/rekap-data/rekap-pdf", "Ringkasan Rekap & Payroll.pdf", true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-[#e0542c] hover:bg-[#c23f1b] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingEndpoint === "/rekap-data/rekap-pdf" ? (
                      <svg className="animate-spin h-3 w-3 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download size={10} className="mr-1" />
                    )}
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Detail */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Rincian Detail Kehadiran</h4>
                  <p className="text-[10px] text-gray-500">Laporan log absensi detail pegawai.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={downloadingEndpoint !== null}
                    onClick={() => {
                      handleDownload("/data-absen/export", "Rincian Detail Kehadiran.xlsx");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-[#7FA46D] hover:bg-[#6e935d] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingEndpoint === "/data-absen/export" ? (
                      <svg className="animate-spin h-3 w-3 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download size={10} className="mr-1" />
                    )}
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    disabled={downloadingEndpoint !== null}
                    onClick={() => {
                      handleDownload("/rekap-data/detail-pdf", "Rincian Detail Kehadiran.pdf", true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-[#e0542c] hover:bg-[#c23f1b] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingEndpoint === "/rekap-data/detail-pdf" ? (
                      <svg className="animate-spin h-3 w-3 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download size={10} className="mr-1" />
                    )}
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={downloadingEndpoint !== null}
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
