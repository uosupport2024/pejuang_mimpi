import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Bell,
  Volume2,
  Users,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
import { THEME_COLORS } from "@/shared/constants/colors";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import {
  fetchAnnouncementsAPI,
  sendAnnouncementAPI,
  type AnnouncementItem,
} from "../api/announcement";

export function AnnouncementPage() {
  const { tenantName, buttonColor } = useTenantBranding();
  const primaryColor = buttonColor || THEME_COLORS.hex.primary;

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "User" | "Administrator">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadHistory = useCallback(async (page = 1) => {
    try {
      setLoadingHistory(true);
      const res = await fetchAnnouncementsAPI(page);
      setAnnouncements(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (err: any) {
      console.warn("Notice: Gagal memuat riwayat pengumuman:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul Pengumuman tidak boleh kosong");
      return;
    }
    if (!message.trim()) {
      toast.error("Isi Pesan tidak boleh kosong");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    try {
      setIsSubmitting(true);
      const res = await sendAnnouncementAPI({
        title: title.trim(),
        message: message.trim(),
        target_role: targetRole,
      });

      const recipients = res?.data?.recipients_count ?? 0;
      toast.success("Pengumuman berhasil disebarkan!", {
        description: `Notifikasi dikirim ke ${recipients} user di tenant ${tenantName || "ini"}.`,
      });

      // Reset form
      setTitle("");
      setMessage("");
      setShowConfirmModal(false);

      // Refresh table
      loadHistory(1);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyiarkan pengumuman");
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Pengumuman & Push Notifikasi
            </h1>
            <span
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/50"
            >
              Per-Tenant Broadcast
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kirim siaran notifikasi langsung ke smartphone seluruh anggota tenant{" "}
            <span className="font-semibold text-gray-700">{tenantName || "Pejuang Mimpi"}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistory(currentPage)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={loadingHistory ? "animate-spin text-gray-400" : "text-gray-600"} />
          Segarkan Data
        </button>
      </div>

      {/* Clean Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-7 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            >
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Form Buat Pengumuman</h2>
              <p className="text-xs text-gray-500">Notifikasi akan otomatis tersimpan dalam riwayat per-user</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
            <Volume2 size={14} className="shrink-0" />
            <span>Nada Chick Sound</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Target Distribusi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: "all", label: "Semua Anggota", desc: "Staff & Admin" },
                { value: "User", label: "Hanya Staff/Tunas", desc: "Role User" },
                { value: "Administrator", label: "Hanya Admin", desc: "Role Admin" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTargetRole(item.value as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetRole === item.value
                      ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Judul Pengumuman <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{title.length}/100</span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengumuman Jadwal Shift Libur Lebaran"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              required
            />
          </div>

          {/* Message Body */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Isi Pesan Notifikasi <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{message.length}/500</span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan isi pesan pengumuman lengkap di sini..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-y"
              required
            />
          </div>

          {/* Tenant Safety Notice */}
          <div className="p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-xl flex items-start gap-3 text-xs text-sky-800">
            <Info size={16} className="text-sky-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Isolasi Tenant Terjamin:</span> Pesan hanya akan didistribusikan ke perangkat user yang terdaftar dalam tenant ini (ID:{" "}
              <span className="font-mono font-semibold">{tenantName || "Aktif"}</span>). User dari tenant lain tidak akan menerima notifikasi ini.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              style={{ backgroundColor: primaryColor }}
              className="w-full sm:w-auto min-w-[200px] py-3 px-6 text-white text-sm font-semibold rounded-xl shadow-md hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} />
              <span>Kirim Notifikasi Sekarang</span>
            </button>
          </div>
        </form>
      </div>

      {/* History Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Riwayat Pengumuman Terkirim</h3>
            <p className="text-xs text-gray-500">Daftar siaran yang pernah dikirimkan beserta statistik penerima</p>
          </div>
          <div className="text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            Total Riwayat: <span className="text-emerald-700 font-bold">{totalCount}</span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu Dikirim</th>
                <th className="py-3 px-4">Judul Pengumuman</th>
                <th className="py-3 px-4">Isi Pesan</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Penerima</th>
                <th className="py-3 px-4">Pengirim</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHistory ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                    <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Memuat data riwayat...
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Bell size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">Belum Ada Pengumuman</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Gunakan formulir di atas untuk mulai menyiarkan pengumuman pertama Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 text-xs max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-[320px] truncate">
                      {item.message}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">
                        {item.target_role === "all"
                          ? "Semua"
                          : item.target_role === "User"
                          ? "Staff"
                          : "Admin"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-gray-400" />
                        <span>{item.total_recipients} User</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                      {item.creator?.name || item.metadata?.creator_name || "Admin"}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 size={11} />
                        Tersiar
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || loadingHistory}
                onClick={() => loadHistory(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || loadingHistory}
                onClick={() => loadHistory(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSend}
        title="Kirim Pengumuman ke Seluruh Anggota?"
        message={`Pengumuman "${title}" akan segera dikirimkan ke perangkat anggota tenant ${
          tenantName || "ini"
        } dengan nada dering suara notifikasi.`}
        confirmText={isSubmitting ? "Mengirim..." : "Ya, Kirim Sekarang"}
        cancelText="Batal"
        variant="warning"
        loading={isSubmitting}
      />
    </div>
  );
}
