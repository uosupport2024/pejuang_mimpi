import { Wallet, Landmark } from "lucide-react";
import type { TunasUser } from "../types/tunas.type";

interface LumbungTabunganProps {
  user: TunasUser;
  formatRupiah: (val?: number) => string;
}

export function LumbungTabungan({ user, formatRupiah }: LumbungTabunganProps) {
  return (
    <div className="bg-[#1e2a4a] text-white p-5 rounded-3xl shadow-lg shadow-[#1e2a4a]/20 relative overflow-hidden space-y-4 text-left">
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
        <h2 className="text-2xl font-black tracking-tight">{formatRupiah(user.gaji_pokok || 4440000)}</h2>
      </div>

      <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-white/80">
        <span>{user.bank || "Mandiri"}</span>
        <span className="font-mono font-bold">{user.rekening || "1730018948050"}</span>
      </div>
    </div>
  );
}
