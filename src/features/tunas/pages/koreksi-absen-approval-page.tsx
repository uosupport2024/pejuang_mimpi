import { useState, useEffect, useCallback } from "react";
import { Check, X, User, Search } from "lucide-react";
import { toast } from "sonner";
import { fetchKoreksiAbsenForAdminAPI, approveKoreksiAbsenAPI } from "../api/absensi";
import { ReusableTable, type ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ApprovalItem {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  alasan: string;
  status: "Approved" | "Pending" | "Rejected";
  notes: string | null;
  approvedByName: string | null;
}

export function KoreksiAbsenApprovalPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
  const [list, setList] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Approval action states
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "Approved" | "Rejected" | null;
    id: number | null;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === "All" ? undefined : activeTab;
      const res = await fetchKoreksiAbsenForAdminAPI(page, perPage, statusParam);

      if (res && (res.code === 200 || res.data)) {
        const paginator = res.data;
        const rawItems = paginator.data || [];
        setTotal(paginator.total || 0);

        const mapped: ApprovalItem[] = rawItems.map((item: any) => ({
          id: item.id,
          user: {
            id: item.User?.id || item.user_id,
            name: item.User?.name || "Pegawai",
            email: item.User?.email || "—",
            role: item.User?.role || "Karyawan",
            avatar: item.User?.avatar,
          },
          tanggal: item.tanggal,
          jamMasuk: item.jam_masuk ? item.jam_masuk.substring(0, 5) : null,
          jamPulang: item.jam_pulang ? item.jam_pulang.substring(0, 5) : null,
          alasan: item.alasan,
          status: item.status,
          notes: item.notes,
          approvedByName: item.approved_by?.name || item.approved_by_name || null,
        }));

        setList(mapped);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memuat data pengajuan koreksi");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, perPage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleOpenAction = (id: number, type: "Approved" | "Rejected") => {
    setAdminNotes("");
    setActionModal({
      isOpen: true,
      type,
      id,
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.id || !actionModal.type) return;

    try {
      setSubmitting(true);

      const res = await approveKoreksiAbsenAPI(actionModal.id, {
        status: actionModal.type,
        notes: adminNotes,
      });

      if (res && (res.code === 200 || res.success)) {
        toast.success(`Pengajuan berhasil di-${actionModal.type === "Approved" ? "setujui" : "tolak"}`);
        setActionModal({ isOpen: false, type: null, id: null });
        loadRequests();

        // Dispatch a custom event to trigger sidebar refresh for badge counts
        window.dispatchEvent(new Event("koreksi-approval-updated"));
      } else {
        throw new Error(res?.message || "Gagal memproses pengajuan");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memproses pengajuan koreksi");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status classes
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-700 border border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Approved":
        return "Disetujui";
      case "Rejected":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  // Filter list by search query (client-side)
  const filteredList = list.filter(item =>
    item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.user.email && item.user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );  // Table Columns Definition
  const columns: ColumnDef<ApprovalItem>[] = [
    {
      header: "Pegawai",
      className: "w-[22%] text-left",
      cell: (row: ApprovalItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200/50 flex items-center justify-center shrink-0 text-gray-400 overflow-hidden">
            {row.user.avatar ? (
              <img src={row.user.avatar} alt={row.user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-800 leading-tight truncate">{row.user.name}</span>
            <span className="text-[10px] text-gray-400 font-semibold leading-tight mt-0.5 truncate">{row.user.role}</span>
          </div>
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="space-y-1 w-24">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-2.5 w-2/3 rounded" />
          </div>
        </div>
      ),
    },
    {
      header: "Tanggal",
      className: "w-[13%] text-left",
      cell: (row: ApprovalItem) => (
        <span className="text-xs font-bold text-gray-750">
          {new Date(row.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </span>
      ),
      skeleton: () => <Skeleton className="h-3.5 w-20 rounded" />,
    },
    {
      header: "Masuk",
      className: "w-[12%] text-center",
      cell: (row: ApprovalItem) => (
        row.jamMasuk ? (
          <span className="inline-flex items-center justify-center bg-teal-50 border border-teal-105 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-black">
            {row.jamMasuk}
          </span>
        ) : (
          <span className="text-gray-300 font-bold">—</span>
        )
      ),
      skeleton: () => <Skeleton className="h-6 w-12 mx-auto rounded-lg" />,
    },
    {
      header: "Pulang",
      className: "w-[12%] text-center",
      cell: (row: ApprovalItem) => (
        row.jamPulang ? (
          <span className="inline-flex items-center justify-center bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-black">
            {row.jamPulang}
          </span>
        ) : (
          <span className="text-gray-300 font-bold">—</span>
        )
      ),
      skeleton: () => <Skeleton className="h-6 w-12 mx-auto rounded-lg" />,
    },
    {
      header: "Alasan",
      className: "w-[17%] text-left",
      cell: (row: ApprovalItem) => (
        <p className="text-xs text-gray-650 font-semibold leading-relaxed line-clamp-2" title={row.alasan}>
          "{row.alasan}"
        </p>
      ),
      skeleton: () => <Skeleton className="h-3.5 w-full rounded" />,
    },
    {
      header: "Catatan Admin",
      className: "w-[15%] text-left",
      cell: (row: ApprovalItem) => (
        row.notes ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-700 font-bold leading-normal">
              {row.notes}
            </span>
            {row.approvedByName && (
              <span className="text-[9px] text-[#5C8A90] font-semibold">
                oleh {row.approvedByName}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-350 italic text-xs font-semibold">—</span>
        )
      ),
      skeleton: () => <Skeleton className="h-3.5 w-16 rounded" />,
    },
    {
      header: "Status",
      className: "w-[12%] text-left",
      cell: (row: ApprovalItem) => (
        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${getStatusStyle(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
      skeleton: () => <Skeleton className="h-5 w-16 rounded-md" />,
    },
    {
      header: "Aksi",
      className: "w-[10%] text-center",
      cell: (row: ApprovalItem) => (
        row.status === "Pending" ? (
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenAction(row.id, "Approved")}
              className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
              title="Setujui"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenAction(row.id, "Rejected")}
              className="p-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20 transition-all cursor-pointer"
              title="Tolak"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null
      ),
      skeleton: () => (
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="w-6 h-6 rounded-lg" />
        </div>
      ),
    },
  ].filter(col => {
    if (col.header === "Aksi") {
      return activeTab === "Pending";
    }
    return true;
  });

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6 text-left">
      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Header Filter Row */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          {/* Left: Search Input */}
          <div className="relative w-full md:max-w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
            />
          </div>

          {/* Right: Tab Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["Pending", "Approved", "Rejected", "All"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                  ? "bg-[#e0542c]/10 text-[#e0542c] border border-[#e0542c]/20"
                  : "bg-zinc-50 border border-gray-200 text-gray-650 hover:bg-zinc-100/70"
                  }`}
              >
                {tab === "Pending"
                  ? "Menunggu Approval"
                  : tab === "Approved"
                    ? "Disetujui"
                    : tab === "Rejected"
                      ? "Ditolak"
                      : "Semua Pengajuan"}
              </button>
            ))}
          </div>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          columns={columns}
          data={filteredList}
          loading={loading}
          showSearch={false}
          showPagination={true}
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={perPage}
          onPageChange={(p) => setPage(p)}
          className="border-none shadow-none rounded-none"
          emptyMessage="Tidak ada pengajuan koreksi presensi."
        />
      </div>

      {/* Approve/Reject confirmation dialog modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={submitting ? undefined : () => setActionModal({ isOpen: false, type: null, id: null })}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full p-6 space-y-4 z-50 animate-in zoom-in-95 duration-200">
            <div className="text-left space-y-2">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {actionModal.type === "Approved" ? "Setujui Koreksi Presensi" : "Tolak Koreksi Presensi"}
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {actionModal.type === "Approved"
                  ? "Apakah Anda yakin ingin menyetujui pengajuan koreksi presensi ini? Jam absen pegawai akan diperbarui sesuai pengajuan."
                  : "Apakah Anda yakin ingin menolak pengajuan koreksi presensi ini?"}
              </p>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Catatan Admin (Opsional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Ketik catatan di sini..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#e0542c] resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setActionModal({ isOpen: false, type: null, id: null })}
                className="w-full h-9 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmAction}
                className={`w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 cursor-pointer disabled:opacity-50 flex items-center justify-center ${actionModal.type === "Approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                  }`}
              >
                {submitting ? "Memproses..." : actionModal.type === "Approved" ? "Setujui" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
