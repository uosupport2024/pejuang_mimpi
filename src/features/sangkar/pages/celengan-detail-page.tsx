import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Bike,
  Palmtree,
  Laptop,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  History
} from "lucide-react";
import { useRouter } from "@/shared/router/router";
import { THEME_COLORS } from "@/shared/constants/colors";
import { toast } from "sonner";
import patternBg from "@/assets/bg/pattern-background.png";

// Static mapping for Celengan options
const CELENGAN_DATA = {
  rumah: {
    id: "rumah",
    name: "Rumah",
    target: 200000000,
    initialFilled: 40000000,
    gradient: THEME_COLORS.celengan.rumah.gradient,
    color: THEME_COLORS.celengan.rumah.solid,
    icon: Home,
    deadline: "31 Desember 2027",
    desc: "Tabungan impian untuk membeli atau merenovasi rumah masa depan.",
    history: [
      { id: 1, date: "24 Jun 2026", desc: "Setoran Bulanan (Gaji Pokok)", amount: 2000000, type: "deposit" },
      { id: 2, date: "15 Jun 2026", desc: "Bonus Lembur", amount: 500000, type: "deposit" },
      { id: 3, date: "25 Mei 2026", desc: "Setoran Bulanan", amount: 2000000, type: "deposit" },
      { id: 4, date: "10 Mei 2026", desc: "Hadiah Ulang Tahun", amount: 1000000, type: "deposit" },
    ]
  },
  motor: {
    id: "motor",
    name: "Motor",
    target: 30000000,
    initialFilled: 12000000,
    gradient: THEME_COLORS.celengan.motor.gradient,
    color: THEME_COLORS.celengan.motor.solid,
    icon: Bike,
    deadline: "30 September 2026",
    desc: "Target cicilan/pembelian motor baru untuk menunjang mobilitas kerja.",
    history: [
      { id: 1, date: "20 Jun 2026", desc: "Tabungan Rutin", amount: 1000000, type: "deposit" },
      { id: 2, date: "05 Jun 2026", desc: "Tambahan THR", amount: 1500000, type: "deposit" },
      { id: 3, date: "20 Mei 2026", desc: "Tabungan Rutin", amount: 1000000, type: "deposit" },
    ]
  },
  liburanBali: {
    id: "liburanBali",
    name: "Liburan Bali",
    target: 10000000,
    initialFilled: 7000000,
    gradient: THEME_COLORS.celengan.liburanBali.gradient,
    color: THEME_COLORS.celengan.liburanBali.solid,
    icon: Palmtree,
    deadline: "15 Desember 2026",
    desc: "Liburan akhir tahun bersama keluarga ke pantai dan alam Bali.",
    history: [
      { id: 1, date: "18 Jun 2026", desc: "Alokasi Hiburan", amount: 500000, type: "deposit" },
      { id: 2, date: "18 Mei 2026", desc: "Alokasi Hiburan", amount: 500000, type: "deposit" },
      { id: 3, date: "02 Mei 2026", desc: "Kembalian Belanja Bulanan", amount: 200000, type: "deposit" },
    ]
  },
  laptopBaru: {
    id: "laptopBaru",
    name: "Laptop Baru",
    target: 20000000,
    initialFilled: 18000000,
    gradient: THEME_COLORS.celengan.laptopBaru.gradient,
    color: THEME_COLORS.celengan.laptopBaru.solid,
    icon: Laptop,
    deadline: "31 Oktober 2026",
    desc: "Upgrade laptop kerja untuk coding dan performa pengerjaan tugas yang lebih kencang.",
    history: [
      { id: 1, date: "26 Jun 2026", desc: "Insentif Proyek", amount: 3000000, type: "deposit" },
      { id: 2, date: "26 Mei 2026", desc: "Setoran Bulanan", amount: 1500000, type: "deposit" },
      { id: 3, date: "12 Apr 2026", desc: "Tarik sebagian untuk servis", amount: 500000, type: "withdraw" },
    ]
  }
};

