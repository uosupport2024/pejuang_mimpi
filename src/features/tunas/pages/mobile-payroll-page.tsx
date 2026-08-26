import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Wallet, Download, Calendar, FileText, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useTenantBranding } from "@/shared/hooks/use-tenant-branding";
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
  const { mainColor, subColor } = useTenantBranding();
  const navBg = mainColor || THEME_COLORS.hex.navBg;
  const primaryAccent = subColor || THEME_COLORS.hex.primary;

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
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

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
    loadHistory();
  }, [loadHistory]);

  const handleDownloadPayslip = async (targetMonth?: number, targetYear?: number, keyIdentifier?: string) => {
    const m = targetMonth || selectedMonth;
    const y = targetYear || selectedYear;
    const lastDay = new Date(y, m, 0).getDate();
    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const downloadKey = keyIdentifier || `${m}-${y}`;

    try {
      setIsDownloading(true);
      setDownloadingKey(downloadKey);
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
      const monthName = months.find((mo) => mo.value === m)?.label || `Bulan_${m}`;
      a.download = `Slip_Gaji_${profile.name || "Pegawai"}_${monthName}_${y}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      toast.success(`Slip gaji ${monthName} ${y} berhasil diunduh!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh slip gaji");
    } finally {
      setIsDownloading(false);
      setDownloadingKey(null);
    }
  };

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || "";

  // Compute merged slip list: combining finalized backend payrolls and recent monthly periods
  const availablePayslips = useMemo(() => {
    // Generate recent 8 months
    const periods: Array<{
      month: number;
      year: number;
      label: string;
      historyItem?: PayrollHistoryItem;
      isCurrentPeriod: boolean;
    }> = [];

    for (let i = 0; i < 8; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const mLabel = months.find((item) => item.value === m)?.label || `Bulan ${m}`;

      // Check if this month has a finalized record in historyItems
      const matched = historyItems.find((h) => h.bulan === m && h.tahun === y);
      const isCurrent = m === currentMonth && y === currentYear;

      periods.push({
        month: m,
        year: y,
        label: `${mLabel} ${y}`,
        historyItem: matched,
        isCurrentPeriod: isCurrent,
      });
    }

    return periods;
  }, [currentMonth, currentYear, historyItems]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-24 relative -mt-6 -mx-5 text-left font-sans">
      {/* Top sticky navigation */}
      <div
        style={{ backgroundColor: navBg }}
        className="text-white flex items-center justify-between px-5 pt-7 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden transition-colors duration-300"
      >
        {/* Background Pattern Overlay */}
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
            className="p-1.5 hover:bg-white/15 rounded-full transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <span className="text-base font-extrabold tracking-tight block text-white leading-tight">Payroll & Keuangan</span>
            <span className="text-[10px] text-white/75 font-medium">Informasi Gaji & Slip Saya</span>
          </div>
        </div>

        <button
          onClick={() => handleDownloadPayslip()}
          disabled={isDownloading}
          style={{ backgroundColor: primaryAccent }}
          className="px-3 py-1.5 rounded-xl text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer relative z-10 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
          title="Download Slip PDF Bulan Ini"
        >
          {isDownloading && downloadingKey === `${selectedMonth}-${selectedYear}` ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Unduh PDF</span>
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
          <div className="flex bg-[#e8e2d5] p-1 rounded-2xl shadow-inner select-none">
            <button
              onClick={() => setActiveTab("current")}
              style={activeTab === "current" ? { color: THEME_COLORS.hex.textDark } : undefined}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "current"
                  ? "bg-white shadow-sm font-extrabold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Rincian Periode
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={activeTab === "history" ? { color: THEME_COLORS.hex.textDark } : undefined}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white shadow-sm font-extrabold"
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
                className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
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
                className="w-28 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:outline-none cursor-pointer"
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
              style={{ backgroundColor: navBg }}
              className="text-white p-5 rounded-3xl shadow-xl relative overflow-hidden space-y-3.5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#fee279]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
                    Estimasi Take Home Pay
                  </span>
                </div>
                <span
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff" }}
                  className="text-[9px] font-bold px-2.5 py-0.5 rounded-full"
                >
                  {selectedMonthLabel} {selectedYear}
                </span>
              </div>

              <div className="space-y-0.5 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fee279]">
                  {isLoadingRekap ? "Memuat..." : formatRupiah(rekapItem?.aktual_gaji ?? (user?.gaji_pokok || 0))}
                </h2>
                <p className="text-[10px] text-white/75 font-medium">
                  {rekapItem?.has_payroll
                    ? "✓ Payroll telah difinalisasi oleh Admin"
                    : "• Perhitungan realtime berdasarkan absensi"}
                </p>
              </div>

              {/* Bank Account Info Footer */}
              <div className="pt-3 border-t border-white/15 flex justify-between items-center text-[10px] text-white/85 relative z-10">
                <span className="font-semibold">
                  {rekapItem?.bank || user?.bank || "Bank Mandiri"}
                </span>
                <span className="font-mono font-bold">
                  {rekapItem?.rekening || user?.rekening || "—"}
                </span>
              </div>
            </div>

            {/* Breakdown Accordion / List */}
            {isLoadingRekap ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ) : rekapItem ? (
              <div className="space-y-3.5">
                {/* STATISTIK KEHADIRAN (Finexy Theme Palette) */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calendar
                      size={16}
                      style={{ color: THEME_COLORS.hex.airKehidupan }}
                    />
                    <h3
                      style={{ color: THEME_COLORS.hex.textDark }}
                      className="text-xs font-black uppercase tracking-wider"
                    >
                      Statistik Kehadiran
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Hari Kerja (Air Kehidupan Light Palette) */}
                    <div
                      style={{
                        backgroundColor: `${THEME_COLORS.hex.airKehidupan}12`,
                        borderColor: `${THEME_COLORS.hex.airKehidupan}30`,
                      }}
                      className="p-3 rounded-xl border flex flex-col justify-between"
                    >
                      <span
                        style={{ color: THEME_COLORS.hex.airKehidupanText }}
                        className="text-[10px] font-extrabold uppercase tracking-wide"
                      >
                        Hari Kerja
                      </span>
                      <p
                        style={{ color: THEME_COLORS.hex.airKehidupanDark }}
                        className="text-sm font-black mt-0.5"
                      >
                        {rekapItem.total_hari_kerja} Hari
                      </p>
                    </div>

                    {/* Total Hadir (Sawah Pertumbuhan Palette) */}
                    <div
                      style={{
                        backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}14`,
                        borderColor: `${THEME_COLORS.hex.sawahPertumbuhan}35`,
                      }}
                      className="p-3 rounded-xl border flex flex-col justify-between"
                    >
                      <span
                        style={{ color: THEME_COLORS.hex.sawahPertumbuhanText }}
                        className="text-[10px] font-extrabold uppercase tracking-wide"
                      >
                        Total Hadir
                      </span>
                      <p
                        style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                        className="text-sm font-black mt-0.5"
                      >
                        {rekapItem.total_hadir} Hari
                      </p>
                    </div>

                    {/* Sakit / Izin (Padi Kemakmuran Palette) */}
                    <div
                      style={{
                        backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}1A`,
                        borderColor: `${THEME_COLORS.hex.padiKemakmuran}40`,
                      }}
                      className="p-3 rounded-xl border flex flex-col justify-between"
                    >
                      <span
                        style={{ color: THEME_COLORS.hex.padiKemakmuranText }}
                        className="text-[10px] font-extrabold uppercase tracking-wide"
                      >
                        Sakit / Izin
                      </span>
                      <p
                        style={{ color: THEME_COLORS.hex.padiKemakmuranDark }}
                        className="text-sm font-black mt-0.5"
                      >
                        {rekapItem.sakit_dan_izin} Hari
                      </p>
                    </div>

                    {/* Total Lembur (Api Semangat / Primary Palette) */}
                    <div
                      style={{
                        backgroundColor: `${THEME_COLORS.hex.apiSemangat}14`,
                        borderColor: `${THEME_COLORS.hex.apiSemangat}30`,
                      }}
                      className="p-3 rounded-xl border flex flex-col justify-between"
                    >
                      <span
                        style={{ color: THEME_COLORS.hex.apiSemangatDark }}
                        className="text-[10px] font-extrabold uppercase tracking-wide"
                      >
                        Total Lembur
                      </span>
                      <p
                        style={{ color: THEME_COLORS.hex.apiSemangatDark }}
                        className="text-sm font-black mt-0.5"
                      >
                        {rekapItem.jam_lembur}j {rekapItem.menit_lembur}m
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rincian Penerimaan Card */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <TrendingUp
                      size={16}
                      style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                    />
                    <h3
                      style={{ color: THEME_COLORS.hex.textDark }}
                      className="text-xs font-black uppercase tracking-wider"
                    >
                      Penerimaan / Penghasilan
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs font-semibold space-y-2">
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
                      <span
                        style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                        className="font-bold"
                      >
                        +{formatRupiah(rekapItem.insentif_per_hari_kerja)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">
                        Uang Lembur ({rekapItem.jam_lembur}j {rekapItem.menit_lembur}m)
                      </span>
                      <span
                        style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                        className="font-bold"
                      >
                        +{formatRupiah(rekapItem.total_lembur_rp)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">Tunjangan Tetap</span>
                      <span
                        style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                        className="font-bold"
                      >
                        +Rp 200.000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rincian Potongan Card */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-xs space-y-3 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <AlertCircle
                      size={16}
                      style={{ color: THEME_COLORS.hex.apiSemangat }}
                    />
                    <h3
                      style={{ color: THEME_COLORS.hex.textDark }}
                      className="text-xs font-black uppercase tracking-wider"
                    >
                      Potongan
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs font-semibold space-y-2">
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-slate-500 font-medium">
                        Izin & Sakit ({rekapItem.sakit_dan_izin} hari)
                      </span>
                      <span
                        style={{ color: THEME_COLORS.hex.apiSemangat }}
                        className="font-bold"
                      >
                        -{formatRupiah(rekapItem.potongan)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-slate-900">
                      <span>Total Potongan</span>
                      <span
                        style={{ color: THEME_COLORS.hex.apiSemangat }}
                        className="font-black"
                      >
                        -{formatRupiah(rekapItem.potongan)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
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
            <div className="flex justify-between items-center px-1">
              <span
                style={{ color: THEME_COLORS.hex.textDark }}
                className="text-xs font-black uppercase tracking-wider"
              >
                Daftar Dokumen Slip Gaji
              </span>
              <span
                style={{ color: THEME_COLORS.hex.airKehidupan }}
                className="text-[10px] font-extrabold"
              >
                {availablePayslips.length} Periode Tersedia
              </span>
            </div>

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
            ) : (
              <div className="space-y-2.5">
                {availablePayslips.map((period) => {
                  const isCurrent = period.isCurrentPeriod;
                  const hasFinalized = !!period.historyItem;
                  const slipAmount = period.historyItem
                    ? period.historyItem.grand_total
                    : isCurrent
                    ? rekapItem?.aktual_gaji ?? (user?.gaji_pokok || 0)
                    : (user?.gaji_pokok || 0);

                  const keyId = `${period.month}-${period.year}`;
                  const isThisDownloading = isDownloading && downloadingKey === keyId;

                  return (
                    <div
                      key={keyId}
                      className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all text-left group"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{ color: THEME_COLORS.hex.textDark }}
                            className="text-xs font-black"
                          >
                            {period.label}
                          </span>
                          {hasFinalized ? (
                            <span
                              style={{
                                backgroundColor: `${THEME_COLORS.hex.sawahPertumbuhan}20`,
                                color: THEME_COLORS.hex.sawahPertumbuhanDark,
                              }}
                              className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            >
                              Final
                            </span>
                          ) : isCurrent ? (
                            <span
                              style={{
                                backgroundColor: `${THEME_COLORS.hex.padiKemakmuran}25`,
                                color: THEME_COLORS.hex.padiKemakmuranText,
                              }}
                              className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            >
                              Periode Berjalan
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: `${THEME_COLORS.hex.airKehidupan}18`,
                                color: THEME_COLORS.hex.airKehidupanText,
                              }}
                              className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            >
                              Tersedia
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-400 font-mono font-medium truncate">
                          {period.historyItem?.no_gaji ? `No: ${period.historyItem.no_gaji}` : `Slip Gaji Karyawan • ${user?.name || "Pegawai"}`}
                        </p>

                        <p
                          style={{ color: THEME_COLORS.hex.sawahPertumbuhanDark }}
                          className="text-xs font-black"
                        >
                          {formatRupiah(slipAmount)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadPayslip(period.month, period.year, keyId)}
                        disabled={isDownloading}
                        style={{ backgroundColor: primaryAccent }}
                        className="px-3.5 py-2.5 rounded-xl text-white text-[11px] font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                        title="Unduh Dokumen PDF Slip Gaji"
                      >
                        {isThisDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunduh...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
