import { Wallet, Landmark } from "lucide-react";

interface PageProps {
  user: {
    name: string;
    email: string;
    role: string;
    telepon?: string;
    gender?: string;
    tgl_join?: string;
    status_nikah?: string;
    rekening?: string;
    bank?: string;
    gaji_pokok?: number;
    lembur?: number;
    izin?: number;
  };
  onLogout?: () => void;
}

export function MobileLumbungPage({ user }: PageProps) {
  const formatRupiah = (val?: number) => {
    if (val === undefined) return "Rp 0";
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-4">
      {/* Wallet Card */}
      <div className="bg-[#1e2a4a] text-white p-5 rounded-3xl shadow-lg shadow-[#1e2a4a]/20 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-white" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/85">Lumbung Tabungan</span>
          </div>
          <Landmark className="w-4 h-4 text-white/75" />
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-white/70">Perkiraan Gaji Pokok</p>
          <h2 className="text-2xl font-bold tracking-tight">{formatRupiah(user.gaji_pokok || 4440000)}</h2>
        </div>
        <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-white/80">
          <span>{user.bank || "Mandiri"}</span>
          <span className="font-mono font-bold">{user.rekening || "1730018948050"}</span>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Rincian Slip Gaji</h3>

        <div className="divide-y divide-gray-100 text-xs font-semibold space-y-2.5">
          <div className="flex justify-between items-center pt-2">
            <span className="text-zinc-500">Gaji Pokok</span>
            <span className="text-gray-900 font-bold">{formatRupiah(user.gaji_pokok)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-zinc-500">Uang Lembur</span>
            <span className="text-emerald-600 font-bold">+{formatRupiah(user.lembur)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-zinc-500">Potongan Izin</span>
            <span className="text-rose-500 font-bold">-{formatRupiah(user.izin || 92500)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-zinc-500">Potongan Terlambat</span>
            <span className="text-rose-500 font-bold">-Rp 0</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-gray-950">
            <span>Estimasi Bersih (Take Home Pay)</span>
            <span>{formatRupiah((user.gaji_pokok || 4440000) + (user.lembur || 15000) - (user.izin || 92500))}</span>
          </div>
        </div>
      </div>

      {/* Bank Info banner */}
      <div className="bg-zinc-50 border border-gray-100 p-3.5 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
          BANK
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">Rekening Payroll</p>
          <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{user.bank} - a/n {user.name}</p>
        </div>
      </div>
    </div>
  );
}
