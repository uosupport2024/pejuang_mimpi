import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { fetchKoreksiAbsenAPI, postKoreksiAbsenAPI, deleteKoreksiAbsenAPI } from "../api/absensi";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { SingleDatePicker } from "@/shared/components/ui/single-date-picker";
import { SingleTimePicker } from "@/shared/components/ui/single-time-picker";

type KoreksiStatus = "Approved" | "Pending" | "Rejected";

interface KoreksiItem {
  id: number;
  day: number;
  dayName: string;
  monthName: string;
  year: number;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  alasan: string;
  status: KoreksiStatus;
  notes: string | null;
  approvedByName: string | null;
}



const indonesianDays: Record<string, string> = {
  Mon: "Sen", Tue: "Sel", Wed: "Rab", Thu: "Kam",
  Fri: "Jum", Sat: "Sab", Sun: "Min",
};

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const mapItem = (item: any): KoreksiItem => {
  const d = new Date(item.tanggal);
  return {
    id: item.id,
    day: d.getDate(),
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthName: indonesianMonths[d.getMonth()] || "Jan",
    year: d.getFullYear(),
    tanggal: item.tanggal,
    jamMasuk: item.jam_masuk ? item.jam_masuk.substring(0, 5) : null,
    jamPulang: item.jam_pulang ? item.jam_pulang.substring(0, 5) : null,
    alasan: item.alasan,
    status: (item.status as KoreksiStatus) || "Pending",
    notes: item.notes,
    approvedByName: item.approved_by_name || null
  };
};

