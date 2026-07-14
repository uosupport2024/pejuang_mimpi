import { useLocation } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, FileText, LogOut, HeartPulse, Edit, Trash2 } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useLeave } from "../hooks/use-leave";
import { LeaveForm } from "../components/leave-form";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { API_BASE_URL } from "@/shared/utils/api";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import patternBg from "@/assets/bg/pattern-background.png";

interface LeaveRequestPageProps {
  user: any;
}

const getLeaveStyle = (name: string) => {
  const normName = name.toLowerCase();
  if (normName.includes("cuti")) {
    return {
      bg: "bg-[#7FA46D]/5",
      border: "border-[#7FA46D]/20",
      text: "text-[#516b46]",
      iconBg: "bg-[#7FA46D]/10",
      iconText: "text-[#516b46]"
    };
  } else if (normName.includes("sakit")) {
    return {
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      iconText: "text-rose-700"
    };
  } else if (normName.includes("telat")) {
    return {
      bg: "bg-[#F2B233]/5",
      border: "border-[#F2B233]/20",
      text: "text-[#916715]",
      iconBg: "bg-[#F2B233]/12",
      iconText: "text-[#916715]"
    };
  } else if (normName.includes("pulang cepat")) {
    return {
      bg: "bg-[#F25C2A]/5",
      border: "border-[#F25C2A]/20",
      text: "text-[#C54117]",
      iconBg: "bg-[#F25C2A]/10",
      iconText: "text-[#C54117]"
    };
  } else {
    // Izin Lainnya
    return {
      bg: "bg-[#5C8A90]/5",
      border: "border-[#5C8A90]/20",
      text: "text-[#3b595d]",
      iconBg: "bg-[#5C8A90]/10",
      iconText: "text-[#3b595d]"
    };
  }
};

export function LeaveRequestPage({ user }: LeaveRequestPageProps) {
  const { navigate } = useRouter();
  const location = useLocation();
  const selectedType = location.state?.selectedType;
  const hook = useLeave(user, selectedType);

  const {
    historyList,
    isLoadingHistory,
    fetchHistory,
    currentPage,
    totalPages,
    dateRange,
    handleRangeChange,
    startEdit,
    deleteLeaveRequest,
    showDeleteConfirm,
    confirmDeleteLeave,
    cancelDeleteLeave,
  } = hook;

  return (
    <div className="space-y-4 pb-12">
      {/* Redesigned Premium Header Bar with Pattern Background */}
      <div className="relative -mx-5 -mt-6 mb-4 overflow-hidden rounded-b-2xl bg-[#1e2a4a] text-white">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="relative z-10 flex items-center justify-between px-6 pt-7 pb-20 gap-3.5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate("MobileLumbung")}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer text-white border border-white/10 bg-white/5 backdrop-blur-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">Layanan Mandiri</span>
              <h1 className="text-base font-bold tracking-tight text-white mt-1.5 leading-none">
                Permintaan Cuti Karyawan
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leave Form (Inside White Card) */}
      <div className="-mt-18 relative z-10 mx-1">
        <LeaveForm hook={hook} />
      </div>

      {/* Filters and List Title */}
      <div className="pt-2 text-left">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider px-0.5">
          Riwayat Pengajuan Cuti & Izin
        </h3>

        {/* Date Filter Panel */}
        <div className="mt-3 relative z-30">
          <DateRangePicker
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={handleRangeChange}
            maxDate={new Date()}
          />
        </div>

        {/* History Table/List */}
        {isLoadingHistory ? (
          <div className="flex flex-col gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-2.5 border border-zinc-100/80 shadow-xs flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9.5 h-9.5 rounded-full bg-zinc-100 shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0 w-24">
                    <div className="h-3.5 bg-zinc-100 rounded-md w-full" />
                    <div className="h-2.5 bg-zinc-50 rounded-md w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-12 h-5 bg-zinc-100 rounded-full" />
                  <div className="flex items-center gap-1 border-l border-zinc-100 pl-2">
                    <div className="w-7 h-7 bg-zinc-100 rounded-lg" />
                    <div className="w-7 h-7 bg-zinc-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-zinc-400 border border-zinc-200/80 mt-4 font-semibold">
            Belum ada riwayat pengajuan cuti & izin.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            <div className="grid grid-cols-1 gap-2 mt-1">
              {historyList.map((item) => {
                const style = getLeaveStyle(item.nama_cuti);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-2.5 border border-zinc-100/80 shadow-xs flex items-center justify-between gap-3 text-left"
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconText}`}>
                        {item.nama_cuti.toLowerCase().includes("cuti") && <Calendar className="w-5 h-5" />}
                        {item.nama_cuti.toLowerCase().includes("sakit") && <HeartPulse className="w-5 h-5" />}
                        {item.nama_cuti.toLowerCase().includes("telat") && <Clock className="w-5 h-5" />}
                        {item.nama_cuti.toLowerCase().includes("pulang cepat") && <LogOut className="w-5 h-5" />}
                        {!item.nama_cuti.toLowerCase().includes("cuti") &&
                          !item.nama_cuti.toLowerCase().includes("sakit") &&
                          !item.nama_cuti.toLowerCase().includes("telat") &&
                          !item.nama_cuti.toLowerCase().includes("pulang cepat") && <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col min-w-0 justify-center gap-0">
                        <span className={`text-[11px] font-extrabold leading-none pb-1 truncate ${style.text}`}>
                          {item.nama_cuti}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                          <span className="text-[9.5px] font-bold text-zinc-500">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                          {item.foto_cuti && (
                            <>
                              <span className="text-zinc-300 text-[8px]">•</span>
                              <a
                                href={`${API_BASE_URL.replace("/api/v1", "")}/storage/${item.foto_cuti}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9.5px] font-extrabold text-[#e0542c] hover:underline"
                              >
                                Lampiran
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${item.status_cuti === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        item.status_cuti === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                        {item.status_cuti}
                      </span>

                      {item.status_cuti === "Pending" && (
                        <div className="flex items-center gap-1 border-l border-zinc-100 pl-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all active:scale-[0.9] cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLeaveRequest(item.id)}
                            className="w-7 h-7 rounded-lg border border-rose-100 bg-rose-50/20 hover:bg-rose-50 text-rose-600 flex items-center justify-center transition-all active:scale-[0.9] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 mt-1">
                <span className="text-[10px] text-zinc-500 font-semibold">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchHistory(currentPage - 1)}
                    className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchHistory(currentPage + 1)}
                    className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteLeave}
        onConfirm={confirmDeleteLeave}
        title="Batalkan Pengajuan?"
        message="Apakah Anda yakin ingin membatalkan pengajuan cuti/izin ini?"
        variant="danger"
        confirmText="Batal Cuti"
        cancelText="Tutup"
      />
    </div>
  );
}
