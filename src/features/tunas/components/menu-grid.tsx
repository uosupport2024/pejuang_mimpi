import { useState } from "react";
import {
  Calendar,
  History,
  Dollar,
  DocumentText,
  Refresh,
  MedalStar,
  Buildings,
  BillList,
} from "@solar-icons/react";
import { Download, Loader2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import { THEME_COLORS } from "@/shared/constants/colors";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";

export function MenuGrid() {
  const { navigate } = useRouter();
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));

  const handleDownloadPayslip = async () => {
    try {
      setIsDownloading(true);
      const profile = await fetchProfileAPI();
      const userId = profile?.id;
      if (!userId) {
        throw new Error("Gagal mengidentifikasi profil pengguna.");
      }

      const m = parseInt(selectedMonth, 10);
      const y = parseInt(selectedYear, 10);
      const lastDay = new Date(y, m, 0).getDate();
      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const response = await fetch(
        `${API_BASE_URL}/payroll-recap/${userId}/payslip?start_date=${startDate}&end_date=${endDate}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Gagal mengunduh slip gaji (Status: ${response.status})`);
      }

      const blob = await response.blob();
      const fileBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(fileBlob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Slip_Gaji_${profile.name || "Pegawai"}_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      toast.success("Slip gaji berhasil diunduh!");
      setIsPayslipModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh slip gaji");
    } finally {
      setIsDownloading(false);
    }
  };

  const menuItems = [
    { label: "Payroll", icon: Dollar, action: () => navigate("PayrollHistory") },
    { label: "Pengajuan Absen", icon: Calendar, action: () => navigate("MobileKoreksiAbsen") },
    { label: "Export Payslip", icon: BillList || DocumentText, action: () => setIsPayslipModalOpen(true) },
    { label: "Riwayat Absen", icon: History, action: () => navigate("MobileHistory") },
    { label: "Riwayat Izin", icon: DocumentText, action: () => navigate("MobileLeaveHistory") },
    { label: "Riwayat Lembur", icon: Refresh, action: () => navigate("MobileLemburHistory") },
    { label: "Kinerja", icon: MedalStar, action: () => toast.info("Membuka menu Kinerja...") },
    { label: "Perusahaan", icon: Buildings, action: () => toast.info("Membuka profil Perusahaan...") },
  ];

  const row1 = menuItems.slice(0, 4);
  const row2 = menuItems.slice(4, 8);

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const currentYearNum = now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYearNum - i));

  const renderItem = (item: typeof menuItems[0], index: number) => {
    const Icon = item.icon;
    return (
      <button
        key={index}
        type="button"
        onClick={item.action}
        className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all duration-200 w-12.5 border-none bg-transparent"
      >
        {/* Glossy Gradient Icon Wrapper */}
        <div
          style={{ backgroundColor: THEME_COLORS.hex.primary }}
          className="w-12.5 h-12.5 rounded-2xl text-white flex items-center justify-center shadow-md relative overflow-hidden transition-all duration-300 group-hover:scale-105 shrink-0"
        >
          {/* 3D Gloss Highlight effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-2xl pointer-events-none" />
          <Icon size={24} weight="Bold" className="relative z-10 transition-transform group-hover:rotate-3 text-white" />
        </div>

        {/* Label */}
        <span className="text-[10px] font-bold text-gray-800 mt-2 text-center leading-snug tracking-wide w-[72px] min-h-[30px] flex items-start justify-center shrink-0">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3 w-full">
      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider text-left px-0.5">
        Layanan Mandiri
      </h3>

      <div className="space-y-4 w-full">
        {/* Row 1 */}
        <div className="flex justify-between w-full">
          {row1.map((item, idx) => renderItem(item, idx))}
        </div>

        {/* Row 2 */}
        <div className="flex justify-between w-full">
          {row2.map((item, idx) => renderItem(item, idx + 4))}
        </div>
      </div>

      {/* Export Payslip Modal */}
      {isPayslipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-5 space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: `${THEME_COLORS.hex.primary}15`, color: THEME_COLORS.hex.primary }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Export Slip Gaji</h4>
                  <p className="text-[10px] text-gray-500">Unduh dokumen PDF slip gaji Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-medium text-gray-800 cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-zinc-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-medium text-gray-800 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(false)}
                disabled={isDownloading}
                className="flex-1 py-2.5 px-3 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDownloadPayslip}
                disabled={isDownloading}
                style={{ backgroundColor: THEME_COLORS.hex.primary }}
                className="flex-1 py-2.5 px-3 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengunduh...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

