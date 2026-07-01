import type { TunasUser } from "../types/tunas.type";

interface SlipGajiBreakdownProps {
  user: TunasUser;
  formatRupiah: (val?: number) => string;
}

export function SlipGajiBreakdown({ user, formatRupiah }: SlipGajiBreakdownProps) {
  const gajiPokok = user.gaji_pokok || 4440000;
  const lembur = user.lembur || 15000;
  const izin = user.izin || 92500;
  const takeHomePay = gajiPokok + lembur - izin;

  return (
    <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs space-y-3.5 text-left">
      <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide px-0.5">Rincian Slip Gaji</h3>

      <div className="divide-y divide-gray-100 text-xs font-semibold space-y-2.5">
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-500 font-bold">Gaji Pokok</span>
          <span className="text-gray-900 font-bold">{formatRupiah(gajiPokok)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-500 font-bold">Uang Lembur</span>
          <span className="text-emerald-600 font-bold">+{formatRupiah(lembur)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-500 font-bold">Potongan Izin</span>
          <span className="text-rose-500 font-bold">-{formatRupiah(izin)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-zinc-500 font-bold">Potongan Terlambat</span>
          <span className="text-rose-500 font-bold">-Rp 0</span>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 font-bold text-gray-950">
          <span>Estimasi Bersih (Take Home Pay)</span>
          <span>{formatRupiah(takeHomePay)}</span>
        </div>
      </div>
    </div>
  );
}
