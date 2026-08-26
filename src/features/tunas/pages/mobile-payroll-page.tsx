import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Wallet, Download, Calendar, FileText, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { THEME_COLORS } from "@/shared/constants/colors";
import { fetchRekapData, fetchPayrollHistory, type RekapItem, type PayrollHistoryItem } from "@/features/payroll/api/payroll";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";
import { fetchProfileAPI } from "@/features/tunas/api/absensi";
import { motion } from "framer-motion";

interface MobilePayrollPageProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    bank?: string;
    rekening?: string;
    gaji_pokok?: number;
  };
}

export function MobilePayrollPage({ user }: MobilePayrollPageProps) {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  // Date filters for current period
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Data states
  const [rekapItem, setRekapItem] = useState<RekapItem | null>(null);
  const [historyItems, setHistoryItems] = useState<PayrollHistoryItem[]>([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | string | null>(null);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formatRupiah = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return "Rp 0";
    return "Rp " + Math.round(val).toLocaleString("id-ID");
  };

  // Load current period Rekap Data
  const loadRekap = useCallback(async (month: number, year: number) => {
    try {
      setIsLoadingRekap(true);
      const lastDay = new Date(year, month, 0).getDate();
      const mulai = `${year}-${String(month).padStart(2, "0")}-01`;
      const akhir = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const res = await fetchRekapData({
        mulai,
        akhir,
      });

      if (res && res.data && res.data.length > 0) {
        setRekapItem(res.data[0]);
      } else {
        setRekapItem(null);
      }
    } catch (err: any) {
      console.warn("Failed to fetch rekap data for user:", err);
      // Fallback empty rekap
      setRekapItem(null);
    } finally {
      setIsLoadingRekap(false);
    }
  }, []);

  // Load payroll history list
  const loadHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetchPayrollHistory({
        page: 1,
      });
      if (res && res.data) {
        setHistoryItems(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to fetch payroll history for user:", err);
      setHistoryItems([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadRekap(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, loadRekap]);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const handleDownloadPayslip = async (targetMonth?: number, targetYear?: number, targetId?: number | string) => {
    const m = targetMonth || selectedMonth;
    const y = targetYear || selectedYear;
    const lastDay = new Date(y, m, 0).getDate();
    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    try {
      setIsDownloading(true);
      setDownloadingId(targetId || "current");
      const profile = await fetchProfileAPI();
      const userId = profile?.id;
      if (!userId) {
        throw new Error("Gagal mengidentifikasi profil pengguna.");
      }

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
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh slip gaji");
    } finally {
      setIsDownloading(false);
      setDownloadingId(null);
    }
  };

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || "";

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-24 relative -mt-6 -mx-5 text-left">
      {/* Top sticky navigation */}
      <div
        style={{ backgroundColor: THEME_COLORS.hex.navBg }}
        className="text-white flex items-center justify-between px-5 pt-7 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "180px auto",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate("MobileLumbung")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <span className="text-base font-bold tracking-tight block">Payroll & Keuangan</span>
            <span className="text-[10px] text-white/70 font-medium">Informasi Gaji & Slip Saya</span>
          </div>
        </div>

        <button
          onClick={() => handleDownloadPayslip()}
          disabled={isDownloading}
          style={{ backgroundColor: THEME_COLORS.hex.primary }}
          className="p-2 rounded-xl text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer relative z-10 flex items-center gap-1 text-[11px] font-bold disabled:opacity-50"
          title="Download Slip PDF"
        >
          {isDownloading && downloadingId === "current" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Unduh PDF</span>
        </button>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-4 sm:p-5 space-y-4 max-w-md mx-auto w-full"
      >
        {/* Period Selector & Tabs */}
        <div className="flex flex-col gap-3">
          {/* Segmented Tab Navigation */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl shadow-inner select-none">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "current"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Rincian Periode
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Riwayat Slip Gaji
            </button>
          </div>

          {/* Month & Year Filter (Only on Rincian Periode tab) */}
          {activeTab === "current" && (
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: RINCIAN PERIODE INI */}
        {activeTab === "current" && (
          <div className="space-y-4">
            {/* Take Home Pay Hero Card */}
            <div
              style={{ backgroundColor: THEME_COLORS.hex.navBg }}
              className="text-white p-5 rounded-3xl shadow-lg relative overflow-hidden space-y-3.5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#fee279]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
                    Estimasi Take Home Pay
                  </span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {selectedMonthLabel} {selectedYear}
                </span>
              </div>

              <div className="space-y-0.5 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fee279]">
                  {isLoadingRekap ? "Memuat..." : formatRupiah(rekapItem?.aktual_gaji ?? (user?.gaji_pokok || 0))}
                </h2>
                <p className="text-[10px] text-white/70 font-medium">
                  {rekapItem?.has_payroll
                    ? "✓ Payroll telah difinalisasi & terbit"
                    : "• Estimasi berjalan berdasarkan absensi"}
                </p>
              </div>

              {/* Bank Account Info Footer */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-white/80 relative z-10">
                <span className="font-semibold">
                  {rekapItem?.bank || user?.bank || "Rekening Payroll"}
                </span>
                <span className="font-mono font-bold">
                  {rekapItem?.rekening || user?.rekening || "—"}
                </span>
              </div>
            </div>

            {/* Breakdown Accordion / List */}
            {isLoadingRekap ? (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ) : rekapItem ? (
              <div className="space-y-3">
                {/* Rincian Penerimaan Card */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Penerimaan / Penghasilan
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-50 text-xs font-semibold space-y-2">
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-slate-500 font-medium">Gaji Pokok Terhitung</span>
                      <span className="text-slate-900 font-bold">
                        {formatRupiah(rekapItem.total_gaji_pokok)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">Gaji Harian</span>
                      <span className="text-slate-700 font-semibold">
                        {formatRupiah(rekapItem.gaji_harian)} / hari
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">Insentif Kehadiran</span>
                      <span className="text-emerald-600 font-bold">
                        +{formatRupiah(rekapItem.insentif_per_hari_kerja)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">
                        Uang Lembur ({rekapItem.jam_lembur}j {rekapItem.menit_lembur}m)
                      </span>
                      <span className="text-emerald-600 font-bold">
                        +{formatRupiah(rekapItem.total_lembur_rp)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">Tunjangan Tetap</span>
                      <span className="text-emerald-600 font-bold">+Rp 200.000</span>
                    </div>
                  </div>
                </div>

                {/* Rincian Potongan Card */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Potongan
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-50 text-xs font-semibold space-y-2">
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-slate-500 font-medium">
                        Izin & Sakit ({rekapItem.sakit_dan_izin} hari)
                      </span>
                      <span className="text-rose-500 font-bold">
                        -{formatRupiah(rekapItem.potongan)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-slate-900">
                      <span>Total Potongan</span>
                      <span className="text-rose-600">-{formatRupiah(rekapItem.potongan)}</span>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Absensi Periode Card */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Statistik Kehadiran
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Hari Kerja</span>
                      <p className="text-sm font-black text-slate-800">{rekapItem.total_hari_kerja} Hari</p>
                    </div>

                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Hadir</span>
                      <p className="text-sm font-black text-emerald-800">{rekapItem.total_hadir} Hari</p>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-600 uppercase">Sakit / Izin</span>
                      <p className="text-sm font-black text-amber-800">{rekapItem.sakit_dan_izin} Hari</p>
                    </div>

                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Total Lembur</span>
                      <p className="text-sm font-black text-blue-800">
                        {rekapItem.jam_lembur}j {rekapItem.menit_lembur}m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Data Rekap</h4>
                <p className="text-[11px] text-slate-400">
                  Data payroll untuk periode {selectedMonthLabel} {selectedYear} belum tercatat.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT SLIP GAJI */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-2 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-slate-200 transition-all text-left"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {months.find((m) => m.value === item.bulan)?.label || `Bulan ${item.bulan}`} {item.tahun}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Terbit
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono font-medium">
                      No: {item.no_gaji}
                    </p>
                    <p className="text-xs font-bold text-emerald-600">
                      {formatRupiah(item.grand_total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadPayslip(item.bulan, item.tahun, item.id)}
                    disabled={isDownloading && downloadingId === item.id}
                    style={{ backgroundColor: THEME_COLORS.hex.primary }}
                    className="px-3 py-2 rounded-xl text-white text-[11px] font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isDownloading && downloadingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Slip PDF</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Riwayat Slip Gaji</h4>
                <p className="text-[11px] text-slate-400">
                  Slip gaji bulanan yang telah difinalisasi akan muncul di sini.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
