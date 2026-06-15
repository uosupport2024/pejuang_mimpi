import type { TunasUser } from "../types/tunas.type";

interface RekeningPayrollProps {
  user: TunasUser;
}

export function RekeningPayroll({ user }: RekeningPayrollProps) {
  return (
    <div className="bg-white hover:bg-zinc-50/20 border border-gray-100 p-3.5 rounded-2xl shadow-md shadow-black/[0.04] flex items-center gap-3.5 text-left transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] tracking-wider shrink-0 shadow-xs border border-blue-100/40">
        BANK
      </div>
      <div className="flex flex-col text-left min-w-0">
        <p className="text-xs font-extrabold text-gray-900 leading-tight">Rekening Payroll</p>
        <p className="text-[10px] text-zinc-450 font-bold leading-normal mt-0.5 truncate">
          {user.bank || "Mandiri"} - a/n {user.name}
        </p>
      </div>
    </div>
  );
}
