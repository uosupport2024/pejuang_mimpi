import { useState, useEffect } from "react";
import { Download, Printer, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { fetchLocations, type BackendLocation } from "@/features/location/api/location";
import { fetchRekapData, type RekapItem } from "../api/payroll";
import { API_BASE_URL } from "@/shared/utils/api";
import { getCookie } from "@/shared/utils/cookies";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { Magnifier, DocumentText, InfoCircle } from "@solar-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const formatDisplayDate = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()}`;

export function PayrollPage() {
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [rekapItems, setRekapItems] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [downloadingEndpoint, setDownloadingEndpoint] = useState<string | null>(null);

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

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    sort: "name",
    direction: "asc",
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

  // Load rekap data
  const loadRekapData = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const res = await fetchRekapData({
        mulai: customFilters.mulai,
        akhir: customFilters.akhir,
        lokasi: customFilters.lokasi,
        sort: sortConfig.sort,
        direction: sortConfig.direction,
        page,
      });
      setRekapItems(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalItems(res.total);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data rekap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRekapData(currentPage);
  }, [sortConfig]);

  const handleSearchChange = (query: string) => {
    const nextFilters = { ...filters, q: query };
    setFilters(nextFilters);
    loadRekapData(1, nextFilters);
  };

  const handleLocationChange = (locId: string) => {
    const nextFilters = { ...filters, lokasi: locId === "all" ? "" : locId };
    setFilters(nextFilters);
    loadRekapData(1, nextFilters);
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
      loadRekapData(1, nextFilters);
    }
  };

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      sort: field,
      direction: prev.sort === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
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

  // Columns definition using Project Style
  const columns: ColumnDef<RekapItem>[] = [
    {
      header: <span className="text-center block w-full text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">No.</span>,
      cell: (_row: RekapItem, index: number) => (
        <span className="text-center block text-xs text-gray-655">{(currentPage - 1) * 10 + index + 1}.</span>
      ),
      className: "w-12 text-center",
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("name")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          Nama {sortConfig.sort === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{row.name}</span>
      ),
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("jabatan")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          Divisi {sortConfig.sort === "jabatan" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{row.jabatan_nama}</span>
      ),
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("gaji_harian")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          Gaji / Hari {sortConfig.sort === "gaji_harian" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{formatRupiah(row.gaji_harian)}</span>
      ),
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Hari Kerja</span>,
      cell: (row: RekapItem) => (
        <span className="text-center block text-xs text-gray-750 font-semibold">{row.total_hari_kerja}</span>
      ),
      className: "text-center w-20",
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Sakit</span>,
      cell: (row: RekapItem) => (
        <span className="text-center block text-xs text-gray-650">{row.sakit}</span>
      ),
      className: "text-center w-16",
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Izin</span>,
      cell: (row: RekapItem) => (
        <span className="text-center block text-xs text-gray-655">{row.izin_masuk}</span>
      ),
      className: "text-center w-16",
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Total Absen</span>,
      cell: (row: RekapItem) => (
        <span className="text-center block text-xs text-gray-750 font-bold">{row.sakit_dan_izin}</span>
      ),
      className: "text-center w-16",
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Lembur</span>,
      cell: (row: RekapItem) => (
        <span className="text-center block text-xs text-gray-600 whitespace-nowrap">
          {row.jam_lembur}j {row.menit_lembur}m
        </span>
      ),
      className: "text-center w-24",
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Insentif (22H)</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{formatRupiah(row.insentif_per_22_hari)}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Tot Gaji Pokok</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{formatRupiah(row.total_gaji_pokok)}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Insentif (Aktual)</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{formatRupiah(row.insentif_per_hari_kerja)}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Potongan</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs text-rose-600 whitespace-nowrap font-medium">{formatRupiah(row.potongan)}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Uang Lembur</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs text-emerald-600 whitespace-nowrap font-medium">{formatRupiah(row.total_lembur_rp)}</span>
      ),
    },
    {
      header: <span className="text-left block text-xs font-bold text-[#e0542c] tracking-wider whitespace-nowrap">Aktual Gaji</span>,
      cell: (row: RekapItem) => (
        <span className="text-xs font-extrabold text-[#e0542c] whitespace-nowrap">{formatRupiah(row.aktual_gaji)}</span>
      ),
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("nama_rekening")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          A/N Rekening {sortConfig.sort === "nama_rekening" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{row.nama_rekening || "-"}</span>
      ),
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("bank")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          Bank {sortConfig.sort === "bank" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 whitespace-nowrap">{row.bank || "-"}</span>
      ),
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("rekening")}
          className="flex items-center gap-1 text-left text-xs font-semibold text-gray-500 tracking-wider hover:text-gray-700 cursor-pointer whitespace-nowrap"
        >
          No Rekening {sortConfig.sort === "rekening" && (sortConfig.direction === "asc" ? "↑" : "↓")}
        </button>
      ),
      cell: (row: RekapItem) => (
        <span className="text-xs text-gray-655 font-mono whitespace-nowrap">{row.rekening || "-"}</span>
      ),
    },
    {
      header: <span className="text-center block text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">Actions</span>,
      cell: (row: RekapItem) => (
        <div className="flex items-center justify-center gap-2">
          {!row.has_payroll && (
            <a
              href={`${API_BASE_URL.replace("/api", "")}/rekap-data/payroll/${row.id}?mulai=${filters.mulai}&akhir=${filters.akhir}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#e0542c] hover:bg-[#e0542c]/10 rounded-md transition-colors cursor-pointer"
              title="Input Gaji"
            >
              <CreditCard size={14} />
            </a>
          )}
          <a
            href={`${API_BASE_URL.replace("/api", "")}/data-absen/export?user_id=${row.id}&mulai=${filters.mulai}&akhir=${filters.akhir}`}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            title="Cetak Absensi Karyawan"
          >
            <Printer size={14} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Unified Table Card containing Search, Date Range, Location, and Export */}
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

            {/* Export Trigger Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="w-full sm:w-auto h-9 px-4 flex items-center justify-center gap-2 bg-[#e0542c] hover:bg-[#c23f1b] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <DocumentText size={16} className="text-[#fee279]" />
              <span>Export Rekap</span>
            </button>
          </div>
        </div>

        {/* Embedded Reusable Table */}
        <ReusableTable
          columns={columns}
          data={rekapItems}
          loading={loading}
          showSearch={false}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(page) => loadRekapData(page)}
          className="border-none shadow-none p-0 bg-transparent rounded-none"
          rowClassName="hover:bg-zinc-50/30"
          emptyMessage="Tidak ada data rekapitulasi."
        />
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsExportModalOpen(false)}
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