export function MobileKoreksiAbsenPage() {
  const { navigate } = useRouter();

  // Navigation tabs: "form" | "history"
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Form states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [jamPulang, setJamPulang] = useState("");
  const [alasan, setAlasan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJamMasukChange = (val: string) => {
    setJamMasuk(val);
    if (val && jamPulang) {
      const [inH, inM] = val.split(":").map(Number);
      const [outH, outM] = jamPulang.split(":").map(Number);
      if (inH * 60 + inM > outH * 60 + outM) {
        setJamPulang("");
      }
    }
  };

  const getMinPulangTime = () => {
    if (!jamMasuk) return undefined;
    const [h, m] = jamMasuk.split(":").map(Number);
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(0);
    return d;
  };

  const getMaxPulangTime = () => {
    if (!jamMasuk) return undefined;
    const d = new Date();
    d.setHours(23);
    d.setMinutes(59);
    d.setSeconds(0);
    return d;
  };

  // History states
  const [historyList, setHistoryList] = useState<KoreksiItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle notes state
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  const toggleNotes = (id: number) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadHistory = useCallback(async (targetPage: number, append = false) => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchKoreksiAbsenAPI(targetPage, 10);
      setHasMore((data || []).length >= 10);
      const mapped = (data || []).map(mapItem);
      setHistoryList(prev => append ? [...prev, ...mapped] : mapped);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mengambil riwayat koreksi");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      setPage(1);
      setHasMore(true);
      loadHistory(1);
    }
  }, [activeTab, loadHistory]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadHistory(next, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal) {
      toast.error("Silakan pilih tanggal koreksi");
      return;
    }

    if (!jamMasuk && !jamPulang) {
      toast.error("Silakan isi jam masuk atau jam pulang");
      return;
    }

    if (!alasan.trim()) {
      toast.error("Silakan isi alasan lupa absen / koreksi");
      return;
    }

    setIsSubmitting(true);
    try {
      await postKoreksiAbsenAPI({
        tanggal,
        jam_masuk: jamMasuk || null,
        jam_pulang: jamPulang || null,
        alasan
      });

      toast.success("Pengajuan koreksi presensi berhasil dikirim");
      
      // Reset form
      setSelectedDate(null);
      setTanggal("");
      setJamMasuk("");
      setJamPulang("");
      setAlasan("");
      
      // Go to history
      setActiveTab("history");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mengajukan koreksi presensi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setSelectedDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteKoreksiAbsenAPI(selectedDeleteId);
      toast.success("Pengajuan koreksi presensi berhasil dibatalkan");
      setHistoryList(prev => prev.filter(item => item.id !== selectedDeleteId));
      closeDeleteModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal membatalkan pengajuan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#e0542c] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${patternBg})`, backgroundSize: "150px 150px", backgroundRepeat: "repeat" }}
        />
        <div className="relative z-10 flex items-center px-6 pt-7 pb-6 gap-3.5">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Lupa Absen</span>
            <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">Koreksi Presensi</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 rounded-xl p-1 border border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "form" ? "bg-white text-[#e0542c] shadow-xs" : "text-zinc-500 hover:text-zinc-700"}`}
        >
          Form Pengajuan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "history" ? "bg-white text-[#e0542c] shadow-xs" : "text-zinc-500 hover:text-zinc-700"}`}
        >
          Riwayat Pengajuan
        </button>
      </div>

      {activeTab === "form" ? (
        /* Form tab content */
        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs text-left">
          {/* Tanggal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider">Tanggal Lupa Absen</label>
            <SingleDatePicker
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setTanggal(date ? date.toLocaleDateString("en-CA") : "");
              }}
              maxDate={new Date()}
              placeholder="Pilih Tanggal"
            />
          </div>

          {/* Jam Masuk */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider text-left">Jam Masuk Sebenarnya</label>
            <SingleTimePicker
              value={jamMasuk}
              onChange={handleJamMasukChange}
              placeholder="Pilih Jam Masuk"
            />
          </div>

          {/* Jam Pulang */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider text-left">Jam Pulang Sebenarnya</label>
            <SingleTimePicker
              value={jamPulang}
              onChange={setJamPulang}
              placeholder="Pilih Jam Pulang"
              minTime={getMinPulangTime()}
              maxTime={getMaxPulangTime()}
            />
          </div>

          {/* Alasan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider">Alasan Lupa Absen / Koreksi</label>
            <textarea
              required
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan mengapa Anda tidak melakukan scan absensi tepat waktu..."
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs font-medium text-zinc-700 focus:outline-none focus:border-[#e0542c] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#e0542c] text-white rounded-xl text-xs font-bold hover:bg-[#c23f1b] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Mengajukan...</>
            ) : "Kirim Pengajuan"}
          </button>
        </form>
      ) : (
        /* History tab content */
        <div className="space-y-2.5 pb-8">
          {isLoadingHistory && historyList.length === 0 ? (
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-stretch rounded-2xl bg-zinc-100 border border-zinc-200/50 h-[84px] animate-pulse overflow-hidden">
                  {/* Left Column Skeleton */}
                  <div className="w-16 bg-zinc-200/60 shrink-0" />

                  {/* Middle Column Skeleton */}
                  <div className="flex-1 py-4 pl-4 pr-4 flex flex-col justify-center gap-2">
                    <div className="h-4 bg-zinc-200 rounded-md w-24" />
                    <div className="h-3 bg-zinc-200 rounded-md w-36 mt-1" />
                  </div>

                  {/* Right Column Skeleton */}
                  <div className="flex items-center pr-4 shrink-0">
                    <div className="h-9 w-14 bg-zinc-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : historyList.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs font-semibold bg-white rounded-2xl border border-zinc-200/50">
              <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p>Tidak ada riwayat koreksi</p>
              <p className="text-zinc-300 mt-1">presensi yang ditemukan.</p>
            </div>
          ) : (
            <>
              {historyList.map((item, idx) => {
                const bgClass = 
                  item.status === "Approved"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/15"
                    : item.status === "Pending"
                    ? "bg-gradient-to-br from-[#e0542c] to-[#c23f1b] shadow-md shadow-[#e0542c]/20"
                    : "bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/15";

                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div 
                      onClick={() => toggleNotes(item.id)}
                      className={`flex items-stretch rounded-2xl transition-all duration-200 text-white overflow-hidden cursor-pointer select-none ${bgClass}`}
                    >
                      {/* Left Column: Full-height Translucent Date Badge */}
                      <div className="w-16 bg-white/15 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl font-bold leading-none text-white">{item.day}</span>
                        <span className="text-[9px] font-bold uppercase mt-1.5 leading-none text-white/90 tracking-wider">
                          {indonesianDays[item.dayName] || item.dayName}
                        </span>
                      </div>

                      {/* Middle Column: Times & Reason */}
                      <div className="flex-1 min-w-0 flex flex-col text-left justify-center py-4 pl-4 pr-4">
                        {/* Times Row */}
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white leading-none">
                          <span>{item.jamMasuk || "—"}</span>
                          <span className="text-white/60 font-semibold">—</span>
                          <span>{item.jamPulang || "—"}</span>
                        </div>

                        {/* Reason (Alasan) Row */}
                        <p className="text-[10px] font-medium text-white/80 mt-2 truncate leading-none">
                          {item.alasan}
                        </p>
                      </div>

                      {/* Right Column: Status Glass Badge & Action */}
                      <div className="flex items-center pr-4 gap-2 shrink-0">
                        <div className="flex flex-col items-center justify-center bg-white/20 border border-white/10 rounded-xl px-2 py-1 min-w-[56px] shrink-0 text-center">
                          <span className="text-[8px] font-black uppercase leading-none text-white tracking-wider">
                            {item.status === "Approved" ? "SELESAI" : item.status === "Pending" ? "PROSES" : "BATAL"}
                          </span>
                        </div>
                        {item.status === "Pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(item.id);
                            }}
                            className="p-1.5 bg-white/15 hover:bg-white/25 border border-white/10 rounded-lg text-white transition-colors cursor-pointer"
                            title="Batalkan Pengajuan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Admin notes panel - rendered beneath card */}
                    {item.notes && (
                      <div 
                        className={`mx-2 bg-zinc-50 border border-zinc-150 border-t-0 rounded-b-xl -mt-3 text-left text-zinc-700 transition-all duration-300 ease-in-out overflow-hidden ${
                          expandedNotes[item.id]
                            ? "max-h-40 opacity-100 px-3.5 py-2.5 pt-4"
                            : "max-h-0 opacity-0 px-3.5 py-0 border-none"
                        }`}
                      >
                        <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wider block">Catatan Admin</span>
                        <p className="text-[10.5px] font-semibold mt-0.5 leading-relaxed">{item.notes}</p>
                        {item.approvedByName && (
                          <span className="text-[8px] text-zinc-400 font-medium block mt-1">Diproses oleh: {item.approvedByName}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingHistory}
                  className="w-full mt-2 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] transition-all text-xs font-bold text-zinc-600 flex items-center justify-center gap-2 cursor-pointer bg-white"
                >
                  {isLoadingHistory ? (
                    <><RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />Memuat...</>
                  ) : "Muat Lebih Banyak"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Batalkan Pengajuan Koreksi?"
        message="Apakah Anda yakin ingin membatalkan pengajuan koreksi presensi yang tertunda ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