export function CelenganDetailPage() {
  const { navigate } = useRouter();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "rumah";

  // Safeguard in case of invalid type parameter
  const key = (typeParam in CELENGAN_DATA ? typeParam : "rumah") as keyof typeof CELENGAN_DATA;
  const celengan = CELENGAN_DATA[key];

  // Local state for savings simulation
  const [currentAmount, setCurrentAmount] = useState(celengan.initialFilled);
  const [history, setHistory] = useState(celengan.history);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDesc, setTransactionDesc] = useState("");

  const pct = Math.min(Math.round((currentAmount / celengan.target) * 100), 100);
  const IconComponent = celengan.icon;

  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transactionAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Masukkan nominal tabungan yang valid!");
      return;
    }

    const newAmount = currentAmount + amountNum;
    setCurrentAmount(newAmount);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const newHistoryItem = {
      id: Date.now(),
      date: formattedDate,
      desc: transactionDesc.trim() || "Menabung langsung",
      amount: amountNum,
      type: "deposit"
    };

    setHistory([newHistoryItem, ...history]);
    setShowDepositModal(false);
    setTransactionAmount("");
    setTransactionDesc("");
    toast.success(`Berhasil menambahkan ${formatRupiah(amountNum)} ke Celengan!`);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transactionAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Masukkan nominal penarikan yang valid!");
      return;
    }

    if (amountNum > currentAmount) {
      toast.error("Saldo celengan tidak mencukupi!");
      return;
    }

    const newAmount = currentAmount - amountNum;
    setCurrentAmount(newAmount);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const newHistoryItem = {
      id: Date.now(),
      date: formattedDate,
      desc: transactionDesc.trim() || "Penarikan Celengan",
      amount: amountNum,
      type: "withdraw"
    };

    setHistory([newHistoryItem, ...history]);
    setShowWithdrawModal(false);
    setTransactionAmount("");
    setTransactionDesc("");
    toast.success(`Berhasil menarik ${formatRupiah(amountNum)} dari Celengan!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-slate-800 pb-20 relative -mt-6 -mx-5">
      {/* Top sticky navigation */}
      <div className="bg-[#1e2a4a] text-white flex items-center gap-3 px-5 pt-4 pb-4 sticky -top-6 z-20 shadow-md relative overflow-hidden">
        {/* Background Pattern - Repeating and subtle (15% opacity) */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg})`,
            backgroundSize: "150px 150px",
            backgroundRepeat: "repeat"
          }}
        />
        <button
          onClick={() => navigate("MobileHome")}
          className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer animate-none relative z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold tracking-tight relative z-10">Detail Celengan</span>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4">
        {/* Dynamic Theme Color Hero Card */}
        <div className={`bg-gradient-to-br ${celengan.gradient} text-white p-5 rounded-3xl shadow-lg relative overflow-hidden`}>
          {/* Decorative graphic element */}
          <div className="absolute -right-4 -bottom-4 opacity-15 text-white pointer-events-none">
            <IconComponent className="w-32 h-32" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl">
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <span className="bg-white/25 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              {pct}% Terkumpul
            </span>
          </div>

          <div className="mt-5 relative z-10">
            <h2 className="text-xl font-bold tracking-tight">{celengan.name}</h2>
            <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-[85%]">{celengan.desc}</p>
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
              <div className="flex flex-col">
                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Terkumpul</span>
                <span className="text-lg font-bold">{formatRupiah(currentAmount)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Target</span>
                <span className="text-sm font-bold text-white/95">{formatRupiah(celengan.target)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid & Statistics - Simple, borderless, no cards */}
        <div className="space-y-4 px-1 py-1">
          <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detail Informasi</span>
          </div>

          <div className="space-y-4">
            {/* Target Selesai */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Target Selesai</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{celengan.deadline}</span>
              </div>
            </div>

            {/* Kekurangan Dana */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Kekurangan Dana</span>
                <span className="text-sm font-bold text-slate-800 mt-1">
                  {formatRupiah(Math.max(celengan.target - currentAmount, 0))}
                </span>
              </div>
            </div>

            {/* Estimasi Rencana */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 text-slate-650 rounded-lg shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Estimasi Rencana</span>
                <span className="text-xs font-bold text-slate-700 mt-1 leading-relaxed">
                  {currentAmount >= celengan.target
                    ? "Target Anda telah tercapai! 🎉"
                    : `Menabung ${formatRupiah(Math.round((celengan.target - currentAmount) / 12))} per bulan selama 12 bulan.`
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

          <div className="space-y-2.5">
            {history.map((item) => (
              <div 
                key={item.id} 
                className={`p-3.5 rounded-xl border flex justify-between items-center transition-all shadow-sm ${
                  item.type === "deposit" 
                    ? "bg-emerald-50/50 border-emerald-200/80" 
                    : "bg-rose-50/50 border-rose-200/80"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{item.desc}</span>
                  <span className="text-[9px] text-slate-400 mt-1 font-semibold leading-none">{item.date}</span>
                </div>

                <span className={`text-xs font-extrabold shrink-0 ${
                  item.type === "deposit" ? "text-emerald-700" : "text-rose-700"
                }`}>
                  {item.type === "deposit" ? "+" : "-"} {formatRupiah(item.amount)}
                </span>
              </div>
            ))}

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
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Nominal Tabungan (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1000000"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[#e0542c]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Catatan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Setoran celengan..."
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e0542c]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#e0542c] hover:bg-[#c23f1b] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-[#e0542c]/15 transition-all cursor-pointer"
              >
                Konfirmasi Tabungan
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
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Nominal Penarikan (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 500000"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Saldo Tersedia: {formatRupiah(currentAmount)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Keperluan Penarikan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Kebutuhan mendadak..."
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Konfirmasi Penarikan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
