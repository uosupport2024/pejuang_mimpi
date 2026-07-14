import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  History,
  Trash2
} from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";
import { useCelenganDetail } from "../hooks/use-celengan";
import { getCelenganStyle } from "../components/celenganku-carousel";
import { formatThousands, parseThousands } from "@/shared/utils/format";
import { Input } from "@/shared/components/ui/input";
import { getChickenIcon } from "@/shared/utils/icons";
import { motion } from "motion/react";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";

export function CelenganDetailPage() {
  const { navigate } = useRouter();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const typeParam = searchParams.get("type");

  const {
    celengan,
    history,
    loading,
    isSubmitting,
    deposit,
    withdraw,
    remove
  } = useCelenganDetail(idParam, typeParam);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDesc, setTransactionDesc] = useState("");

  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celengan) return;

    const amountNum = parseThousands(transactionAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Masukkan nominal tabungan yang valid!");
      return;
    }

    try {
      await deposit(amountNum, transactionDesc.trim());
      setShowDepositModal(false);
      setTransactionAmount("");
      setTransactionDesc("");
      toast.success(`Berhasil menambahkan ${formatRupiah(amountNum)} ke Celengan!`);
    } catch (error: any) {
      // toast is already handled in hook, but in case:
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celengan) return;

    const amountNum = parseThousands(transactionAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Masukkan nominal penarikan yang valid!");
      return;
    }

    if (amountNum > celengan.current_amount) {
      toast.error("Saldo celengan tidak mencukupi!");
      return;
    }

    try {
      await withdraw(amountNum, transactionDesc.trim());
      setShowWithdrawModal(false);
      setTransactionAmount("");
      setTransactionDesc("");
      toast.success(`Berhasil menarik ${formatRupiah(amountNum)} dari Celengan!`);
    } catch (error: any) {
      // error is handled in hook
    }
  };

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const handleDelete = () => {
    if (!celengan) return;
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmModal(false);
    try {
      await remove();
    } catch (error) {
      // error is handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-20 relative -mt-6 -mx-5 animate-pulse">
        {/* Top Header Placeholder */}
        <div className="bg-[#1e2a4a] h-14 w-full" />
        
        <div className="p-4 space-y-4">
          {/* Hero Card Placeholder */}
          <div className="bg-white border border-slate-200/40 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
              <div className="h-5 bg-slate-100 rounded-full w-20" />
            </div>
            <div className="h-6 bg-slate-150 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>

          {/* Details Placeholder */}
          <div className="bg-white border border-slate-200/40 rounded-3xl p-5 space-y-3.5 shadow-sm">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-[1px] bg-slate-100 w-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-150 rounded w-16" />
              </div>
            ))}
          </div>

          {/* Action buttons Placeholder */}
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-white border border-slate-200 rounded-2xl" />
            <div className="flex-1 h-12 bg-white border border-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!celengan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F3EB] text-slate-500 p-6 text-center">
        <span className="text-sm font-semibold">Celengan tidak ditemukan.</span>
        <button onClick={() => navigate("MobileHome")} className="mt-4 bg-[#e0542c] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
          Kembali ke Home
        </button>
      </div>
    );
  }

  const style = getCelenganStyle(celengan.id);
  const iconSrc = getChickenIcon(celengan.icon);
  const currentAmount = celengan.current_amount;
  const target = celengan.target_amount;
  const pct = target > 0 ? Math.min(Math.round((currentAmount / target) * 100), 100) : 0;

  // Deadline logic (estimated 1 year from creation date or standard default)
  const deadlineDate = celengan.created_at ? new Date(celengan.created_at) : new Date();
  if (!celengan.created_at) {
    deadlineDate.setMonth(deadlineDate.getMonth() + 12);
  } else {
    deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
  }
  const deadlineStr = deadlineDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const celenganDesc = celengan.name.toLowerCase().includes("rumah")
    ? "Tabungan impian untuk membeli atau merenovasi rumah masa depan."
    : celengan.name.toLowerCase().includes("motor")
    ? "Target cicilan/pembelian motor baru untuk menunjang mobilitas kerja."
    : celengan.name.toLowerCase().includes("bali") || celengan.name.toLowerCase().includes("liburan")
    ? "Liburan akhir tahun bersama keluarga ke pantai dan alam Bali."
    : celengan.name.toLowerCase().includes("laptop") || celengan.name.toLowerCase().includes("computer")
    ? "Upgrade laptop kerja untuk coding dan performa pengerjaan tugas yang lebih kencang."
    : `Celengan tabungan khusus untuk merealisasikan rencana ${celengan.name}.`;

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-20 relative -mt-6 -mx-5">
      {/* Top sticky navigation */}
      <div className="bg-[#1e2a4a] text-white flex items-center justify-between px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate("MobileHome")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer animate-none relative z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold tracking-tight relative z-10">Detail Celengan</span>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 bg-red-650/10 hover:bg-red-600 hover:text-white text-red-400 rounded-xl transition-all cursor-pointer relative z-10 flex items-center justify-center"
          title="Hapus Celengan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4">
        {/* Dynamic Theme Color Hero Card */}
        <div className={`bg-gradient-to-br ${style.gradient} text-white p-5 rounded-3xl shadow-lg relative overflow-hidden`}>
          {/* Decorative graphic element */}
          <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
            <motion.img
              src={iconSrc}
              alt={celengan.name}
              className="w-44 h-44 object-contain"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="w-14 h-14 flex items-center justify-center">
              <motion.img
                src={iconSrc}
                alt={celengan.name}
                className="w-12 h-12 object-contain"
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <span className="bg-white/25 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              {pct}% Terkumpul
            </span>
          </div>

          <div className="mt-5 relative z-10">
            <h2 className="text-xl font-bold tracking-tight">{celengan.name}</h2>
            <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-[85%]">{celenganDesc}</p>
          </div>

          {/* Progress Bar Section */}
          <div className="mt-6 relative z-10 space-y-2">
            <div className="h-2 w-full bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between items-baseline text-white">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Terkumpul</span>
                <span className="text-lg font-bold">{formatRupiah(currentAmount)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Target</span>
                <span className="text-sm font-bold text-white/95">{formatRupiah(target)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid & Statistics */}
        <div className="space-y-4 px-1 py-1">
          <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detail Informasi</span>
          </div>

          <div className="space-y-4">
            {/* Target Selesai */}
            <div className="flex items-start gap-3 text-left">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Target Selesai</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{deadlineStr}</span>
              </div>
            </div>

            {/* Kekurangan Dana */}
            <div className="flex items-start gap-3 text-left">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Kekurangan Dana</span>
                <span className="text-sm font-bold text-slate-800 mt-1">
                  {formatRupiah(Math.max(target - currentAmount, 0))}
                </span>
              </div>
            </div>

            {/* Estimasi Rencana */}
            <div className="flex items-start gap-3 text-left">
              <div className="p-1.5 bg-slate-100 text-slate-650 rounded-lg shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Estimasi Rencana</span>
                <span className="text-xs font-bold text-slate-700 mt-1 leading-relaxed">
                  {currentAmount >= target
                    ? "Target Anda telah tercapai! 🎉"
                    : `Menabung ${formatRupiah(Math.round((target - currentAmount) / 12))} per bulan selama 12 bulan.`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Panel */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#e0542c] hover:bg-[#c23f1b] text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tabung Sekarang
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#b43836] hover:bg-[#b43837] text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
            Tarik Celengan
          </button>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-3 px-1 py-1">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Riwayat Setoran</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{history.length} Transaksi</span>
          </div>

          <div className="space-y-2.5 text-left">
            {history.map((item) => {
              const formattedTrxDate = item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "-";
              const note = item.note || (item.type === "deposit" ? "Menabung langsung" : "Penarikan Celengan");
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex justify-between items-center transition-all shadow-sm ${
                    item.type === "deposit"
                      ? "bg-emerald-50/50 border-emerald-200/80"
                      : "bg-rose-50/50 border-rose-200/80"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">{note}</span>
                    <span className="text-[9px] text-slate-400 mt-1 font-semibold leading-none">{formattedTrxDate}</span>
                  </div>

                  <span className={`text-xs font-extrabold shrink-0 ${
                    item.type === "deposit" ? "text-emerald-700" : "text-rose-700"
                  }`}>
                    {item.type === "deposit" ? "+" : "-"} {formatRupiah(item.amount)}
                  </span>
                </div>
              );
            })}

            {history.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs bg-white rounded-xl border border-slate-100">
                Belum ada transaksi di celengan ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Simulation Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl rounded-b-xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tabung Sekarang</span>
              <button
                onClick={() => { setShowDepositModal(false); setTransactionAmount(""); setTransactionDesc(""); }}
                className="text-slate-400 hover:text-slate-650 text-xs font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Nominal Tabungan (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: 1.000.000"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(formatThousands(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus-visible:ring-[#e0542c]/20 text-slate-800 text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Catatan (Opsional)</label>
                <Input
                  type="text"
                  placeholder="Setoran celengan..."
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus-visible:ring-[#e0542c]/20 text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#e0542c] hover:bg-[#c23f1b] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-[#e0542c]/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Konfirmasi Tabungan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Simulation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl rounded-b-xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tarik Celengan</span>
              <button
                onClick={() => { setShowWithdrawModal(false); setTransactionAmount(""); setTransactionDesc(""); }}
                className="text-slate-400 hover:text-slate-650 text-xs font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Nominal Penarikan (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: 500.000"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(formatThousands(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus-visible:ring-red-500/20 text-slate-800 text-left"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Saldo Tersedia: {formatRupiah(celengan.current_amount)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Keperluan Penarikan (Opsional)</label>
                <Input
                  type="text"
                  placeholder="Kebutuhan mendadak..."
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus-visible:ring-red-500/20 text-slate-850"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Konfirmasi Penarikan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {celengan && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Hapus Celengan?"
          message={`Apakah Anda yakin ingin menghapus celengan "${celengan.name}"?`}
          variant="danger"
          confirmText="Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
