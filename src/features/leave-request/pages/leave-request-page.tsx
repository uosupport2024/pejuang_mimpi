import React from "react";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { useLeave } from "../hooks/use-leave";
import { LeaveForm } from "../components/leave-form";
import patternBg from "@/assets/bg/pattern-background.png";

interface LeaveRequestPageProps {
  user: any;
}

export function LeaveRequestPage({ user }: LeaveRequestPageProps) {
  const { navigate } = useRouter();
  const hook = useLeave(user);
  
  const {
    historyList,
    isLoadingHistory,
    fetchHistory,
    currentPage,
    totalPages,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
  } = hook;

  const handleFilterSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(1);
  };

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
        <form onSubmit={handleFilterSearch} className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#e0542c]/50"
            />
          </div>
          <div className="relative flex-1">
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#e0542c]/50"
            />
          </div>
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#e0542c] hover:bg-[#c23f1b] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#e0542c]/10 active:scale-95 transition-all cursor-pointer border-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* History Table/List */}
        {isLoadingHistory ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-zinc-400 border border-zinc-200/80 mt-4 animate-pulse">
            Memuat riwayat pengajuan...
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-zinc-400 border border-zinc-200/80 mt-4 font-semibold">
            Belum ada riwayat pengajuan cuti & izin.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            <div className="overflow-x-auto border border-zinc-200/60 rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-center w-[12%]">No</th>
                    <th className="px-3 py-2.5 w-[38%]">Tanggal</th>
                    <th className="px-3 py-2.5 w-[25%]">Jenis</th>
                    <th className="px-3 py-2.5 text-center w-[25%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700 font-semibold">
                  {historyList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="px-3 py-2.5 text-center text-zinc-400">
                        {(currentPage - 1) * 15 + idx + 1}
                      </td>
                      <td className="px-3 py-2.5 truncate text-[11px] text-zinc-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-3 py-2.5 truncate text-[11px] text-zinc-800">
                        {item.nama_cuti}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.status_cuti === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          item.status_cuti === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {item.status_cuti}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}
