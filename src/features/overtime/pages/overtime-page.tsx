import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchLocations, type BackendLocation } from "@/features/location/api/location";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { getCookie } from "@/shared/utils/cookies";
import { API_BASE_URL } from "@/shared/utils/api";
import { Magnifier } from "@solar-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { User, X, Check, Ban } from "lucide-react";

export interface OvertimeItem {
  id: number;
  user_id: number;
  name: string;
  tanggal: string;
  jam_masuk: string;
  lat_masuk: number;
  long_masuk: number;
  jarak_masuk: string;
  foto_jam_masuk: string | null;
  jam_keluar: string | null;
  lat_keluar: number | null;
  long_keluar: number | null;
  jarak_keluar: string | null;
  foto_jam_keluar: string | null;
  total_lembur_formatted: string;
  total_lembur_seconds: number | null;
  notes: string | null;
  approved_by_name: string | null;
  status: string;
}

export function OvertimePage() {
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [items, setItems] = useState<OvertimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      return `${year}-${month}-01`;
    })(),
    akhir: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })(),
    lokasi: "",
    status: "",
    q: "",
  });

  // Modal & overlay states
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string } | null>(null);
  const [approvalModalItem, setApprovalModalItem] = useState<OvertimeItem | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<"Approved" | "Rejected" | "">("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (err: any) {
        toast.error("Gagal memuat daftar lokasi kantor");
      }
    };
    loadLocations();
  }, []);

  // Fetch overtime data
  const loadOvertimeData = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        mulai: customFilters.mulai,
        akhir: customFilters.akhir,
        page: String(page),
        ...(customFilters.lokasi && { lokasi: customFilters.lokasi }),
        ...(customFilters.status && { status: customFilters.status }),
        ...(customFilters.q && { q: customFilters.q }),
      });

      const token = getCookie("auth_token");
      const response = await fetch(`${API_BASE_URL}/overtime?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data overtime.");
      }

      const res = await response.json();
      if (res.code === 200 && res.data) {
        setItems(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data overtime");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadOvertimeData(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, q: query }));
  };

  const handleLocationChange = (locId: string) => {
    setFilters((prev) => ({ ...prev, lokasi: locId === "all" ? "" : locId }));
  };

  const handleStatusChange = (statusVal: string) => {
    setFilters((prev) => ({ ...prev, status: statusVal === "all" ? "" : statusVal }));
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
    setFilters((prev) => ({
      ...prev,
      mulai: formatDateStr(start),
      akhir: formatDateStr(end),
    }));
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalItem || !approvalStatus) {
      toast.error("Silakan pilih status terlebih dahulu");
      return;
    }

    setSubmittingApproval(true);
    try {
      const token = getCookie("auth_token");
      const response = await fetch(`${API_BASE_URL}/overtime/${approvalModalItem.id}/approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: approvalStatus,
          notes: approvalNotes,
        }),
      });

      const res = await response.json();
      if (response.ok && res.code === 200) {
        toast.success(`Pengajuan lembur berhasil ${approvalStatus === "Approved" ? "disetujui" : "ditolak"}`);
        setApprovalModalItem(null);
        setApprovalStatus("");
        setApprovalNotes("");
        loadOvertimeData(currentPage);
      } else {
        toast.error(res.message || "Gagal memproses approval");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan koneksi internet");
    } finally {
      setSubmittingApproval(false);
    }
  };

  const openApprovalModal = (item: OvertimeItem) => {
    setApprovalModalItem(item);
    setApprovalStatus(item.status === "Approved" || item.status === "Rejected" ? item.status : "Approved");
    setApprovalNotes(item.notes || "");
  };

  const columns: ColumnDef<OvertimeItem>[] = [
    {
      header: "Pegawai",
      className: "w-[20%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-xs font-bold text-gray-800 truncate">{row.name}</h4>
          <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
            Tanggal: {row.tanggal}
          </span>
        </div>
      ),
      skeleton: () => (
        <div className="flex flex-col justify-center gap-1.5 min-w-0">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      ),
    },
    {
      header: "Lembur Masuk",
      className: "w-[20%] text-left",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.foto_jam_masuk ? (
            <button
              onClick={() => setActivePhoto({ url: row.foto_jam_masuk!, title: `Foto Lembur Masuk - ${row.name}` })}
              className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200/80 hover:border-gray-400 transition-colors cursor-pointer shrink-0"
            >
              <img src={row.foto_jam_masuk} alt="Masuk" className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-gray-200/80 flex items-center justify-center text-gray-400 shrink-0">
              <User size={16} />
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-xs font-bold text-gray-700">{row.jam_masuk}</span>
            <span className="text-[9px] text-[#5C8A90] font-bold mt-0.5 truncate block">
              {row.jarak_masuk}m dari kantor
            </span>
          </div>
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-12 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
          </div>
        </div>
      ),
    },
    {
      header: "Lembur Pulang",
      className: "w-[20%] text-left",
      cell: (row) => {
        if (!row.jam_keluar) {
          return (
            <span className="text-[10px] font-bold border rounded-md px-2 py-1 text-center bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20 shrink-0 inline-block">
              Belum Pulang
            </span>
          );
        }
        return (
          <div className="flex items-center gap-3">
            {row.foto_jam_keluar ? (
              <button
                onClick={() => setActivePhoto({ url: row.foto_jam_keluar!, title: `Foto Lembur Pulang - ${row.name}` })}
                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200/80 hover:border-gray-400 transition-colors cursor-pointer shrink-0"
              >
                <img src={row.foto_jam_keluar} alt="Pulang" className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-gray-200/80 flex items-center justify-center text-gray-400 shrink-0">
                <User size={16} />
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs font-bold text-gray-700">{row.jam_keluar}</span>
              {row.jarak_keluar && (
                <span className="text-[9px] text-[#5C8A90] font-bold mt-0.5 truncate block">
                  {row.jarak_keluar}m dari kantor
                </span>
              )}
            </div>
          </div>
        );
      },
      skeleton: () => (
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-12 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
          </div>
        </div>
      ),
    },
    {
      header: "Durasi & Notes",
      className: "w-[20%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-bold text-gray-750">{row.total_lembur_formatted}</span>
          {row.notes && (
            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5" title={row.notes}>
              {row.notes}
            </p>
          )}
        </div>
      ),
      skeleton: () => (
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-2 w-28 rounded" />
        </div>
      ),
    },
    {
      header: "Status",
      className: "w-[12%] text-center",
      cell: (row) => {
        let badgeColor = "bg-gray-50 text-gray-500 border-gray-200/80";
        if (row.status === "Approved") {
          badgeColor = "bg-[#7FA46D]/10 text-[#516b46] border-[#7FA46D]/20";
        } else if (row.status === "Rejected") {
          badgeColor = "bg-[#e0542c]/10 text-[#c23f1b] border-[#e0542c]/20";
        } else if (row.status === "Pending") {
          badgeColor = "bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20";
        }

        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[9px] font-bold border rounded-md px-2 py-0.5 inline-block text-center min-w-[70px] ${badgeColor}`}>
              {row.status}
            </span>
            {row.approved_by_name && (
              <span className="text-[8px] text-gray-400 font-medium truncate max-w-[80px]" title={row.approved_by_name}>
                Oleh: {row.approved_by_name}
              </span>
            )}
          </div>
        );
      },
      skeleton: () => <Skeleton className="h-5 w-16 rounded mx-auto" />,
    },
    {
      header: "Aksi",
      className: "w-[8%] text-center pr-4",
      cell: (row) => {
        const canApprove = row.status !== "Approved" && row.jam_keluar !== null;
        if (!canApprove) return <span className="text-gray-300">-</span>;

        return (
          <button
            onClick={() => openApprovalModal(row)}
            className="h-7 px-2.5 bg-zinc-50 border border-gray-200 hover:border-gray-300 hover:bg-zinc-100 text-gray-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
          >
            Review
          </button>
        );
      },
      skeleton: () => <Skeleton className="h-7 w-12 rounded mx-auto" />,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Filter and Table Container */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Filter Row */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          {/* Left search */}
          <div className="relative w-full md:max-w-[240px] shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Magnifier size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={filters.q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-9 pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
            />
          </div>

          {/* Right filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-end">
            {/* Date Range Picker */}
            <div className="w-full sm:w-auto shrink-0">
              <DateRangePicker
                startDate={filters.mulai ? new Date(filters.mulai) : null}
                endDate={filters.akhir ? new Date(filters.akhir) : null}
                onChange={handleDateRangeChange}
                className="w-full sm:w-[220px] h-9"
              />
            </div>

            {/* Location Select */}
            <div className="w-full sm:w-[170px] shrink-0">
              <Select value={filters.lokasi || "all"} onValueChange={(val) => handleLocationChange(val || "all")}>
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {filters.lokasi === ""
                      ? "Semua Lokasi"
                      : locations.find((l) => String(l.id) === filters.lokasi)?.nama_lokasi || "Semua Lokasi"}
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

            {/* Status Select */}
            <div className="w-full sm:w-[150px] shrink-0">
              <Select value={filters.status || "all"} onValueChange={(val) => handleStatusChange(val || "all")}>
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {filters.status === ""
                      ? "Semua Status"
                      : filters.status === "Pending"
                      ? "Pending"
                      : filters.status === "Approved"
                      ? "Disetujui"
                      : "Ditolak"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[130px]">
                  <SelectItem value="all" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="Pending" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Pending
                  </SelectItem>
                  <SelectItem value="Approved" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Disetujui
                  </SelectItem>
                  <SelectItem value="Rejected" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Ditolak
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Embedded Reusable Table */}
        <ReusableTable
          columns={columns}
          data={loading ? [] : items}
          loading={loading}
          showSearch={false}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(page) => loadOvertimeData(page)}
          className="border-none shadow-none p-0 bg-transparent rounded-none"
          rowClassName="hover:bg-zinc-50/30"
          emptyMessage="Tidak ada data overtime."
        />
      </div>

      {/* Photo Preview Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setActivePhoto(null)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50/50">
              <span className="text-xs font-bold text-gray-750">{activePhoto.title}</span>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1 hover:bg-zinc-150 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-650"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 flex items-center justify-center bg-zinc-50">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-sm border border-gray-200/60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setApprovalModalItem(null)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50/50">
              <span className="text-xs font-bold text-gray-750">Review Pengajuan Lembur</span>
              <button
                onClick={() => setApprovalModalItem(null)}
                className="p-1 hover:bg-zinc-150 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-650"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleApprovalSubmit} className="p-5 space-y-4">
              <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-4 space-y-2.5">
                {/* Pegawai */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pegawai</span>
                  <span className="text-xs font-bold text-gray-800 leading-tight">{approvalModalItem.name}</span>
                </div>

                {/* Tanggal */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Tanggal</span>
                  <span className="text-xs font-bold text-gray-800 leading-tight">
                    {new Date(approvalModalItem.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {/* Total Lembur */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Total Lembur</span>
                  <span className="inline-flex items-center w-fit bg-teal-50 border border-teal-100 text-teal-700 px-2 py-0.5 rounded-lg text-xs font-black leading-none mt-0.5">
                    {approvalModalItem.total_lembur_formatted}
                  </span>
                </div>

                {/* Catatan Pegawai */}
                {approvalModalItem.notes && (
                  <div className="flex flex-col gap-0.5 pt-2 border-t border-amber-150/40">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Catatan Pegawai</span>
                    <p className="text-xs text-gray-650 font-semibold leading-relaxed mt-0.5">
                      "{approvalModalItem.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Status Approval</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalStatus("Approved")}
                    className={`h-9 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                      approvalStatus === "Approved"
                        ? "bg-[#7FA46D]/15 text-[#516b46] border-[#7FA46D]/40"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Check size={14} />
                    <span>Setujui</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalStatus("Rejected")}
                    className={`h-9 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                      approvalStatus === "Rejected"
                        ? "bg-[#e0542c]/15 text-[#c23f1b] border-[#e0542c]/40"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Ban size={14} />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-1.5">
                <label htmlFor="notes-input" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Catatan Penyetuju</label>
                <textarea
                  id="notes-input"
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Masukkan catatan persetujuan atau penolakan..."
                  className="w-full text-xs bg-zinc-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 placeholder-gray-400 font-medium resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setApprovalModalItem(null)}
                  className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-gray-755 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingApproval}
                  className="h-9 px-4 bg-[#e0542c] hover:bg-[#c23f1b] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {submittingApproval ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
