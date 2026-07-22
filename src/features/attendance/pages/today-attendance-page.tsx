import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchLocations, type BackendLocation } from "@/features/location/api/location";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
import { CheckCircle2, Clock, AlertTriangle, User, Image, X } from "lucide-react";

export interface TodayAttendanceItem {
  user_id: number;
  name: string;
  jabatan_nama: string;
  lokasi_nama: string;
  shift_nama: string;
  shift_masuk: string | null;
  shift_keluar: string | null;
  jam_absen: string | null;
  jam_pulang: string | null;
  foto_absen: string | null;
  foto_pulang: string | null;
  status: string;
}

export function TodayAttendancePage() {
  const [items, setItems] = useState<TodayAttendanceItem[]>([]);
  const [locations, setLocations] = useState<BackendLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Photo modal states
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string } | null>(null);

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const token = getCookie("auth_token");
      const queryParams = new URLSearchParams();

      if (selectedLocation !== "all") {
        queryParams.append("lokasi", selectedLocation);
      }
      if (selectedStatus !== "all") {
        queryParams.append("status", selectedStatus);
      }
      if (searchQuery) {
        queryParams.append("q", searchQuery);
      }

      const response = await fetch(`${API_BASE_URL}/attendance/today?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const resData = await response.json();
      if (response.ok && resData.code === 200) {
        setItems(resData.data);
      } else {
        toast.error(resData.message || "Gagal memuat data absensi hari ini");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locData = await fetchLocations();
      setLocations(locData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTodayData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedLocation, selectedStatus]);

  // Overview stats calculation
  const totalEmployees = items.length;
  const totalHadir = items.filter((i) => i.status === "Hadir").length;
  const totalSakitIzin = items.filter((i) => ["Sakit", "Izin", "Izin Masuk", "Cuti"].includes(i.status)).length;
  const totalBelumHadir = items.filter((i) => i.status === "Belum Hadir").length;

  const columns: ColumnDef<TodayAttendanceItem>[] = [
    {
      header: "Pegawai",
      className: "w-[25%] text-left",
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
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      ),
    },
    {
      header: "Lokasi Kerja",
      className: "w-[15%] text-left",
      cell: (row) => (
        <span className="text-xs font-medium text-gray-650 truncate block">
          {row.lokasi_nama}
        </span>
      ),
      skeleton: () => <Skeleton className="h-3 w-20 rounded" />,
    },
    {
      header: "Jadwal Shift",
      className: "w-[20%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold text-gray-700">{row.shift_nama}</span>
          {row.shift_masuk && row.shift_keluar && (
            <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
              {row.shift_masuk.substring(0, 5)} - {row.shift_keluar.substring(0, 5)}
            </span>
          )}
        </div>
      ),
      skeleton: () => (
        <div className="flex flex-col justify-center gap-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-2.5 w-20 rounded" />
        </div>
      ),
    },
    {
      header: "Jam Masuk",
      className: "w-[15%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center gap-1">
          <span className="text-xs font-bold text-gray-700">{row.jam_absen || "-"}</span>
          {row.foto_absen && (
            <button
              onClick={() => setActivePhoto({ url: row.foto_absen!, title: `Foto Masuk - ${row.name}` })}
              className="inline-flex items-center gap-1 text-[9px] font-bold text-[#5C8A90] hover:text-[#3b595d] transition-colors cursor-pointer"
            >
              <Image size={10} />
              <span>Lihat Foto</span>
            </button>
          )}
        </div>
      ),
      skeleton: () => <Skeleton className="h-3.5 w-12 rounded" />,
    },
    {
      header: "Jam Pulang",
      className: "w-[15%] text-left",
      cell: (row) => (
        <div className="flex flex-col justify-center gap-1">
          <span className="text-xs font-bold text-gray-700">{row.jam_pulang || "-"}</span>
          {row.foto_pulang && (
            <button
              onClick={() => setActivePhoto({ url: row.foto_pulang!, title: `Foto Pulang - ${row.name}` })}
              className="inline-flex items-center gap-1 text-[9px] font-bold text-[#5C8A90] hover:text-[#3b595d] transition-colors cursor-pointer"
            >
              <Image size={10} />
              <span>Lihat Foto</span>
            </button>
          )}
        </div>
      ),
      skeleton: () => <Skeleton className="h-3.5 w-12 rounded" />,
    },
    {
      header: "Status",
      className: "w-[10%] text-center",
      cell: (row) => {
        let badgeColor = "bg-gray-50 text-gray-500 border-gray-200/80";
        if (row.status === "Hadir") {
          badgeColor = "bg-[#7FA46D]/10 text-[#516b46] border-[#7FA46D]/20";
        } else if (["Sakit", "Izin", "Izin Masuk", "Cuti"].includes(row.status)) {
          badgeColor = "bg-[#F2B233]/12 text-[#916715] border-[#F2B233]/20";
        } else if (row.status === "Belum Hadir") {
          badgeColor = "bg-[#e0542c]/10 text-[#c23f1b] border-[#e0542c]/20";
        }

        return (
          <span className={`text-[9px] font-bold border rounded-md px-2 py-0.5 inline-block text-center min-w-[70px] ${badgeColor}`}>
            {row.status}
          </span>
        );
      },
      skeleton: () => <Skeleton className="h-5 w-16 rounded mx-auto" />,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pegawai */}
        <div className="p-4 bg-[#5C8A90] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Total Pegawai</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{loading ? "..." : `${totalEmployees} Orang`}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
        </div>

        {/* Hadir */}
        <div className="p-4 bg-[#7FA46D] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Hadir</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{loading ? "..." : `${totalHadir} Orang`}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Izin/Sakit */}
        <div className="p-4 bg-[#F2B233] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Izin / Sakit / Cuti</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{loading ? "..." : `${totalSakitIzin} Orang`}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Belum Hadir */}
        <div className="p-4 bg-[#e0542c] text-white rounded-2xl shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block">Belum Hadir</span>
            <span className="text-2xl font-black text-white tracking-tight leading-none block">{loading ? "..." : `${totalBelumHadir} Orang`}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white backdrop-blur-xs flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
            />
          </div>

          {/* Right dropdowns */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-end">
            {/* Status Select */}
            <div className="w-full sm:w-[150px] shrink-0">
              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {selectedStatus === "all" ? "Semua Status" : selectedStatus === "hadir" ? "Hadir" : selectedStatus === "belum_hadir" ? "Belum Hadir" : "Sakit & Izin"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[150px]">
                  <SelectItem value="all" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="hadir" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Hadir
                  </SelectItem>
                  <SelectItem value="belum_hadir" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Belum Hadir
                  </SelectItem>
                  <SelectItem value="sakit_izin" className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2">
                    Sakit & Izin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Select */}
            <div className="w-full sm:w-[170px] shrink-0">
              <Select value={selectedLocation} onValueChange={(val) => setSelectedLocation(val || "all")}>
                <SelectTrigger className="w-full h-9 box-border px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between cursor-pointer shadow-none">
                  <SelectValue>
                    {selectedLocation === "all"
                      ? "Semua Lokasi"
                      : locations.find((l) => String(l.id) === selectedLocation)?.nama_lokasi || "Semua Lokasi"}
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
        </div>

        {/* Embedded Reusable Table */}
        <div className="p-6 bg-zinc-50/30">
          <ReusableTable
            columns={columns}
            data={loading ? [] : items}
            loading={loading}
            showSearch={false}
            showPagination={false}
            className="border-none shadow-none p-0 bg-transparent rounded-none"
            rowClassName="hover:bg-zinc-50/30"
            emptyMessage="Tidak ada log absensi hari ini."
          />
        </div>
      </div>

      {/* Photo Preview Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setActivePhoto(null)}
          />
          {/* Modal content */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50/50">
              <span className="text-xs font-bold text-gray-750">{activePhoto.title}</span>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1 hover:bg-zinc-150 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-650"
              >
                <X size={14} />
              </button>
            </div>
            {/* Photo body */}
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
    </div>
  );
}
